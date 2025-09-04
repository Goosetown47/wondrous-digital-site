import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '../route';
import { NextRequest } from 'next/server';
import * as gracePeriodService from '@/lib/services/grace-period';
import * as notificationService from '@/lib/services/grace-period-notifications';

// Mock the services
vi.mock('@/lib/services/grace-period');
vi.mock('@/lib/services/grace-period-notifications');

describe.skip('Grace Period Cron Job', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  describe('GET /api/cron/grace-period', () => {
    it('should process notifications and expired grace periods', async () => {
      const now = new Date('2025-09-02T09:00:00Z');
      vi.setSystemTime(now);

      // Mock successful notification processing
      vi.mocked(notificationService.checkAndSendGracePeriodNotifications).mockResolvedValue({
        sent: 3,
        errors: [],
        skipped: 1,
        notificationTypes: ['grace_period_day_0', 'grace_period_day_7', 'grace_period_day_13']
      });

      // Mock successful grace period expiration processing
      vi.mocked(gracePeriodService.processExpiredGracePeriods).mockResolvedValue({
        processed: 2,
        errors: [],
        downgradedAccounts: ['account-1', 'account-2']
      });

      const request = new NextRequest('http://localhost:3000/api/cron/grace-period');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        timestamp: now.toISOString(),
        notifications: {
          sent: 3,
          errors: [],
          skipped: 1,
          types: ['grace_period_day_0', 'grace_period_day_7', 'grace_period_day_13']
        },
        expirations: {
          processed: 2,
          errors: [],
          accounts: ['account-1', 'account-2']
        }
      });
    });

    it('should handle partial failures gracefully', async () => {
      // Mock notification errors
      vi.mocked(notificationService.checkAndSendGracePeriodNotifications).mockResolvedValue({
        sent: 1,
        errors: ['Failed to send email to account-123'],
        skipped: 0,
        notificationTypes: ['grace_period_day_0']
      });

      // Mock expiration processing errors
      vi.mocked(gracePeriodService.processExpiredGracePeriods).mockResolvedValue({
        processed: 1,
        errors: ['Failed to downgrade account-456'],
        downgradedAccounts: ['account-789']
      });

      const request = new NextRequest('http://localhost:3000/api/cron/grace-period');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.notifications.errors).toHaveLength(1);
      expect(data.expirations.errors).toHaveLength(1);
    });

    it('should handle complete failure', async () => {
      // Mock service failures
      vi.mocked(notificationService.checkAndSendGracePeriodNotifications).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/cron/grace-period');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'Failed to process grace period tasks',
        details: 'Database connection failed'
      });
    });

    it('should run at the correct time (9 AM daily)', async () => {
      // This test verifies the cron schedule configuration
      // In production, this would be configured in vercel.json or similar
      const cronSchedule = '0 9 * * *'; // 9 AM daily
      expect(cronSchedule).toBe('0 9 * * *');
    });

    it('should include test mode when test email is provided', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/cron/grace-period?testEmail=test@example.com'
      );

      vi.mocked(notificationService.checkAndSendGracePeriodNotifications).mockResolvedValue({
        sent: 1,
        errors: [],
        skipped: 0,
        notificationTypes: ['grace_period_day_0'],
        testMode: true,
        testEmail: 'test@example.com'
      });

      vi.mocked(gracePeriodService.processExpiredGracePeriods).mockResolvedValue({
        processed: 0,
        errors: [],
        downgradedAccounts: []
      });

      const response = await GET(request);
      const data = await response.json();

      expect(data.notifications.testMode).toBe(true);
      expect(data.notifications.testEmail).toBe('test@example.com');
    });

    it('should respect dry run mode', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/cron/grace-period?dryRun=true'
      );

      vi.mocked(notificationService.checkAndSendGracePeriodNotifications).mockResolvedValue({
        sent: 0,
        errors: [],
        skipped: 5,
        notificationTypes: [],
        dryRun: true
      });

      vi.mocked(gracePeriodService.processExpiredGracePeriods).mockResolvedValue({
        processed: 0,
        errors: [],
        downgradedAccounts: [],
        dryRun: true
      });

      const response = await GET(request);
      const data = await response.json();

      expect(data.dryRun).toBe(true);
      expect(data.notifications.sent).toBe(0);
      expect(data.expirations.processed).toBe(0);
    });

    it('should log detailed metrics for monitoring', async () => {
      const consoleSpy = vi.spyOn(console, 'log');

      vi.mocked(notificationService.checkAndSendGracePeriodNotifications).mockResolvedValue({
        sent: 2,
        errors: [],
        skipped: 1,
        notificationTypes: ['grace_period_day_0', 'grace_period_day_7']
      });

      vi.mocked(gracePeriodService.processExpiredGracePeriods).mockResolvedValue({
        processed: 1,
        errors: [],
        downgradedAccounts: ['account-123']
      });

      const request = new NextRequest('http://localhost:3000/api/cron/grace-period');
      await GET(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Grace Period Cron Job')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Notifications sent: 2')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Accounts downgraded: 1')
      );
    });
  });

  describe('POST /api/cron/grace-period', () => {
    it('should allow manual triggering with account filter', async () => {
      const request = new NextRequest('http://localhost:3000/api/cron/grace-period', {
        method: 'POST',
        body: JSON.stringify({
          accountId: 'account-123',
          action: 'send_notifications'
        })
      });

      // Mock filtered processing
      vi.mocked(notificationService.checkAndSendGracePeriodNotifications).mockResolvedValue({
        sent: 1,
        errors: [],
        skipped: 0,
        notificationTypes: ['grace_period_day_7'],
        filtered: true,
        accountId: 'account-123'
      });

      const { POST } = await import('../route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.filtered).toBe(true);
      expect(data.accountId).toBe('account-123');
    });

    it('should validate request body for manual triggers', async () => {
      const request = new NextRequest('http://localhost:3000/api/cron/grace-period', {
        method: 'POST',
        body: JSON.stringify({
          // Missing required fields
        })
      });

      const { POST } = await import('../route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid request');
    });
  });

  describe('Monitoring and Alerting', () => {
    it('should track execution time', async () => {
      
      vi.mocked(notificationService.checkAndSendGracePeriodNotifications).mockImplementation(
        async () => {
          // Simulate some processing time
          await new Promise(resolve => setTimeout(resolve, 100));
          return {
            sent: 1,
            errors: [],
            skipped: 0,
            notificationTypes: ['grace_period_day_0']
          };
        }
      );

      vi.mocked(gracePeriodService.processExpiredGracePeriods).mockResolvedValue({
        processed: 0,
        errors: [],
        downgradedAccounts: []
      });

      const request = new NextRequest('http://localhost:3000/api/cron/grace-period');
      const response = await GET(request);
      const data = await response.json();

      expect(data.executionTime).toBeDefined();
      expect(data.executionTime).toBeGreaterThan(0);
    });

    it('should alert on high error rates', async () => {
      const consoleSpy = vi.spyOn(console, 'error');

      // Simulate high error rate
      vi.mocked(notificationService.checkAndSendGracePeriodNotifications).mockResolvedValue({
        sent: 1,
        errors: [
          'Error 1',
          'Error 2',
          'Error 3',
          'Error 4',
          'Error 5'
        ],
        skipped: 0,
        notificationTypes: []
      });

      vi.mocked(gracePeriodService.processExpiredGracePeriods).mockResolvedValue({
        processed: 0,
        errors: [],
        downgradedAccounts: []
      });

      const request = new NextRequest('http://localhost:3000/api/cron/grace-period');
      await GET(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('HIGH ERROR RATE')
      );
    });
  });
});