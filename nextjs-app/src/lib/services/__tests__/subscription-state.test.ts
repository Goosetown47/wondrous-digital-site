import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  SubscriptionState,
  canTransition,
  getAvailableActions,
  validateStateTransition,
  updateSubscriptionState,
  getStateDisplayInfo,
  isActionAllowed,
  SubscriptionAction,
  isPendingChangeAnUpgrade,
  getPendingChangeDetails,
  getEnhancedErrorMessage
} from '../subscription-state';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import type { MockSupabaseClient } from '@/test/mocks/types';
import { createMockSupabaseClient } from '@/test/mocks/types';

// Mock Supabase
vi.mock('@/lib/supabase/service', () => ({
  createSupabaseServiceClient: vi.fn(),
}));

describe('SubscriptionState', () => {
  let mockSupabase: MockSupabaseClient;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock Supabase client
    mockSupabase = createMockSupabaseClient();
    
    vi.mocked(createSupabaseServiceClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createSupabaseServiceClient>);
  });

  describe('State Enum Values', () => {
    it('should have all required subscription states', () => {
      expect(SubscriptionState.ACTIVE).toBe('active');
      expect(SubscriptionState.PENDING_CHANGE).toBe('pending_change');
      expect(SubscriptionState.CANCELING).toBe('canceling');
      expect(SubscriptionState.PAST_DUE).toBe('past_due');
      expect(SubscriptionState.INCOMPLETE).toBe('incomplete');
      expect(SubscriptionState.INCOMPLETE_EXPIRED).toBe('incomplete_expired');
    });

    it('should not include trial state', () => {
      // Ensure we don't have a trial state as per requirements
      expect(Object.values(SubscriptionState)).not.toContain('trialing');
      expect(Object.values(SubscriptionState)).not.toContain('trial');
    });
  });

  describe('State Transitions', () => {
    describe('From ACTIVE state', () => {
      it('should allow transition to PENDING_CHANGE', () => {
        expect(canTransition(SubscriptionState.ACTIVE, SubscriptionState.PENDING_CHANGE)).toBe(true);
      });

      it('should allow transition to CANCELING', () => {
        expect(canTransition(SubscriptionState.ACTIVE, SubscriptionState.CANCELING)).toBe(true);
      });

      it('should allow transition to PAST_DUE', () => {
        expect(canTransition(SubscriptionState.ACTIVE, SubscriptionState.PAST_DUE)).toBe(true);
      });

      it('should not allow transition to INCOMPLETE', () => {
        expect(canTransition(SubscriptionState.ACTIVE, SubscriptionState.INCOMPLETE)).toBe(false);
      });
    });

    describe('From PENDING_CHANGE state', () => {
      it('should allow transition back to ACTIVE', () => {
        expect(canTransition(SubscriptionState.PENDING_CHANGE, SubscriptionState.ACTIVE)).toBe(true);
      });

      it('should allow transition to CANCELING', () => {
        expect(canTransition(SubscriptionState.PENDING_CHANGE, SubscriptionState.CANCELING)).toBe(true);
      });

      it('should not allow another PENDING_CHANGE', () => {
        expect(canTransition(SubscriptionState.PENDING_CHANGE, SubscriptionState.PENDING_CHANGE)).toBe(false);
      });
    });

    describe('From CANCELING state', () => {
      it('should allow reactivation to ACTIVE', () => {
        expect(canTransition(SubscriptionState.CANCELING, SubscriptionState.ACTIVE)).toBe(true);
      });

      it('should not allow transition to PENDING_CHANGE', () => {
        expect(canTransition(SubscriptionState.CANCELING, SubscriptionState.PENDING_CHANGE)).toBe(false);
      });
    });

    describe('From PAST_DUE state', () => {
      it('should allow recovery to ACTIVE', () => {
        expect(canTransition(SubscriptionState.PAST_DUE, SubscriptionState.ACTIVE)).toBe(true);
      });

      it('should allow cancellation', () => {
        expect(canTransition(SubscriptionState.PAST_DUE, SubscriptionState.CANCELING)).toBe(true);
      });

      it('should not allow plan changes', () => {
        expect(canTransition(SubscriptionState.PAST_DUE, SubscriptionState.PENDING_CHANGE)).toBe(false);
      });
    });

    describe('validateStateTransition', () => {
      it('should return success for valid transitions', () => {
        const result = validateStateTransition(SubscriptionState.ACTIVE, SubscriptionState.PENDING_CHANGE);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should return error for invalid transitions', () => {
        const result = validateStateTransition(SubscriptionState.CANCELING, SubscriptionState.PENDING_CHANGE);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Cannot transition from canceling to pending_change');
      });
    });
  });

  describe('Action Availability', () => {
    describe('ACTIVE state actions', () => {
      it('should allow all actions when active', () => {
        const actions = getAvailableActions(SubscriptionState.ACTIVE);
        expect(actions).toContain(SubscriptionAction.UPGRADE);
        expect(actions).toContain(SubscriptionAction.DOWNGRADE);
        expect(actions).toContain(SubscriptionAction.CANCEL);
        expect(actions).toContain(SubscriptionAction.ADD_ADDON);
        expect(actions).toContain(SubscriptionAction.REMOVE_ADDON);
        expect(actions).toContain(SubscriptionAction.CHANGE_BILLING_PERIOD);
      });
    });

    describe('PENDING_CHANGE state actions', () => {
      it('should only allow cancellation of pending change', () => {
        const actions = getAvailableActions(SubscriptionState.PENDING_CHANGE);
        expect(actions).toContain(SubscriptionAction.CANCEL_PENDING_CHANGE);
        expect(actions).not.toContain(SubscriptionAction.UPGRADE);
        expect(actions).not.toContain(SubscriptionAction.DOWNGRADE);
        expect(actions).not.toContain(SubscriptionAction.ADD_ADDON);
      });
    });

    describe('CANCELING state actions', () => {
      it('should only allow reactivation', () => {
        const actions = getAvailableActions(SubscriptionState.CANCELING);
        expect(actions).toContain(SubscriptionAction.REACTIVATE);
        expect(actions).not.toContain(SubscriptionAction.UPGRADE);
        expect(actions).not.toContain(SubscriptionAction.DOWNGRADE);
        expect(actions).not.toContain(SubscriptionAction.CANCEL);
      });
    });

    describe('PAST_DUE state actions', () => {
      it('should only allow payment update and cancellation', () => {
        const actions = getAvailableActions(SubscriptionState.PAST_DUE);
        expect(actions).toContain(SubscriptionAction.UPDATE_PAYMENT);
        expect(actions).toContain(SubscriptionAction.CANCEL);
        expect(actions).not.toContain(SubscriptionAction.UPGRADE);
        expect(actions).not.toContain(SubscriptionAction.DOWNGRADE);
      });
    });

    describe('isActionAllowed helper', () => {
      it('should return true for allowed actions', () => {
        expect(isActionAllowed(SubscriptionState.ACTIVE, SubscriptionAction.UPGRADE)).toBe(true);
        expect(isActionAllowed(SubscriptionState.ACTIVE, SubscriptionAction.CANCEL)).toBe(true);
      });

      it('should return false for disallowed actions', () => {
        expect(isActionAllowed(SubscriptionState.PENDING_CHANGE, SubscriptionAction.UPGRADE)).toBe(false);
        expect(isActionAllowed(SubscriptionState.CANCELING, SubscriptionAction.ADD_ADDON)).toBe(false);
      });
    });
  });

  describe('State Display Information', () => {
    it('should return correct display info for ACTIVE state', () => {
      const info = getStateDisplayInfo(SubscriptionState.ACTIVE);
      expect(info.label).toBe('Active');
      expect(info.color).toBe('green');
      expect(info.description).toContain('active');
    });

    it('should return correct display info for PENDING_CHANGE state', () => {
      const info = getStateDisplayInfo(SubscriptionState.PENDING_CHANGE);
      expect(info.label).toBe('Change Scheduled');
      expect(info.color).toBe('blue');
      expect(info.description).toContain('scheduled');
    });

    it('should return correct display info for CANCELING state', () => {
      const info = getStateDisplayInfo(SubscriptionState.CANCELING);
      expect(info.label).toBe('Canceling');
      expect(info.color).toBe('yellow');
      expect(info.description).toContain('cancel');
    });

    it('should return correct display info for PAST_DUE state', () => {
      const info = getStateDisplayInfo(SubscriptionState.PAST_DUE);
      expect(info.label).toBe('Past Due');
      expect(info.color).toBe('red');
      expect(info.description).toContain('payment');
    });
  });

  describe('Pending Change Helpers', () => {
    describe('isPendingChangeAnUpgrade', () => {
      it('should identify pending upgrade correctly', () => {
        expect(isPendingChangeAnUpgrade('PRO', 'SCALE')).toBe(true);
        expect(isPendingChangeAnUpgrade('SCALE', 'MAX')).toBe(true);
      });
      
      it('should identify pending downgrade correctly', () => {
        expect(isPendingChangeAnUpgrade('SCALE', 'PRO')).toBe(false);
        expect(isPendingChangeAnUpgrade('MAX', 'SCALE')).toBe(false);
      });
      
      it('should identify same tier change (billing switch) as not upgrade', () => {
        expect(isPendingChangeAnUpgrade('PRO', 'PRO')).toBe(false);
      });
    });
    
    describe('getPendingChangeDetails', () => {
      it('should return structured pending change information', () => {
        const mockAccount = {
          tier: 'SCALE',
          pending_tier_change: 'PRO',
          pending_tier_change_date: '2025-09-30T00:00:00Z',
          subscription_state: 'pending_change'
        };
        
        const details = getPendingChangeDetails(mockAccount);
        
        expect(details).toEqual({
          hasPendingChange: true,
          currentTier: 'SCALE',
          pendingTier: 'PRO',
          changeDate: '2025-09-30T00:00:00Z',
          isUpgrade: false,
          isDowngrade: true,
          isBillingSwitch: false
        });
      });
      
      it('should handle no pending change', () => {
        const mockAccount = {
          tier: 'PRO',
          pending_tier_change: null,
          pending_tier_change_date: null,
          subscription_state: 'active'
        };
        
        const details = getPendingChangeDetails(mockAccount);
        
        expect(details).toEqual({
          hasPendingChange: false,
          currentTier: 'PRO',
          pendingTier: null,
          changeDate: null,
          isUpgrade: false,
          isDowngrade: false,
          isBillingSwitch: false
        });
      });
    });
    
    describe('getEnhancedErrorMessage', () => {
      it('should create detailed error for blocked downgrade with pending upgrade', () => {
        const pendingDetails = {
          hasPendingChange: true,
          currentTier: 'PRO',
          pendingTier: 'SCALE',
          changeDate: '2025-09-30T00:00:00Z',
          isUpgrade: true,
          isDowngrade: false,
          isBillingSwitch: false
        };
        
        const error = getEnhancedErrorMessage('downgrade', pendingDetails);
        
        expect(error).toContain('You have an upgrade to SCALE scheduled');
        expect(error).toContain('September 29, 2025');
        expect(error).toContain('We only allow one change at a time');
      });
      
      it('should create detailed error for blocked upgrade with pending upgrade', () => {
        const pendingDetails = {
          hasPendingChange: true,
          currentTier: 'PRO',
          pendingTier: 'SCALE',
          changeDate: '2025-09-30T00:00:00Z',
          isUpgrade: true,
          isDowngrade: false,
          isBillingSwitch: false
        };
        
        const error = getEnhancedErrorMessage('upgrade', pendingDetails);
        
        expect(error).toContain('You have an upgrade to SCALE scheduled');
        expect(error).toContain('We only allow one change at a time');
      });
      
      it('should create detailed error for billing switch conflict', () => {
        const pendingDetails = {
          hasPendingChange: true,
          currentTier: 'PRO',
          pendingTier: 'PRO',
          changeDate: '2025-09-30T00:00:00Z',
          isUpgrade: false,
          isDowngrade: false,
          isBillingSwitch: true
        };
        
        const error = getEnhancedErrorMessage('upgrade', pendingDetails);
        
        expect(error).toContain('billing period change scheduled');
        expect(error).toContain('Please cancel the pending change first');
      });
    });
  });

  describe('State Persistence', () => {
    it('should update subscription state in database', async () => {
      const mockAccount = {
        id: 'account-123',
        subscription_state: 'active',
      };

      mockSupabase.from.mockReturnValue({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => ({
                data: { ...mockAccount, subscription_state: 'pending_change' },
                error: null,
              })),
            })),
          })),
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { id: 'transition-123' },
              error: null,
            })),
          })),
        })),
      });

      const result = await updateSubscriptionState(
        'account-123',
        SubscriptionState.PENDING_CHANGE,
        'User requested plan upgrade',
        { newTier: 'PRO' }
      );

      expect(result.success).toBe(true);
      const data = result.data as { subscription_state: string };
      expect(data?.subscription_state).toBe('pending_change');
      expect(mockSupabase.from).toHaveBeenCalledWith('accounts');
      expect(mockSupabase.from).toHaveBeenCalledWith('subscription_state_transitions');
    });

    it('should track state transition history', async () => {
      const insertSpy = vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: 'transition-123' },
            error: null,
          })),
        })),
      }));

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'subscription_state_transitions') {
          return { insert: insertSpy };
        }
        return {
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn(() => ({
                  data: { id: 'account-123', subscription_state: 'canceling' },
                  error: null,
                })),
              })),
            })),
          })),
        };
      });

      await updateSubscriptionState(
        'account-123',
        SubscriptionState.CANCELING,
        'User cancelled subscription'
      );

      expect(insertSpy).toHaveBeenCalledWith({
        account_id: 'account-123',
        from_state: null,
        to_state: 'canceling',
        reason: 'User cancelled subscription',
        metadata: {},
      });
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => ({
                data: null,
                error: { message: 'Database error' },
              })),
            })),
          })),
        })),
      });

      const result = await updateSubscriptionState(
        'account-123',
        SubscriptionState.PAST_DUE,
        'Payment failed'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to update subscription state');
    });
  });
});