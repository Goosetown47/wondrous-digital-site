import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { sendEmail } from '@/lib/services/email';
import BillingChangeReminderEmail from '@/emails/billing-change-reminder';
import { TIER_LIMITS } from '@/lib/tier-features';
import type { TierName } from '@/types/database';

export type NotificationType = '30_days' | '14_days' | '7_days' | '1_day';

interface AccountWithPendingChange {
  id: string;
  name: string;
  email: string;
  tier: TierName;
  pending_tier_change: TierName | null;
  pending_tier_change_date: string | null;
  subscription_status: string;
  stripe_subscription_id: string | null;
  has_perform_addon?: boolean;
}

interface NotificationDates {
  '30_days': Date;
  '14_days': Date;
  '7_days': Date;
  '1_day': Date;
}

interface BillingChangeData {
  accountName: string;
  contactEmail: string;
  currentPlan: {
    tier: string;
    billingPeriod: string;
    amount: number;
    features: {
      projects: number;
      users: number;
      customDomains: boolean;
      smartMarketing: boolean;
      performAddon: boolean;
    };
  };
  targetPlan: {
    tier: string;
    billingPeriod: string;
    amount: number;
    features: {
      projects: number;
      users: number;
      customDomains: boolean;
      smartMarketing: boolean;
      performAddon: boolean;
    };
  };
  changeDate: Date;
  requestDate: Date;
  daysUntilChange: number;
  reminderType: NotificationType;
}

/**
 * Check for accounts with pending changes that need notifications
 * @param daysBeforeChange - Number of days before the change to check for (30, 14, 7, or 1)
 * @param currentDate - Optional date to use as "today" (for testing)
 */
export async function checkPendingChanges(
  daysBeforeChange: number,
  currentDate: Date = new Date()
): Promise<AccountWithPendingChange[]> {
  const supabase = createSupabaseServiceClient();
  
  // Calculate the target date for notifications
  const targetDate = new Date(currentDate);
  targetDate.setDate(targetDate.getDate() + daysBeforeChange);
  
  // Set to start and end of day for proper date range matching
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .not('pending_tier_change', 'is', null)
    .not('pending_tier_change_date', 'is', null)
    .gte('pending_tier_change_date', startOfDay.toISOString())
    .lte('pending_tier_change_date', endOfDay.toISOString())
    .eq('subscription_status', 'active');
  
  if (error) {
    console.error('Error fetching accounts with pending changes:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Calculate all notification dates based on change date
 */
export function calculateNotificationDates(changeDate: Date): NotificationDates {
  const dates: NotificationDates = {
    '30_days': new Date(changeDate),
    '14_days': new Date(changeDate),
    '7_days': new Date(changeDate),
    '1_day': new Date(changeDate),
  };
  
  dates['30_days'].setDate(changeDate.getDate() - 30);
  dates['14_days'].setDate(changeDate.getDate() - 14);
  dates['7_days'].setDate(changeDate.getDate() - 7);
  dates['1_day'].setDate(changeDate.getDate() - 1);
  
  return dates;
}

/**
 * Check if a notification has already been sent
 */
export async function hasAlreadySentNotification(
  accountId: string,
  notificationType: NotificationType,
  changeDate: Date
): Promise<boolean> {
  const supabase = createSupabaseServiceClient();
  
  const { data, error } = await supabase
    .from('billing_notification_log')
    .select('id')
    .eq('account_id', accountId)
    .eq('notification_type', notificationType)
    .eq('change_date', changeDate.toISOString())
    .eq('success', true)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error checking notification status:', error);
    return false;
  }
  
  return !!data;
}

/**
 * Record that a notification was sent
 */
export async function recordNotificationSent(
  accountId: string,
  notificationType: NotificationType,
  changeDate: Date,
  email: string,
  success: boolean,
  errorMessage?: string
): Promise<void> {
  const supabase = createSupabaseServiceClient();
  
  const { error } = await supabase
    .from('billing_notification_log')
    .insert({
      account_id: accountId,
      notification_type: notificationType,
      change_date: changeDate.toISOString(),
      email_sent_to: email,
      success,
      error_message: errorMessage,
      metadata: {
        sent_at: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
    });
  
  if (error) {
    console.error('Error recording notification:', error);
  }
}

/**
 * Get billing period and amount from Stripe subscription
 * For now, we'll use hardcoded values based on tier
 */
function getBillingDetails(tier: TierName, isYearly: boolean = false) {
  const monthlyPrices: Record<TierName, number> = {
    FREE: 0,
    BASIC: 97, // Placeholder
    PRO: 397,
    SCALE: 697,
    MAX: 997,
  };
  
  const yearlyPrices: Record<TierName, number> = {
    FREE: 0,
    BASIC: 1047, // Placeholder
    PRO: 4287,
    SCALE: 7527,
    MAX: 10767,
  };
  
  return {
    billingPeriod: isYearly ? 'yearly' : 'monthly',
    // eslint-disable-next-line security/detect-object-injection
    amount: isYearly ? yearlyPrices[tier] : monthlyPrices[tier],
  };
}

/**
 * Format account data for the email template
 */
export function formatBillingChangeData(
  account: AccountWithPendingChange,
  reminderType: NotificationType,
  requestDate: Date = new Date()
): BillingChangeData {
  // Handle missing pending change data
  if (!account.pending_tier_change_date || !account.pending_tier_change) {
    throw new Error('Account does not have pending tier change');
  }
  
  const changeDate = new Date(account.pending_tier_change_date);
  const currentDate = new Date();
  const daysUntilChange = Math.ceil((changeDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Determine if yearly based on subscription (simplified for now)
  const isYearly = false; // Would need to fetch from Stripe in production
  
  const currentBilling = getBillingDetails(account.tier, isYearly);
  const targetBilling = getBillingDetails(account.pending_tier_change, isYearly);
  
  // Handle unknown tiers gracefully
  const currentLimits = TIER_LIMITS[account.tier] || TIER_LIMITS.FREE;
  const targetLimits = TIER_LIMITS[account.pending_tier_change] || TIER_LIMITS.FREE;
  
  return {
    accountName: account.name,
    contactEmail: account.email,
    currentPlan: {
      tier: account.tier,
      billingPeriod: currentBilling.billingPeriod,
      amount: currentBilling.amount,
      features: {
        projects: currentLimits.projects,
        users: currentLimits.users,
        customDomains: currentLimits.customDomains,
        smartMarketing: currentLimits.marketingPlatform,
        performAddon: account.has_perform_addon || false,
      },
    },
    targetPlan: {
      tier: account.pending_tier_change!,
      billingPeriod: targetBilling.billingPeriod,
      amount: targetBilling.amount,
      features: {
        projects: targetLimits.projects,
        users: targetLimits.users,
        customDomains: targetLimits.customDomains,
        smartMarketing: targetLimits.marketingPlatform,
        performAddon: account.has_perform_addon || false,
      },
    },
    changeDate,
    requestDate,
    daysUntilChange,
    reminderType,
  };
}

/**
 * Send a billing change reminder email
 */
export async function sendBillingChangeReminder(
  account: AccountWithPendingChange,
  reminderType: NotificationType
): Promise<{
  success: boolean;
  reminderType: NotificationType;
  emailSent?: boolean;
  testEmailSent?: boolean;
  reason?: string;
  error?: string;
}> {
  try {
    const changeDate = new Date(account.pending_tier_change_date!);
    
    // Check if this is a test email
    const isTestEmail = account.email === 'tyler.lahaie@hey.com';
    
    // Skip duplicate check for test emails
    if (!isTestEmail) {
      // Check if already sent
      const alreadySent = await hasAlreadySentNotification(
        account.id,
        reminderType,
        changeDate
      );
      
      if (alreadySent) {
        return {
          success: false,
          reminderType,
          reason: 'Notification already sent',
        };
      }
    }
    
    // Format data for email template
    const emailData = formatBillingChangeData(account, reminderType);
    
    // Determine subject line
    const subjectLines = {
      '30_days': `Your billing change is scheduled in 30 days`,
      '14_days': `Your billing change is scheduled in 2 weeks`,
      '7_days': `Your billing change is scheduled in 1 week`,
      '1_day': `Your billing change is tomorrow`,
    };
    
    // Send the email
    const emailResult = await sendEmail({
      to: account.email,
      from: 'Wondrous Digital <billing@wondrousdigital.com>',
      // eslint-disable-next-line security/detect-object-injection
      subject: subjectLines[reminderType],
      react: BillingChangeReminderEmail(emailData),
    });
    
    // Only record notification if it's not a test email (to avoid foreign key constraints)
    if (!isTestEmail) {
      await recordNotificationSent(
        account.id,
        reminderType,
        changeDate,
        account.email,
        emailResult.success,
        emailResult.error
      );
    }
    
    return {
      success: emailResult.success,
      reminderType,
      emailSent: emailResult.success,
      testEmailSent: isTestEmail && emailResult.success,
      error: emailResult.error,
    };
  } catch (error) {
    console.error('Error sending billing change reminder:', error);
    
    return {
      success: false,
      reminderType,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Process all pending notifications for a given notification type
 */
export async function processPendingNotifications(
  notificationType: NotificationType
): Promise<{
  processed: number;
  sent: number;
  skipped: number;
  failed: number;
  errors: string[];
}> {
  const daysMap: Record<NotificationType, number> = {
    '30_days': 30,
    '14_days': 14,
    '7_days': 7,
    '1_day': 1,
  };
  
  const results = {
    processed: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
    errors: [] as string[],
  };
  
  try {
    // Get accounts that need this notification
    // eslint-disable-next-line security/detect-object-injection
    const accounts = await checkPendingChanges(daysMap[notificationType]);
    results.processed = accounts.length;
    
    // Process each account
    for (const account of accounts) {
      const result = await sendBillingChangeReminder(account, notificationType);
      
      if (result.success) {
        results.sent++;
      } else if (result.reason?.includes('already sent')) {
        results.skipped++;
      } else {
        results.failed++;
        if (result.error) {
          results.errors.push(`${account.email}: ${result.error}`);
        }
      }
    }
  } catch (error) {
    console.error('Error processing notifications:', error);
    results.errors.push(error instanceof Error ? error.message : 'Unknown error');
  }
  
  return results;
}