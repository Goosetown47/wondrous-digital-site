import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';

/**
 * TEST ENDPOINT - Expire grace period for testing downgrade
 * POST /api/test/expire-grace-period
 * Body: { accountId: string }
 */
export async function POST(request: NextRequest) {
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

    // Set grace period to expired (1 hour ago)
    const expiredDate = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('accounts')
      .update({
        grace_period_ends_at: expiredDate
      })
      .eq('id', accountId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to expire grace period', details: error.message },
        { status: 500 }
      );
    }

    // Also update the downgrade notification to be ready to send
    await supabase
      .from('grace_period_notifications')
      .update({
        scheduled_for: expiredDate
      })
      .eq('account_id', accountId)
      .eq('notification_type', 'account_downgraded');

    return NextResponse.json({
      success: true,
      message: 'Grace period expired for testing',
      account: {
        id: data.id,
        name: data.name,
        tier: data.tier,
        gracePeriodEndsAt: data.grace_period_ends_at,
        subscriptionState: data.subscription_state
      },
      nextStep: 'Run GET /api/cron/grace-period to process the expiration and downgrade'
    });

  } catch (error) {
    console.error('Failed to expire grace period:', error);
    return NextResponse.json(
      { 
        error: 'Failed to expire grace period',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}