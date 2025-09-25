/**
 * Grace Period Notification Service
 * 
 * Handles sending scheduled emails for grace period events
 */

import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { resend } from '@/lib/resend';
import { isBefore } from 'date-fns';
import PaymentFailedDay0 from '@/emails/payment-failed-day-0';
import PaymentFailedDay7 from '@/emails/payment-failed-day-7';
import PaymentFailedDay13 from '@/emails/payment-failed-day-13';
import AccountDowngraded from '@/emails/account-downgraded';

interface NotificationResult {
  sent: number;
  errors: string[];
  skipped: number;
  notificationTypes: string[];
  testMode?: boolean;
  testEmail?: string;
  filtered?: boolean;
  accountId?: string;
  dryRun?: boolean;
}

interface EmailData {
  to: string;
  accountName: string;
  userName: string;
  notificationType: string;
  daysRemaining: number;
  gracePeriodEndsAt: string;
  currentTier: string;
  oldTier?: string;
}

interface GracePeriodNotification {
  id: string;
  account_id: string;
  notification_type: 'grace_period_day_0' | 'grace_period_day_7' | 'grace_period_day_13' | 'account_downgraded';
  scheduled_for: string;
  sent: boolean;
  sent_at: string | null;
  metadata: Record<string, unknown>;
}

/**
 * Check for and send due grace period notifications
 */
export async function checkAndSendGracePeriodNotifications(
  testEmail?: string,
  accountIdFilter?: string
): Promise<NotificationResult> {
  const supabase = createSupabaseServiceClient();
  const now = new Date();
  
  const result: NotificationResult = {
    sent: 0,
    errors: [],
    skipped: 0,
    notificationTypes: []
  };
  
  if (testEmail) {
    result.testMode = true;
    result.testEmail = testEmail;
  }
  
  if (accountIdFilter) {
    result.filtered = true;
    result.accountId = accountIdFilter;
  }
  
  // Get scheduled notifications that are due
  let query = supabase
    .from('grace_period_notifications')
    .select('*')
    .lte('scheduled_for', now.toISOString())
    .eq('sent', false);
    
  if (accountIdFilter) {
    query = query.eq('account_id', accountIdFilter);
  }
  
  const { data: notifications, error } = await query;
  
  if (error) {
    console.error('Failed to fetch grace period notifications:', error);
    result.errors.push(`Database error: ${error.message}`);
    return result;
  }
  
  for (const notification of notifications || []) {
    try {
      // Skip if already sent (double-check)
      if (notification.sent) {
        result.skipped++;
        continue;
      }
      
      // Get account details
      const { data: account } = await supabase
        .from('accounts')
        .select('id, name, tier, grace_period_ends_at')
        .eq('id', notification.account_id)
        .single();
        
      if (!account) {
        throw new Error(`Account not found: ${notification.account_id}`);
      }
      
      // Get account owner details - first get the account_users record
      const { data: accountOwner } = await supabase
        .from('account_users')
        .select('user_id')
        .eq('account_id', notification.account_id)
        .eq('role', 'account_owner')
        .single();
        
      if (!accountOwner) {
        throw new Error(`No account owner found for account: ${notification.account_id}`);
      }
      
      // Then get the user details from auth.users table
      const { data: { user: owner }, error: userError } = await supabase.auth.admin.getUserById(
        accountOwner.user_id
      );
        
      if (userError || !owner) {
        throw new Error(`User not found for account owner: ${accountOwner.user_id}`);
      }
      
      // Calculate days remaining
      const gracePeriodEnd = new Date(notification.metadata?.grace_period_ends_at || account.grace_period_ends_at);
      const daysRemaining = Math.max(0, Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      
      // Send appropriate email
      await sendGracePeriodEmail({
        to: testEmail || owner.email!,
        accountName: account.name,
        userName: owner.user_metadata?.full_name || owner.email || 'User',
        notificationType: notification.notification_type,
        daysRemaining,
        gracePeriodEndsAt: gracePeriodEnd.toISOString(),
        currentTier: notification.metadata?.tier || account.tier,
        oldTier: notification.metadata?.old_tier
      });
      
      // Mark as sent (unless in test mode)
      if (!testEmail) {
        await markNotificationSent(notification.id);
      }
      
      result.sent++;
      result.notificationTypes.push(notification.notification_type);
    } catch (error) {
      const errorMessage = `Failed to send notification ${notification.id}: ${error}`;
      console.error(errorMessage);
      result.errors.push(errorMessage);
    }
  }
  
  return result;
}

/**
 * Send a specific grace period email
 */
export async function sendGracePeriodEmail(data: EmailData): Promise<void> {
  const { to, accountName, userName, notificationType, daysRemaining, gracePeriodEndsAt, currentTier, oldTier } = data;
  
  let subject: string;
  let emailComponent: React.ReactElement;
  
  const updatePaymentUrl = 'https://app.wondrousdigital.com/billing';
  const reactivateUrl = 'https://app.wondrousdigital.com/billing/plans';
  
  switch (notificationType) {
    case 'grace_period_day_0':
      subject = `Important: Your payment failed - ${daysRemaining} days to fix`;
      emailComponent = PaymentFailedDay0({
        userName,
        accountName,
        currentTier,
        gracePeriodEndsAt,
        daysRemaining,
        updatePaymentUrl
      }) as React.ReactElement;
      break;
      
    case 'grace_period_day_7':
      subject = `Reminder: ${daysRemaining} days left to update payment`;
      emailComponent = PaymentFailedDay7({
        userName,
        accountName,
        currentTier,
        gracePeriodEndsAt,
        daysRemaining,
        updatePaymentUrl
      }) as React.ReactElement;
      break;
      
    case 'grace_period_day_13':
      subject = `URGENT: ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left before account downgrade`;
      emailComponent = PaymentFailedDay13({
        userName,
        accountName,
        currentTier,
        gracePeriodEndsAt,
        daysRemaining,
        updatePaymentUrl
      }) as React.ReactElement;
      break;
      
    case 'account_downgraded':
      subject = 'Your account has been downgraded to FREE';
      emailComponent = AccountDowngraded({
        userName,
        accountName,
        oldTier: oldTier || currentTier,
        newTier: 'FREE',
        reactivateUrl
      }) as React.ReactElement;
      break;
      
    default:
      throw new Error(`Unknown notification type: ${notificationType}`);
  }
  
  await resend!.emails.send({
    from: 'Wondrous Digital <hello@wondrousdigital.com>',
    to,
    subject,
    react: emailComponent
  });
}

/**
 * Mark a notification as sent
 */
export async function markNotificationSent(notificationId: string): Promise<void> {
  const supabase = createSupabaseServiceClient();
  
  const { error } = await supabase
    .from('grace_period_notifications')
    .update({
      sent: true,
      sent_at: new Date().toISOString()
    })
    .eq('id', notificationId);
    
  if (error) {
    throw new Error(`Failed to mark notification as sent: ${error.message}`);
  }
}

/**
 * Check if a notification should be sent
 */
export function shouldSendNotification(notification: GracePeriodNotification): boolean {
  if (notification.sent) {
    return false;
  }
  
  const now = new Date();
  const scheduledFor = new Date(notification.scheduled_for);
  
  return isBefore(scheduledFor, now) || scheduledFor.getTime() === now.getTime();
}

/**
 * Get scheduled notifications for an account
 */
export async function getScheduledNotifications(accountId?: string): Promise<GracePeriodNotification[]> {
  const supabase = createSupabaseServiceClient();
  const now = new Date();
  
  let query = supabase
    .from('grace_period_notifications')
    .select('*')
    .lte('scheduled_for', now.toISOString())
    .eq('sent', false);
    
  if (accountId) {
    query = query.eq('account_id', accountId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Failed to fetch scheduled notifications:', error);
    return [];
  }
  
  return data || [];
}