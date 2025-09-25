import { NextRequest, NextResponse } from 'next/server';
import * as gracePeriodService from '@/lib/services/grace-period';
import * as notificationService from '@/lib/services/grace-period-notifications';

/**
 * Grace Period Cron Job
 * Runs daily at 9 AM to:
 * 1. Send scheduled grace period notifications
 * 2. Process expired grace periods and downgrade accounts
 * 
 * Schedule in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/grace-period",
 *     "schedule": "0 9 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] Grace Period Cron Job - Starting`);
  
  try {
    // Check for test mode or dry run
    const searchParams = request.nextUrl.searchParams;
    const testEmail = searchParams.get('testEmail');
    const dryRun = searchParams.get('dryRun') === 'true';
    
    // Process notifications
    console.log('Processing grace period notifications...');
    const notificationResult = await notificationService.checkAndSendGracePeriodNotifications(
      testEmail || undefined
    );
    
    console.log(`Notifications sent: ${notificationResult.sent}`);
    if (notificationResult.errors.length > 0) {
      console.error('Notification errors:', notificationResult.errors);
    }
    
    // Process expired grace periods (skip in test mode)
    let expirationResult = {
      processed: 0,
      errors: [] as string[],
      downgradedAccounts: [] as string[]
    };
    
    if (!testEmail && !dryRun) {
      console.log('Processing expired grace periods...');
      const result = await gracePeriodService.processExpiredGracePeriods();
      expirationResult = {
        processed: result.processed,
        errors: result.errors,
        downgradedAccounts: result.downgradedAccounts || []
      };
      
      console.log(`Accounts downgraded: ${expirationResult.processed}`);
      if (expirationResult.errors.length > 0) {
        console.error('Expiration errors:', expirationResult.errors);
      }
    }
    
    // Calculate execution time
    const executionTime = Date.now() - startTime;
    
    // Check for high error rate
    const totalErrors = notificationResult.errors.length + expirationResult.errors.length;
    const totalProcessed = notificationResult.sent + expirationResult.processed;
    if (totalErrors > 5 || (totalProcessed > 0 && totalErrors / totalProcessed > 0.5)) {
      console.error(`[HIGH ERROR RATE] ${totalErrors} errors out of ${totalProcessed} processed`);
    }
    
    // Return results
    const response = {
      success: true,
      timestamp,
      executionTime,
      notifications: {
        sent: notificationResult.sent,
        errors: notificationResult.errors,
        skipped: notificationResult.skipped,
        types: notificationResult.notificationTypes,
        ...(testEmail && { testMode: true, testEmail })
      },
      expirations: {
        processed: expirationResult.processed,
        errors: expirationResult.errors,
        accounts: expirationResult.downgradedAccounts || []
      },
      ...(dryRun && { dryRun: true })
    };
    
    console.log(`[${timestamp}] Grace Period Cron Job - Completed in ${executionTime}ms`);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Grace period cron job failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process grace period tasks',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Manual trigger endpoint for testing or specific accounts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, action } = body;
    
    if (!accountId || !action) {
      return NextResponse.json(
        { error: 'Invalid request: accountId and action are required' },
        { status: 400 }
      );
    }
    
    let result: unknown = {};
    
    switch (action) {
      case 'send_notifications': {
        result = await notificationService.checkAndSendGracePeriodNotifications(
          undefined,
          accountId
        );
        break;
      }
        
      case 'check_status': {
        result = await gracePeriodService.checkGracePeriodStatus(accountId);
        break;
      }
        
      case 'process_expiration': {
        // Check if this specific account has expired grace period
        const status = await gracePeriodService.checkGracePeriodStatus(accountId);
        if (status.isExpired) {
          result = await gracePeriodService.processExpiredGracePeriods();
        } else {
          result = { message: 'Grace period not expired for this account' };
        }
        break;
      }
        
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      accountId,
      action,
      ...(typeof result === 'object' && result !== null ? result : { result })
    });
  } catch (error) {
    console.error('Manual grace period trigger failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process manual trigger',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}