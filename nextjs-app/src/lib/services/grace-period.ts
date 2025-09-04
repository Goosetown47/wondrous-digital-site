/**
 * Grace Period Service
 * 
 * Manages grace periods for failed payments, allowing customers
 * 14 days to update their payment method before account downgrade.
 */

import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { addDays, differenceInDays, differenceInHours, isAfter } from 'date-fns';
import { SubscriptionState } from './subscription-state';
import type { TierName } from '@/types/database';

const GRACE_PERIOD_DAYS = 14;

interface GracePeriodStatus {
  isActive: boolean;
  isExpired?: boolean;
  endsAt: string | null;
  daysRemaining: number;
  hoursRemaining: number;
  needsNotification?: boolean;
  needsDowngrade?: boolean;
  currentTier: string;
}

interface ProcessResult {
  processed: number;
  errors: string[];
  downgradedAccounts?: string[];
  dryRun?: boolean;
}

/**
 * Check if an account is currently in grace period
 */
export async function checkGracePeriodStatus(accountId: string): Promise<GracePeriodStatus> {
  const supabase = createSupabaseServiceClient();
  
  const { data: account, error } = await supabase
    .from('accounts')
    .select('id, grace_period_ends_at, subscription_state, tier')
    .eq('id', accountId)
    .single();
    
  if (error || !account) {
    console.error('Error fetching account for grace period check:', error);
    return {
      isActive: false,
      endsAt: null,
      daysRemaining: 0,
      hoursRemaining: 0,
      currentTier: 'FREE'
    };
  }
  
  if (!account.grace_period_ends_at) {
    return {
      isActive: false,
      endsAt: null,
      daysRemaining: 0,
      hoursRemaining: 0,
      needsNotification: false,
      currentTier: account.tier
    };
  }
  
  const now = new Date();
  const gracePeriodEnd = new Date(account.grace_period_ends_at);
  
  // Check if grace period has expired
  if (isAfter(now, gracePeriodEnd)) {
    return {
      isActive: false,
      isExpired: true,
      endsAt: account.grace_period_ends_at,
      daysRemaining: 0,
      hoursRemaining: 0,
      needsDowngrade: true,
      currentTier: account.tier
    };
  }
  
  // Grace period is active
  const daysRemaining = Math.max(0, differenceInDays(gracePeriodEnd, now));
  const hoursRemaining = Math.max(0, differenceInHours(gracePeriodEnd, now));
  
  return {
    isActive: true,
    endsAt: account.grace_period_ends_at,
    daysRemaining,
    hoursRemaining,
    needsNotification: true,
    currentTier: account.tier
  };
}

/**
 * Schedule all grace period notifications
 */
export async function scheduleGracePeriodNotifications(
  accountId: string,
  gracePeriodEndsAt: string,
  currentTier: string
): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const gracePeriodEnd = new Date(gracePeriodEndsAt);
  const gracePeriodStart = addDays(gracePeriodEnd, -GRACE_PERIOD_DAYS);
  
  // Check for existing notifications to avoid duplicates
  const { data: existingNotifications } = await supabase
    .from('grace_period_notifications')
    .select('notification_type')
    .eq('account_id', accountId)
    .eq('sent', false);
    
  const existingTypes = new Set(existingNotifications?.map(n => n.notification_type) || []);
  
  const notifications = [
    {
      account_id: accountId,
      notification_type: 'grace_period_day_0',
      scheduled_for: gracePeriodStart.toISOString(),
      sent: false,
      metadata: { tier: currentTier, grace_period_ends_at: gracePeriodEndsAt }
    },
    {
      account_id: accountId,
      notification_type: 'grace_period_day_7',
      scheduled_for: addDays(gracePeriodStart, 7).toISOString(),
      sent: false,
      metadata: { tier: currentTier, grace_period_ends_at: gracePeriodEndsAt }
    },
    {
      account_id: accountId,
      notification_type: 'grace_period_day_13',
      scheduled_for: addDays(gracePeriodStart, 13).toISOString(),
      sent: false,
      metadata: { tier: currentTier, grace_period_ends_at: gracePeriodEndsAt }
    },
    {
      account_id: accountId,
      notification_type: 'account_downgraded',
      scheduled_for: gracePeriodEnd.toISOString(),
      sent: false,
      metadata: { tier: currentTier, old_tier: currentTier, new_tier: 'FREE' }
    }
  ];
  
  // Filter out notifications that already exist
  const newNotifications = notifications.filter(n => !existingTypes.has(n.notification_type));
  
  if (newNotifications.length > 0) {
    const { error } = await supabase
      .from('grace_period_notifications')
      .insert(newNotifications);
      
    if (error) {
      console.error('Failed to schedule grace period notifications:', error);
      throw error;
    }
  }
}

/**
 * Process accounts with expired grace periods and downgrade them
 */
export async function processExpiredGracePeriods(): Promise<ProcessResult> {
  const supabase = createSupabaseServiceClient();
  const now = new Date();
  
  // Find accounts with expired grace periods
  const { data: expiredAccounts, error: fetchError } = await supabase
    .from('accounts')
    .select('id, tier, grace_period_ends_at, stripe_subscription_id')
    .lte('grace_period_ends_at', now.toISOString())
    .eq('subscription_state', SubscriptionState.PAST_DUE);
    
  if (fetchError) {
    console.error('Failed to fetch expired grace periods:', fetchError);
    return {
      processed: 0,
      errors: [`Failed to fetch accounts: ${fetchError.message}`]
    };
  }
  
  const results: ProcessResult = {
    processed: 0,
    errors: [],
    downgradedAccounts: []
  };
  
  for (const account of expiredAccounts || []) {
    try {
      // Downgrade to FREE tier
      const { error: updateError } = await supabase
        .from('accounts')
        .update({
          tier: 'FREE' as TierName,
          grace_period_ends_at: null,
          subscription_state: SubscriptionState.ACTIVE,
          stripe_subscription_id: null,
          pending_tier_change: null,
          pending_tier_change_date: null
        })
        .eq('id', account.id);
        
      if (updateError) {
        throw updateError;
      }
      
      // Log the downgrade event
      await supabase
        .from('account_billing_history')
        .insert({
          account_id: account.id,
          event_type: 'account_downgraded_grace_period_expired',
          old_tier: account.tier,
          new_tier: 'FREE',
          metadata: {
            grace_period_ended: account.grace_period_ends_at,
            reason: 'Grace period expired without payment update'
          }
        });
      
      // Cancel Stripe subscription if exists
      if (account.stripe_subscription_id) {
        try {
          const { getStripe } = await import('@/lib/stripe/config');
          const stripe = getStripe();
          await stripe.subscriptions.cancel(account.stripe_subscription_id);
        } catch (stripeError) {
          console.error(`Failed to cancel Stripe subscription for ${account.id}:`, stripeError);
        }
      }
      
      results.processed++;
      results.downgradedAccounts?.push(account.id);
      
    } catch (error) {
      const errorMessage = `Failed to downgrade account ${account.id}: ${error}`;
      console.error(errorMessage);
      results.errors.push(errorMessage);
    }
  }
  
  return results;
}

/**
 * Handle payment retry during grace period
 */
export async function handlePaymentRetry(
  accountId: string, 
  paymentSuccessful: boolean
): Promise<void> {
  const supabase = createSupabaseServiceClient();
  
  if (paymentSuccessful) {
    // Clear grace period
    await clearGracePeriod(accountId);
    
    // Log successful recovery
    await supabase
      .from('account_billing_history')
      .insert({
        account_id: accountId,
        event_type: 'payment_recovered_during_grace_period',
        metadata: {
          recovered_at: new Date().toISOString()
        }
      });
  } else {
    // Log failed retry
    const { data: account } = await supabase
      .from('accounts')
      .select('grace_period_ends_at')
      .eq('id', accountId)
      .single();
      
    if (account?.grace_period_ends_at) {
      const daysRemaining = getGracePeriodDaysRemaining(account.grace_period_ends_at);
      
      await supabase
        .from('account_billing_history')
        .insert({
          account_id: accountId,
          event_type: 'payment_retry_failed',
          metadata: {
            days_remaining: daysRemaining,
            grace_period_ends_at: account.grace_period_ends_at
          }
        });
    }
  }
}

/**
 * Calculate grace period end date
 */
export function calculateGracePeriodEnd(failureDate: Date = new Date()): Date {
  return addDays(failureDate, GRACE_PERIOD_DAYS);
}

/**
 * Get days remaining in grace period
 */
export function getGracePeriodDaysRemaining(gracePeriodEndsAt: string): number {
  const now = new Date();
  const endDate = new Date(gracePeriodEndsAt);
  return Math.max(0, differenceInDays(endDate, now));
}

/**
 * Clear grace period and notifications
 */
export async function clearGracePeriod(accountId: string): Promise<void> {
  const supabase = createSupabaseServiceClient();
  
  // Clear grace period fields
  const { error: updateError } = await supabase
    .from('accounts')
    .update({
      grace_period_ends_at: null,
      subscription_state: SubscriptionState.ACTIVE
    })
    .eq('id', accountId);
    
  if (updateError) {
    console.error('Failed to clear grace period:', updateError);
    throw updateError;
  }
  
  // Delete pending notifications
  const { error: deleteError } = await supabase
    .from('grace_period_notifications')
    .delete()
    .eq('account_id', accountId)
    .eq('sent', false);
    
  if (deleteError) {
    console.error('Failed to delete grace period notifications:', deleteError);
  }
}