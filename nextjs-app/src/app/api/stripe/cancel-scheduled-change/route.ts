import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/config';

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
        { error: 'You must be logged in to cancel planned changes' },
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
        { error: 'Only account owners or platform admins can cancel planned changes' },
        { status: 403 }
      );
    }

    // Check if there's a pending change to cancel
    if (!account.pending_tier_change || !account.pending_tier_change_date) {
      return NextResponse.json(
        { error: 'No pending change found to cancel' },
        { status: 400 }
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
      account.stripe_subscription_id,
      { expand: ['schedule'] }
    );

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // If subscription has a schedule, release it
    if (subscription.schedule) {
      console.log('Releasing subscription schedule:', subscription.schedule);
      try {
        const scheduleId = typeof subscription.schedule === 'string' 
          ? subscription.schedule 
          : subscription.schedule.id;
          
        await stripe.subscriptionSchedules.release(scheduleId);
        console.log('Schedule released successfully');
      } catch (error) {
        console.error('Error releasing schedule:', error);
        return NextResponse.json(
          { 
            error: 'Failed to cancel the scheduled change',
            message: error instanceof Error ? error.message : 'Unknown error'
          },
          { status: 500 }
        );
      }
    } else {
      console.log('No schedule found on subscription');
    }

    // Clear pending change fields in database
    const { error: updateError } = await supabase
      .from('accounts')
      .update({
        pending_tier_change: null,
        pending_tier_change_date: null,
      })
      .eq('id', accountId);
    
    if (updateError) {
      console.error('Error updating account:', updateError);
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
        event_type: 'downgrade_cancelled',
        old_tier: account.tier,
        new_tier: account.tier, // Staying on same tier
        metadata: {
          cancelled_change: {
            from: account.tier,
            to: account.pending_tier_change,
            scheduled_date: account.pending_tier_change_date,
          },
          cancelled_by: user.id,
          cancelled_at: new Date().toISOString(),
        },
      });

    return NextResponse.json({
      success: true,
      message: `Successfully cancelled the planned change to ${account.pending_tier_change}. You will remain on your ${account.tier} plan.`,
    });
    
  } catch (error) {
    console.error('Cancel scheduled change error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to cancel planned change',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}