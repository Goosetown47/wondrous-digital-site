import { NextRequest, NextResponse } from 'next/server';
import { processPendingNotifications } from '@/lib/services/billing-notifications';
import type { NotificationType } from '@/lib/services/billing-notifications';

/**
 * Cron job endpoint for processing billing change notifications
 * Should be called daily to check for and send pending notifications
 * 
 * Can be triggered via:
 * - Vercel cron jobs
 * - External cron service
 * - Manual trigger for testing
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the request is authorized (simple secret check)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Skip auth in development or if no secret is set
    if (process.env.NODE_ENV === 'production' && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if we're in test mode
    const searchParams = request.nextUrl.searchParams;
    const testMode = searchParams.get('test') === 'true';
    const specificType = searchParams.get('type') as NotificationType | null;
    
    // Notification types to process
    const notificationTypes: NotificationType[] = specificType 
      ? [specificType]
      : ['30_days', '14_days', '7_days', '1_day'];
    
    const results = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      testMode,
      notifications: {} as Record<string, unknown>,
      summary: {
        totalProcessed: 0,
        totalSent: 0,
        totalSkipped: 0,
        totalFailed: 0,
      },
      errors: [] as string[],
    };
    
    // Process each notification type
    for (const type of notificationTypes) {
      console.log(`Processing ${type} notifications...`);
      
      try {
        const typeResults = await processPendingNotifications(type);
        
        // eslint-disable-next-line security/detect-object-injection
        results.notifications[type] = typeResults;
        results.summary.totalProcessed += typeResults.processed;
        results.summary.totalSent += typeResults.sent;
        results.summary.totalSkipped += typeResults.skipped;
        results.summary.totalFailed += typeResults.failed;
        
        if (typeResults.errors.length > 0) {
          results.errors.push(...typeResults.errors);
        }
        
        console.log(`${type}: Processed ${typeResults.processed}, Sent ${typeResults.sent}, Skipped ${typeResults.skipped}, Failed ${typeResults.failed}`);
      } catch (error) {
        const errorMessage = `Error processing ${type} notifications: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMessage);
        results.errors.push(errorMessage);
      }
    }
    
    // Log summary
    console.log('Billing notifications cron job completed:', results.summary);
    
    // Return results
    return NextResponse.json(results, { 
      status: results.errors.length > 0 ? 207 : 200 // 207 = Multi-Status
    });
  } catch (error) {
    console.error('Fatal error in billing notifications cron job:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for manually triggering notifications for specific accounts
 * Useful for testing and manual intervention
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the request is authorized
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (process.env.NODE_ENV === 'production' && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { accountId, notificationType, testEmail } = body;
    
    if (!notificationType) {
      return NextResponse.json(
        { error: 'Missing required parameter: notificationType' },
        { status: 400 }
      );
    }
    
    // If test email is requested, create a test notification
    if (testEmail) {
      const { sendBillingChangeReminder } = await import('@/lib/services/billing-notifications');
      
      // Generate a valid UUID for the test account
      const testAccountId = crypto.randomUUID();
      
      // Create a test account object
      const testAccount = {
        id: testAccountId,
        name: 'Test Company',
        email: 'tyler.lahaie@hey.com',
        tier: 'MAX' as const,
        pending_tier_change: 'PRO' as const,
        pending_tier_change_date: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString(), // 30 days from now
        subscription_status: 'active',
        stripe_subscription_id: 'test_sub_123',
        has_perform_addon: false,
      };
      
      // Adjust the change date based on notification type
      const daysMap = {
        '30_days': 30,
        '14_days': 14,
        '7_days': 7,
        '1_day': 1,
      };
      
      const daysFromNow = daysMap[notificationType as NotificationType];
      if (daysFromNow) {
        testAccount.pending_tier_change_date = new Date(Date.now() + (daysFromNow * 24 * 60 * 60 * 1000)).toISOString();
      }
      
      const result = await sendBillingChangeReminder(testAccount, notificationType as NotificationType);
      
      return NextResponse.json({
        success: result.success,
        testEmailSent: true,
        notificationType,
        result,
      });
    }
    
    // Process specific account if provided
    if (accountId) {
      // Implementation for specific account would go here
      return NextResponse.json({
        message: 'Specific account processing not yet implemented',
        accountId,
        notificationType,
      });
    }
    
    // Otherwise process all pending for this type
    const results = await processPendingNotifications(notificationType as NotificationType);
    
    return NextResponse.json({
      success: true,
      notificationType,
      results,
    });
  } catch (error) {
    console.error('Error in manual notification trigger:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}