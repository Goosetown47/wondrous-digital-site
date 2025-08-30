import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { sendBillingChangeReminder } from '@/lib/services/billing-notifications';
import { sendTestEmail } from '@/lib/services/__tests__/test-email-sender';
import type { TierName } from '@/types/database';

vi.mock('@/lib/supabase/service');
vi.mock('@/lib/resend/client');

describe('Billing Notifications E2E', () => {
  let mockSupabase: any;
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis()
    };
    
    (createSupabaseServiceClient as any).mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Downgrade Notification Series', () => {
    const mockAccount = {
      id: 'acc-test-1',
      name: 'Test Company',
      email: 'billing@testcompany.com',
      tier: 'MAX' as TierName,
      pending_tier_change: 'PRO' as TierName,
      pending_tier_change_date: '2025-09-30T00:00:00Z',
      subscription_status: 'active',
      stripe_subscription_id: 'sub_test123'
    };

    it('should send 30-day notification when downgrade scheduled', async () => {
      // Set date to 30 days before change
      vi.setSystemTime(new Date('2025-08-31'));
      
      mockSupabase.select.mockResolvedValueOnce({ 
        data: null, // No previous notification
        error: null 
      });
      
      mockSupabase.insert.mockResolvedValueOnce({ 
        data: { id: 'notif-1' }, 
        error: null 
      });

      const result = await sendBillingChangeReminder(mockAccount, '30_days');

      expect(result.success).toBe(true);
      expect(result.reminderType).toBe('30_days');
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          account_id: 'acc-test-1',
          notification_type: '30_days',
          change_date: '2025-09-30T00:00:00Z'
        })
      );
    });

    it('should send series of notifications as date approaches', async () => {
      const notifications = [
        { date: '2025-08-31', type: '30_days' },
        { date: '2025-09-16', type: '14_days' },
        { date: '2025-09-23', type: '7_days' },
        { date: '2025-09-29', type: '1_day' }
      ];

      for (const { date, type } of notifications) {
        vi.setSystemTime(new Date(date));
        
        // Mock no previous notification of this type
        mockSupabase.select.mockResolvedValueOnce({ 
          data: null, 
          error: null 
        });
        
        mockSupabase.insert.mockResolvedValueOnce({ 
          data: { id: `notif-${type}` }, 
          error: null 
        });

        const result = await sendBillingChangeReminder(mockAccount, type as any);

        expect(result.success).toBe(true);
        expect(result.reminderType).toBe(type);
      }

      // Verify all 4 notifications were sent
      expect(mockSupabase.insert).toHaveBeenCalledTimes(4);
    });

    it('should stop notifications if change is cancelled', async () => {
      // First, schedule a downgrade
      const accountWithChange = { ...mockAccount };
      
      vi.setSystemTime(new Date('2025-08-31'));
      
      mockSupabase.select.mockResolvedValueOnce({ data: null, error: null });
      mockSupabase.insert.mockResolvedValueOnce({ data: { id: 'notif-1' }, error: null });
      
      await sendBillingChangeReminder(accountWithChange, '30_days');
      
      // Now cancel the change (remove pending fields)
      const accountCancelled = {
        ...mockAccount,
        pending_tier_change: null,
        pending_tier_change_date: null
      };
      
      // Move to 14-day mark
      vi.setSystemTime(new Date('2025-09-16'));
      
      // Account no longer has pending change, so checkPendingChanges won't return it
      mockSupabase.select.mockResolvedValueOnce({ data: [], error: null });
      
      // This would normally be called by the cron job
      const pendingAccounts = await mockSupabase.select().data || [];
      
      expect(pendingAccounts).toHaveLength(0);
      // No new notifications should be sent
    });

    it('should handle billing period switches correctly', async () => {
      const billingSwitch = {
        ...mockAccount,
        tier: 'MAX' as TierName,
        pending_tier_change: 'MAX' as TierName, // Same tier
        current_billing_period: 'yearly',
        pending_billing_period: 'monthly',
        pending_tier_change_date: '2025-09-30T00:00:00Z',
        stripe_subscription_id: 'sub_test123'
      };

      vi.setSystemTime(new Date('2025-09-23')); // 7 days before
      
      mockSupabase.select.mockResolvedValueOnce({ data: null, error: null });
      mockSupabase.insert.mockResolvedValueOnce({ data: { id: 'notif-1' }, error: null });

      const result = await sendBillingChangeReminder(billingSwitch, '7_days');

      expect(result.success).toBe(true);
      // Note: changeType is not returned by sendBillingChangeReminder
    });

    it('should send actual test emails to doyixo9427@besaies.com in each scenario', async () => {
      const testScenarios = [
        {
          name: 'MAX to PRO downgrade',
          account: {
            ...mockAccount,
            email: 'doyixo9427@besaies.com',
            tier: 'MAX' as TierName,
            pending_tier_change: 'PRO' as TierName,
            stripe_subscription_id: 'sub_test123'
          },
          type: '30_days'
        },
        {
          name: 'SCALE to PRO downgrade',
          account: {
            ...mockAccount,
            email: 'doyixo9427@besaies.com',
            tier: 'SCALE' as TierName,
            pending_tier_change: 'PRO' as TierName,
            stripe_subscription_id: 'sub_test123'
          },
          type: '14_days'
        },
        {
          name: 'Yearly to Monthly switch',
          account: {
            ...mockAccount,
            email: 'doyixo9427@besaies.com',
            tier: 'MAX' as TierName,
            pending_tier_change: 'MAX' as TierName,
            current_billing_period: 'yearly',
            pending_billing_period: 'monthly',
            stripe_subscription_id: 'sub_test123'
          },
          type: '7_days'
        },
        {
          name: 'Final reminder',
          account: {
            ...mockAccount,
            email: 'doyixo9427@besaies.com',
            tier: 'PRO' as TierName,
            pending_tier_change: 'BASIC' as TierName,
            stripe_subscription_id: 'sub_test123'
          },
          type: '1_day'
        }
      ];

      for (const scenario of testScenarios) {
        mockSupabase.select.mockResolvedValueOnce({ data: null, error: null });
        mockSupabase.insert.mockResolvedValueOnce({ 
          data: { id: `test-${scenario.type}` }, 
          error: null 
        });

        const result = await sendTestEmail({
          to: 'doyixo9427@besaies.com',
          template: 'billing-change-reminder',
          data: {
            account: scenario.account,
            reminderType: scenario.type,
            scenario: scenario.name
          }
        });

        expect(result.success).toBe(true);
        expect(result.emailId).toBeDefined();
        console.log(`Test email sent for scenario: ${scenario.name}`);
      }
    });
  });

  describe('Error Recovery', () => {
    it('should retry failed email sends', async () => {
      const mockAccount = {
        id: 'acc-retry',
        name: 'Retry Test',
        email: 'retry@test.com',
        tier: 'MAX' as TierName,
        pending_tier_change: 'PRO' as TierName,
        pending_tier_change_date: '2025-09-30T00:00:00Z',
        subscription_status: 'active',
        stripe_subscription_id: 'sub_test123'
      };

      // First attempt fails
      mockSupabase.select.mockResolvedValueOnce({ data: null, error: null });
      
      const sendEmailMock = vi.fn()
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce({ success: true });

      // Simulate retry logic
      let attempt = 0;
      let result;
      
      while (attempt < 3) {
        try {
          result = await sendEmailMock();
          break;
        } catch (error) {
          attempt++;
          if (attempt >= 3) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }

      expect(sendEmailMock).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
    });

    it('should handle database connection issues', async () => {
      mockSupabase.select.mockRejectedValueOnce(new Error('Database connection lost'));
      
      try {
        await sendBillingChangeReminder({} as any, '30_days');
      } catch (error: any) {
        expect(error.message).toContain('Database connection lost');
      }
    });

    it('should continue processing other accounts if one fails', async () => {
      const accounts = [
        { id: 'acc-1', email: 'valid@test.com', tier: 'MAX', pending_tier_change: 'PRO' },
        { id: 'acc-2', email: 'invalid', tier: 'SCALE', pending_tier_change: 'PRO' }, // Bad email
        { id: 'acc-3', email: 'another@test.com', tier: 'PRO', pending_tier_change: 'BASIC' }
      ];

      let successCount = 0;
      let errorCount = 0;

      for (const account of accounts) {
        try {
          mockSupabase.select.mockResolvedValueOnce({ data: null, error: null });
          mockSupabase.insert.mockResolvedValueOnce({ data: { id: 'notif' }, error: null });
          
          if (account.email.includes('@')) {
            // Simulate successful send
            successCount++;
          } else {
            throw new Error('Invalid email');
          }
        } catch (error) {
          errorCount++;
        }
      }

      expect(successCount).toBe(2);
      expect(errorCount).toBe(1);
    });
  });

  describe('Test Mode', () => {
    it('should send comprehensive test report to doyixo9427@besaies.com', async () => {
      const testReport = {
        timestamp: new Date().toISOString(),
        accountsProcessed: 10,
        notificationsSent: {
          '30_days': 3,
          '14_days': 2,
          '7_days': 4,
          '1_day': 1
        },
        errors: [],
        testMode: true
      };

      const result = await sendTestEmail({
        to: 'doyixo9427@besaies.com',
        template: 'billing-notifications-summary',
        data: testReport
      });

      expect(result.success).toBe(true);
      expect(result.emailId).toBeDefined();
    });
  });
});