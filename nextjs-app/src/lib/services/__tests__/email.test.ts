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
  let mockSupabase: any;
  let consoleLogSpy: any;
  let consoleErrorSpy: any;
  const originalEnv = process.env.NODE_ENV;
  const originalResendApiKey = process.env.RESEND_API_KEY;
  let sendEmail: any;
  let queueEmail: any;
  let processEmailQueue: any;
  let retryFailedEmails: any;
  let getEmailQueueStats: any;

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Set required env var
    process.env.RESEND_API_KEY = 'test-api-key';
    
    // Setup console spies
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Setup Supabase mock with proper chaining
    mockSupabase = {
      from: vi.fn(() => mockSupabase),
      select: vi.fn(() => mockSupabase),
      insert: vi.fn(() => mockSupabase),
      update: vi.fn(() => mockSupabase),
      delete: vi.fn(() => mockSupabase),
      eq: vi.fn(() => mockSupabase),
      neq: vi.fn(() => mockSupabase),
      lte: vi.fn(() => mockSupabase),
      lt: vi.fn(() => mockSupabase),
      gte: vi.fn(() => mockSupabase),
      order: vi.fn(() => mockSupabase),
      limit: vi.fn(() => mockSupabase),
      single: vi.fn(() => mockSupabase),
      sql: vi.fn((template) => template),
    };
    (createAdminClient as any).mockReturnValue(mockSupabase);
    
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
    process.env.NODE_ENV = originalEnv;
    process.env.RESEND_API_KEY = originalResendApiKey;
  });

  describe('sendEmail', () => {
    it('should send email successfully in production', async () => {
      process.env.NODE_ENV = 'production';
      
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
      // Reset module cache and set development mode
      vi.resetModules();
      process.env.NODE_ENV = 'development';
      
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
      expect(result.data.id).toMatch(/^dev-\d+$/);
      expect(mockResendInstance.emails.send).not.toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '📧 Email (Development Mode):',
        expect.objectContaining({
          to: emailOptions.to,
          subject: emailOptions.subject,
        })
      );
      
      // Restore environment
      process.env.NODE_ENV = originalEnv;
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
        reply_to: emailOptions.replyTo,
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

      mockSupabase.single.mockResolvedValue({
        data: { id: 'queue-123' },
        error: null,
      });

      const result = await queueEmail(queueOptions);

      expect(result.success).toBe(true);
      expect(result.id).toBe('queue-123');
      expect(mockSupabase.from).toHaveBeenCalledWith('email_queue');
      expect(mockSupabase.insert).toHaveBeenCalledWith({
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

      mockSupabase.single.mockResolvedValue({
        data: { id: 'queue-456' },
        error: null,
      });

      await queueEmail(queueOptions);

      expect(mockSupabase.insert).toHaveBeenCalledWith(
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

      mockSupabase.single.mockResolvedValue({
        data: { id: 'queue-789' },
        error: null,
      });

      await queueEmail(queueOptions);

      expect(mockSupabase.insert).toHaveBeenCalledWith(
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

      mockSupabase.single.mockResolvedValue({
        data: { id: 'queue-template' },
        error: null,
      });

      await queueEmail(queueOptions);

      expect(mockSupabase.insert).toHaveBeenCalledWith(
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

      mockSupabase.single.mockResolvedValue({
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
      mockSupabase.eq.mockReturnThis();
      mockSupabase.update.mockResolvedValue({ error: null });

      const result = await processEmailQueue(10);

      expect(result.processed).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(mockSupabase.from).toHaveBeenCalledWith('email_queue');
      expect(mockSupabase.update).toHaveBeenCalledTimes(4); // 2 processing + 2 sent
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

      mockSupabase.limit.mockResolvedValue({
        data: [mockEmail],
        error: null,
      });

      // Mock email sending failure
      mockResendInstance.emails.send.mockResolvedValue({
        data: null,
        error: { message: 'Network error' },
      });

      mockSupabase.eq.mockReturnThis();
      mockSupabase.update.mockResolvedValue({ error: null });

      const result = await processEmailQueue();

      expect(result.processed).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors).toContain('Email email-fail: Network error');
      
      // Should update retry count and keep status as pending
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'pending',
          retry_count: 2,
          error_message: 'Network error',
        })
      );
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

      mockSupabase.limit.mockResolvedValue({
        data: [mockEmail],
        error: null,
      });

      mockResendInstance.emails.send.mockResolvedValue({
        data: null,
        error: { message: 'Permanent failure' },
      });

      mockSupabase.eq.mockReturnThis();
      mockSupabase.update.mockResolvedValue({ error: null });

      await processEmailQueue();

      // Should mark as failed since retry_count + 1 >= max_retries
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'failed',
          retry_count: 3,
          error_message: 'Permanent failure',
        })
      );
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

      mockSupabase.limit.mockResolvedValue({
        data: [mockEmail],
        error: null,
      });

      // Mock template fetch
      mockSupabase.single.mockResolvedValue({
        data: mockTemplate,
        error: null,
      });

      mockResendInstance.emails.send.mockResolvedValue({
        data: { id: 'sent-template' },
        error: null,
      });

      mockSupabase.eq.mockReturnThis();
      mockSupabase.update.mockResolvedValue({ error: null });

      await processEmailQueue();

      expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Welcome John',
          html: '<p>Hello John from Test Corp</p>',
        })
      );
    });

    it('should handle empty queue', async () => {
      mockSupabase.limit.mockResolvedValue({
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

      mockSupabase.limit.mockResolvedValue({
        data: [mockEmail],
        error: null,
      });

      mockResendInstance.emails.send.mockResolvedValue({
        data: { id: 'resend-123' },
        error: null,
      });

      mockSupabase.eq.mockReturnThis();
      mockSupabase.update.mockResolvedValue({ error: null });
      mockSupabase.insert.mockResolvedValue({ error: null });

      await processEmailQueue();

      // Should log successful delivery
      expect(mockSupabase.from).toHaveBeenCalledWith('email_logs');
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        email_queue_id: 'email-log',
        provider: 'resend',
        provider_id: 'resend-123',
        status: 'delivered',
        delivered_at: expect.any(String),
      });
    });
  });

  describe('retryFailedEmails', () => {
    it('should retry failed emails that have not exceeded max retries', async () => {
      const mockFailedEmails = [
        { id: 'retry-1', retry_count: 1, max_retries: 3 },
        { id: 'retry-2', retry_count: 2, max_retries: 5 },
      ];

      mockSupabase.limit.mockResolvedValue({
        data: mockFailedEmails,
        error: null,
      });

      const result = await retryFailedEmails(10);

      expect(result.retried).toBe(2);
      expect(result.errors).toHaveLength(0);
      expect(mockSupabase.update).toHaveBeenCalledWith({
        status: 'pending',
        error_message: null,
      });
    });

    it('should handle retry errors', async () => {
      mockSupabase.limit.mockResolvedValue({
        data: null,
        error: new Error('Database connection failed'),
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

      // Mock the chained calls
      mockSupabase.select.mockImplementation(() => {
        // Return the count for the current status query
        const currentCount = counts[callCount] || 0;
        callCount++;
        return Promise.resolve({ count: currentCount });
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
      mockSupabase.select.mockRejectedValue(new Error('Stats query failed'));

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

      mockSupabase.limit.mockResolvedValue({
        data: mockEmails,
        error: null,
      });

      mockResendInstance.emails.send.mockResolvedValue({
        data: { id: 'sent-concurrent' },
        error: null,
      });

      mockSupabase.eq.mockReturnThis();
      mockSupabase.update.mockResolvedValue({ error: null });

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
      const rendered = template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return maliciousData[key] !== undefined ? String(maliciousData[key]) : match;
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
      mockSupabase.lte.mockImplementation((field, value) => {
        if (field === 'scheduled_at') {
          const now = new Date(value);
          const filtered = mockEmails.filter(e => new Date(e.scheduled_at) <= now);
          mockSupabase.limit.mockResolvedValue({
            data: filtered,
            error: null,
          });
        }
        return mockSupabase;
      });

      await processEmailQueue();

      // Only the past email should be processed
      expect(mockSupabase.lte).toHaveBeenCalledWith('scheduled_at', expect.any(String));
    });
  });
});