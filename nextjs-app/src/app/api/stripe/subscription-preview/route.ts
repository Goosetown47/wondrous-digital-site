import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/config';
import { TIER_PRICING, PERFORM_ADDON_PRICING } from '@/lib/stripe/prices';
import type { TierName } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const supabase = await createSupabaseServerClient();
    const body = await request.json();
    
    const {
      accountId,
      targetTier,
      action,
      billingPeriod = 'monthly',
      addon,
    } = body as {
      accountId: string;
      targetTier: TierName;
      action: 'upgrade' | 'downgrade' | 'addon' | 'remove-addon' | 'switch-billing';
      billingPeriod?: 'monthly' | 'yearly';
      addon?: 'PERFORM';
    };

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to preview changes' },
        { status: 401 }
      );
    }

    // Get account with subscription details
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

    // If no subscription, return basic pricing info
    if (!account.stripe_subscription_id) {
      const tierPricing = TIER_PRICING[targetTier as keyof typeof TIER_PRICING];
      if (!tierPricing) {
        return NextResponse.json(
          { error: 'Invalid tier' },
          { status: 400 }
        );
      }
      
      const yearlyPrices = { PRO: 4287, SCALE: 7527, MAX: 10767 };
      const price = billingPeriod === 'yearly' 
        ? (yearlyPrices[targetTier as keyof typeof yearlyPrices] || 0)
        : tierPricing.displayPrice / 100;
      
      return NextResponse.json({
        hasSubscription: false,
        immediateCharge: price,
        futureAmount: price,
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        billingPeriod,
        setupFees: 1500, // Marketing platform setup fee for new customers
      });
    }

    // Get the current subscription from Stripe with all details
    const subscription = await stripe.subscriptions.retrieve(
      account.stripe_subscription_id,
      { expand: ['customer', 'items.data.price'] }
    );

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Get customer ID
    const customerId = typeof subscription.customer === 'string' 
      ? subscription.customer 
      : subscription.customer.id;

    // Find the main plan item (not PERFORM addon)
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
      return NextResponse.json(
        { error: 'Could not find main plan in subscription' },
        { status: 400 }
      );
    }
    
    // Detect current billing period from the actual subscription
    const currentTierPricing = TIER_PRICING[account.tier as keyof typeof TIER_PRICING];
    const currentIsYearly = currentTierPricing && mainPlanItem.price.id === currentTierPricing.yearlyPriceId;
    const currentBillingPeriod = currentIsYearly ? 'yearly' : 'monthly';
    const currentPrice = mainPlanItem.price.unit_amount! / 100;

    // Calculate what will happen based on the action
    let upcomingInvoice;
    let immediateCharge = 0;
    let credit = 0;
    let futureAmount = 0;
    let isScheduledChange = false;
    let scheduledDate: Date | null = null;
    let setupFees = 0;

    // Get new price ID based on action
    let newPriceId: string | undefined;

    if (action === 'upgrade' || action === 'downgrade') {
      // Tier change
      const tierPricing = TIER_PRICING[targetTier as keyof typeof TIER_PRICING];
      if (!tierPricing) {
        throw new Error(`Invalid target tier: ${targetTier}`);
      }
      newPriceId = billingPeriod === 'yearly' 
        ? tierPricing.yearlyPriceId 
        : tierPricing.monthlyPriceId;
    } else if (action === 'switch-billing') {
      // Same tier, different billing period
      const currentTier = account.tier as Exclude<TierName, 'FREE' | 'BASIC'>;
      const tierPricing = TIER_PRICING[currentTier];
      newPriceId = billingPeriod === 'yearly' 
        ? tierPricing.yearlyPriceId 
        : tierPricing.monthlyPriceId;
    } else if (action === 'addon' && addon === 'PERFORM') {
      // Add setup fee if not paid
      if (!account.perform_setup_fee_paid) {
        setupFees = 750;
      }
    }

    // Get upcoming invoice preview from Stripe
    try {
      // Build subscription items for the preview
      let subscriptionItems: any[] = [];
      
      if (action === 'upgrade' || action === 'downgrade' || action === 'switch-billing') {
        subscriptionItems = [{
          id: mainPlanItem.id,
          price: newPriceId,
        }];
      } else if (action === 'addon' && addon === 'PERFORM') {
        // For addons, keep existing items and add new one
        subscriptionItems = [
          ...subscription.items.data.map(item => ({
            id: item.id,
            price: item.price.id,
            quantity: item.quantity,
          })),
          {
            price: billingPeriod === 'yearly' 
              ? PERFORM_ADDON_PRICING.yearlyPriceId
              : PERFORM_ADDON_PRICING.monthlyPriceId,
            quantity: 1,
          }
        ];
      } else if (action === 'remove-addon') {
        // For removing addons, filter out PERFORM prices
        const performPriceIds = [
          PERFORM_ADDON_PRICING.monthlyPriceId,
          PERFORM_ADDON_PRICING.yearlyPriceId,
        ];
        subscriptionItems = subscription.items.data
          .filter(item => !performPriceIds.includes(item.price.id))
          .map(item => ({
            id: item.id,
            price: item.price.id,
            quantity: item.quantity,
          }));
      }

      // Use createPreview for existing subscriptions with subscription_details
      upcomingInvoice = await stripe.invoices.createPreview({
        customer: customerId,
        subscription: subscription.id,
        subscription_details: {
          items: subscriptionItems,
          proration_behavior: action === 'downgrade' ? 'always_invoice' : 'create_prorations',
        },
      });

      console.log('=== STRIPE INVOICE PREVIEW DEBUG ===');
      console.log('Action:', action);
      console.log('Current tier:', account.tier, 'Target tier:', targetTier);
      console.log('Current billing:', currentBillingPeriod, 'Target billing:', billingPeriod);
      console.log('Total lines in preview:', upcomingInvoice.lines.data.length);
      console.log('Invoice amount_due from Stripe:', upcomingInvoice.amount_due / 100);
      
      // For upgrades, use Stripe's actual amount_due as the source of truth
      // This ensures we always show exactly what Stripe will charge
      if (action === 'upgrade') {
        // For upgrades, we need to filter out charges for future billing periods
        // Get the current period end date to identify current vs future charges
        const currentPeriodEnd = mainPlanItem.current_period_end ? mainPlanItem.current_period_end * 1000 : Date.now();
        
        // Filter line items to only include those for the current billing period
        // Exclude items that start AFTER the current period ends (future renewals)
        const currentPeriodItems = upcomingInvoice.lines.data.filter(line => {
          if (!line.period) return true; // Include items without periods
          const periodStart = line.period.start * 1000;
          return periodStart < currentPeriodEnd; // Only include if starts before current period ends
        });
        
        console.log('Filtering line items for current period:');
        console.log('  Current period ends:', new Date(currentPeriodEnd).toISOString());
        console.log('  Total line items:', upcomingInvoice.lines.data.length);
        console.log('  Current period items:', currentPeriodItems.length);
        
        // Calculate the immediate charge from current period items only
        const currentPeriodCharge = currentPeriodItems.reduce((sum, item) => sum + item.amount, 0) / 100;
        immediateCharge = Math.max(0, currentPeriodCharge) + setupFees;
        
        // Calculate credits from negative line items (for display purposes)
        const creditItems = currentPeriodItems.filter(line => line.amount < 0);
        const unusedCredit = creditItems.reduce((sum, item) => sum + Math.abs(item.amount), 0) / 100;
        
        // Calculate new charges from positive line items (for display purposes)
        const chargeItems = currentPeriodItems.filter(line => line.amount > 0);
        const newCharges = chargeItems.reduce((sum, item) => sum + item.amount, 0) / 100;
        
        console.log('Upgrade calculation (current period only):');
        console.log('  Unused credit (from negative items):', unusedCredit);
        console.log('  New charges (from positive items):', newCharges);
        console.log('  Net charge for current period:', currentPeriodCharge);
        console.log('  Setup fees:', setupFees);
        console.log('  Total immediate charge:', immediateCharge);
        
        // Log excluded future items for debugging
        const futureItems = upcomingInvoice.lines.data.filter(line => {
          if (!line.period) return false;
          const periodStart = line.period.start * 1000;
          return periodStart >= currentPeriodEnd;
        });
        
        if (futureItems.length > 0) {
          console.log('Excluded future period items:');
          futureItems.forEach(item => {
            console.log(`  - ${item.description}: $${item.amount / 100} (starts ${new Date(item.period!.start * 1000).toISOString()})`);
          });
        }
        
        // For display purposes, show the breakdown
        credit = 0; // Credits are already factored into the immediate charge
        
      } else if (action === 'downgrade') {
        // Downgrades don't charge immediately - they're scheduled for period end
        immediateCharge = 0;
        credit = 0; // No credit applied immediately since change is deferred
        
        // Set scheduled change flag
        isScheduledChange = true;
        scheduledDate = mainPlanItem.current_period_end ? 
          new Date(mainPlanItem.current_period_end * 1000) : 
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Fallback to 30 days
        
        console.log('Downgrade - scheduled for period end');
        console.log('  Change scheduled for:', scheduledDate.toISOString());
        
      } else if (action === 'switch-billing') {
        // Check if this is an upgrade (monthly to yearly) or downgrade (yearly to monthly)
        const isUpgradingBilling = currentBillingPeriod === 'monthly' && billingPeriod === 'yearly';
        
        if (isUpgradingBilling) {
          // Monthly to yearly is like an upgrade - charge the difference
          const currentPeriodEnd = mainPlanItem.current_period_end ? mainPlanItem.current_period_end * 1000 : Date.now();
          
          // Filter line items to only include those for the current billing period
          const currentPeriodItems = upcomingInvoice.lines.data.filter(line => {
            if (!line.period) return true;
            const periodStart = line.period.start * 1000;
            return periodStart < currentPeriodEnd;
          });
          
          const currentPeriodCharge = currentPeriodItems.reduce((sum, item) => sum + item.amount, 0) / 100;
          immediateCharge = Math.max(0, currentPeriodCharge) + setupFees;
          credit = 0; // No credit for upgrades
          
          console.log('Monthly to Yearly switch (upgrade-like):');
          console.log('  Immediate charge:', immediateCharge);
        } else {
          // Yearly to monthly - deferred change (like a downgrade)
          immediateCharge = 0;
          credit = 0; // No credit applied since change is deferred
          
          // The change will be scheduled for the end of the current period
          // Set a flag to indicate this is a deferred change
          isScheduledChange = true;
          scheduledDate = mainPlanItem.current_period_end ? 
            new Date(mainPlanItem.current_period_end * 1000) : 
            new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Fallback to 1 year from now
          
          console.log('Yearly to Monthly switch (deferred):');
          console.log('  Change scheduled for:', scheduledDate.toISOString());
          console.log('  No immediate charge or credit - keeping current yearly rate until period end');
        }
      } else if (action === 'addon' || action === 'remove-addon') {
        // For addon actions, use Stripe's amount_due
        immediateCharge = Math.max(0, upcomingInvoice.amount_due / 100) + setupFees;
        
        console.log(`${action} calculation:`);
        console.log('  Stripe amount_due:', upcomingInvoice.amount_due / 100);
        console.log('  Setup fees:', setupFees);
        console.log('  Total immediate charge:', immediateCharge);
      }
      
      // Log line items for debugging
      console.log('Line items from Stripe:');
      upcomingInvoice.lines.data.forEach((item, i) => {
        console.log(`  ${i}: ${item.description} - $${item.amount / 100}`);
      });
      
      // For special case: yearly to monthly transition without credits detected
      const isYearlyToMonthly = currentIsYearly && billingPeriod === 'monthly';
      if (isYearlyToMonthly && credit === 0) {
        // If Stripe didn't calculate credits for a yearly to monthly switch,
        // calculate the credit manually for display purposes
        if (mainPlanItem.current_period_end && mainPlanItem.current_period_start) {
          const periodStart = mainPlanItem.current_period_start * 1000;
          const periodEnd = mainPlanItem.current_period_end * 1000;
          const now = Date.now();
          const remainingPercent = Math.max(0, (periodEnd - now) / (periodEnd - periodStart));
          credit = Math.round(currentPrice * remainingPercent);
          console.log('Yearly to monthly - manual credit calculation:', credit);
        }
      }
      
      // Future recurring amount - look for subscription items
      // Since proration and type properties don't exist, look for positive amounts for future tier
      const recurringItems = upcomingInvoice.lines.data.filter(
        line => line.amount > 0 && line.description?.includes(targetTier)
      );
      futureAmount = Math.round(
        recurringItems.reduce((sum, item) => sum + item.amount, 0) / 100
      );
      
      // If no recurring items found, calculate from the new price
      if (futureAmount === 0) {
        const newTierPricing = TIER_PRICING[targetTier as keyof typeof TIER_PRICING];
        const yearlyPrices = { PRO: 4287, SCALE: 7527, MAX: 10767 };
        futureAmount = billingPeriod === 'yearly'
          ? (yearlyPrices[targetTier as keyof typeof yearlyPrices] || 0)
          : newTierPricing.displayPrice / 100;
      }

    } catch (error) {
      console.error('Error retrieving upcoming invoice:', error);
      // Return error to client instead of using fallback calculations
      // This ensures we never show incorrect pricing
      return NextResponse.json(
        { 
          error: 'Unable to calculate pricing changes. Please try again or contact support.',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    // Calculate months remaining
    let monthsRemaining = 0;
    let daysRemaining = 0;
    if (mainPlanItem.current_period_end && mainPlanItem.current_period_start) {
      const now = Date.now();
      const periodEnd = mainPlanItem.current_period_end * 1000;
      daysRemaining = Math.max(0, Math.floor((periodEnd - now) / (1000 * 60 * 60 * 24)));
      monthsRemaining = Math.round(daysRemaining / 30);
    }
    
    console.log('=== FINAL CALCULATION ===');
    console.log('Immediate charge:', immediateCharge);
    console.log('Credit:', credit);
    console.log('Future amount:', futureAmount);
    console.log('Days remaining:', daysRemaining);
    console.log('Months remaining:', monthsRemaining);
    
    // Include Stripe's line items for full transparency
    const lineItems = upcomingInvoice.lines.data.map(line => ({
      description: line.description,
      amount: line.amount / 100,
      // proration property doesn't exist in new API, detect by description
      proration: line.description?.includes('Unused time') || line.description?.includes('Remaining time') || false,
      period: line.period ? {
        start: new Date(line.period.start * 1000).toISOString(),
        end: new Date(line.period.end * 1000).toISOString(),
      } : null,
    }));
    
    console.log('Line items from Stripe:', JSON.stringify(lineItems, null, 2));
    
    // Return the preview data (using item-level dates for Basil API)
    return NextResponse.json({
      hasSubscription: true,
      currentPeriod: mainPlanItem.current_period_start && mainPlanItem.current_period_end ? {
        start: new Date(mainPlanItem.current_period_start * 1000).toISOString(),
        end: new Date(mainPlanItem.current_period_end * 1000).toISOString(),
      } : null,
      monthsRemaining,
      daysRemaining,
      currentPlan: {
        tier: account.tier,
        amount: currentPrice,
        interval: currentBillingPeriod,
        isYearly: currentIsYearly,
        priceId: mainPlanItem.price.id,
      },
      changes: {
        immediateCharge,
        credit,
        setupFees,
        futureAmount,
        nextBillingDate: mainPlanItem.current_period_end 
          ? new Date(mainPlanItem.current_period_end * 1000).toISOString()
          : new Date(Date.now() + (currentIsYearly ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
        isScheduledChange,
        scheduledDate: scheduledDate ? scheduledDate.toISOString() : null,
      },
      subscription: {
        id: subscription.id,
        status: subscription.status,
        customerId,
      },
      // Include Stripe's actual calculations for debugging
      stripeLineItems: lineItems,
      stripeInvoiceTotal: upcomingInvoice.amount_due / 100,
    });
    
  } catch (error) {
    console.error('Subscription preview error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to preview subscription changes',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}