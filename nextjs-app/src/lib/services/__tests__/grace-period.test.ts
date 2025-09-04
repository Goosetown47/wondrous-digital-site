import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  checkGracePeriodStatus,
  scheduleGracePeriodNotifications,
  processExpiredGracePeriods,
  handlePaymentRetry,
  calculateGracePeriodEnd,
  getGracePeriodDaysRemaining,
  clearGracePeriod
} from '../grace-period';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { addDays } from 'date-fns';
import { createSupabaseMock } from './grace-period-mock-utils';

// Mock Supabase
vi.mock('@/lib/supabase/service', () => ({
  createSupabaseServiceClient: vi.fn()
}));

// Mock email service
vi.mock('@/lib/services/billing-notifications', () => ({
  sendBillingEmail: vi.fn()
}));

import type { MockSupabaseClient } from '@/test/mocks/types';
import { createMockQueryBuilder } from '@/test/mocks/types';

describe('Grace Period Service', () => {
  let mockSupabase: MockSupabaseClient;
  const GRACE_PERIOD_DAYS = 14;

  // Helper to set up mock responses
  const setupMockResponse = (response: { data: unknown; error: unknown }) => {
    const mockQueryBuilder = createMockQueryBuilder();
    mockQueryBuilder.single.mockResolvedValue(response);
    mockSupabase.from.mockReturnValue(mockQueryBuilder);
    return mockQueryBuilder;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Use the mock utility
    mockSupabase = createSupabaseMock();
    
    vi.mocked(createSupabaseServiceClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createSupabaseServiceClient>);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('checkGracePeriodStatus', () => {
    it('should return active grace period with correct days remaining', async () => {
      const now = new Date('2025-09-02T10:00:00Z');
      const gracePeriodEnd = new Date('2025-09-16T10:00:00Z'); // 14 days from now
      vi.setSystemTime(now);

      setupMockResponse({
        data: {
          id: 'account-123',
          grace_period_ends_at: gracePeriodEnd.toISOString(),
          subscription_state: 'past_due',
          tier: 'PRO'
        },
        error: null
      });

      const status = await checkGracePeriodStatus('account-123');

      expect(status).toEqual({
        isActive: true,
        endsAt: gracePeriodEnd.toISOString(),
        daysRemaining: 14,
        hoursRemaining: 14 * 24,
        needsNotification: true,
        currentTier: 'PRO'
      });
    });

    it('should return inactive when no grace period exists', async () => {
      setupMockResponse({
        data: {
          id: 'account-123',
          grace_period_ends_at: null,
          subscription_state: 'active',
          tier: 'PRO'
        },
        error: null
      });

      const status = await checkGracePeriodStatus('account-123');

      expect(status).toEqual({
        isActive: false,
        endsAt: null,
        daysRemaining: 0,
        hoursRemaining: 0,
        needsNotification: false,
        currentTier: 'PRO'
      });
    });

    it('should return expired when grace period has passed', async () => {
      const now = new Date('2025-09-17T10:00:00Z');
      const gracePeriodEnd = new Date('2025-09-16T10:00:00Z'); // 1 day ago
      vi.setSystemTime(now);

      setupMockResponse({
        data: {
          id: 'account-123',
          grace_period_ends_at: gracePeriodEnd.toISOString(),
          subscription_state: 'past_due',
          tier: 'PRO'
        },
        error: null
      });

      const status = await checkGracePeriodStatus('account-123');

      expect(status).toEqual({
        isActive: false,
        isExpired: true,
        endsAt: gracePeriodEnd.toISOString(),
        daysRemaining: 0,
        hoursRemaining: 0,
        needsDowngrade: true,
        currentTier: 'PRO'
      });
    });
  });

  describe('scheduleGracePeriodNotifications', () => {
    it('should schedule all 4 notification emails', async () => {
      const now = new Date('2025-09-02T10:00:00Z');
      const gracePeriodEnd = addDays(now, GRACE_PERIOD_DAYS);
      vi.setSystemTime(now);

      // Mock successful inserts
      const notificationsQueryBuilder = createMockQueryBuilder({ 
        data: [{ id: 'notif-1' }], 
        error: null 
      });
      
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'grace_period_notifications') {
          return notificationsQueryBuilder;
        }
        return createMockQueryBuilder();
      });

      await scheduleGracePeriodNotifications(
        'account-123',
        gracePeriodEnd.toISOString(),
        'PRO'
      );

      // Should insert 4 notification records
      expect(notificationsQueryBuilder.insert).toHaveBeenCalledTimes(1);
      expect(notificationsQueryBuilder.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            account_id: 'account-123',
            notification_type: 'grace_period_day_0',
            scheduled_for: expect.any(String),
            sent: false
          }),
          expect.objectContaining({
            account_id: 'account-123',
            notification_type: 'grace_period_day_7',
            scheduled_for: expect.any(String),
            sent: false
          }),
          expect.objectContaining({
            account_id: 'account-123',
            notification_type: 'grace_period_day_13',
            scheduled_for: expect.any(String),
            sent: false
          }),
          expect.objectContaining({
            account_id: 'account-123',
            notification_type: 'account_downgraded',
            scheduled_for: expect.any(String),
            sent: false
          })
        ])
      );
    });

    it('should not schedule duplicate notifications', async () => {
      const now = new Date('2025-09-02T10:00:00Z');
      vi.setSystemTime(now);

      // Mock existing notifications check
      const existingNotificationsBuilder = createMockQueryBuilder({
        data: [
          { notification_type: 'grace_period_day_0', sent: false }
        ],
        error: null
      });

      // Mock insert for new notifications
      const insertNotificationsBuilder = createMockQueryBuilder({
        data: [{ id: 'notif-2' }],
        error: null
      });

      let callCount = 0;
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'grace_period_notifications') {
          callCount++;
          // First call is to check existing, second is to insert
          return callCount === 1 ? existingNotificationsBuilder : insertNotificationsBuilder;
        }
        return createMockQueryBuilder();
      });

      await scheduleGracePeriodNotifications(
        'account-123',
        addDays(now, 14).toISOString(),
        'PRO'
      );

      // Should check for existing notifications
      expect(existingNotificationsBuilder.select).toHaveBeenCalled();
      expect(existingNotificationsBuilder.eq).toHaveBeenCalledWith('account_id', 'account-123');
      expect(existingNotificationsBuilder.eq).toHaveBeenCalledWith('sent', false);
    });
  });

  describe('processExpiredGracePeriods', () => {
    it('should downgrade accounts with expired grace periods', async () => {
      const now = new Date('2025-09-17T10:00:00Z');
      vi.setSystemTime(now);

      // Create mock query builder for accounts with expired grace periods
      const accountsQueryBuilder = createMockQueryBuilder({
        data: [
          {
            id: 'account-1',
            tier: 'PRO',
            grace_period_ends_at: '2025-09-16T10:00:00Z',
            stripe_subscription_id: 'sub_123'
          },
          {
            id: 'account-2',
            tier: 'MAX',
            grace_period_ends_at: '2025-09-15T10:00:00Z',
            stripe_subscription_id: 'sub_456'
          }
        ],
        error: null
      });

      // Create mock query builder for updates
      const updateQueryBuilder = createMockQueryBuilder({
        data: { id: 'account-1', tier: 'FREE' },
        error: null
      });

      // Mock the from() calls
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'accounts') {
          // First call is to fetch accounts, subsequent calls are updates
          if (mockSupabase.from.mock.calls.filter(c => c[0] === 'accounts').length === 1) {
            return accountsQueryBuilder;
          }
          return updateQueryBuilder;
        }
        return createMockQueryBuilder();
      });

      const result = await processExpiredGracePeriods();

      expect(result.processed).toBe(2);
      expect(result.errors).toHaveLength(0);
      
      // Should update each account to FREE tier
      expect(updateQueryBuilder.update).toHaveBeenCalledWith({
        tier: 'FREE',
        grace_period_ends_at: null,
        subscription_state: 'active',
        stripe_subscription_id: null,
        pending_tier_change: null,
        pending_tier_change_date: null
      });
    });

    it('should send downgrade notification emails', async () => {
      const now = new Date('2025-09-17T10:00:00Z');
      vi.setSystemTime(now);

      // Create mock query builders for accounts fetch
      const accountsQueryBuilder = createMockQueryBuilder({
        data: [{
          id: 'account-1',
          tier: 'PRO',
          grace_period_ends_at: '2025-09-16T10:00:00Z',
          stripe_subscription_id: 'sub_123'
        }],
        error: null
      });

      // Create mock query builder for update
      const updateQueryBuilder = createMockQueryBuilder({
        data: { id: 'account-1', tier: 'FREE' },
        error: null
      });

      // Create mock query builder for billing history insert
      const billingHistoryBuilder = createMockQueryBuilder({
        data: { id: 'history-1' },
        error: null
      });

      // Mock the from() calls
      let accountCallCount = 0;
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'accounts') {
          accountCallCount++;
          // First call is to fetch accounts, second is update
          return accountCallCount === 1 ? accountsQueryBuilder : updateQueryBuilder;
        }
        if (table === 'account_billing_history') {
          return billingHistoryBuilder;
        }
        return createMockQueryBuilder();
      });

      await processExpiredGracePeriods();

      // Should log the downgrade event
      expect(billingHistoryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          account_id: 'account-1',
          event_type: 'account_downgraded_grace_period_expired',
          old_tier: 'PRO',
          new_tier: 'FREE'
        })
      );
    });

    it('should handle errors gracefully', async () => {
      const now = new Date('2025-09-17T10:00:00Z');
      vi.setSystemTime(now);

      // Create mock query builders
      const accountsQueryBuilder = createMockQueryBuilder({
        data: [{
          id: 'account-1',
          tier: 'PRO',
          grace_period_ends_at: '2025-09-16T10:00:00Z',
          stripe_subscription_id: 'sub_123'
        }],
        error: null
      });

      // Mock update failure
      const updateQueryBuilder = createMockQueryBuilder({
        data: null,
        error: { message: 'Database error' }
      });

      let accountCallCount = 0;
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'accounts') {
          accountCallCount++;
          return accountCallCount === 1 ? accountsQueryBuilder : updateQueryBuilder;
        }
        return createMockQueryBuilder();
      });

      const result = await processExpiredGracePeriods();

      expect(result.processed).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('account-1');
    });
  });

  describe('handlePaymentRetry', () => {
    it('should clear grace period on successful payment', async () => {
      // Mock account update
      const accountUpdateBuilder = createMockQueryBuilder({
        data: { id: 'account-123' },
        error: null
      });

      // Mock notifications delete
      const notificationsDeleteBuilder = createMockQueryBuilder({
        data: null,
        error: null
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'accounts') {
          return accountUpdateBuilder;
        }
        if (table === 'grace_period_notifications') {
          return notificationsDeleteBuilder;
        }
        return createMockQueryBuilder();
      });

      await handlePaymentRetry('account-123', true);

      expect(accountUpdateBuilder.update).toHaveBeenCalledWith({
        grace_period_ends_at: null,
        subscription_state: 'active'
      });

      // Should also delete pending notifications
      expect(notificationsDeleteBuilder.delete).toHaveBeenCalled();
    });

    it('should extend grace period on failed retry', async () => {
      const now = new Date('2025-09-10T10:00:00Z');
      vi.setSystemTime(now);

      // Mock account fetch with grace period
      const accountQueryBuilder = createMockQueryBuilder({
        data: {
          id: 'account-123',
          grace_period_ends_at: '2025-09-16T10:00:00Z' // 6 days left
        },
        error: null
      });

      // Mock billing history insert
      const billingHistoryBuilder = createMockQueryBuilder({
        data: { id: 'history-1' },
        error: null
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'accounts') {
          return accountQueryBuilder;
        }
        if (table === 'account_billing_history') {
          return billingHistoryBuilder;
        }
        return createMockQueryBuilder();
      });

      await handlePaymentRetry('account-123', false);

      // Should log the retry attempt
      expect(billingHistoryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          account_id: 'account-123',
          event_type: 'payment_retry_failed',
          metadata: expect.objectContaining({
            days_remaining: 6
          })
        })
      );
    });
  });

  describe('calculateGracePeriodEnd', () => {
    it('should calculate exactly 14 days from failure', () => {
      const failureDate = new Date('2025-09-02T10:00:00Z');
      const expectedEnd = new Date('2025-09-16T10:00:00Z');

      const result = calculateGracePeriodEnd(failureDate);

      expect(result.toISOString()).toBe(expectedEnd.toISOString());
    });
  });

  describe('getGracePeriodDaysRemaining', () => {
    it('should calculate correct days remaining', () => {
      const now = new Date('2025-09-10T10:00:00Z');
      const gracePeriodEnd = new Date('2025-09-16T10:00:00Z');
      vi.setSystemTime(now);

      const days = getGracePeriodDaysRemaining(gracePeriodEnd.toISOString());

      expect(days).toBe(6);
    });

    it('should return 0 for expired grace periods', () => {
      const now = new Date('2025-09-17T10:00:00Z');
      const gracePeriodEnd = new Date('2025-09-16T10:00:00Z');
      vi.setSystemTime(now);

      const days = getGracePeriodDaysRemaining(gracePeriodEnd.toISOString());

      expect(days).toBe(0);
    });
  });

  describe('clearGracePeriod', () => {
    it('should remove grace period and notifications', async () => {
      // Mock account update
      const accountUpdateBuilder = createMockQueryBuilder({
        data: { id: 'account-123' },
        error: null
      });

      // Mock notifications delete
      const notificationsDeleteBuilder = createMockQueryBuilder({
        data: null,
        error: null
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'accounts') {
          return accountUpdateBuilder;
        }
        if (table === 'grace_period_notifications') {
          return notificationsDeleteBuilder;
        }
        return createMockQueryBuilder();
      });

      await clearGracePeriod('account-123');

      // Should clear grace period fields
      expect(accountUpdateBuilder.update).toHaveBeenCalledWith({
        grace_period_ends_at: null,
        subscription_state: 'active'
      });
      expect(accountUpdateBuilder.eq).toHaveBeenCalledWith('id', 'account-123');

      // Should delete all pending notifications
      expect(notificationsDeleteBuilder.delete).toHaveBeenCalled();
      expect(notificationsDeleteBuilder.eq).toHaveBeenCalledWith('account_id', 'account-123');
      expect(notificationsDeleteBuilder.eq).toHaveBeenCalledWith('sent', false);
    });
  });
});