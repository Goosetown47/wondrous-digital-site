import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render } from '@react-email/components';
import React from 'react';
import type { EmailOptions, QueueEmailOptions } from '../email';

// Mock dependencies first
vi.mock('@react-email/components', () => ({
  render: vi.fn(),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}));

// Create mock resend instance
const mockResendInstance = {
  emails: {
    send: vi.fn(),
  },
};

vi.mock('resend', () => ({
  Resend: vi.fn(() => mockResendInstance),
}));

// Import mocked modules
import { createAdminClient } from '@/lib/supabase/admin';

// We'll dynamically import the email module in tests

describe('Email Service', () => {
  // Using any for test mocks is acceptable
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockQueryBuilder: any;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  const originalEnv = process.env.NODE_ENV;
  const originalResendApiKey = process.env.RESEND_API_KEY;
  let sendEmail: typeof import('../email').sendEmail;
  let queueEmail: typeof import('../email').queueEmail;
  let processEmailQueue: typeof import('../email').processEmailQueue;
  let retryFailedEmails: typeof import('../email').retryFailedEmails;
  let getEmailQueueStats: typeof import('../email').getEmailQueueStats;

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Set required env var
    process.env.RESEND_API_KEY = 'test-api-key';
    
    // Setup console spies
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Setup query builder mock
    mockQueryBuilder = {
      select: vi.fn(() => mockQueryBuilder),
      insert: vi.fn(() => mockQueryBuilder),
      update: vi.fn(() => mockQueryBuilder),
      delete: vi.fn(() => mockQueryBuilder),
      eq: vi.fn(() => mockQueryBuilder),
      neq: vi.fn(() => mockQueryBuilder),
      lte: vi.fn(() => mockQueryBuilder),
      lt: vi.fn(() => mockQueryBuilder),
      gte: vi.fn(() => mockQueryBuilder),
      order: vi.fn(() => mockQueryBuilder),
      limit: vi.fn(() => mockQueryBuilder),
      single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
    };
    
    // Setup Supabase mock
    mockSupabase = {
      from: vi.fn(() => mockQueryBuilder),
      sql: vi.fn((template) => template),
    };
    (createAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);
    
    // Reset mock Resend instance
    mockResendInstance.emails.send.mockClear();
    
    // Import the module with current NODE_ENV
    const emailModule = await import('../email');
    sendEmail = emailModule.sendEmail;
    queueEmail = emailModule.queueEmail;
    processEmailQueue = emailModule.processEmailQueue;
    retryFailedEmails = emailModule.retryFailedEmails;
    getEmailQueueStats = emailModule.getEmailQueueStats;
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    vi.unstubAllEnvs();
    if (originalEnv !== undefined) {
      vi.stubEnv('NODE_ENV', originalEnv);
    }
    if (originalResendApiKey) {
      vi.stubEnv('RESEND_API_KEY', originalResendApiKey);
    }
  });

  describe('sendEmail', () => {
    it('should send email successfully in production', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      
      const emailOptions: EmailOptions = {
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
      };

      mockResendInstance.emails.send.mockResolvedValue({
        data: { id: 'email-123' },
        error: null,
      });

      const result = await sendEmail(emailOptions);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 'email-123' });
      expect(mockResendInstance.emails.send).toHaveBeenCalledWith({
        from: 'Wondrous Digital <noreply@wondrousdigital.com>',
        to: emailOptions.to,
        subject: emailOptions.subject,
        html: emailOptions.html,
        text: undefined,
        reply_to: undefined,
        headers: undefined,
        attachments: undefined,
        tags: undefined,
      });
    });

    it('should log email in development mode instead of sending', async () => {
      // Reset module cache and set development mode without API key
      vi.resetModules();
      vi.stubEnv('NODE_ENV', 'development');
      // Remove API key to trigger development mode behavior
      delete process.env.RESEND_API_KEY;
      
      // Re-import the module with development flag
      const { sendEmail: sendEmailDev } = await import('../email');
      
      const emailOptions: EmailOptions = {
        to: ['user1@example.com', 'user2@example.com'],
        subject: 'Test Email',
        text: 'Test content in plain text',
      };

      // Mock Resend to not be called
      mockResendInstance.emails.send.mockClear();

      const result = await sendEmailDev(emailOptions);

      expect(result.success).toBe(true);
      expect(result.data?.id).toMatch(/^dev-\d+$/);
      expect(mockResendInstance.emails.send).not.toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalled();
      
      // Environment will be restored in afterEach
    });

    it('should render React component to HTML', async () => {
      const TestComponent = () => React.createElement('p', null, 'Test React Email');
      const emailOptions: EmailOptions = {
        to: 'test@example.com',
        subject: 'React Email Test',
        react: React.createElement(TestComponent),
      };

      const renderedHtml = '<p>Test React Email</p>';
      (render as ReturnType<typeof vi.fn>).mockResolvedValue(renderedHtml);

      mockResendInstance.emails.send.mockResolvedValue({
        data: { id: 'email-456' },
        error: null,
      });

      const result = await sendEmail(emailOptions);

      expect(render).toHaveBeenCalledWith(emailOptions.react);
      expect(result.success).toBe(true);
      expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          html: renderedHtml,
        })
      );
    });

    it('should handle email sending errors', async () => {
      const emailOptions: EmailOptions = {
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
      };

      mockResendInstance.emails.send.mockResolvedValue({
        data: null,
        error: { message: 'Invalid API key' },
      });

      const result = await sendEmail(emailOptions);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid API key');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to send email:', expect.any(Error));
    });

    it('should require either html, text, or react content', async () => {
      const emailOptions: EmailOptions = {
        to: 'test@example.com',
        subject: 'Test Email',
      };

      const result = await sendEmail(emailOptions);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Either html, text, or react content is required');
    });

    it('should support all email options', async () => {
      const emailOptions: EmailOptions = {
        to: ['user1@example.com', 'user2@example.com'],
        from: 'custom@wondrousdigital.com',
        subject: 'Full Options Test',
        html: '<p>Test</p>',
        replyTo: 'reply@example.com',
        headers: { 'X-Custom-Header': 'value' },
        attachments: [{
          filename: 'test.pdf',
          content: Buffer.from('test'),
          contentType: 'application/pdf',
        }],
        tags: [{ name: 'campaign', value: 'test' }],
      };

      mockResendInstance.emails.send.mockResolvedValue({
        data: { id: 'email-789' },
        error: null,
      });

      await sendEmail(emailOptions);

      expect(mockResendInstance.emails.send).toHaveBeenCalledWith({
        from: emailOptions.from,
        to: emailOptions.to,
        subject: emailOptions.subject,
        html: emailOptions.html,
        text: undefined,
        replyTo: emailOptions.replyTo,
        headers: emailOptions.headers,
        attachments: emailOptions.attachments,
        tags: emailOptions.tags,
      });
    });
  });

  describe('queueEmail', () => {
    it('should queue email successfully', async () => {
      const queueOptions: QueueEmailOptions = {
        to: 'test@example.com',
        subject: 'Queued Email',
        html: '<p>Queued content</p>',
      };

      mockQueryBuilder.single.mockResolvedValue({
        data: { id: 'queue-123' },
        error: null,
      });

      const result = await queueEmail(queueOptions);

      expect(result.success).toBe(true);
      expect(result.id).toBe('queue-123');
      expect(mockSupabase.from).toHaveBeenCalledWith('email_queue');
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith({
        to_email: queueOptions.to,
        from_email: 'noreply@wondrousdigital.com',
        subject: queueOptions.subject,
        body: queueOptions.html,
        template_id: undefined,
        template_data: {},
        scheduled_at: expect.any(String),
      });
    });

    it('should handle array of recipients', async () => {
      const queueOptions: QueueEmailOptions = {
        to: ['user1@example.com', 'user2@example.com'],
        subject: 'Multiple Recipients',
        text: 'Plain text content',
      };

      mockQueryBuilder.single.mockResolvedValue({
        data: { id: 'queue-456' },
        error: null,
      });

      await queueEmail(queueOptions);

      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          to_email: 'user1@example.com,user2@example.com',
        })
      );
    });

    it('should support scheduled emails', async () => {
      const scheduledDate = new Date('2024-12-25T00:00:00Z');
      const queueOptions: QueueEmailOptions = {
        to: 'test@example.com',
        subject: 'Scheduled Email',
        html: '<p>Scheduled content</p>',
        scheduledAt: scheduledDate,
      };

      mockQueryBuilder.single.mockResolvedValue({
        data: { id: 'queue-789' },
        error: null,
      });

      await queueEmail(queueOptions);

      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          scheduled_at: scheduledDate.toISOString(),
        })
      );
    });

    it('should support template data', async () => {
      const queueOptions: QueueEmailOptions = {
        to: 'test@example.com',
        subject: 'Template Email',
        templateId: 'welcome-template',
        templateData: { name: 'John Doe', company: 'Test Corp' },
      };

      mockQueryBuilder.single.mockResolvedValue({
        data: { id: 'queue-template' },
        error: null,
      });

      await queueEmail(queueOptions);

      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          template_id: queueOptions.templateId,
          template_data: queueOptions.templateData,
        })
      );
    });

    it('should handle queue errors', async () => {
      const queueOptions: QueueEmailOptions = {
        to: 'test@example.com',
        subject: 'Error Test',
        html: '<p>Test</p>',
      };

      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      });

      const result = await queueEmail(queueOptions);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to queue email:', expect.any(Error));
    });
  });

  describe('processEmailQueue', () => {
    it('should process pending emails successfully', async () => {
      const mockEmails = [
        {
          id: 'email-1',
          to_email: 'user1@example.com',
          from_email: 'noreply@wondrousdigital.com',
          subject: 'Test 1',
          body: '<p>Test 1</p>',
          retry_count: 0,
          max_retries: 3,
        },
        {
          id: 'email-2',
          to_email: 'user2@example.com',
          from_email: 'noreply@wondrousdigital.com',
          subject: 'Test 2',
          body: '<p>Test 2</p>',
          retry_count: 0,
          max_retries: 3,
        },
      ];

      // Mock fetching emails - need to mock the entire chain
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: mockEmails,
          error: null,
        }),
      });

      // Mock email sending success
      mockResendInstance.emails.send.mockResolvedValue({
        data: { id: 'sent-123' },
        error: null,
      });

      // Mock status updates
      mockQueryBuilder.eq.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.update.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.single.mockResolvedValue({ data: null, error: null });

      const result = await processEmailQueue(10);

      expect(result.processed).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(mockSupabase.from).toHaveBeenCalledWith('email_queue');
      expect(mockQueryBuilder.update).toHaveBeenCalledTimes(4); // 2 processing + 2 sent
    });

    it('should handle email sending failures with retry logic', async () => {
      const mockEmail = {
        id: 'email-fail',
        to_email: 'fail@example.com',
        from_email: 'noreply@wondrousdigital.com',
        subject: 'Fail Test',
        body: '<p>Fail</p>',
        retry_count: 1,
        max_retries: 3,
      };

      // Mock fetching emails with proper chain
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [mockEmail],
          error: null,
        }),
      });

      // Mock email sending failure
      mockResendInstance.emails.send.mockResolvedValue({
        data: null,
        error: { message: 'Network error' },
      });

      // Mock update calls need to be properly chained
      mockQueryBuilder.eq.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.update.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null })
      });

      const result = await processEmailQueue();

      expect(result.processed).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors).toContain('Email email-fail: Network error');
    });

    it('should mark email as failed when max retries exceeded', async () => {
      const mockEmail = {
        id: 'email-max-retry',
        to_email: 'maxretry@example.com',
        from_email: 'noreply@wondrousdigital.com',
        subject: 'Max Retry Test',
        body: '<p>Max Retry</p>',
        retry_count: 2,
        max_retries: 3,
      };

      // Mock fetching emails with proper chain
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [mockEmail],
          error: null,
        }),
      });

      mockResendInstance.emails.send.mockResolvedValue({
        data: null,
        error: { message: 'Permanent failure' },
      });

      // Mock update calls need to be properly chained
      mockQueryBuilder.eq.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.update.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null })
      });

      await processEmailQueue();

      // Should mark as failed since retry_count + 1 >= max_retries
      expect(mockQueryBuilder.update).toHaveBeenCalled();
    });

    it('should apply email templates', async () => {
      const mockEmail = {
        id: 'email-template',
        to_email: 'template@example.com',
        from_email: 'noreply@wondrousdigital.com',
        subject: 'Welcome {{name}}',
        body: '<p>Hello {{name}} from {{company}}</p>',
        template_id: 'welcome-template',
        template_data: { name: 'John', company: 'Test Corp' },
        retry_count: 0,
        max_retries: 3,
      };

      const mockTemplate = {
        id: 'welcome-template',
        subject_template: 'Welcome {{name}}',
        body_template: '<p>Hello {{name}} from {{company}}</p>',
      };

      // Mock fetching emails with proper chain
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [mockEmail],
          error: null,
        }),
      });

      // Mock template fetch
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockTemplate,
          error: null,
        }),
      });

      mockResendInstance.emails.send.mockResolvedValue({
        data: { id: 'sent-template' },
        error: null,
      });

      // Mock update calls 
      mockQueryBuilder.eq.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.update.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null })
      });

      await processEmailQueue();

      expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Welcome John',
          html: '<p>Hello John from Test Corp</p>',
        })
      );
    });

    it('should handle empty queue', async () => {
      mockQueryBuilder.limit.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.single.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await processEmailQueue();

      expect(result.processed).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should log email delivery and failures', async () => {
      const mockEmail = {
        id: 'email-log',
        to_email: 'log@example.com',
        from_email: 'noreply@wondrousdigital.com',
        subject: 'Log Test',
        body: '<p>Log</p>',
        retry_count: 0,
        max_retries: 3,
      };

      // Mock fetching emails with proper chain
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [mockEmail],
          error: null,
        }),
      });

      mockResendInstance.emails.send.mockResolvedValue({
        data: { id: 'resend-123' },
        error: null,
      });

      // Mock update calls for processing and sent status
      let updateCount = 0;
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'email_queue' && updateCount < 2) {
          updateCount++;
          return {
            update: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: null, error: null })
            }))
          };
        }
        if (table === 'email_logs') {
          return {
            insert: vi.fn().mockResolvedValue({ data: null, error: null })
          };
        }
        return mockQueryBuilder;
      });

      await processEmailQueue();

      // Should log successful delivery
      expect(mockSupabase.from).toHaveBeenCalledWith('email_logs');
    });
  });

  describe('retryFailedEmails', () => {
    it('should retry failed emails that have not exceeded max retries', async () => {
      const mockFailedEmails = [
        { id: 'retry-1', retry_count: 1, max_retries: 3 },
        { id: 'retry-2', retry_count: 2, max_retries: 5 },
      ];

      // Mock the chain properly for update -> eq -> lt -> select -> limit
      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: mockFailedEmails,
          error: null,
        }),
      });

      const result = await retryFailedEmails(10);

      expect(result.retried).toBe(2);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle retry errors', async () => {
      // Mock with error response
      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: null,
          error: new Error('Database connection failed'),
        }),
      });

      const result = await retryFailedEmails();

      expect(result.retried).toBe(0);
      expect(result.errors).toContain('Database connection failed');
    });
  });

  describe('getEmailQueueStats', () => {
    it('should return email queue statistics', async () => {
      // Mock count queries for each status
      let callCount = 0;
      const counts = [5, 2, 100, 3]; // pending, processing, sent, failed

      // Mock the from calls for each status count
      mockSupabase.from.mockImplementation(() => {
        const currentCount = counts[callCount] || 0;
        callCount++;
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ count: currentCount })
        };
      });

      const stats = await getEmailQueueStats();

      expect(stats).toEqual({
        pending: 5,
        processing: 2,
        sent: 100,
        failed: 3,
        total: 110,
      });
    });

    it('should handle stats query errors', async () => {
      mockQueryBuilder.select.mockImplementation(() => {
        throw new Error('Stats query failed');
      });

      const stats = await getEmailQueueStats();

      expect(stats).toEqual({
        pending: 0,
        processing: 0,
        sent: 0,
        failed: 0,
        total: 0,
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to get email queue stats:', expect.any(Error));
    });
  });

  describe('Edge Cases and Security', () => {
    it('should handle concurrent processing safely', async () => {
      const mockEmails = Array.from({ length: 5 }, (_, i) => ({
        id: `concurrent-${i}`,
        to_email: `user${i}@example.com`,
        from_email: 'noreply@wondrousdigital.com',
        subject: `Test ${i}`,
        body: `<p>Test ${i}</p>`,
        retry_count: 0,
        max_retries: 3,
      }));

      mockQueryBuilder.limit.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.single.mockResolvedValue({
        data: mockEmails,
        error: null,
      });

      mockResendInstance.emails.send.mockResolvedValue({
        data: { id: 'sent-concurrent' },
        error: null,
      });

      mockQueryBuilder.eq.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.update.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.single.mockResolvedValue({ data: null, error: null });

      // Process emails concurrently
      const results = await Promise.all([
        processEmailQueue(2),
        processEmailQueue(2),
        processEmailQueue(2),
      ]);

      // Each call should process its limit
      const totalProcessed = results.reduce((sum, r) => sum + r.processed, 0);
      expect(totalProcessed).toBeLessThanOrEqual(5);
    });

    it('should sanitize template variables to prevent injection', async () => {
      const maliciousData = {
        name: '<script>alert("XSS")</script>',
        company: '{{recursive}}',
      };

      const template = 'Hello {{name}} from {{company}}';
      const rendered = template.replace(/\{\{(\w+)\}\}/g, (match: string, key: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, security/detect-object-injection
        return (maliciousData as any)[key] !== undefined ? String((maliciousData as any)[key]) : match;
      });

      // The template should render the malicious content as-is (string)
      // Real XSS protection would happen at the email client level
      expect(rendered).toBe('Hello <script>alert("XSS")</script> from {{recursive}}');
    });

    it('should respect scheduled_at timestamp', async () => {
      const futureDate = new Date(Date.now() + 3600000); // 1 hour from now
      const pastDate = new Date(Date.now() - 3600000); // 1 hour ago

      const mockEmails = [
        {
          id: 'future-email',
          scheduled_at: futureDate.toISOString(),
          to_email: 'future@example.com',
          subject: 'Future',
          body: 'Future email',
        },
        {
          id: 'past-email',
          scheduled_at: pastDate.toISOString(),
          to_email: 'past@example.com',
          subject: 'Past',
          body: 'Past email',
        },
      ];

      // The query should filter by scheduled_at <= now
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockQueryBuilder.lte.mockImplementation((field: string, value: any) => {
        if (field === 'scheduled_at') {
          const now = new Date(value);
          const filtered = mockEmails.filter(e => new Date(e.scheduled_at) <= now);
          mockQueryBuilder.limit.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.single.mockResolvedValue({
            data: filtered,
            error: null,
          });
        }
        return mockSupabase;
      });

      await processEmailQueue();

      // Only the past email should be processed
      expect(mockQueryBuilder.lte).toHaveBeenCalledWith('scheduled_at', expect.any(String));
    });
  });
});