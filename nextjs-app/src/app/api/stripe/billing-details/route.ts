import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/config';
import type Stripe from 'stripe';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to view billing details' },
        { status: 401 }
      );
    }

    // Get account ID from query params
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    
    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Get account details including pending tier changes
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

    // Verify user has permission
    const { data: accountUser } = await supabase
      .from('account_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('account_id', accountId)
      .single();
    
    if (!accountUser) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Initialize Stripe AFTER authentication is verified
    const stripe = getStripe();
    if (!stripe) {
      throw new Error('Stripe not properly initialized');
    }

    // If no Stripe customer, return basic info
    if (!account.stripe_customer_id) {
      return NextResponse.json({
        account: {
          tier: account.tier,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
        },
        billingStatus: {
          status: 'no_subscription',
          message: 'No active subscription',
          paidUntil: null,
          amountDue: 0,
        },
        subscription: null,
        invoices: [],
        upcomingInvoice: null,
      });
    }

    // Fetch customer details to get credit balance
    let creditBalance = 0;
    try {
      const customer = await stripe.customers.retrieve(account.stripe_customer_id);
      if (!customer.deleted && 'balance' in customer) {
        // Customer balance is in cents and negative means credit
        creditBalance = Math.abs(customer.balance || 0) / 100;
        console.log('Customer credit balance:', creditBalance);
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
    }

    // Fetch subscription details if exists
    let subscription: Stripe.Subscription | null = null;
    if (account.stripe_subscription_id) {
      try {
        subscription = await stripe.subscriptions.retrieve(
          account.stripe_subscription_id,
          { expand: ['customer', 'items.data.price'] }
        );
      } catch (error) {
        console.error('Error fetching subscription:', error);
      }
    }

    // Fetch invoices with line items (now includes all payments including upgrades)
    const invoices = await stripe.invoices.list({
      customer: account.stripe_customer_id,
      limit: 20, // Increased limit since this now includes all payments
      expand: ['data.lines.data.price'],
    });

    // Format invoice data with human-readable information
    const formattedInvoices = invoices.data.map(invoice => {
      // Group line items by invoice
      const lineItems = invoice.lines.data.map(item => {
        // Get product name from item description first, then try expanded product
        const productName = item.description || 'Subscription';
        
        // Try to get product name from expanded data if available
        // Note: InvoiceLineItem doesn't have a price property in newer Stripe versions
        // The product info should come from the description field
        
        // Determine if this is a setup fee or subscription
        const isSetupFee = productName.toLowerCase().includes('setup') || 
                          productName.toLowerCase().includes('one time') ||
                          productName.toLowerCase().includes('fee');
        
        return {
          description: productName,
          amount: item.amount / 100,
          quantity: item.quantity,
          isSetupFee,
          period: item.period ? {
            start: new Date(item.period.start * 1000).toISOString(),
            end: new Date(item.period.end * 1000).toISOString(),
          } : null,
        };
      });

      // Determine human-readable status
      let status = 'PENDING';
      if (invoice.status === 'paid') {
        status = 'PAID';
      } else if (invoice.status === 'open') {
        status = 'UNPAID';
      } else if (invoice.status === 'void') {
        status = 'CANCELLED';
      } else if (invoice.status === 'uncollectible') {
        status = 'FAILED';
      }

      return {
        id: invoice.id,
        number: invoice.number,
        status,
        amount: invoice.amount_paid / 100,
        subtotal: invoice.subtotal / 100,
        total: invoice.total / 100,
        created: new Date(invoice.created * 1000).toISOString(),
        paidAt: invoice.status_transitions?.paid_at 
          ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
          : null,
        lineItems,
        hostedInvoiceUrl: invoice.hosted_invoice_url, // Use hosted page for consistency
        invoicePdf: invoice.hosted_invoice_url, // Use same URL for both to ensure consistency
      };
    });

    // All payments are now invoices, no need to fetch separate charges
    // Sort all payment records by date (newest first)
    const allPayments = formattedInvoices
      .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

    // Get upcoming invoice preview if subscription exists
    let upcomingInvoice = null;
    if (subscription && subscription.status === 'active') {
      try {
        const upcoming = await stripe.invoices.createPreview({
          customer: account.stripe_customer_id,
          subscription: subscription.id, // Include subscription ID for existing subscriptions
        });
        
        upcomingInvoice = {
          amount: upcoming.total / 100,
          dueDate: upcoming.period_end 
            ? new Date(upcoming.period_end * 1000).toISOString()
            : null,
          lineItems: upcoming.lines.data.map(item => ({
            description: item.description || 'Subscription',
            amount: item.amount / 100,
            quantity: item.quantity || 1,
          })),
        };
      } catch (error) {
        console.error('Error fetching upcoming invoice:', error);
      }
    }

    // Format subscription data
    let subscriptionData = null;
    if (subscription) {
      // Determine billing period
      const mainItem = subscription.items.data[0];
      const interval = mainItem?.price?.recurring?.interval;
      const billingPeriod = interval === 'year' ? 'yearly' : 'monthly';
      
      // In Stripe's Basil API (2025-07-30.basil), billing periods moved to item level
      const currentPeriodStart = mainItem?.current_period_start;
      const currentPeriodEnd = mainItem?.current_period_end;
      
      // Calculate next billing amount
      const nextAmount = subscription.items.data.reduce((sum, item) => {
        return sum + ((item.price.unit_amount || 0) * (item.quantity || 1));
      }, 0) / 100;

      subscriptionData = {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: currentPeriodEnd
          ? new Date(currentPeriodEnd * 1000).toISOString()
          : null,
        currentPeriodStart: currentPeriodStart
          ? new Date(currentPeriodStart * 1000).toISOString()
          : null,
        billingPeriod,
        nextBillingDate: currentPeriodEnd
          ? new Date(currentPeriodEnd * 1000).toISOString()
          : null,
        nextBillingAmount: nextAmount,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at 
          ? new Date(subscription.canceled_at * 1000).toISOString() 
          : null,
        items: subscription.items.data.map(item => ({
          priceId: item.price.id,
          productName: 'Subscription', // We can't expand product deeply enough
          amount: (item.price.unit_amount || 0) / 100,
          quantity: item.quantity || 1,
          interval: item.price.recurring?.interval,
        })),
      };
    }

    // Calculate credit exhaustion date if there's a credit balance
    let creditExhaustionDate: string | null = null;
    let creditCoversMonths = 0;
    let billingAnniversaryChange: { from: number; to: number } | null = null;
    
    if (creditBalance > 0 && subscription && subscriptionData) {
      const monthlyAmount = subscriptionData.nextBillingAmount;
      if (monthlyAmount > 0) {
        // Calculate exact months (with decimals) for display
        creditCoversMonths = creditBalance / monthlyAmount;
        
        // Calculate exact exhaustion date using days (same as confirmation page)
        const daysCredit = creditCoversMonths * 30;
        const exhaustionDate = new Date();
        exhaustionDate.setDate(exhaustionDate.getDate() + Math.round(daysCredit));
        
        // Check if billing anniversary changes
        const currentPeriodEnd = subscriptionData.currentPeriodEnd ? new Date(subscriptionData.currentPeriodEnd) : null;
        if (currentPeriodEnd) {
          const originalDay = currentPeriodEnd.getDate();
          const newDay = exhaustionDate.getDate();
          if (originalDay !== newDay) {
            billingAnniversaryChange = { from: originalDay, to: newDay };
          }
        }
        
        creditExhaustionDate = exhaustionDate.toISOString();
        console.log(`Credit balance ${creditBalance} covers ${creditCoversMonths.toFixed(2)} months (${Math.round(daysCredit)} days) until ${creditExhaustionDate}`);
      }
    }

    // Determine overall billing status
    let billingStatus = {
      status: 'no_subscription' as 'paid' | 'overdue' | 'no_subscription',
      message: '',
      paidUntil: null as string | null,
      amountDue: 0,
      creditBalance: creditBalance,
      creditExhaustionDate: creditExhaustionDate,
      creditCoversMonths: creditCoversMonths,
      billingAnniversaryChange: billingAnniversaryChange,
    };

    if (subscription) {
      // Get billing period from first item (Basil API change)
      const mainItem = subscription.items.data[0];
      const currentPeriodEnd = mainItem?.current_period_end;
      
      if (currentPeriodEnd) {
        const periodEnd = new Date(currentPeriodEnd * 1000);
        // Use credit exhaustion date if available, otherwise use period end
        const effectivePaidUntil = creditExhaustionDate ? new Date(creditExhaustionDate) : periodEnd;
        
        if (subscription.status === 'active') {
          billingStatus = {
            status: 'paid',
            message: `You're paid until ${effectivePaidUntil.toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}`,
            paidUntil: effectivePaidUntil.toISOString(),
            amountDue: 0,
            creditBalance: creditBalance,
            creditExhaustionDate: creditExhaustionDate,
            creditCoversMonths: creditCoversMonths,
            billingAnniversaryChange: billingAnniversaryChange,
          };
        } else if (subscription.status === 'past_due') {
          billingStatus = {
            status: 'overdue',
            message: `You're past due. Your account will be downgraded if not paid.`,
            paidUntil: null,
            amountDue: upcomingInvoice?.amount || 0,
            creditBalance: creditBalance,
            creditExhaustionDate: creditExhaustionDate,
            creditCoversMonths: creditCoversMonths,
            billingAnniversaryChange: billingAnniversaryChange,
          };
        }
      } else {
        // Subscription exists but missing period dates
        billingStatus = {
          status: 'no_subscription',
          message: 'Subscription information unavailable',
          paidUntil: null,
          amountDue: 0,
          creditBalance: creditBalance,
          creditExhaustionDate: creditExhaustionDate,
          creditCoversMonths: creditCoversMonths,
          billingAnniversaryChange: billingAnniversaryChange,
        };
      }
    }

    // Build pending change information if it exists
    let pendingChange = null;
    if (account.pending_tier_change && account.pending_tier_change_date) {
      const changeDate = new Date(account.pending_tier_change_date);
      const now = new Date();
      const daysRemaining = Math.ceil((changeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate months remaining (roughly)
      const monthsRemaining = Math.floor(daysRemaining / 30);
      const remainingText = monthsRemaining > 0 
        ? `${monthsRemaining} month${monthsRemaining === 1 ? '' : 's'}`
        : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`;

      // Get the change request date from billing history
      // Just get the most recent downgrade_scheduled event
      const { data: changeHistory, error: historyError } = await supabase
        .from('account_billing_history')
        .select('created_at, metadata, new_tier, old_tier')
        .eq('account_id', accountId)
        .eq('event_type', 'downgrade_scheduled')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (historyError) {
        console.log('[Billing-Details] No billing history found:', historyError.message);
      }
      console.log('[Billing-Details] Change history:', changeHistory);

      // Determine current billing period from subscription
      const mainItem = subscription?.items?.data?.[0];
      const interval = mainItem?.price?.recurring?.interval;
      const currentBillingPeriod = interval === 'year' ? 'yearly' : 'monthly';
      
      // Get target billing period from metadata - cast metadata as any to access properties
      const metadata = changeHistory?.metadata as any;
      const targetBillingPeriod = metadata?.billing_period || currentBillingPeriod;
      
      if (changeHistory) {
        console.log('[Billing-Details] Using billing period from history:', {
          targetBillingPeriod,
          currentBillingPeriod,
          isBillingSwitch: account.tier === account.pending_tier_change,
        });
      }
      
      // Check if this is a billing switch (same tier, different billing period)
      const isBillingSwitch = account.tier === account.pending_tier_change;
      const hasYearlyDiscount = currentBillingPeriod === 'yearly';
      
      // Calculate the new rate based on target tier and target billing period
      let newRate = 0;
      if (account.pending_tier_change !== 'FREE' && account.pending_tier_change !== 'BASIC') {
        // Import pricing at the top of the file if not already imported
        const { TIER_PRICING } = await import('@/lib/stripe/prices');
        const targetTierPricing = TIER_PRICING[account.pending_tier_change as 'PRO' | 'SCALE' | 'MAX'];
        
        if (targetBillingPeriod === 'yearly') {
          // Use specific yearly prices
          const yearlyPrices = { PRO: 4287, SCALE: 7527, MAX: 10767 };
          newRate = yearlyPrices[account.pending_tier_change as keyof typeof yearlyPrices] || 0;
        } else {
          // Use monthly price - displayPrice is already in cents, so divide by 100
          newRate = targetTierPricing.displayPrice / 100; // Convert from cents to dollars
        }
      }

      pendingChange = {
        targetTier: account.pending_tier_change,
        changeDate: changeDate.toISOString(),
        requestDate: changeHistory?.created_at || new Date().toISOString(),
        currentTier: account.tier,
        remainingTime: remainingText,
        daysRemaining,
        newRate,
        isBillingSwitch,
        currentBillingPeriod,
        targetBillingPeriod,
        hasYearlyDiscount,
      };
    }

    return NextResponse.json({
      account: {
        tier: account.tier,
        stripeCustomerId: account.stripe_customer_id,
        stripeSubscriptionId: account.stripe_subscription_id,
        pendingTierChange: account.pending_tier_change,
        pendingTierChangeDate: account.pending_tier_change_date,
      },
      billingStatus,
      subscription: subscriptionData,
      invoices: allPayments, // Now includes both invoices and one-time charges
      upcomingInvoice,
      pendingChange,
    });
    
  } catch (error) {
    console.error('Billing details error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch billing details',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}