import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/config';
import { SubscriptionState } from '@/lib/services/subscription-state';
import type Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const supabase = await createSupabaseServerClient();
    const body = await request.json();
    
    const { accountId } = body as { accountId: string };

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to reactivate subscription' },
        { status: 401 }
      );
    }

    // Get account details
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

    // Check if account has a subscription
    if (!account.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No subscription found to reactivate' },
        { status: 400 }
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
        { error: 'Only account owners or platform admins can reactivate subscriptions' },
        { status: 403 }
      );
    }

    // Check if subscription is actually scheduled for cancellation
    const subscription = await stripe.subscriptions.retrieve(account.stripe_subscription_id);
    
    if (!subscription.cancel_at_period_end) {
      return NextResponse.json(
        { error: 'Subscription is not scheduled for cancellation' },
        { status: 400 }
      );
    }

    // Reactivate subscription in Stripe
    const updatedSubscription = await stripe.subscriptions.update(
      account.stripe_subscription_id,
      { cancel_at_period_end: false }
    ) as Stripe.Subscription;

    // Update account in database
    const { error: updateError } = await supabase
      .from('accounts')
      .update({
        subscription_state: SubscriptionState.ACTIVE,
      })
      .eq('id', accountId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating account:', updateError);
      // Try to revert Stripe reactivation
      try {
        await stripe.subscriptions.update(
          account.stripe_subscription_id,
          { cancel_at_period_end: true }
        );
      } catch (revertError) {
        console.error('Failed to revert Stripe reactivation:', revertError);
      }
      
      return NextResponse.json(
        { error: 'Failed to update account' },
        { status: 500 }
      );
    }

    // Log the reactivation in billing history
    await supabase
      .from('account_billing_history')
      .insert({
        account_id: accountId,
        event_type: 'subscription_reactivated',
        old_tier: account.tier,
        new_tier: account.tier,
        metadata: {
          reactivated_by: user.id,
          reactivated_at: new Date().toISOString(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          next_billing_date: (updatedSubscription as any).current_period_end
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? new Date((updatedSubscription as any).current_period_end * 1000).toISOString()
            : null,
        },
      })
      .select()
      .single();

    return NextResponse.json({
      success: true,
      message: `Your ${account.tier} subscription has been reactivated successfully.`,
      tier: account.tier,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      nextBillingDate: (updatedSubscription as any).current_period_end
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? new Date((updatedSubscription as any).current_period_end * 1000).toISOString()
        : null,
    });
    
  } catch (error) {
    console.error('Reactivate subscription error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to reactivate subscription',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}