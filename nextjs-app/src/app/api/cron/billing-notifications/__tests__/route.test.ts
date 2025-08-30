import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../route';
import { checkPendingChanges, sendBillingChangeReminder } from '@/lib/services/billing-notifications';

vi.mock('@/lib/services/billing-notifications');
vi.mock('@/lib/supabase/service');

describe('Billing Notifications Cron Job', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = 'test-secret';
  });

  const mockAccounts = [
    {
      id: 'acc-1',
      name: 'Company A',
      email: 'billing@companya.com',
      tier: 'MAX',
      pending_tier_change: 'PRO',
      pending_tier_change_date: '2025-09-30T00:00:00Z'
    },
    {
      id: 'acc-2',
      name: 'Company B',
      email: 'billing@companyb.com',
      tier: 'SCALE',
      pending_tier_change: 'PRO',
      pending_tier_change_date: '2025-09-14T00:00:00Z'
    },
    {
      id: 'acc-3',
      name: 'Company C',
      email: 'billing@companyc.com',
      tier: 'PRO',
      pending_tier_change: 'SCALE',
      pending_tier_change_date: '2025-09-07T00:00:00Z'
    }
  ];

  describe('Processing Accounts', () => {
    it('should process all accounts with pending changes', async () => {
      const mockRequest = new NextRequest('http://localhost/api/cron/billing-notifications', {
        headers: {
          'x-cron-secret': 'test-secret'
        }
      });

      (checkPendingChanges as any).mockResolvedValueOnce([mockAccounts[0]]) // 30 days
        .mockResolvedValueOnce([mockAccounts[1]]) // 14 days
        .mockResolvedValueOnce([mockAccounts[2]]) // 7 days
        .mockResolvedValueOnce([]); // 1 day

      (sendBillingChangeReminder as any).mockResolvedValue({ success: true });

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.processed).toBe(3);
      expect(checkPendingChanges).toHaveBeenCalledTimes(4);
    });

    it('should send appropriate notifications based on days remaining', async () => {
      const mockRequest = new NextRequest('http://localhost/api/cron/billing-notifications', {
        headers: {
          'x-cron-secret': 'test-secret'
        }
      });

      (checkPendingChanges as any)
        .mockResolvedValueOnce([mockAccounts[0]]) // 30 days
        .mockResolvedValueOnce([]) // 14 days
        .mockResolvedValueOnce([]) // 7 days
        .mockResolvedValueOnce([]); // 1 day

      (sendBillingChangeReminder as any).mockResolvedValue({ success: true });

      await GET(mockRequest);

      expect(sendBillingChangeReminder).toHaveBeenCalledWith(mockAccounts[0], '30_days');
      expect(sendBillingChangeReminder).toHaveBeenCalledTimes(1);
    });

    it('should skip already notified accounts', async () => {
      const mockRequest = new NextRequest('http://localhost/api/cron/billing-notifications', {
        headers: {
          'x-cron-secret': 'test-secret'
        }
      });

      (checkPendingChanges as any).mockResolvedValueOnce([mockAccounts[0]])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      (sendBillingChangeReminder as any).mockResolvedValue({ 
        success: false, 
        reason: 'Notification already sent' 
      });

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.skipped).toBe(1);
      expect(data.sent).toBe(0);
    });

    it('should handle errors without stopping other notifications', async () => {
      const mockRequest = new NextRequest('http://localhost/api/cron/billing-notifications', {
        headers: {
          'x-cron-secret': 'test-secret'
        }
      });

      (checkPendingChanges as any).mockResolvedValueOnce([mockAccounts[0], mockAccounts[1]])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      (sendBillingChangeReminder as any)
        .mockRejectedValueOnce(new Error('Email service down'))
        .mockResolvedValueOnce({ success: true });

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.errors).toBe(1);
      expect(data.sent).toBe(1);
    });

    it('should return summary of notifications sent', async () => {
      const mockRequest = new NextRequest('http://localhost/api/cron/billing-notifications', {
        headers: {
          'x-cron-secret': 'test-secret'
        }
      });

      (checkPendingChanges as any)
        .mockResolvedValueOnce([mockAccounts[0], mockAccounts[1]])
        .mockResolvedValueOnce([mockAccounts[2]])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      (sendBillingChangeReminder as any).mockResolvedValue({ success: true });

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data).toEqual({
        success: true,
        processed: 3,
        sent: 3,
        skipped: 0,
        errors: 0,
        details: {
          '30_days': 2,
          '14_days': 1,
          '7_days': 0,
          '1_day': 0
        }
      });
    });

    it('should respect rate limits', async () => {
      const mockRequest = new NextRequest('http://localhost/api/cron/billing-notifications', {
        headers: {
          'x-cron-secret': 'test-secret'
        }
      });

      // Create 50 mock accounts
      const manyAccounts = Array.from({ length: 50 }, (_, i) => ({
        ...mockAccounts[0],
        id: `acc-${i}`,
        email: `billing${i}@company.com`
      }));

      (checkPendingChanges as any).mockResolvedValueOnce(manyAccounts)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      (sendBillingChangeReminder as any).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );

      const startTime = Date.now();
      const response = await GET(mockRequest);
      const endTime = Date.now();
      const data = await response.json();

      // Should have rate limiting (e.g., batch processing)
      expect(data.processed).toBe(50);
      expect(endTime - startTime).toBeGreaterThan(1000); // At least 1 second for rate limiting
    });

    it('should send test summary to doyixo9427@besaies.com', async () => {
      const mockRequest = new NextRequest('http://localhost/api/cron/billing-notifications?test=true', {
        headers: {
          'x-cron-secret': 'test-secret'
        }
      });

      (checkPendingChanges as any).mockResolvedValueOnce([mockAccounts[0]])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      (sendBillingChangeReminder as any).mockResolvedValue({ success: true });

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.testEmailSent).toBe(true);
      expect(data.testEmailRecipient).toBe('doyixo9427@besaies.com');
    });
  });

  describe('Security', () => {
    it('should reject requests without proper authentication', async () => {
      const mockRequest = new NextRequest('http://localhost/api/cron/billing-notifications');

      const response = await GET(mockRequest);

      expect(response.status).toBe(401);
    });

    it('should reject requests with invalid secret', async () => {
      const mockRequest = new NextRequest('http://localhost/api/cron/billing-notifications', {
        headers: {
          'x-cron-secret': 'wrong-secret'
        }
      });

      const response = await GET(mockRequest);

      expect(response.status).toBe(401);
    });
  });
});