import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/config';
import { PERFORM_ADDON_PRICING } from '@/lib/stripe/prices';
import { createOrRetrieveCustomer } from '@/lib/stripe/utils';
import { SubscriptionState, SubscriptionAction, isActionAllowed } from '@/lib/services/subscription-state';
import type Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await request.json();
    
    const { 
      addon,
      accountId,
      isYearly = false,
    } = body as {
      addon: 'PERFORM';
      accountId: string;
      isYearly?: boolean;
    };

    // Validate addon
    if (addon !== 'PERFORM') {
      return NextResponse.json(
        { error: 'Invalid addon selected' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to purchase addons' },
        { status: 401 }
      );
    }

    // Verify the account and check current tier
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

    // Verify user has permission (account owner only)
    const { data: accountUser } = await supabase
      .from('account_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('account_id', accountId)
      .single();
    
    if (!accountUser || accountUser.role !== 'account_owner') {
      return NextResponse.json(
        { error: 'Only account owners can purchase addons' },
        { status: 403 }
      );
    }

    // Check if account has a premium package
    if (account.tier === 'FREE' || account.tier === 'BASIC') {
      return NextResponse.json(
        { error: 'PERFORM addon requires a premium package (PRO, SCALE, or MAX)' },
        { status: 400 }
      );
    }

    // Check if they already have PERFORM
    if (account.has_perform_addon) {
      return NextResponse.json(
        { error: 'Account already has PERFORM addon' },
        { status: 400 }
      );
    }

    // Check subscription state to see if addon changes are allowed
    const subscriptionState = account.subscription_state as SubscriptionState | null;
    if (subscriptionState) {
      // Check if adding addons is allowed in current state
      if (!isActionAllowed(subscriptionState, SubscriptionAction.ADD_ADDON)) {
        let errorMessage = 'Cannot add addons in the current subscription state.';
        
        // Provide specific error messages based on state
        if (subscriptionState === SubscriptionState.PENDING_CHANGE) {
          errorMessage = 'You have a pending plan change. Please wait for it to complete before adding addons.';
        } else if (subscriptionState === SubscriptionState.CANCELING) {
          errorMessage = 'Your subscription is scheduled for cancellation. Please reactivate it before adding addons.';
        } else if (subscriptionState === SubscriptionState.PAST_DUE) {
          errorMessage = 'Your subscription is past due. Please update your payment method before adding addons.';
        } else if (subscriptionState === SubscriptionState.INCOMPLETE) {
          errorMessage = 'Your subscription setup is incomplete. Please complete the payment first.';
        } else if (subscriptionState === SubscriptionState.INCOMPLETE_EXPIRED) {
          errorMessage = 'Your subscription has expired. Please start a new subscription.';
        }
        
        return NextResponse.json(
          { 
            error: errorMessage,
            currentState: subscriptionState
          },
          { status: 400 }
        );
      }
    }

    // Get stripe instance
    const stripe = getStripe();
    
    // Create or retrieve Stripe customer
    const stripeCustomerId = await createOrRetrieveCustomer(
      user.email || '',
      accountId,
      account.name
    );

    // Determine which price to use
    const priceId = isYearly 
      ? PERFORM_ADDON_PRICING.yearlyPriceId 
      : PERFORM_ADDON_PRICING.monthlyPriceId;

    // Build line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price: priceId,
        quantity: 1,
      }
    ];

    // Add setup fee if not already paid
    if (!account.perform_setup_fee_paid) {
      lineItems.push({
        price: PERFORM_ADDON_PRICING.setupFeeId,
        quantity: 1,
      });
    }

    // Create Stripe checkout session for addon
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/billing?success=true&addon=perform`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/billing/plans?canceled=true`,
      metadata: {
        account_id: accountId,
        user_id: user.id,
        addon: 'PERFORM',
        flow: 'addon',
      },
      subscription_data: {
        metadata: {
          account_id: accountId,
          addon: 'PERFORM',
        },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Addon checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create addon checkout session' },
      { status: 500 }
    );
  }
}