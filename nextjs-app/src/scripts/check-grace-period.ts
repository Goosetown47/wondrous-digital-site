#!/usr/bin/env node

/**
 * Check Grace Period Status Script
 * 
 * Usage: npx tsx src/scripts/check-grace-period.ts --account-id=YOUR_ACCOUNT_ID
 * 
 * This script checks the grace period status for an account and displays
 * all relevant information for debugging and testing.
 */

import { createClient } from '@supabase/supabase-js';
import { differenceInDays, differenceInHours, format } from 'date-fns';

// Parse command line arguments
const args = process.argv.slice(2);
const accountIdArg = args.find(arg => arg.startsWith('--account-id='));

if (!accountIdArg) {
  console.error('❌ Error: --account-id parameter is required');
  console.error('Usage: npx tsx src/scripts/check-grace-period.ts --account-id=YOUR_ACCOUNT_ID');
  process.exit(1);
}

const accountId = accountIdArg.split('=')[1];

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase environment variables not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGracePeriod() {
  console.log('\n🔍 Checking Grace Period Status');
  console.log('================================');
  console.log(`Account ID: ${accountId}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  // 1. Get account information
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', accountId)
    .single();

  if (accountError || !account) {
    console.error('❌ Account not found:', accountError?.message);
    process.exit(1);
  }

  console.log('📋 Account Information');
  console.log('----------------------');
  console.log(`Name: ${account.name}`);
  console.log(`Tier: ${account.tier}`);
  console.log(`Subscription State: ${account.subscription_state || 'Not set'}`);
  console.log(`Stripe Customer ID: ${account.stripe_customer_id || 'Not set'}`);
  console.log(`Stripe Subscription ID: ${account.stripe_subscription_id || 'Not set'}`);
  
  // 2. Check grace period status
  console.log('\n⏰ Grace Period Status');
  console.log('----------------------');
  
  if (!account.grace_period_ends_at) {
    console.log('✅ No active grace period');
  } else {
    const gracePeriodEnd = new Date(account.grace_period_ends_at);
    const now = new Date();
    const daysRemaining = differenceInDays(gracePeriodEnd, now);
    const hoursRemaining = differenceInHours(gracePeriodEnd, now);
    
    console.log(`🚨 GRACE PERIOD ACTIVE`);
    console.log(`Ends at: ${format(gracePeriodEnd, 'PPpp')}`);
    
    if (hoursRemaining <= 0) {
      console.log(`Status: EXPIRED ❌`);
    } else if (daysRemaining === 0) {
      console.log(`Time remaining: ${hoursRemaining} hours ⚠️`);
    } else {
      console.log(`Time remaining: ${daysRemaining} days, ${hoursRemaining % 24} hours`);
    }
    
    // Progress bar
    const totalHours = 14 * 24; // 14 days in hours
    const elapsedHours = totalHours - hoursRemaining;
    const progress = Math.round((elapsedHours / totalHours) * 100);
    const barLength = 30;
    const filledLength = Math.round((progress / 100) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    
    console.log(`Progress: [${bar}] ${progress}%`);
  }

  // 3. Check scheduled notifications
  console.log('\n📧 Scheduled Notifications');
  console.log('-------------------------');
  
  const { data: notifications, error: notifError } = await supabase
    .from('grace_period_notifications')
    .select('*')
    .eq('account_id', accountId)
    .order('scheduled_for', { ascending: true });

  if (notifError) {
    console.error('❌ Error fetching notifications:', notifError.message);
  } else if (!notifications || notifications.length === 0) {
    console.log('No notifications scheduled');
  } else {
    notifications.forEach((notif, index) => {
      const scheduledDate = new Date(notif.scheduled_for);
      const status = notif.sent ? '✅ Sent' : '⏳ Pending';
      const typeLabelMap = {
        'grace_period_day_0': 'Day 0 - Initial failure',
        'grace_period_day_7': 'Day 7 - Reminder',
        'grace_period_day_13': 'Day 13 - Urgent',
        'account_downgraded': 'Day 14 - Downgrade'
      };
      const typeLabel = typeLabelMap[notif.notification_type as keyof typeof typeLabelMap] || notif.notification_type;
      
      console.log(`\n${index + 1}. ${typeLabel}`);
      console.log(`   Status: ${status}`);
      console.log(`   Scheduled: ${format(scheduledDate, 'PPp')}`);
      if (notif.sent) {
        console.log(`   Sent at: ${format(new Date(notif.sent_at), 'PPp')}`);
      }
    });
  }

  // 4. Recent billing history
  console.log('\n💳 Recent Billing History');
  console.log('------------------------');
  
  const { data: billingHistory, error: historyError } = await supabase
    .from('account_billing_history')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (historyError) {
    console.error('❌ Error fetching billing history:', historyError.message);
  } else if (!billingHistory || billingHistory.length === 0) {
    console.log('No billing history found');
  } else {
    billingHistory.forEach((entry, index) => {
      const date = new Date(entry.created_at);
      const eventLabelMap = {
        'payment_failed': '❌ Payment Failed',
        'payment_recovered_during_grace_period': '✅ Payment Recovered',
        'account_downgraded_grace_period_expired': '⬇️ Account Downgraded',
        'grace_period_started': '⏰ Grace Period Started',
        'plan_upgraded': '⬆️ Plan Upgraded',
        'plan_downgraded': '⬇️ Plan Downgraded'
      };
      const eventLabel = eventLabelMap[entry.event_type as keyof typeof eventLabelMap] || entry.event_type;
      
      console.log(`\n${index + 1}. ${eventLabel}`);
      console.log(`   Date: ${format(date, 'PPp')}`);
      if (entry.metadata) {
        console.log(`   Details: ${JSON.stringify(entry.metadata, null, 2).split('\n').join('\n   ')}`);
      }
    });
  }

  // 5. Recommendations
  console.log('\n📝 Test Recommendations');
  console.log('-----------------------');
  
  if (!account.grace_period_ends_at) {
    console.log('1. Trigger grace period: POST /api/test/grace-period');
    console.log(`   Body: { "accountId": "${accountId}" }`);
  } else {
    console.log('1. Check billing page UI at /billing');
    console.log('2. Test notification sending: GET /api/cron/grace-period?testEmail=your-email');
    console.log('3. Clear grace period: POST /api/test/clear-grace-period');
    console.log(`   Body: { "accountId": "${accountId}" }`);
  }
  
  if (account.stripe_subscription_id) {
    console.log(`4. Test webhook: POST /api/test/webhook-simulator`);
    console.log(`   Body: { "subscriptionId": "${account.stripe_subscription_id}" }`);
  }

  console.log('\n✅ Check complete!\n');
}

// Run the check
checkGracePeriod().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});