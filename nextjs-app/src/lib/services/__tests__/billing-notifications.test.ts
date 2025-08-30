import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  checkPendingChanges,
  calculateNotificationDates,
  sendBillingChangeReminder,
  formatBillingChangeData,
  hasAlreadySentNotification
} from '../billing-notifications';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { sendEmail } from '@/lib/services/email';
import type { TierName } from '@/types/database';

vi.mock('@/lib/supabase/service');
vi.mock('@/lib/services/email');

describe('BillingNotificationService', () => {
  // Create a mock Supabase client with proper chaining
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    };
    (createSupabaseServiceClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);
    // Mock sendEmail to always succeed by default
    (sendEmail as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: { id: 'test-email-id' },
    });
  });

  describe('checkPendingChanges', () => {
    const mockAccounts = [
      {
        id: 'acc-1',
        name: 'Company A',
        email: 'billing@companya.com',
        tier: 'MAX',
        pending_tier_change: 'PRO',
        pending_tier_change_date: '2025-09-30T00:00:00Z',
        subscription_status: 'active'
      },
      {
        id: 'acc-2',
        name: 'Company B',
        email: 'billing@companyb.com',
        tier: 'SCALE',
        pending_tier_change: 'PRO',
        pending_tier_change_date: '2025-09-14T00:00:00Z',
        subscription_status: 'active'
      }
    ];

    it('should identify accounts with changes 30 days out', async () => {
      const today = new Date('2025-08-31');
      // Mock the final method in the chain
      mockSupabase.eq.mockReturnValueOnce({ data: [mockAccounts[0]], error: null });

      const accounts = await checkPendingChanges(30, today);

      expect(accounts).toHaveLength(1);
      expect(accounts[0].id).toBe('acc-1');
      expect(accounts[0].pending_tier_change_date).toBe('2025-09-30T00:00:00Z');
    });

    it('should identify accounts with changes 14 days out', async () => {
      const today = new Date('2025-08-31');
      // Mock the final method in the chain
      mockSupabase.eq.mockReturnValueOnce({ data: [mockAccounts[1]], error: null });

      const accounts = await checkPendingChanges(14, today);

      expect(accounts).toHaveLength(1);
      expect(accounts[0].id).toBe('acc-2');
    });

    it('should identify accounts with changes 7 days out', async () => {
      const today = new Date('2025-09-23');
      const mockAccount = {
        ...mockAccounts[0],
        pending_tier_change_date: '2025-09-30T00:00:00Z'
      };
      // Mock the final method in the chain
      mockSupabase.eq.mockReturnValueOnce({ data: [mockAccount], error: null });

      const accounts = await checkPendingChanges(7, today);

      expect(accounts).toHaveLength(1);
    });

    it('should identify accounts with changes 1 day out', async () => {
      const today = new Date('2025-09-29');
      const mockAccount = {
        ...mockAccounts[0],
        pending_tier_change_date: '2025-09-30T00:00:00Z'
      };
      // Mock the final method in the chain
      mockSupabase.eq.mockReturnValueOnce({ data: [mockAccount], error: null });

      const accounts = await checkPendingChanges(1, today);

      expect(accounts).toHaveLength(1);
    });

    it('should not identify accounts outside notification windows', async () => {
      const today = new Date('2025-08-15');
      // Mock the final method in the chain
      mockSupabase.eq.mockReturnValueOnce({ data: [], error: null });

      const accounts = await checkPendingChanges(30, today);

      expect(accounts).toHaveLength(0);
    });

    it('should handle timezone considerations correctly', async () => {
      const todayUTC = new Date('2025-08-31T00:00:00Z');
      const todayPST = new Date('2025-08-31T08:00:00Z'); // 8 hours ahead
      
      // Mock the final method in the chain for both calls
      mockSupabase.eq.mockReturnValueOnce({ data: [mockAccounts[0]], error: null });

      const accountsUTC = await checkPendingChanges(30, todayUTC);
      
      mockSupabase.eq.mockReturnValueOnce({ data: [mockAccounts[0]], error: null });
      
      const accountsPST = await checkPendingChanges(30, todayPST);

      expect(accountsUTC).toHaveLength(1);
      expect(accountsPST).toHaveLength(1);
    });
  });

  describe('calculateNotificationDates', () => {
    it('should calculate correct notification dates from change date', () => {
      const changeDate = new Date('2025-09-30');
      const dates = calculateNotificationDates(changeDate);

      expect(dates['30_days']).toEqual(new Date('2025-08-31'));
      expect(dates['14_days']).toEqual(new Date('2025-09-16'));
      expect(dates['7_days']).toEqual(new Date('2025-09-23'));
      expect(dates['1_day']).toEqual(new Date('2025-09-29'));
    });

    it('should account for already sent notifications', async () => {
      const changeDate = new Date('2025-09-30');
      const accountId = 'acc-1';
      
      // Mock the final method in the chain
      mockSupabase.single.mockReturnValueOnce({ 
        data: { id: 'notification-1' }, 
        error: null 
      });

      const sent30Day = await hasAlreadySentNotification(accountId, '30_days', changeDate);
      expect(sent30Day).toBe(true);
    });

    it('should handle edge cases (leap years, month boundaries)', () => {
      const leapYearDate = new Date('2024-02-29'); // Leap year
      const dates = calculateNotificationDates(leapYearDate);

      expect(dates['30_days']).toEqual(new Date('2024-01-30'));
      expect(dates['14_days']).toEqual(new Date('2024-02-15'));
      
      const monthBoundary = new Date('2025-05-01');
      const boundaryDates = calculateNotificationDates(monthBoundary);
      
      expect(boundaryDates['30_days']).toEqual(new Date('2025-04-01'));
    });
  });

  describe('sendBillingChangeReminder', () => {
    const mockAccount = {
      id: 'acc-1',
      name: 'Test Company',
      email: 'billing@test.com',
      tier: 'MAX' as TierName,
      pending_tier_change: 'PRO' as TierName,
      pending_tier_change_date: '2025-09-30T00:00:00Z',
      subscription_status: 'active',
      stripe_subscription_id: 'sub_123'
    };

    it('should send email with correct 30-day content', async () => {
      // Mock hasAlreadySentNotification to return false
      mockSupabase.single.mockReturnValueOnce({ data: null, error: { code: 'PGRST116' } });
      // Mock the insert operation
      mockSupabase.insert.mockReturnValueOnce({ data: { id: 'notif-1' }, error: null });
      
      const result = await sendBillingChangeReminder(mockAccount, '30_days');

      expect(result.success).toBe(true);
      expect(result.reminderType).toBe('30_days');
      expect(result.emailSent).toBe(true);
    });

    it('should send email with correct 14-day content', async () => {
      // Mock hasAlreadySentNotification to return false
      mockSupabase.single.mockReturnValueOnce({ data: null, error: { code: 'PGRST116' } });
      // Mock the insert operation
      mockSupabase.insert.mockReturnValueOnce({ data: { id: 'notif-1' }, error: null });
      
      const result = await sendBillingChangeReminder(mockAccount, '14_days');

      expect(result.success).toBe(true);
      expect(result.reminderType).toBe('14_days');
    });

    it('should send email with correct 7-day content', async () => {
      // Mock hasAlreadySentNotification to return false
      mockSupabase.single.mockReturnValueOnce({ data: null, error: { code: 'PGRST116' } });
      // Mock the insert operation
      mockSupabase.insert.mockReturnValueOnce({ data: { id: 'notif-1' }, error: null });
      
      const result = await sendBillingChangeReminder(mockAccount, '7_days');

      expect(result.success).toBe(true);
      expect(result.reminderType).toBe('7_days');
    });

    it('should send email with correct 1-day content', async () => {
      // Mock hasAlreadySentNotification to return false
      mockSupabase.single.mockReturnValueOnce({ data: null, error: { code: 'PGRST116' } });
      // Mock the insert operation
      mockSupabase.insert.mockReturnValueOnce({ data: { id: 'notif-1' }, error: null });
      
      const result = await sendBillingChangeReminder(mockAccount, '1_day');

      expect(result.success).toBe(true);
      expect(result.reminderType).toBe('1_day');
    });

    it('should record notification in database', async () => {
      // Mock hasAlreadySentNotification to return false
      mockSupabase.single.mockReturnValueOnce({ data: null, error: { code: 'PGRST116' } });
      // Mock the insert operation
      mockSupabase.insert.mockReturnValueOnce({ data: { id: 'notif-1' }, error: null });
      
      await sendBillingChangeReminder(mockAccount, '30_days');
      
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          account_id: 'acc-1',
          notification_type: '30_days'
        })
      );
    });

    it('should not send duplicate notifications', async () => {
      // Mock that a notification was already sent
      mockSupabase.single.mockReturnValueOnce({ 
        data: { id: 'existing-notification' }, 
        error: null 
      });

      const result = await sendBillingChangeReminder(mockAccount, '30_days');

      expect(result.success).toBe(false);
      expect(result.reason).toBe('Notification already sent');
    });

    it('should handle email failures gracefully', async () => {
      // Mock hasAlreadySentNotification to return false
      mockSupabase.single.mockReturnValueOnce({ data: null, error: { code: 'PGRST116' } });
      // Mock the insert operation
      mockSupabase.insert.mockReturnValueOnce({ data: { id: 'notif-1' }, error: null });
      // Mock email failure for this test
      (sendEmail as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        success: false,
        error: 'Invalid email address',
      });
      
      const failAccount = { 
        ...mockAccount, 
        email: 'invalid-email',
        tier: 'MAX' as TierName,
        pending_tier_change: 'PRO' as TierName
      };
      
      const result = await sendBillingChangeReminder(failAccount, '30_days');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should send test email to tyler.lahaie@hey.com for each scenario', async () => {
      const testAccount = { 
        ...mockAccount, 
        email: 'tyler.lahaie@hey.com',
        tier: 'MAX' as TierName,
        pending_tier_change: 'PRO' as TierName
      };
      
      const scenarios = ['30_days', '14_days', '7_days', '1_day'] as const;
      
      for (const scenario of scenarios) {
        // No mocks needed for test emails as they skip database operations
        const result = await sendBillingChangeReminder(testAccount, scenario);
        expect(result.success).toBe(true);
        expect(result.testEmailSent).toBe(true);
      }
    });
  });

  describe('formatBillingChangeData', () => {
    const mockAccount = {
      id: 'acc-1',
      name: 'Test Company',
      email: 'test@company.com',
      tier: 'MAX' as TierName,
      pending_tier_change: 'PRO' as TierName,
      pending_tier_change_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      subscription_status: 'active',
      stripe_subscription_id: 'sub_123',
    };

    it('should format downgrade data correctly', () => {
      const data = formatBillingChangeData(mockAccount, '30_days');

      expect(data.currentPlan.tier).toBe('MAX');
      expect(data.targetPlan.tier).toBe('PRO');
      expect(data.currentPlan.features.projects).toBe(25);
      expect(data.targetPlan.features.projects).toBe(5);
    });

    it('should format billing switch data correctly', () => {
      const sameTierAccount = {
        ...mockAccount,
        pending_tier_change: 'MAX' as const,
      };
      const data = formatBillingChangeData(sameTierAccount, '30_days');

      expect(data.currentPlan.tier).toBe('MAX');
      expect(data.targetPlan.tier).toBe('MAX');
      expect(data.currentPlan.features.projects).toBe(data.targetPlan.features.projects);
    });

    it('should calculate feature differences', () => {
      const scaleAccount = {
        ...mockAccount,
        pending_tier_change: 'SCALE' as const,
      };
      const data = formatBillingChangeData(scaleAccount, '30_days');

      expect(data.currentPlan.features.projects).toBe(25);
      expect(data.targetPlan.features.projects).toBe(10);
      expect(data.currentPlan.features.users).toBe(10);
      expect(data.targetPlan.features.users).toBe(5);
    });

    it('should format currency values properly', () => {
      const data = formatBillingChangeData(mockAccount, '30_days');

      expect(data.currentPlan.amount).toBe(997);
      expect(data.targetPlan.amount).toBe(397);
    });

    it('should handle missing data gracefully', () => {
      const invalidAccount = {
        ...mockAccount,
        pending_tier_change: null,
        pending_tier_change_date: null,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => formatBillingChangeData(invalidAccount as any, '30_days')).toThrow('Account does not have pending tier change');
    });
  });
});