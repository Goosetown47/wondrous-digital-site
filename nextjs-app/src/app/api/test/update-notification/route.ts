import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';

/**
 * TEST ENDPOINT - Update notification schedule for testing
 * POST /api/test/update-notification
 * Body: { accountId: string, notificationType: string, scheduledFor: string }
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    const { accountId, notificationType, scheduledFor } = await request.json();

    if (!accountId || !notificationType) {
      return NextResponse.json(
        { error: 'accountId and notificationType are required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceClient();

    // Update the notification schedule - set to past date to trigger immediately
    const newScheduledDate = scheduledFor || new Date(Date.now() - 60000).toISOString(); // 1 minute ago

    const { data, error } = await supabase
      .from('grace_period_notifications')
      .update({ 
        scheduled_for: newScheduledDate,
        sent: false 
      })
      .eq('account_id', accountId)
      .eq('notification_type', notificationType)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update notification', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Notification rescheduled to ${newScheduledDate}`,
      notification: {
        type: data.notification_type,
        scheduledFor: data.scheduled_for,
        sent: data.sent,
        accountId: data.account_id
      },
      nextStep: 'Run GET /api/cron/grace-period?testEmail=your-email to send the notification'
    });
  } catch (error) {
    console.error('Failed to update notification:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}