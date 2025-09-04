import { createSupabaseServiceClient } from '@/lib/supabase/service';

/**
 * Subscription state enum - matches database enum type
 * Excludes trial state as per requirements
 */
export enum SubscriptionState {
  ACTIVE = 'active',
  PENDING_CHANGE = 'pending_change',
  CANCELING = 'canceling',
  PAST_DUE = 'past_due',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired'
}

/**
 * Available actions for subscriptions
 */
export enum SubscriptionAction {
  UPGRADE = 'upgrade',
  DOWNGRADE = 'downgrade',
  CANCEL = 'cancel',
  REACTIVATE = 'reactivate',
  ADD_ADDON = 'add_addon',
  REMOVE_ADDON = 'remove_addon',
  CHANGE_BILLING_PERIOD = 'change_billing_period',
  UPDATE_PAYMENT = 'update_payment',
  CANCEL_PENDING_CHANGE = 'cancel_pending_change'
}

/**
 * State transition rules - defines allowed transitions between states
 */
const STATE_TRANSITIONS: Record<SubscriptionState, SubscriptionState[]> = {
  [SubscriptionState.ACTIVE]: [
    SubscriptionState.PENDING_CHANGE,
    SubscriptionState.CANCELING,
    SubscriptionState.PAST_DUE
  ],
  [SubscriptionState.PENDING_CHANGE]: [
    SubscriptionState.ACTIVE, // Cancel pending change or change completes
    SubscriptionState.CANCELING // Can still cancel during pending change
  ],
  [SubscriptionState.CANCELING]: [
    SubscriptionState.ACTIVE // Reactivation before period ends
  ],
  [SubscriptionState.PAST_DUE]: [
    SubscriptionState.ACTIVE, // Payment succeeds
    SubscriptionState.CANCELING // Give up and cancel
  ],
  [SubscriptionState.INCOMPLETE]: [
    SubscriptionState.ACTIVE, // Initial payment succeeds
    SubscriptionState.INCOMPLETE_EXPIRED // Payment window expires
  ],
  [SubscriptionState.INCOMPLETE_EXPIRED]: [] // Terminal state - must create new subscription
};

/**
 * Actions available in each state
 */
const STATE_ACTIONS: Record<SubscriptionState, SubscriptionAction[]> = {
  [SubscriptionState.ACTIVE]: [
    SubscriptionAction.UPGRADE,
    SubscriptionAction.DOWNGRADE,
    SubscriptionAction.CANCEL,
    SubscriptionAction.ADD_ADDON,
    SubscriptionAction.REMOVE_ADDON,
    SubscriptionAction.CHANGE_BILLING_PERIOD
  ],
  [SubscriptionState.PENDING_CHANGE]: [
    SubscriptionAction.CANCEL_PENDING_CHANGE,
    SubscriptionAction.CANCEL // Can still cancel subscription entirely
  ],
  [SubscriptionState.CANCELING]: [
    SubscriptionAction.REACTIVATE
  ],
  [SubscriptionState.PAST_DUE]: [
    SubscriptionAction.UPDATE_PAYMENT,
    SubscriptionAction.CANCEL
  ],
  [SubscriptionState.INCOMPLETE]: [
    SubscriptionAction.UPDATE_PAYMENT
  ],
  [SubscriptionState.INCOMPLETE_EXPIRED]: [] // No actions available
};

/**
 * Display information for each state
 */
interface StateDisplayInfo {
  label: string;
  color: 'green' | 'blue' | 'yellow' | 'red' | 'gray';
  description: string;
  icon?: string;
}

const STATE_DISPLAY: Record<SubscriptionState, StateDisplayInfo> = {
  [SubscriptionState.ACTIVE]: {
    label: 'Active',
    color: 'green',
    description: 'Your subscription is active and in good standing',
    icon: 'check-circle'
  },
  [SubscriptionState.PENDING_CHANGE]: {
    label: 'Change Scheduled',
    color: 'blue',
    description: 'A plan change is scheduled for your next billing cycle',
    icon: 'clock'
  },
  [SubscriptionState.CANCELING]: {
    label: 'Canceling',
    color: 'yellow',
    description: 'Your subscription will cancel at the end of the billing period',
    icon: 'alert-circle'
  },
  [SubscriptionState.PAST_DUE]: {
    label: 'Past Due',
    color: 'red',
    description: 'Payment failed. Please update your payment method',
    icon: 'alert-triangle'
  },
  [SubscriptionState.INCOMPLETE]: {
    label: 'Payment Pending',
    color: 'yellow',
    description: 'Waiting for initial payment to activate subscription',
    icon: 'clock'
  },
  [SubscriptionState.INCOMPLETE_EXPIRED]: {
    label: 'Expired',
    color: 'gray',
    description: 'Initial payment window expired. Please start a new subscription',
    icon: 'x-circle'
  }
};

/**
 * Check if a state transition is allowed
 */
export function canTransition(from: SubscriptionState, to: SubscriptionState): boolean {
  const allowedTransitions = STATE_TRANSITIONS[from] || [];
  return allowedTransitions.includes(to);
}

/**
 * Validate a state transition and return detailed result
 */
export function validateStateTransition(from: SubscriptionState, to: SubscriptionState): {
  valid: boolean;
  error?: string;
} {
  if (canTransition(from, to)) {
    return { valid: true };
  }
  
  return {
    valid: false,
    error: `Cannot transition from ${from} to ${to}. Allowed transitions: ${STATE_TRANSITIONS[from]?.join(', ') || 'none'}`
  };
}

/**
 * Get available actions for a given state
 */
export function getAvailableActions(state: SubscriptionState): SubscriptionAction[] {
  return STATE_ACTIONS[state] || [];
}

/**
 * Check if a specific action is allowed in a given state
 */
export function isActionAllowed(state: SubscriptionState, action: SubscriptionAction): boolean {
  const availableActions = getAvailableActions(state);
  return availableActions.includes(action);
}

/**
 * Get display information for a state
 * @param state - The subscription state
 * @param gracePeriodEndsAt - Optional grace period end date for PAST_DUE state
 */
export function getStateDisplayInfo(
  state: SubscriptionState, 
  gracePeriodEndsAt?: string | null
): StateDisplayInfo {
  // Special handling for PAST_DUE with grace period
  if (state === SubscriptionState.PAST_DUE && gracePeriodEndsAt) {
    const now = new Date();
    const gracePeriodEnd = new Date(gracePeriodEndsAt);
    const daysRemaining = Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining > 0) {
      return {
        label: 'Grace Period',
        color: 'yellow',
        description: `Your payment failed. You have ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} to update your payment method before your account converts to FREE`,
        icon: 'alert-triangle'
      };
    }
  }
  
  return STATE_DISPLAY[state] || {
    label: 'Unknown',
    color: 'gray',
    description: 'Unknown subscription state'
  };
}

/**
 * Update subscription state with transition tracking
 */
export async function updateSubscriptionState(
  accountId: string,
  newState: SubscriptionState,
  reason?: string,
  metadata?: Record<string, unknown>
): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  try {
    const supabase = createSupabaseServiceClient();
    
    // Update account subscription state
    const { data: account, error: updateError } = await supabase
      .from('accounts')
      .update({ subscription_state: newState })
      .eq('id', accountId)
      .select()
      .single();
    
    if (updateError) {
      return {
        success: false,
        error: `Failed to update subscription state: ${updateError.message}`
      };
    }
    
    // Record state transition for audit trail
    const { error: transitionError } = await supabase
      .from('subscription_state_transitions')
      .insert({
        account_id: accountId,
        from_state: null, // Will be set from previous state in real implementation
        to_state: newState,
        reason: reason || '',
        metadata: metadata || {}
      })
      .select()
      .single();
    
    if (transitionError) {
      console.error('Failed to record state transition:', transitionError);
      // Don't fail the whole operation if transition logging fails
    }
    
    return {
      success: true,
      data: account
    };
  } catch (error) {
    console.error('Error updating subscription state:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while updating subscription state'
    };
  }
}

/**
 * Get current subscription state for an account
 */
export async function getSubscriptionState(accountId: string): Promise<{
  state: SubscriptionState | null;
  error?: string;
}> {
  try {
    const supabase = createSupabaseServiceClient();
    
    const { data, error } = await supabase
      .from('accounts')
      .select('subscription_state')
      .eq('id', accountId)
      .single();
    
    if (error) {
      return {
        state: null,
        error: error.message
      };
    }
    
    return {
      state: data?.subscription_state as SubscriptionState || null
    };
  } catch (error) {
    console.error('Error fetching subscription state:', error);
    return {
      state: null,
      error: 'Failed to fetch subscription state'
    };
  }
}

/**
 * Helper to determine if account can make billing changes
 */
export function canMakeBillingChanges(state: SubscriptionState): boolean {
  return isActionAllowed(state, SubscriptionAction.UPGRADE) ||
         isActionAllowed(state, SubscriptionAction.DOWNGRADE) ||
         isActionAllowed(state, SubscriptionAction.CHANGE_BILLING_PERIOD);
}

/**
 * Helper to determine if account needs payment attention
 */
export function needsPaymentAttention(state: SubscriptionState): boolean {
  return state === SubscriptionState.PAST_DUE ||
         state === SubscriptionState.INCOMPLETE;
}

/**
 * Map Stripe status to our subscription state
 */
export function mapStripeStatusToState(stripeStatus: string): SubscriptionState {
  const statusMap: Record<string, SubscriptionState> = {
    'active': SubscriptionState.ACTIVE,
    'past_due': SubscriptionState.PAST_DUE,
    'canceled': SubscriptionState.CANCELING,
    'incomplete': SubscriptionState.INCOMPLETE,
    'incomplete_expired': SubscriptionState.INCOMPLETE_EXPIRED,
    // Note: We don't map 'trialing' since we don't support trials
  };
  
  return statusMap[stripeStatus] || SubscriptionState.ACTIVE;
}

// ============================================================================
// UPGRADE OVERRIDE EXCEPTION FUNCTIONALITY
// ============================================================================

/**
 * Tier hierarchy for determining upgrades vs downgrades
 */
const TIER_HIERARCHY: Record<string, number> = {
  'FREE': 0,
  'BASIC': 1,
  'PRO': 2,
  'SCALE': 3,
  'MAX': 4
};

/**
 * Account interface for pending change functions
 */
interface PendingChangeAccount {
  tier: string;
  pending_tier_change: string | null;
  pending_tier_change_date?: string | null;
  subscription_state: string;
}

/**
 * Structured pending change information
 */
interface PendingChangeDetails {
  hasPendingChange: boolean;
  currentTier: string;
  pendingTier: string | null;
  changeDate: string | null;
  isUpgrade: boolean;
  isDowngrade: boolean;
  isBillingSwitch: boolean;
}

/**
 * Check if a tier change represents an upgrade
 */
export function isPendingChangeAnUpgrade(currentTier: string, pendingTier: string): boolean {
  const currentLevel = TIER_HIERARCHY[currentTier] || 0;
  const pendingLevel = TIER_HIERARCHY[pendingTier] || 0;
  return pendingLevel > currentLevel;
}

/**
 * Get detailed information about a pending change
 */
export function getPendingChangeDetails(account: PendingChangeAccount): PendingChangeDetails {
  if (!account.pending_tier_change) {
    return {
      hasPendingChange: false,
      currentTier: account.tier,
      pendingTier: null,
      changeDate: null,
      isUpgrade: false,
      isDowngrade: false,
      isBillingSwitch: false
    };
  }

  const isUpgrade = isPendingChangeAnUpgrade(account.tier, account.pending_tier_change);
  const isBillingSwitch = account.tier === account.pending_tier_change;
  
  return {
    hasPendingChange: true,
    currentTier: account.tier,
    pendingTier: account.pending_tier_change,
    changeDate: account.pending_tier_change_date || null,
    isUpgrade,
    isDowngrade: !isUpgrade && !isBillingSwitch,
    isBillingSwitch
  };
}

// Removed canUpgradeOverridePending function - upgrades are immediate, never pending

/**
 * Create enhanced error messages with pending change details
 */
export function getEnhancedErrorMessage(
  attemptedAction: string,
  pendingDetails: PendingChangeDetails
): string {
  if (!pendingDetails.hasPendingChange) {
    return 'No pending changes found.';
  }

  const changeDate = pendingDetails.changeDate 
    ? new Date(pendingDetails.changeDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'your next billing cycle';

  if (pendingDetails.isUpgrade) {
    // This shouldn't happen since upgrades are immediate, but kept for safety
    return `You have an upgrade to ${pendingDetails.pendingTier} scheduled for ${changeDate}. ` +
           `We only allow one change at a time. Please wait for the current change to complete ` +
           `or cancel it before making another change.`;
  } else if (pendingDetails.isDowngrade) {
    return `You have a downgrade to ${pendingDetails.pendingTier} scheduled for ${changeDate}. ` +
           `Please cancel the pending change first or wait for it to complete.`;
  } else if (pendingDetails.isBillingSwitch) {
    return `You have a billing period change scheduled for ${changeDate}. ` +
           `Please cancel the pending change first or wait for it to complete.`;
  }

  return `You have a pending change scheduled for ${changeDate}. Please wait for it to complete or cancel it first.`;
}