import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { getStripe } from '@/lib/stripe/config';
import { TIER_PRICING, PERFORM_ADDON_PRICING } from '@/lib/stripe/prices';
import { format } from 'date-fns';
import type { TierName } from '@/types/database';
import type Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const supabase = await createSupabaseServerClient();
    const body = await request.json();
    
    const { 
      targetTier,
      accountId,
      billingPeriod = 'monthly',
      action // 'upgrade', 'downgrade', or 'switch-billing'
    } = body as {
      targetTier: TierName;
      accountId: string;
      billingPeriod?: 'monthly' | 'yearly';
      action: 'upgrade' | 'downgrade' | 'switch-billing';
    };

    // Validate tier
    if (!targetTier || !['PRO', 'SCALE', 'MAX'].includes(targetTier)) {
      return NextResponse.json(
        { error: 'Invalid tier selected' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to change plans' },
        { status: 401 }
      );
    }

    // Verify the account and get subscription details
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .single();
    
    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Verify user has permission (account owner or platform admin)
    const { data: accountUser } = await supabase
      .from('account_users')
      .select('role, account_id')
      .eq('user_id', user.id)
      .in('account_id', [accountId, '00000000-0000-0000-0000-000000000000']);
    
    console.log('Permission check:', {
      userId: user.id,
      accountId,
      accountUserRecords: accountUser,
    });
    
    const isOwner = accountUser?.some(u => u.account_id === accountId && u.role === 'account_owner');
    const isPlatformAdmin = accountUser?.some(u => 
      u.account_id === '00000000-0000-0000-0000-000000000000' && u.role === 'admin'
    );
    
    console.log('Permission results:', { isOwner, isPlatformAdmin });
    
    if (!isOwner && !isPlatformAdmin) {
      return NextResponse.json(
        { error: 'Only account owners or platform admins can change billing plans' },
        { status: 403 }
      );
    }

    // Check if account has an active subscription
    if (!account.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found. Please subscribe first.' },
        { status: 400 }
      );
    }

    // Get the current subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(
      account.stripe_subscription_id,
      { expand: ['customer', 'items.data.price'] }
    );

    if (subscription.status === 'canceled' || subscription.status === 'incomplete_expired') {
      return NextResponse.json(
        { error: 'Subscription is not active' },
        { status: 400 }
      );
    }

    // If subscription has an existing schedule, release it first
    if (subscription.schedule) {
      console.log('Releasing existing schedule:', subscription.schedule);
      try {
        await stripe.subscriptionSchedules.release(
          typeof subscription.schedule === 'string' ? subscription.schedule : subscription.schedule.id
        );
        console.log('Schedule released successfully');
      } catch (error) {
        console.error('Error releasing schedule:', error);
        // Continue anyway - the schedule might already be released
      }
    }

    // Find the subscription item for the main plan (not addons)
    // Main plan items are identified by matching known tier price IDs
    const allTierPriceIds = [
      TIER_PRICING.PRO.monthlyPriceId,
      TIER_PRICING.PRO.yearlyPriceId,
      TIER_PRICING.SCALE.monthlyPriceId,
      TIER_PRICING.SCALE.yearlyPriceId,
      TIER_PRICING.MAX.monthlyPriceId,
      TIER_PRICING.MAX.yearlyPriceId,
    ];
    
    const mainPlanItem = subscription.items.data.find(item => {
      const priceId = item.price.id;
      return allTierPriceIds.includes(priceId);
    });

    if (!mainPlanItem) {
      console.error('=== SUBSCRIPTION DEBUG ===');
      console.error('Looking for one of these price IDs:', allTierPriceIds);
      console.error('Subscription items found:', subscription.items.data.map(item => ({
        itemId: item.id,
        priceId: item.price.id,
        productId: typeof item.price.product === 'string' ? item.price.product : item.price.product.id,
        quantity: item.quantity,
      })));
      
      return NextResponse.json(
        { error: 'Could not find main plan in subscription. Check server logs for details.' },
        { status: 400 }
      );
    }
    
    console.log('Found main plan item:', {
      itemId: mainPlanItem.id,
      currentPriceId: mainPlanItem.price.id,
      currentTier: account.tier,
      targetTier: targetTier,
    });

    // Get the new price ID (handle FREE and BASIC tiers that don't have pricing)
    if (targetTier === 'FREE' || targetTier === 'BASIC') {
      return NextResponse.json(
        { error: 'Cannot downgrade to FREE or BASIC tier through this endpoint' },
        { status: 400 }
      );
    }
    
    const tierPricing = TIER_PRICING[targetTier as 'PRO' | 'SCALE' | 'MAX'];
    if (!tierPricing) {
      return NextResponse.json(
        { error: 'Invalid tier pricing configuration' },
        { status: 500 }
      );
    }

    const newPriceId = billingPeriod === 'yearly' 
      ? tierPricing.yearlyPriceId 
      : tierPricing.monthlyPriceId;

    // Prepare update parameters
    const updateParams: Stripe.SubscriptionUpdateParams = {
      items: [
        {
          id: mainPlanItem.id,
          price: newPriceId,
        }
      ],
      metadata: {
        ...subscription.metadata,
        tier: targetTier,
        previous_tier: account.tier,
      }
    };

    // Detect current billing period from the price ID
    const currentTierPricing = TIER_PRICING[account.tier as 'PRO' | 'SCALE' | 'MAX'];
    const isCurrentlyYearly = mainPlanItem.price.id === currentTierPricing?.yearlyPriceId;
    const currentBillingPeriod = isCurrentlyYearly ? 'yearly' : 'monthly';
    
    // Check if this is a billing downgrade (yearly to monthly)
    const isBillingDowngrade = action === 'switch-billing' && 
                               currentBillingPeriod === 'yearly' && 
                               billingPeriod === 'monthly';

    // Handle upgrade vs downgrade vs billing switch
    if (action === 'downgrade' || isBillingDowngrade) {
      // Downgrades are deferred until the end of the current billing period
      console.log(isBillingDowngrade ? 
        'Processing billing downgrade (yearly to monthly) - scheduling for end of current period' :
        'Processing tier downgrade - scheduling for end of current period');
      
      // In Stripe's Basil API (2025-07-30.basil), billing periods moved to item level
      // Get the current period end date from the main plan item
      const currentPeriodEnd = mainPlanItem.current_period_end;
      if (!currentPeriodEnd) {
        return NextResponse.json(
          { error: 'Could not determine current billing period end date' },
          { status: 500 }
        );
      }

      // Create a subscription schedule from the existing subscription
      // When using from_subscription, Stripe creates the initial phase automatically
      const schedule = await stripe.subscriptionSchedules.create({
        from_subscription: subscription.id,
      });

      // Get the current phase start date from the created schedule
      const currentPhaseStart = schedule.phases[0]?.start_date || Math.floor(Date.now() / 1000);

      // Now update the schedule with our desired phases
      const updatedSchedule = await stripe.subscriptionSchedules.update(schedule.id, {
        end_behavior: 'release',
        phases: [
          {
            // Keep current plan until period end
            start_date: currentPhaseStart,
            end_date: currentPeriodEnd,
            items: subscription.items.data.map(item => ({
              price: item.price.id,
              quantity: item.quantity || 1,
            })),
          },
          {
            // Switch to new plan after period end
            start_date: currentPeriodEnd,
            items: [
              // Include the new tier pricing
              {
                price: newPriceId,
                quantity: 1,
              },
              // Keep any addon items (non-tier items)
              ...subscription.items.data
                .filter(item => !allTierPriceIds.includes(item.price.id))
                .map(item => ({
                  price: item.price.id,
                  quantity: item.quantity || 1,
                })),
            ],
          },
        ],
      });

      // Update database with pending change information
      await supabase
        .from('accounts')
        .update({
          pending_tier_change: targetTier,
          pending_tier_change_date: new Date(currentPeriodEnd * 1000).toISOString(),
        })
        .eq('id', accountId);

      // Log the pending change
      const billingHistoryData = {
        account_id: accountId,
        event_type: 'downgrade_scheduled',
        old_tier: account.tier,
        new_tier: targetTier,
        metadata: {
          action: action,
          subscription_id: subscription.id,
          schedule_id: updatedSchedule.id,
          scheduled_date: new Date(currentPeriodEnd * 1000).toISOString(),
          billing_period: billingPeriod,
          is_billing_switch: isBillingDowngrade,
        },
      };
      
      console.log('[Subscription-Update] Saving billing history for:', 
        isBillingDowngrade ? `${account.tier} Yearly → ${targetTier} Monthly` : `${action} to ${targetTier} ${billingPeriod}`);
      
      // Use service client for billing history (bypasses RLS)
      const supabaseService = createSupabaseServiceClient();
      const { error: historyError } = await supabaseService
        .from('account_billing_history')
        .insert(billingHistoryData);
      
      if (historyError) {
        console.error('[Subscription-Update] Failed to create billing history:', historyError);
        // Don't fail the whole operation, just log the error
      } else {
        console.log('[Subscription-Update] Billing history created successfully');
      }

      const message = `Your downgrade to ${targetTier} has been scheduled. You'll continue to have access to ${account.tier} features until ${format(new Date(currentPeriodEnd * 1000), 'MMMM d, yyyy')}. The change will take effect automatically at that time.`;

      return NextResponse.json({
        success: true,
        message,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          schedule_id: schedule.id,
          transition_date: new Date(currentPeriodEnd * 1000).toISOString(),
        }
      });

    } else if (action === 'upgrade' || (action === 'switch-billing' && !isBillingDowngrade)) {
      // Upgrades and monthly-to-yearly switches happen immediately
      const isMonthlyToYearly = action === 'switch-billing' && 
                               currentBillingPeriod === 'monthly' && 
                               billingPeriod === 'yearly';
      console.log(isMonthlyToYearly ? 
        'Processing billing upgrade (monthly to yearly) - immediate with proration' :
        `Processing ${action} - immediate with proration`);
      updateParams.proration_behavior = 'create_prorations';

      // Update the subscription immediately
      const updatedSubscription = await stripe.subscriptions.update(
        subscription.id,
        updateParams
      );

      // Clear any pending changes and update tier for upgrades
      if (action === 'upgrade') {
        await supabase
          .from('accounts')
          .update({
            tier: targetTier,
            pending_tier_change: null,
            pending_tier_change_date: null,
          })
          .eq('id', accountId);
      }

      // Log the change
      await supabase
        .from('account_billing_history')
        .insert({
          account_id: accountId,
          event_type: action === 'upgrade' ? 'plan_upgraded' : 'billing_period_changed',
          old_tier: account.tier,
          new_tier: targetTier,
          metadata: {
            action: action,
            subscription_id: updatedSubscription.id,
            prorated: true,
            proration_behavior: updateParams.proration_behavior,
          },
        });

      const message = action === 'upgrade' 
        ? `Successfully upgraded to ${targetTier}. You've been charged the prorated difference.`
        : `Successfully switched to ${billingPeriod} billing. Your new billing schedule has been applied.`;

      return NextResponse.json({
        success: true,
        message,
        subscription: {
          id: updatedSubscription.id,
          status: updatedSubscription.status,
        }
      });
    }
    
  } catch (error) {
    console.error('Subscription update error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update subscription',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}