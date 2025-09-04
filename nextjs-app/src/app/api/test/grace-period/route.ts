import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { 
  calculateGracePeriodEnd, 
  scheduleGracePeriodNotifications 
} from '@/lib/services/grace-period';
import { SubscriptionState } from '@/lib/services/subscription-state';

/**
 * TEST ENDPOINT - Manual Grace Period Trigger
 * 
 * This endpoint is for testing purposes only and should be removed before production.
 * It manually triggers a grace period for a specific account to test the UI and flow.
 * 
 * POST /api/test/grace-period
 * Body: { accountId: string, testMode?: boolean }
 */
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    const { accountId } = await request.json();

    if (!accountId) {
      return NextResponse.json(
        { error: 'accountId is required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceClient();
    
    // Verify account exists and get current state
    const { data: account, error: fetchError } = await supabase
      .from('accounts')
      .select('id, name, tier, subscription_state, grace_period_ends_at')
      .eq('id', accountId)
      .single();

    if (fetchError || !account) {
      return NextResponse.json(
        { error: `Account not found: ${accountId}` },
        { status: 404 }
      );
    }

    // Calculate grace period end (14 days from now)
    const gracePeriodEnd = calculateGracePeriodEnd(new Date());
    
    const updates: {
      performed: string[];
      skipped: string[];
      errors: string[];
    } = {
      performed: [],
      skipped: [],
      errors: []
    };

    // 1. Update account with grace period
    const { error: updateError } = await supabase
      .from('accounts')
      .update({
        grace_period_ends_at: gracePeriodEnd.toISOString(),
        subscription_state: SubscriptionState.PAST_DUE
      })
      .eq('id', accountId);

    if (updateError) {
      updates.errors.push(`Failed to update account: ${updateError.message}`);
    } else {
      updates.performed.push('Set grace_period_ends_at to ' + gracePeriodEnd.toISOString());
      updates.performed.push('Set subscription_state to past_due');
    }

    // 2. Schedule notifications
    try {
      await scheduleGracePeriodNotifications(
        accountId,
        gracePeriodEnd.toISOString(),
        account.tier
      );
      updates.performed.push('Scheduled 4 grace period notifications');
    } catch (notifError) {
      updates.errors.push(`Failed to schedule notifications: ${notifError instanceof Error ? notifError.message : 'Unknown error'}`);
    }

    // 3. Log to billing history
    const { error: historyError } = await supabase
      .from('account_billing_history')
      .insert({
        account_id: accountId,
        event_type: 'payment_failed',
        metadata: {
          test_mode: true,
          triggered_by: 'manual_test_endpoint',
          grace_period_ends_at: gracePeriodEnd.toISOString(),
          tier: account.tier
        }
      });

    if (historyError) {
      updates.errors.push(`Failed to log billing history: ${historyError.message}`);
    } else {
      updates.performed.push('Added payment_failed entry to billing history');
    }

    // 4. Check what notifications were created
    const { data: notifications } = await supabase
      .from('grace_period_notifications')
      .select('notification_type, scheduled_for, sent')
      .eq('account_id', accountId)
      .order('scheduled_for', { ascending: true });

    // Return comprehensive status
    return NextResponse.json({
      success: updates.errors.length === 0,
      testMode: true,
      message: '🧪 TEST MODE: Grace period manually triggered',
      account: {
        id: account.id,
        name: account.name,
        tier: account.tier,
        previousState: account.subscription_state,
        previousGracePeriod: account.grace_period_ends_at
      },
      gracePeriod: {
        endsAt: gracePeriodEnd.toISOString(),
        daysRemaining: 14,
        state: SubscriptionState.PAST_DUE
      },
      updates,
      notifications: notifications || [],
      nextSteps: [
        '1. Navigate to /billing to see the grace period alert',
        '2. Check database: SELECT * FROM accounts WHERE id = \'' + accountId + '\'',
        '3. Check notifications: SELECT * FROM grace_period_notifications WHERE account_id = \'' + accountId + '\'',
        '4. Test cron job: GET /api/cron/grace-period?testEmail=your-email@example.com',
        '5. To clear: POST /api/test/clear-grace-period with { accountId: \'' + accountId + '\' }'
      ]
    });

  } catch (error) {
    console.error('Test grace period trigger failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to trigger grace period',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check grace period status
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const accountId = searchParams.get('accountId');

  if (!accountId) {
    return NextResponse.json(
      { error: 'accountId query parameter is required' },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServiceClient();

  // Get account with grace period info
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('id, name, tier, grace_period_ends_at, subscription_state')
    .eq('id', accountId)
    .single();

  if (accountError || !account) {
    return NextResponse.json(
      { error: 'Account not found' },
      { status: 404 }
    );
  }

  // Get scheduled notifications
  interface GracePeriodNotification {
    id: string;
    account_id: string;
    notification_type: 'grace_period_day_0' | 'grace_period_day_7' | 'grace_period_day_13' | 'account_downgraded';
    scheduled_for: string;
    sent: boolean;
    sent_at: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
  }

  const { data: notifications } = await supabase
    .from('grace_period_notifications')
    .select('*')
    .eq('account_id', accountId)
    .order('scheduled_for', { ascending: true }) as { data: GracePeriodNotification[] | null };

  // Calculate time remaining if in grace period
  let timeRemaining = null;
  if (account.grace_period_ends_at) {
    const now = new Date();
    const endsAt = new Date(account.grace_period_ends_at);
    const msRemaining = endsAt.getTime() - now.getTime();
    
    if (msRemaining > 0) {
      const days = Math.floor(msRemaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((msRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      timeRemaining = `${days} days, ${hours} hours`;
    } else {
      timeRemaining = 'Expired';
    }
  }

  return NextResponse.json({
    account: {
      id: account.id,
      name: account.name,
      tier: account.tier,
      subscriptionState: account.subscription_state,
      gracePeriodEndsAt: account.grace_period_ends_at,
      timeRemaining,
      isInGracePeriod: !!account.grace_period_ends_at && account.subscription_state === 'past_due'
    },
    notifications: notifications || [],
    summary: {
      totalNotifications: notifications?.length || 0,
      sentNotifications: notifications?.filter((n: GracePeriodNotification) => n.sent).length || 0,
      pendingNotifications: notifications?.filter((n: GracePeriodNotification) => !n.sent).length || 0
    }
  });
}