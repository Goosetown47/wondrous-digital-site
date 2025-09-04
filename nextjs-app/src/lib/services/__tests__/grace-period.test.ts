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
  
  // Helper to setup complex query chains
  const setupMockQueryChain = () => {
    const mockQueryBuilder = createMockQueryBuilder();
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
      const mockQueryBuilder = setupMockQueryChain();
      mockQueryBuilder.insert.mockResolvedValue({ error: null });

      await scheduleGracePeriodNotifications(
        'account-123',
        gracePeriodEnd.toISOString(),
        'PRO'
      );

      // Should insert 4 notification records
      expect(mockQueryBuilder.insert).toHaveBeenCalledTimes(1);
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
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
      // Mock existing notifications
      mockSupabase.select!.mockReturnThis();
      mockSupabase.eq!.mockReturnThis();
      setupMockResponse({
        data: [
          { notification_type: 'grace_period_day_0', sent: false }
        ],
        error: null
      });

      const now = new Date('2025-09-02T10:00:00Z');
      vi.setSystemTime(now);

      await scheduleGracePeriodNotifications(
        'account-123',
        addDays(now, 14).toISOString(),
        'PRO'
      );

      // Should check for existing notifications
      expect(mockSupabase.select).toHaveBeenCalled();
    });
  });

  describe('processExpiredGracePeriods', () => {
    it('should downgrade accounts with expired grace periods', async () => {
      const now = new Date('2025-09-17T10:00:00Z');
      vi.setSystemTime(now);

      // Mock accounts with expired grace periods
      mockSupabase.select!.mockReturnThis();
      mockSupabase.lte!.mockReturnThis();
      mockSupabase.eq!.mockReturnThis();
      mockSupabase.select!.mockResolvedValue({
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

      // Mock successful updates
      mockSupabase.update!.mockResolvedValue({ error: null });

      const result = await processExpiredGracePeriods();

      expect(result.processed).toBe(2);
      expect(result.errors).toHaveLength(0);
      
      // Should update each account to FREE tier
      expect(mockSupabase.update).toHaveBeenCalledWith({
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

      mockSupabase.select!.mockResolvedValue({
        data: [{
          id: 'account-1',
          tier: 'PRO',
          grace_period_ends_at: '2025-09-16T10:00:00Z'
        }],
        error: null
      });

      mockSupabase.update!.mockResolvedValue({ error: null });

      await processExpiredGracePeriods();

      // Should log the downgrade event
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          account_id: 'account-1',
          event_type: 'account_downgraded_grace_period_expired',
          old_tier: 'PRO',
          new_tier: 'FREE'
        })
      );
    });

    it('should handle errors gracefully', async () => {
      mockSupabase.select!.mockResolvedValue({
        data: [{
          id: 'account-1',
          tier: 'PRO',
          grace_period_ends_at: '2025-09-16T10:00:00Z'
        }],
        error: null
      });

      // Mock update failure
      mockSupabase.update!.mockResolvedValue({
        error: new Error('Database error')
      });

      const result = await processExpiredGracePeriods();

      expect(result.processed).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('account-1');
    });
  });

  describe('handlePaymentRetry', () => {
    it('should clear grace period on successful payment', async () => {
      mockSupabase.update!.mockResolvedValue({
        data: { id: 'account-123' },
        error: null
      });

      await handlePaymentRetry('account-123', true);

      expect(mockSupabase.update).toHaveBeenCalledWith({
        grace_period_ends_at: null,
        subscription_state: 'active'
      });

      // Should also delete pending notifications
      expect(mockSupabase.delete).toHaveBeenCalled();
    });

    it('should extend grace period on failed retry', async () => {
      const now = new Date('2025-09-10T10:00:00Z');
      vi.setSystemTime(now);

      setupMockResponse({
        data: {
          grace_period_ends_at: '2025-09-16T10:00:00Z' // 6 days left
        },
        error: null
      });

      await handlePaymentRetry('account-123', false);

      // Should log the retry attempt
      expect(mockSupabase.insert).toHaveBeenCalledWith(
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
      mockSupabase.update!.mockResolvedValue({ error: null });
      mockSupabase.delete!.mockResolvedValue({ error: null });

      await clearGracePeriod('account-123');

      // Should clear grace period fields
      expect(mockSupabase.update).toHaveBeenCalledWith({
        grace_period_ends_at: null,
        subscription_state: 'active'
      });

      // Should delete all pending notifications
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('account_id', 'account-123');
      expect(mockSupabase.eq).toHaveBeenCalledWith('sent', false);
    });
  });
});