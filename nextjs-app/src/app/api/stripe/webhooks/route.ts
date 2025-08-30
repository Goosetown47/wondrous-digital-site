import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { WEBHOOK_EVENTS } from '@/lib/stripe/config';
import { verifyWebhookSignature, updateAccountTier, startGracePeriod } from '@/lib/stripe/utils';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { getEnvironmentName, getStripeMode } from '@/lib/utils/environment';
import type { TierName } from '@/types/database';
import type Stripe from 'stripe';

// Stripe webhook handler
export async function POST(request: NextRequest) {
  console.log('🔔 WEBHOOK ENDPOINT HIT');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Environment:', getEnvironmentName());
  console.log('Stripe Mode:', getStripeMode());
  
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    console.log('Webhook secret exists?', !!webhookSecret);
    console.log('Signature exists?', !!signature);

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: 'Missing signature or webhook secret' },
        { status: 400 }
      );
    }

    // Verify webhook signature and get event
    let event: Stripe.Event;
    try {
      event = verifyWebhookSignature(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Use service role client for webhooks (bypasses RLS)
    const supabase = createSupabaseServiceClient();

    // Log webhook event
    await supabase
      .from('stripe_webhook_logs')
      .insert({
        stripe_event_id: event.id,
        type: event.type,
        data: event.data,
        processed: false,
      });

    // Handle different event types
    switch (event.type) {
      case WEBHOOK_EVENTS.CHECKOUT_COMPLETED: {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('=== CHECKOUT COMPLETED EVENT ===');
        console.log('Session ID:', session.id);
        console.log('Customer:', session.customer);
        console.log('Subscription:', session.subscription);
        console.log('Metadata:', session.metadata);
        console.log('Amount Total:', session.amount_total);
        console.log('Payment Status:', session.payment_status);
        
        // Get metadata from session
        let accountId = session.metadata?.account_id;
        const tier = session.metadata?.tier as TierName;
        const flow = session.metadata?.flow;
        const addon = session.metadata?.addon;
        
        // Handle PERFORM addon purchase
        if (flow === 'addon' && addon === 'PERFORM' && accountId) {
          console.log(`Processing PERFORM addon for account ${accountId}`);
          
          const { error: updateError } = await supabase
            .from('accounts')
            .update({
              has_perform_addon: true,
              perform_setup_fee_paid: true,
              perform_setup_fee_paid_at: new Date().toISOString(),
            })
            .eq('id', accountId);
          
          if (updateError) {
            console.error('Failed to update PERFORM addon status:', updateError);
          } else {
            console.log('✅ PERFORM addon activated for account');
            
            // Log to billing history
            await supabase
              .from('account_billing_history')
              .insert({
                account_id: accountId,
                event_type: 'addon_purchased',
                metadata: {
                  addon: 'PERFORM',
                  amount: session.amount_total,
                  currency: session.currency,
                  subscription_id: session.subscription,
                },
                stripe_event_id: event.id,
              });
          }
          break;
        }
        
        // Handle subscription upgrade payment
        if (session.metadata?.type === 'subscription_upgrade' && accountId) {
          console.log(`Processing subscription upgrade payment for account ${accountId}`);
          
          const targetTier = session.metadata.target_tier as TierName;
          const billingPeriod = session.metadata.billing_period as 'monthly' | 'yearly';
          const subscriptionId = session.metadata.subscription_id;
          const currentTier = session.metadata.current_tier as TierName;
          const prorationAmount = parseFloat(session.metadata.proration_amount || '0');
          
          if (!targetTier || !subscriptionId) {
            console.error('Missing upgrade metadata:', session.metadata);
            break;
          }
          
          try {
            // Now that payment is successful, actually update the subscription
            const { updateAccountTier } = await import('@/lib/stripe/utils');
            const stripe = (await import('@/lib/stripe/config')).getStripe();
            const { TIER_PRICING } = await import('@/lib/stripe/prices');
            
            // Get the subscription
            const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
              expand: ['items.data.price']
            });
            
            // Find the main plan item
            const allTierPriceIds = [
              TIER_PRICING.PRO.monthlyPriceId,
              TIER_PRICING.PRO.yearlyPriceId,
              TIER_PRICING.SCALE.monthlyPriceId,
              TIER_PRICING.SCALE.yearlyPriceId,
              TIER_PRICING.MAX.monthlyPriceId,
              TIER_PRICING.MAX.yearlyPriceId,
            ];
            
            const mainPlanItem = subscription.items.data.find(item => 
              allTierPriceIds.includes(item.price.id)
            );
            
            if (!mainPlanItem) {
              console.error('Could not find main plan item in subscription');
              break;
            }
            
            // Update the subscription to the new tier
            const tierPricing = TIER_PRICING[targetTier as 'PRO' | 'SCALE' | 'MAX'];
            const newPriceId = billingPeriod === 'yearly' 
              ? tierPricing.yearlyPriceId 
              : tierPricing.monthlyPriceId;
            
            await stripe.subscriptions.update(subscriptionId, {
              items: [{
                id: mainPlanItem.id,
                price: newPriceId,
              }],
              proration_behavior: 'none', // We already charged for proration
              metadata: {
                ...subscription.metadata,
                tier: targetTier,
                previous_tier: currentTier,
              }
            });
            
            console.log('✅ Subscription updated successfully');
            
            // Update account tier in database
            const { error: updateError } = await supabase
              .from('accounts')
              .update({
                tier: targetTier,
                pending_tier_change: null,
                pending_tier_change_date: null,
              })
              .eq('id', accountId);
            
            if (updateError) {
              console.error('Failed to update account tier:', updateError);
            } else {
              console.log(`✅ Account tier updated to ${targetTier}`);
            }
            
            // Log to billing history
            await supabase
              .from('account_billing_history')
              .insert({
                account_id: accountId,
                event_type: 'plan_upgraded',
                old_tier: currentTier,
                new_tier: targetTier,
                metadata: {
                  proration_amount: prorationAmount,
                  billing_period: billingPeriod,
                  subscription_id: subscriptionId,
                  checkout_session_id: session.id,
                },
                stripe_event_id: event.id,
              });
              
            console.log('✅ Billing history logged');
            
          } catch (error) {
            console.error('Failed to process upgrade after payment:', error);
            // Payment succeeded but upgrade failed - this needs manual review
          }
          
          break;
        }
        
        if (!accountId || !tier) {
          console.error('Missing metadata in checkout session:', session.id);
          break;
        }

        console.log(`Processing ${flow} flow for account ${accountId} with tier ${tier}`);

        // For signup flow, the account already exists and ID is in metadata
        if (flow === 'signup' && accountId && !accountId.startsWith('pending_')) {
          console.log(`Processing signup flow payment for account ${accountId}`);
          
          // Verify the account actually exists
          const { data: existingAccount, error: checkError } = await supabase
            .from('accounts')
            .select('id, name, tier, stripe_customer_id')
            .eq('id', accountId)
            .single();
          
          if (checkError || !existingAccount) {
            console.error('❌ Account not found in database!');
            console.error('Account ID:', accountId);
            console.error('Error:', checkError);
            break;
          }
          
          console.log('✓ Account found in database:', existingAccount);
          // Account exists, just need to update it with Stripe details
        }
        // For cold flow with pending ID, we need to find the actual account
        // that was created during profile setup
        else if (flow === 'cold' && accountId.startsWith('pending_')) {
          // The user should have created an account by now
          // Find it by email and update it
          const customerEmail = session.customer_email || session.customer_details?.email;
          
          if (customerEmail) {
            // Find the user's account
            const { data: userData } = await supabase
              .from('users')
              .select('id')
              .eq('email', customerEmail)
              .single();
            
            if (userData) {
              // Find their account (they should have one from profile setup)
              const { data: accountData } = await supabase
                .from('account_users')
                .select('account_id')
                .eq('user_id', userData.id)
                .eq('role', 'owner')
                .single();
              
              if (accountData) {
                accountId = accountData.account_id;
                console.log(`Found actual account ${accountId} for cold visitor ${customerEmail}`);
              } else {
                console.error(`No account found for cold visitor ${customerEmail}`);
                break;
              }
            } else {
              // User doesn't exist yet - save payment for later processing
              console.log(`User not found yet for ${customerEmail}, saving payment for later`);
              
              // Store in pending_stripe_payments table
              const { error: pendingError } = await supabase
                .from('pending_stripe_payments')
                .insert({
                  email: customerEmail.toLowerCase(),
                  stripe_customer_id: session.customer as string,
                  stripe_subscription_id: session.subscription as string,
                  stripe_session_id: session.id,
                  tier: tier,
                  amount_paid: session.amount_total,
                  currency: session.currency,
                  metadata: {
                    flow: 'cold',
                    customer_details: session.customer_details,
                    payment_intent: session.payment_intent,
                    mode: session.mode,
                  }
                });
              
              if (pendingError) {
                console.error('Failed to save pending payment:', pendingError);
              } else {
                console.log(`Saved pending payment for ${customerEmail} with tier ${tier}`);
                
                // Log to billing history that payment is pending
                await supabase
                  .from('stripe_webhook_logs')
                  .update({ 
                    processed: true,
                    metadata: { 
                      status: 'pending_user_creation',
                      email: customerEmail,
                      tier: tier 
                    }
                  })
                  .eq('stripe_event_id', event.id);
              }
              
              // Don't break - we've handled this case
              break;
            }
          } else {
            console.error('No email found in session for cold visitor');
            break;
          }
        }

        // Update account with Stripe IDs and tier
        console.log('=== ATTEMPTING ACCOUNT UPDATE ===');
        console.log('Checking update conditions:');
        console.log('- Has customer?', !!session.customer);
        console.log('- Has accountId?', !!accountId);
        console.log('- Is pending?', accountId?.startsWith('pending_'));
        
        if (session.customer && accountId && !accountId.startsWith('pending_')) {
          console.log('✓ Conditions met, updating account...');
          console.log('- Account ID:', accountId);
          console.log('- Tier:', tier);
          console.log('- Customer ID:', session.customer);
          console.log('- Subscription ID:', session.subscription || 'NOT YET AVAILABLE');
          
          try {
            // Update with subscription if available, otherwise just update tier and customer
            if (session.subscription) {
              console.log('Calling updateAccountTier with subscription...');
              await updateAccountTier(
                accountId,
                tier,
                session.customer as string,
                session.subscription as string,
                supabase
              );
              console.log('✅ Account updated with tier and subscription');
            } else {
              // Update without subscription ID for now (will be updated when subscription.created event fires)
              console.log('⚠️ No subscription ID yet, updating tier and customer only');
              console.log('Attempting database update for account:', accountId);
              
              const updateData = {
                tier,
                stripe_customer_id: session.customer as string,
                subscription_status: 'pending' as const,
                setup_fee_paid: true,
                setup_fee_paid_at: new Date().toISOString(),
              };
              
              console.log('Update data:', JSON.stringify(updateData, null, 2));
              
              // First check if account exists
              const { data: beforeUpdate } = await supabase
                .from('accounts')
                .select('*')
                .eq('id', accountId)
                .single();
              
              console.log('Account before update:', beforeUpdate ? JSON.stringify(beforeUpdate, null, 2) : 'NOT FOUND');
              
              if (!beforeUpdate) {
                console.error('❌ Account does not exist! Cannot update.');
                break;
              }
              
              const { data: updatedAccount, error } = await supabase
                .from('accounts')
                .update(updateData)
                .eq('id', accountId)
                .select()
                .single();
              
              if (error) {
                console.error('❌ Failed to update account:', error);
                console.error('Error details:', JSON.stringify(error, null, 2));
                
                // Try logging what the service role can see
                const { data: allAccounts } = await supabase
                  .from('accounts')
                  .select('id, name')
                  .limit(5);
                console.log('Sample of accounts visible to service role:', allAccounts);
              } else {
                console.log('✅ Account updated successfully!');
                console.log('Updated account:', JSON.stringify(updatedAccount, null, 2));
                
                // Double-check the update actually persisted
                const { data: verifyUpdate } = await supabase
                  .from('accounts')
                  .select('tier, stripe_customer_id, subscription_status')
                  .eq('id', accountId)
                  .single();
                console.log('Verification read after update:', JSON.stringify(verifyUpdate, null, 2));
              }
            }
          } catch (updateError) {
            console.error('❌ Exception during account update:', updateError);
            console.error('Stack trace:', updateError instanceof Error ? updateError.stack : 'No stack trace');
          }
        } else {
          console.error('❌ Cannot update account - missing required data:');
          console.error('- Customer:', session.customer || 'MISSING');
          console.error('- Account ID:', accountId || 'MISSING');
          console.error('- Is pending:', accountId?.startsWith('pending_') || false);
        }

        // If this was an invitation flow, mark invitation as accepted
        if (flow === 'invitation' && session.metadata?.user_id) {
          await supabase
            .from('account_invitations')
            .update({ 
              accepted_at: new Date().toISOString() 
            })
            .eq('account_id', accountId)
            .eq('invited_by', session.metadata.user_id);
        }

        // Log successful activation
        await supabase
          .from('account_billing_history')
          .insert({
            account_id: accountId,
            event_type: 'payment',
            new_tier: tier,
            amount_cents: session.amount_total,
            currency: session.currency,
            stripe_event_id: event.id,
            metadata: {
              flow,
              session_id: session.id,
              customer_id: session.customer,
              subscription_id: session.subscription,
            },
          });

        break;
      }

      case WEBHOOK_EVENTS.PAYMENT_FAILED: {
        const invoice = event.data.object as Stripe.Invoice;
        // Get subscription ID from invoice - cast to unknown first for type safety
        const invoiceWithSub = invoice as unknown as { subscription?: string | { id: string } };
        const subscription = invoiceWithSub.subscription;
        const subscriptionId = typeof subscription === 'string' 
          ? subscription 
          : subscription?.id || '';
        
        // Find account by subscription ID
        const { data: account } = await supabase
          .from('accounts')
          .select('id')
          .eq('stripe_subscription_id', subscriptionId)
          .single();

        if (account) {
          // Start grace period
          await startGracePeriod(account.id, 10, supabase);
          
          // Log payment failure
          await supabase
            .from('account_billing_history')
            .insert({
              account_id: account.id,
              event_type: 'payment_failed',
              stripe_event_id: event.id,
              stripe_invoice_id: invoice.id,
              metadata: {
                attempt_count: invoice.attempt_count,
                next_payment_attempt: invoice.next_payment_attempt,
              },
            });
        }
        
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        
        console.log('=== SUBSCRIPTION CREATED EVENT ===');
        console.log('Subscription ID:', subscription.id);
        console.log('Customer ID:', subscription.customer);
        console.log('Status:', subscription.status);
        console.log('Metadata:', subscription.metadata);
        
        // Find account by customer ID (since we might not have subscription ID yet)
        const { data: account } = await supabase
          .from('accounts')
          .select('id, stripe_subscription_id')
          .eq('stripe_customer_id', subscription.customer as string)
          .single();
        
        if (account && !account.stripe_subscription_id) {
          console.log(`Updating account ${account.id} with subscription ${subscription.id}`);
          const { error: updateError } = await supabase
            .from('accounts')
            .update({
              stripe_subscription_id: subscription.id,
              subscription_status: subscription.status as string,
            })
            .eq('id', account.id);
          
          if (updateError) {
            console.error('Failed to update subscription ID:', updateError);
          } else {
            console.log('✅ Account updated with subscription ID');
          }
        }
        
        break;
      }

      case WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED: {
        const subscription = event.data.object as Stripe.Subscription;
        
        console.log('=== SUBSCRIPTION UPDATED EVENT ===');
        console.log('Subscription ID:', subscription.id);
        console.log('Status:', subscription.status);
        console.log('Metadata:', subscription.metadata);
        
        // Find account by subscription ID
        const { data: account } = await supabase
          .from('accounts')
          .select('id, tier, pending_tier_change')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (account) {
          // Check if this is a tier change
          const newTier = subscription.metadata?.tier as TierName | undefined;
          const previousTier = subscription.metadata?.previous_tier as TierName | undefined;
          
          const updateData: any = {
            subscription_status: subscription.status,
          };
          
          // If tier changed, update it
          if (newTier && newTier !== account.tier) {
            console.log(`Updating account tier from ${account.tier} to ${newTier}`);
            updateData.tier = newTier;
            
            // Clear pending change if this was a scheduled downgrade
            if (account.pending_tier_change === newTier) {
              updateData.pending_tier_change = null;
              updateData.pending_tier_change_date = null;
            }
            
            // Log the tier change
            await supabase
              .from('account_billing_history')
              .insert({
                account_id: account.id,
                event_type: 'tier_changed',
                old_tier: previousTier || account.tier,
                new_tier: newTier,
                stripe_event_id: event.id,
                metadata: {
                  subscription_id: subscription.id,
                  status: subscription.status,
                },
              });
          }
          
          // Update account
          await supabase
            .from('accounts')
            .update(updateData)
            .eq('id', account.id);
        }
        
        break;
      }

      case WEBHOOK_EVENTS.SUBSCRIPTION_DELETED: {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Find account by subscription ID
        const { data: account } = await supabase
          .from('accounts')
          .select('id, tier')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (account) {
          // Downgrade to FREE tier
          await supabase
            .from('accounts')
            .update({
              tier: 'FREE' as TierName,
              subscription_status: 'canceled',
            })
            .eq('id', account.id);
          
          // Log cancellation
          await supabase
            .from('account_billing_history')
            .insert({
              account_id: account.id,
              event_type: 'subscription_canceled',
              old_tier: account.tier,
              new_tier: 'FREE' as TierName,
              stripe_event_id: event.id,
              metadata: {
                subscription_id: subscription.id,
                canceled_at: subscription.canceled_at,
              },
            });
        }
        
        break;
      }

      case WEBHOOK_EVENTS.INVOICE_PAYMENT_SUCCEEDED: {
        const invoice = event.data.object as Stripe.Invoice;
        
        console.log('=== INVOICE PAYMENT SUCCEEDED EVENT ===');
        console.log('Invoice ID:', invoice.id);
        console.log('Customer:', invoice.customer);
        console.log('Metadata:', invoice.metadata);
        console.log('Amount Paid:', invoice.amount_paid);
        
        // Check if this is an upgrade payment by metadata
        if (invoice.metadata?.type === 'subscription_upgrade') {
          const accountId = invoice.metadata.account_id;
          const targetTier = invoice.metadata.target_tier as TierName;
          const currentTier = invoice.metadata.current_tier as TierName;
          const billingPeriod = invoice.metadata.billing_period;
          const subscriptionId = invoice.metadata.subscription_id;
          const prorationAmount = parseFloat(invoice.metadata.proration_amount || '0');
          
          if (!accountId || !targetTier || !subscriptionId) {
            console.error('Missing required metadata for upgrade processing:', invoice.metadata);
            break;
          }
          
          console.log(`Processing upgrade payment for account ${accountId}: ${currentTier} -> ${targetTier}`);
          
          try {
            // Update the subscription to the new tier
            const { getStripe } = await import('@/lib/stripe/config');
            const stripe = getStripe();
            
            // Get the right price ID for the target tier
            const { TIER_PRICING } = await import('@/lib/stripe/prices');
            const targetPricing = TIER_PRICING[targetTier as 'PRO' | 'SCALE' | 'MAX'];
            const priceId = billingPeriod === 'yearly' 
              ? targetPricing.yearlyPriceId 
              : targetPricing.monthlyPriceId;
            
            if (!priceId) {
              throw new Error(`No price ID found for ${targetTier} ${billingPeriod}`);
            }
            
            // Get the current subscription
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            
            // Update subscription items to new tier
            // Assume there's only one item (the main subscription)
            const currentItem = subscription.items.data[0];
            
            if (!currentItem) {
              throw new Error('No subscription items found');
            }
            
            // Update the subscription item to the new price
            await stripe.subscriptions.update(subscriptionId, {
              items: [{
                id: currentItem.id,
                price: priceId,
              }],
              proration_behavior: 'none', // Don't create another proration since we just paid for it
            });
            
            console.log(`✅ Subscription ${subscriptionId} updated to ${targetTier} tier`);
            
            // Update account in database
            const { error: updateError } = await supabase
              .from('accounts')
              .update({
                tier: targetTier,
                pending_tier_change: null,
                pending_tier_change_date: null,
              })
              .eq('id', accountId);
            
            if (updateError) {
              console.error('Failed to update account tier:', updateError);
            } else {
              console.log(`✅ Account tier updated to ${targetTier}`);
            }
            
            // Log to billing history
            await supabase
              .from('account_billing_history')
              .insert({
                account_id: accountId,
                event_type: 'plan_upgraded',
                old_tier: currentTier,
                new_tier: targetTier,
                metadata: {
                  proration_amount: prorationAmount,
                  billing_period: billingPeriod,
                  subscription_id: subscriptionId,
                  invoice_id: invoice.id,
                },
                stripe_event_id: event.id,
              });
              
            console.log('✅ Billing history logged for upgrade');
            
          } catch (error) {
            console.error('Failed to process upgrade after invoice payment:', error);
            // Payment succeeded but upgrade failed - this needs manual review
            // Log error to billing history
            await supabase
              .from('account_billing_history')
              .insert({
                account_id: accountId,
                event_type: 'upgrade_processing_error',
                metadata: {
                  error: error instanceof Error ? error.message : 'Unknown error',
                  invoice_id: invoice.id,
                  target_tier: targetTier,
                },
                stripe_event_id: event.id,
              });
          }
        }
        
        break;
      }

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    // Mark webhook as processed
    await supabase
      .from('stripe_webhook_logs')
      .update({ processed: true })
      .eq('stripe_event_id', event.id);

    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Log error if we have the event ID
    if (error instanceof Error && 'id' in error) {
      // Use service role client for webhooks (bypasses RLS)
    const supabase = createSupabaseServiceClient();
      const errorWithId = error as Error & { id: string };
      await supabase
        .from('stripe_webhook_logs')
        .update({ 
          processed: false,
          error: error.message 
        })
        .eq('stripe_event_id', errorWithId.id);
    }
    
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}