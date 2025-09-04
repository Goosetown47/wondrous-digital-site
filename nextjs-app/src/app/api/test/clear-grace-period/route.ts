import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { clearGracePeriod } from '@/lib/services/grace-period';

/**
 * TEST ENDPOINT - Clear Grace Period
 * 
 * This endpoint clears a manually triggered grace period for testing.
 * 
 * POST /api/test/clear-grace-period
 * Body: { accountId: string }
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
    
    // Get current state before clearing
    const { data: beforeAccount } = await supabase
      .from('accounts')
      .select('grace_period_ends_at, subscription_state')
      .eq('id', accountId)
      .single();

    // Clear the grace period
    await clearGracePeriod(accountId);

    // Get state after clearing
    const { data: afterAccount } = await supabase
      .from('accounts')
      .select('grace_period_ends_at, subscription_state')
      .eq('id', accountId)
      .single();

    // Check notifications were deleted
    const { data: remainingNotifications } = await supabase
      .from('grace_period_notifications')
      .select('id')
      .eq('account_id', accountId)
      .eq('sent', false);

    return NextResponse.json({
      success: true,
      testMode: true,
      message: '🧪 TEST MODE: Grace period cleared',
      before: {
        gracePeriodEndsAt: beforeAccount?.grace_period_ends_at,
        subscriptionState: beforeAccount?.subscription_state
      },
      after: {
        gracePeriodEndsAt: afterAccount?.grace_period_ends_at,
        subscriptionState: afterAccount?.subscription_state
      },
      notificationsDeleted: beforeAccount?.grace_period_ends_at ? 'Yes' : 'No grace period was active',
      remainingPendingNotifications: remainingNotifications?.length || 0
    });

  } catch (error) {
    console.error('Clear grace period failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to clear grace period',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}