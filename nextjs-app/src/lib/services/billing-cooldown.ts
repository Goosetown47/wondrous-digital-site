/**
 * Billing Cooldown Service
 * 
 * Enforces a 24-hour cooldown period between plan changes to prevent
 * rapid switching and reduce support burden.
 */

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { differenceInHours, differenceInMinutes, addHours } from 'date-fns';

const COOLDOWN_HOURS = 24;

interface CooldownStatus {
  isActive: boolean;
  endsAt: string | null;
  timeRemaining: string | null;
  canMakeChange: boolean;
}

/**
 * Check if an account is currently in cooldown period
 */
export async function checkCooldownStatus(accountId: string): Promise<CooldownStatus> {
  const supabase = await createSupabaseServerClient();
  
  const { data: account, error } = await supabase
    .from('accounts')
    .select('last_plan_change_at, cooldown_override')
    .eq('id', accountId)
    .single();
    
  if (error || !account) {
    console.error('Error fetching account for cooldown check:', error);
    return {
      isActive: false,
      endsAt: null,
      timeRemaining: null,
      canMakeChange: true
    };
  }
  
  // Testing override bypasses cooldown
  if (account.cooldown_override) {
    return {
      isActive: false,
      endsAt: null,
      timeRemaining: null,
      canMakeChange: true
    };
  }
  
  // No previous change means no cooldown
  if (!account.last_plan_change_at) {
    return {
      isActive: false,
      endsAt: null,
      timeRemaining: null,
      canMakeChange: true
    };
  }
  
  const lastChangeTime = new Date(account.last_plan_change_at);
  const cooldownEndsAt = addHours(lastChangeTime, COOLDOWN_HOURS);
  const now = new Date();
  
  // Check if cooldown has expired
  if (now >= cooldownEndsAt) {
    return {
      isActive: false,
      endsAt: null,
      timeRemaining: null,
      canMakeChange: true
    };
  }
  
  // Calculate time remaining
  const hoursRemaining = differenceInHours(cooldownEndsAt, now);
  const minutesRemaining = differenceInMinutes(cooldownEndsAt, now) % 60;
  
  let timeRemaining = '';
  if (hoursRemaining > 0) {
    timeRemaining = `${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''}`;
    if (minutesRemaining > 0) {
      timeRemaining += ` and ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}`;
    }
  } else {
    timeRemaining = `${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}`;
  }
  
  return {
    isActive: true,
    endsAt: cooldownEndsAt.toISOString(),
    timeRemaining,
    canMakeChange: false
  };
}

/**
 * Simple boolean check for cooldown status
 */
export async function isCooldownActive(accountId: string): Promise<boolean> {
  const status = await checkCooldownStatus(accountId);
  return status.isActive;
}

/**
 * Get the time when cooldown ends
 */
export async function getCooldownEndTime(accountId: string): Promise<Date | null> {
  const status = await checkCooldownStatus(accountId);
  return status.endsAt ? new Date(status.endsAt) : null;
}

/**
 * Update the last plan change timestamp (starts new cooldown)
 * Should be called after any successful plan change
 */
export async function updateLastChangeTime(accountId: string): Promise<void> {
  const supabaseService = createSupabaseServiceClient();
  
  const { error } = await supabaseService
    .from('accounts')
    .update({ 
      last_plan_change_at: new Date().toISOString() 
    })
    .eq('id', accountId);
    
  if (error) {
    console.error('Error updating last plan change time:', error);
    throw new Error('Failed to update cooldown timestamp');
  }
}

/**
 * Toggle cooldown override for testing (admin only)
 */
export async function toggleCooldownOverride(accountId: string, enabled: boolean): Promise<void> {
  const supabaseService = createSupabaseServiceClient();
  
  const { error } = await supabaseService
    .from('accounts')
    .update({ 
      cooldown_override: enabled 
    })
    .eq('id', accountId);
    
  if (error) {
    console.error('Error toggling cooldown override:', error);
    throw new Error('Failed to toggle cooldown override');
  }
}

/**
 * Get a user-friendly error message for cooldown period
 */
export function getCooldownErrorMessage(timeRemaining: string): string {
  return `You recently made a plan change. To prevent accidental changes, ` +
         `please wait ${timeRemaining} before making another change. ` +
         `You can still cancel any pending changes.`;
}