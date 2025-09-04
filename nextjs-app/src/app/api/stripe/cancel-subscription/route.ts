import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/config';
import { SubscriptionState } from '@/lib/services/subscription-state';
import { format } from 'date-fns';
import { sendEmail } from '@/lib/services/email';
import CancellationNotificationEmail from '@/emails/cancellation-notification';
import * as React from 'react';

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const supabase = await createSupabaseServerClient();
    const body = await request.json();
    
    const { accountId, reason, feedback } = body as { 
      accountId: string;
      reason?: string;
      feedback?: string;
    };

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
        { error: 'You must be logged in to cancel subscription' },
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

    // Check if account has an active subscription
    if (!account.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
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
        { error: 'Only account owners or platform admins can cancel subscriptions' },
        { status: 403 }
      );
    }

    // Cancel subscription at period end in Stripe
    await stripe.subscriptions.update(
      account.stripe_subscription_id,
      { 
        cancel_at_period_end: true
      }
    );

    // Retrieve the full subscription object with all details
    const subscription = await stripe.subscriptions.retrieve(
      account.stripe_subscription_id,
      {
        expand: ['items.data.price']
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any; // Cast to any to access properties - Stripe types are complex

    // Update account in database
    const { error: updateError } = await supabase
      .from('accounts')
      .update({
        subscription_state: SubscriptionState.CANCELING,
        // Clear any pending tier changes since we're canceling
        pending_tier_change: null,
        pending_tier_change_date: null,
      })
      .eq('id', accountId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating account:', updateError);
      // Try to revert Stripe cancellation
      try {
        await stripe.subscriptions.update(
          account.stripe_subscription_id,
          { cancel_at_period_end: false }
        );
      } catch (revertError) {
        console.error('Failed to revert Stripe cancellation:', revertError);
      }
      
      return NextResponse.json(
        { error: 'Failed to update account' },
        { status: 500 }
      );
    }

    // Log the cancellation in billing history
    await supabase
      .from('account_billing_history')
      .insert({
        account_id: accountId,
        event_type: 'subscription_cancelled',
        old_tier: account.tier,
        new_tier: account.tier, // Stays same until period end
        metadata: {
          cancelled_by: user.id,
          cancelled_at: new Date().toISOString(),
          cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
          reason: reason || null,
          feedback: feedback || null,
        },
      })
      .select()
      .single();

    // Use cancel_at if available (most accurate), otherwise use current_period_end
    const cancelTimestamp = subscription.cancel_at || subscription.current_period_end;
    const cancelDate = cancelTimestamp
      ? new Date(cancelTimestamp * 1000)
      : new Date();

    // Debug logging for subscriptions
    console.log('Subscription cancellation details:', {
      subscription_id: subscription.id,
      interval: subscription.items?.data?.[0]?.price?.recurring?.interval,
      current_period_end: subscription.current_period_end,
      current_period_start: subscription.current_period_start,
      cancel_at: subscription.cancel_at,
      cancel_at_period_end: subscription.cancel_at_period_end,
      cancelTimestamp: cancelTimestamp,
      cancelDate: cancelDate.toISOString(),
      tier: account.tier,
    });

    // Format date properly for display using date-fns (e.g., "September 3, 2026")
    const cancelDateFormatted = format(cancelDate, 'MMMM d, yyyy');
    
    // Send cancellation notification email to hello@wondrousdigital.com
    // This is non-blocking - we don't want email failure to prevent cancellation
    try {
      // Get user's full profile for the email
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      
      // Determine user's role in the account
      const userRole = isOwner ? 'Account Owner' : 
                       isPlatformAdmin ? 'Platform Admin' : 'User';
      
      // Send notification email
      await sendEmail({
        to: 'hello@wondrousdigital.com',
        from: 'notifications@wondrousdigital.com',
        subject: `[Cancellation] ${account.name} - ${account.tier} Plan`,
        react: React.createElement(CancellationNotificationEmail, {
          accountName: account.name,
          accountId: accountId,
          accountTier: account.tier,
          userEmail: user.email || '',
          userName: userProfile?.full_name,
          userRole: userRole,
          cancellationReason: reason,
          additionalFeedback: feedback,
          cancelledAt: format(new Date(), "MMMM d, yyyy 'at' h:mm a"),
          subscriptionEndsAt: cancelDateFormatted,
          stripeCustomerId: account.stripe_customer_id,
          stripeSubscriptionId: account.stripe_subscription_id,
        }),
      });
      
      console.log('Cancellation notification email sent to hello@wondrousdigital.com');
    } catch (emailError) {
      // Log error but don't fail the cancellation
      console.error('Failed to send cancellation notification email:', emailError);
      // Could store this in a failed_notifications table for retry later
    }

    return NextResponse.json({
      success: true,
      message: `Your ${account.tier} subscription is scheduled to cancel on ${cancelDateFormatted}. You will retain access until then.`,
      cancelDate: cancelDate.toISOString(),
      currentTier: account.tier,
    });
    
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to cancel subscription',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}