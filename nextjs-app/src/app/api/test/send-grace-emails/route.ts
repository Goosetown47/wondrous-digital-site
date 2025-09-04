import { NextRequest, NextResponse } from 'next/server';
import { resend } from '@/lib/resend';
import PaymentFailedDay0Email from '@/emails/payment-failed-day-0';
import PaymentFailedDay7Email from '@/emails/payment-failed-day-7';
import PaymentFailedDay13Email from '@/emails/payment-failed-day-13';
import AccountDowngradedEmail from '@/emails/account-downgraded';

/**
 * TEST ENDPOINT - Send all grace period emails for review
 * GET /api/test/send-grace-emails?email=xxx
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get('email') || 'tyler.lahaie@hey.com';

  try {
    const results = [];
    
    // Mock data for emails
    const mockData = {
      userName: 'Test User',
      accountName: 'DELETE ME',
      currentTier: 'MAX',
      updatePaymentUrl: 'https://app.wondrousdigital.com/billing',
      reactivateUrl: 'https://app.wondrousdigital.com/billing',
    };

    // 1. Send Day 0 - Payment Failed Email
    console.log('Sending Day 0 payment failed email...');
    const day0Result = await resend!.emails.send({
      from: 'Wondrous Digital <hello@wondrousdigital.com>',
      to: email,
      subject: '[TEST] Payment Failed - Action Required',
      react: PaymentFailedDay0Email({
        userName: mockData.userName,
        accountName: mockData.accountName,
        currentTier: mockData.currentTier,
        gracePeriodEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        daysRemaining: 14,
        updatePaymentUrl: mockData.updatePaymentUrl,
      }) as React.ReactElement,
    });
    results.push({ type: 'Day 0 - Payment Failed', success: !!day0Result.data });

    // 2. Send Day 7 - Reminder Email
    console.log('Sending Day 7 reminder email...');
    const day7Result = await resend!.emails.send({
      from: 'Wondrous Digital <hello@wondrousdigital.com>',
      to: email,
      subject: '[TEST] Payment Reminder - 7 Days Remaining',
      react: PaymentFailedDay7Email({
        userName: mockData.userName,
        accountName: mockData.accountName,
        currentTier: mockData.currentTier,
        daysRemaining: 7,
        gracePeriodEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatePaymentUrl: mockData.updatePaymentUrl,
      }) as React.ReactElement,
    });
    results.push({ type: 'Day 7 - Reminder', success: !!day7Result.data });

    // 3. Send Day 13 - Urgent Reminder Email
    console.log('Sending Day 13 urgent reminder email...');
    try {
      const day13Result = await resend!.emails.send({
        from: 'Wondrous Digital <hello@wondrousdigital.com>',
        to: email,
        subject: '[TEST] Urgent: 1 Day Until Account Downgrade',
        react: PaymentFailedDay13Email({
          userName: mockData.userName,
          accountName: mockData.accountName,
          currentTier: mockData.currentTier,
          daysRemaining: 1,
          gracePeriodEndsAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          updatePaymentUrl: mockData.updatePaymentUrl,
        }) as React.ReactElement,
      });
      results.push({ type: 'Day 13 - Urgent Reminder', success: !!day13Result.data });
    } catch (day13Error) {
      console.error('Day 13 email error:', day13Error);
      results.push({ type: 'Day 13 - Urgent Reminder', success: false, error: day13Error instanceof Error ? day13Error.message : 'Unknown error' });
    }

    // 4. Send Day 14 - Account Downgraded Email
    console.log('Sending account downgraded email...');
    try {
      const downgradeResult = await resend!.emails.send({
        from: 'Wondrous Digital <hello@wondrousdigital.com>',
        to: email,
        subject: '[TEST] Your Account Has Been Downgraded',
        react: AccountDowngradedEmail({
          userName: mockData.userName,
          accountName: mockData.accountName,
          oldTier: mockData.currentTier,
          newTier: 'FREE',
          reactivateUrl: mockData.reactivateUrl,
        }) as React.ReactElement,
      });
      results.push({ type: 'Day 14 - Account Downgraded', success: !!downgradeResult.data });
    } catch (downgradeError) {
      console.error('Day 14 email error:', downgradeError);
      results.push({ type: 'Day 14 - Account Downgraded', success: false, error: downgradeError instanceof Error ? downgradeError.message : 'Unknown error' });
    }

    return NextResponse.json({
      success: true,
      message: `Sent all 4 grace period emails to ${email}`,
      results,
      note: 'Check your inbox for all 4 test emails. They are marked with [TEST] in the subject.'
    });

  } catch (error) {
    console.error('Failed to send test emails:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send test emails',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}