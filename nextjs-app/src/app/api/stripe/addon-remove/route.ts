import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/config';
import { PERFORM_ADDON_PRICING } from '@/lib/stripe/prices';
import type Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const supabase = await createSupabaseServerClient();
    const body = await request.json();
    
    const { 
      accountId,
      addon = 'PERFORM',
    } = body as {
      accountId: string;
      addon?: 'PERFORM';
    };

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to remove addons' },
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
    
    const isOwner = accountUser?.some(u => u.account_id === accountId && u.role === 'account_owner');
    const isPlatformAdmin = accountUser?.some(u => 
      u.account_id === '00000000-0000-0000-0000-000000000000' && u.role === 'admin'
    );
    
    if (!isOwner && !isPlatformAdmin) {
      return NextResponse.json(
        { error: 'Only account owners or platform admins can modify addons' },
        { status: 403 }
      );
    }

    // Check if account has an active subscription
    if (!account.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      );
    }

    // Get the current subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(
      account.stripe_subscription_id
    );

    if (subscription.status === 'canceled' || subscription.status === 'incomplete_expired') {
      return NextResponse.json(
        { error: 'Subscription is not active' },
        { status: 400 }
      );
    }

    // Find the PERFORM addon item
    const performPriceIds = [
      PERFORM_ADDON_PRICING.monthlyPriceId,
      PERFORM_ADDON_PRICING.yearlyPriceId,
    ];
    
    const performItem = subscription.items.data.find(item => 
      performPriceIds.includes(item.price.id)
    );

    if (!performItem) {
      return NextResponse.json(
        { error: 'PERFORM addon not found in subscription' },
        { status: 400 }
      );
    }

    console.log('Found PERFORM addon item to remove:', {
      itemId: performItem.id,
      priceId: performItem.price.id,
    });

    // Remove the PERFORM addon from the subscription
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.id,
      {
        items: [
          {
            id: performItem.id,
            deleted: true,
          }
        ],
        proration_behavior: 'create_prorations', // Credit for unused time
      }
    );

    // Update account to mark PERFORM as removed
    await supabase
      .from('accounts')
      .update({
        has_perform_addon: false,
      })
      .eq('id', accountId);

    // Log the change
    await supabase
      .from('account_billing_history')
      .insert({
        account_id: accountId,
        event_type: 'addon_removed',
        metadata: {
          addon: 'PERFORM',
          subscription_id: updatedSubscription.id,
          removed_price_id: performItem.price.id,
          prorated: true,
        },
      });

    return NextResponse.json({
      success: true,
      message: 'PERFORM addon has been removed. You\'ve been credited for unused time.',
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
      }
    });
    
  } catch (error) {
    console.error('Addon removal error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to remove addon',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}