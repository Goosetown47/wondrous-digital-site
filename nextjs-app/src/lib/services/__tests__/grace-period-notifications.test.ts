import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  checkAndSendGracePeriodNotifications,
  sendGracePeriodEmail,
  getScheduledNotifications,
  markNotificationSent,
  shouldSendNotification
} from '../grace-period-notifications';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import type { MockSupabaseClient } from '@/test/mocks/types';
import { createMockSupabaseClient, createMockQueryBuilder } from '@/test/mocks/types';

// Mock dependencies
vi.mock('@/lib/supabase/service', () => ({
  createSupabaseServiceClient: vi.fn()
}));

vi.mock('@/lib/resend', () => ({
  resend: {
    emails: {
      send: vi.fn().mockResolvedValue({ id: 'email-id' })
    }
  }
}));

describe('Grace Period Notifications', () => {
  let mockSupabase: MockSupabaseClient;

  // Helper function to setup standard mocks for grace period tests
  const setupStandardMocks = (notificationData: unknown, accountData?: unknown, userData?: unknown) => {
    const notificationsQueryBuilder = createMockQueryBuilder({
      data: notificationData,
      error: null
    });

    const accountQueryBuilder = createMockQueryBuilder({
      data: accountData || {
        id: 'account-123',
        name: 'Test Company',
        tier: 'PRO',
        grace_period_ends_at: '2025-09-16T09:00:00Z'
      },
      error: null
    });

    const accountUsersQueryBuilder = createMockQueryBuilder({
      data: userData || {
        user_id: 'user-123'
      },
      error: null
    });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'grace_period_notifications') {
        return notificationsQueryBuilder;
      } else if (table === 'accounts') {
        return accountQueryBuilder;
      } else if (table === 'account_users') {
        return accountUsersQueryBuilder;
      }
      return createMockQueryBuilder();
    });

    mockSupabase.auth.admin = {
      getUserById: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            user_metadata: {
              full_name: 'John Doe'
            }
          }
        },
        error: null
      }),
      updateUserById: vi.fn(),
      deleteUser: vi.fn(),
      listUsers: vi.fn()
    };

    return { notificationsQueryBuilder, accountQueryBuilder, accountUsersQueryBuilder };
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    mockSupabase = createMockSupabaseClient();
    
    vi.mocked(createSupabaseServiceClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createSupabaseServiceClient>);
    
    // Reset resend mock to default resolved value
    const { resend } = await import('@/lib/resend');
    vi.mocked(resend!.emails.send).mockResolvedValue({ 
      data: { id: 'email-id' },
      error: null 
    });
  });

  describe('checkAndSendGracePeriodNotifications', () => {
    it('should send day 0 notification on payment failure', async () => {
      const now = new Date('2025-09-02T09:00:00Z');
      vi.setSystemTime(now);

      // Create a mock query builder for the notifications query
      const notificationsQueryBuilder = createMockQueryBuilder({
        data: [
          {
            id: 'notif-1',
            account_id: 'account-123',
            notification_type: 'grace_period_day_0',
            scheduled_for: now.toISOString(),
            sent: false,
            metadata: {
              tier: 'PRO',
              grace_period_ends_at: '2025-09-16T09:00:00Z'
            }
          }
        ],
        error: null
      });

      // Create a mock query builder for the account query
      const accountQueryBuilder = createMockQueryBuilder({
        data: {
          id: 'account-123',
          name: 'Test Company',
          tier: 'PRO',
          grace_period_ends_at: '2025-09-16T09:00:00Z'
        },
        error: null
      });

      // Create a mock query builder for the account_users query
      const accountUsersQueryBuilder = createMockQueryBuilder({
        data: {
          user_id: 'user-123'
        },
        error: null
      });

      // Mock the from() calls to return appropriate query builders
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'grace_period_notifications') {
          return notificationsQueryBuilder;
        } else if (table === 'accounts') {
          return accountQueryBuilder;
        } else if (table === 'account_users') {
          return accountUsersQueryBuilder;
        }
        return createMockQueryBuilder();
      });

      // Mock auth.admin.getUserById
      mockSupabase.auth.admin = {
        getUserById: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: 'user-123',
              email: 'test@example.com',
              user_metadata: {
                full_name: 'John Doe'
              }
            }
          },
          error: null
        }),
        updateUserById: vi.fn(),
        deleteUser: vi.fn(),
        listUsers: vi.fn()
      };

      const result = await checkAndSendGracePeriodNotifications();

      expect(result.sent).toBe(1);
      expect(result.errors).toHaveLength(0);
    });

    it('should send day 7 notification at correct time', async () => {
      const now = new Date('2025-09-09T09:00:00Z'); // 7 days after failure
      vi.setSystemTime(now);

      // Setup mock query builders
      const notificationsQueryBuilder = createMockQueryBuilder({
        data: [
          {
            id: 'notif-2',
            account_id: 'account-123',
            notification_type: 'grace_period_day_7',
            scheduled_for: now.toISOString(),
            sent: false,
            metadata: {
              tier: 'PRO',
              grace_period_ends_at: '2025-09-16T09:00:00Z'
            }
          }
        ],
        error: null
      });

      const accountQueryBuilder = createMockQueryBuilder({
        data: {
          id: 'account-123',
          name: 'Test Company',
          tier: 'PRO',
          grace_period_ends_at: '2025-09-16T09:00:00Z'
        },
        error: null
      });

      const accountUsersQueryBuilder = createMockQueryBuilder({
        data: {
          user_id: 'user-123'
        },
        error: null
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'grace_period_notifications') {
          return notificationsQueryBuilder;
        } else if (table === 'accounts') {
          return accountQueryBuilder;
        } else if (table === 'account_users') {
          return accountUsersQueryBuilder;
        }
        return createMockQueryBuilder();
      });

      mockSupabase.auth.admin = {
        getUserById: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: 'user-123',
              email: 'test@example.com',
              user_metadata: {
                full_name: 'John Doe'
              }
            }
          },
          error: null
        }),
        updateUserById: vi.fn(),
        deleteUser: vi.fn(),
        listUsers: vi.fn()
      };

      const result = await checkAndSendGracePeriodNotifications();

      expect(result.sent).toBe(1);
      expect(result.notificationTypes).toContain('grace_period_day_7');
    });

    it('should send day 13 urgent notification', async () => {
      const now = new Date('2025-09-15T09:00:00Z'); // 13 days after failure
      vi.setSystemTime(now);

      setupStandardMocks([
        {
          id: 'notif-3',
          account_id: 'account-123',
          notification_type: 'grace_period_day_13',
          scheduled_for: now.toISOString(),
          sent: false,
          metadata: {
            tier: 'MAX',
            grace_period_ends_at: '2025-09-16T09:00:00Z'
          }
        }
      ]);

      const result = await checkAndSendGracePeriodNotifications();

      expect(result.notificationTypes).toContain('grace_period_day_13');
    });

    it('should send downgrade notification on day 14', async () => {
      const now = new Date('2025-09-16T09:00:00Z'); // 14 days - grace period expired
      vi.setSystemTime(now);

      setupStandardMocks([
        {
          id: 'notif-4',
          account_id: 'account-123',
          notification_type: 'account_downgraded',
          scheduled_for: now.toISOString(),
          sent: false,
          metadata: {
            tier: 'SCALE',
            old_tier: 'SCALE',
            new_tier: 'FREE'
          }
        }
      ]);

      const result = await checkAndSendGracePeriodNotifications();

      expect(result.notificationTypes).toContain('account_downgraded');
    });

    it('should not send already sent notifications', async () => {
      setupStandardMocks([
        {
          id: 'notif-5',
          account_id: 'account-123',
          notification_type: 'grace_period_day_0',
          scheduled_for: '2025-09-02T09:00:00Z',
          sent: true // Already sent
        }
      ]);

      const result = await checkAndSendGracePeriodNotifications();

      expect(result.sent).toBe(0);
      expect(result.skipped).toBe(1);
    });

    it('should handle email sending errors gracefully', async () => {
      const now = new Date('2025-09-02T09:00:00Z');
      vi.setSystemTime(now);

      setupStandardMocks([{
        id: 'notif-6',
        account_id: 'account-123',
        notification_type: 'grace_period_day_0',
        scheduled_for: now.toISOString(),
        sent: false,
        metadata: {
          tier: 'PRO',
          grace_period_ends_at: '2025-09-16T09:00:00Z'
        }
      }]);

      // Mock email send failure
      const { resend } = await import('@/lib/resend');
      vi.mocked(resend!.emails.send).mockRejectedValue(new Error('Email service down'));

      const result = await checkAndSendGracePeriodNotifications();

      expect(result.sent).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Email service down');
    });
  });

  describe('sendGracePeriodEmail', () => {
    it('should send day 0 email with correct content', async () => {
      const { resend } = await import('@/lib/resend');
      
      await sendGracePeriodEmail({
        to: 'test@example.com',
        accountName: 'Test Company',
        userName: 'John Doe',
        notificationType: 'grace_period_day_0',
        daysRemaining: 14,
        gracePeriodEndsAt: '2025-09-16T09:00:00Z',
        currentTier: 'PRO'
      });

      expect(resend!.emails.send).toHaveBeenCalledWith({
        from: 'Wondrous Digital <hello@wondrousdigital.com>',
        to: 'test@example.com',
        subject: 'Important: Your payment failed - 14 days to fix',
        react: expect.any(Object)
      });
    });

    it('should send day 7 email with correct urgency', async () => {
      const { resend } = await import('@/lib/resend');
      
      await sendGracePeriodEmail({
        to: 'test@example.com',
        accountName: 'Test Company',
        userName: 'Jane Smith',
        notificationType: 'grace_period_day_7',
        daysRemaining: 7,
        gracePeriodEndsAt: '2025-09-16T09:00:00Z',
        currentTier: 'MAX'
      });

      expect(resend!.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Reminder: 7 days left to update payment'
        })
      );
    });

    it('should send urgent day 13 email', async () => {
      const { resend } = await import('@/lib/resend');
      
      await sendGracePeriodEmail({
        to: 'test@example.com',
        accountName: 'Test Company',
        userName: 'Admin User',
        notificationType: 'grace_period_day_13',
        daysRemaining: 1,
        gracePeriodEndsAt: '2025-09-16T09:00:00Z',
        currentTier: 'SCALE'
      });

      expect(resend!.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'URGENT: 1 day left before account downgrade'
        })
      );
    });

    it('should send downgrade confirmation email', async () => {
      const { resend } = await import('@/lib/resend');
      
      await sendGracePeriodEmail({
        to: 'test@example.com',
        accountName: 'Test Company',
        userName: 'Owner',
        notificationType: 'account_downgraded',
        daysRemaining: 0,
        gracePeriodEndsAt: '2025-09-16T09:00:00Z',
        currentTier: 'FREE',
        oldTier: 'PRO'
      });

      expect(resend!.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Your account has been downgraded to FREE'
        })
      );
    });
  });

  describe('markNotificationSent', () => {
    it('should update notification as sent with timestamp', async () => {
      const now = new Date('2025-09-02T09:15:00Z');
      vi.setSystemTime(now);

      const updateQueryBuilder = createMockQueryBuilder({
        data: { id: 'notif-1' },
        error: null
      });

      mockSupabase.from.mockImplementation(() => updateQueryBuilder);

      await markNotificationSent('notif-1');

      expect(updateQueryBuilder.update).toHaveBeenCalledWith({
        sent: true,
        sent_at: now.toISOString()
      });
      expect(updateQueryBuilder.eq).toHaveBeenCalledWith('id', 'notif-1');
    });

    it('should handle update errors', async () => {
      const updateQueryBuilder = createMockQueryBuilder({
        data: null,
        error: { message: 'Database error' }
      });

      mockSupabase.from.mockImplementation(() => updateQueryBuilder);

      await expect(markNotificationSent('notif-1')).rejects.toThrow('Failed to mark notification as sent: Database error');
    });
  });

  describe('shouldSendNotification', () => {
    it('should return true when time matches and not sent', () => {
      const now = new Date('2025-09-02T09:00:00Z');
      vi.setSystemTime(now);

      const notification = {
        id: 'notif-1',
        account_id: 'account-123',
        notification_type: 'grace_period_day_0' as const,
        scheduled_for: now.toISOString(),
        sent: false,
        sent_at: null,
        metadata: {}
      };

      expect(shouldSendNotification(notification)).toBe(true);
    });

    it('should return false if already sent', () => {
      const notification = {
        id: 'notif-1',
        account_id: 'account-123',
        notification_type: 'grace_period_day_0' as const,
        scheduled_for: '2025-09-02T09:00:00Z',
        sent: true,
        sent_at: '2025-09-02T09:00:00Z',
        metadata: {}
      };

      expect(shouldSendNotification(notification)).toBe(false);
    });

    it('should return false if scheduled for future', () => {
      const now = new Date('2025-09-02T09:00:00Z');
      vi.setSystemTime(now);

      const notification = {
        id: 'notif-1',
        account_id: 'account-123',
        notification_type: 'grace_period_day_0' as const,
        scheduled_for: '2025-09-03T09:00:00Z',
        sent: false,
        sent_at: null,
        metadata: {}
      };

      expect(shouldSendNotification(notification)).toBe(false);
    });
  });

  describe('getScheduledNotifications', () => {
    it('should fetch notifications due to be sent', async () => {
      const now = new Date('2025-09-02T09:00:00Z');
      vi.setSystemTime(now);

      const queryBuilder = createMockQueryBuilder({
        data: [
          { id: '1', notification_type: 'grace_period_day_0' },
          { id: '2', notification_type: 'grace_period_day_7' }
        ],
        error: null
      });

      mockSupabase.from.mockImplementation(() => queryBuilder);

      const notifications = await getScheduledNotifications();

      expect(notifications).toHaveLength(2);
      expect(queryBuilder.lte).toHaveBeenCalledWith('scheduled_for', now.toISOString());
      expect(queryBuilder.eq).toHaveBeenCalledWith('sent', false);
    });
  });
});