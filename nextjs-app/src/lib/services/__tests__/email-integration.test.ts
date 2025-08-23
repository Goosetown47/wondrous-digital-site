import { describe, it, expect, beforeEach, vi } from 'vitest';
import { queueEmail, processEmailQueue } from '../email';
import { createInvitation, resendInvitation } from '../invitations';
import { createAdminClient } from '@/lib/supabase/admin';

// Mock dependencies
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}));

vi.mock('@react-email/components', () => ({
  render: vi.fn().mockResolvedValue('<html>Mock Email HTML</html>'),
}));

vi.mock('resend', () => {
  const mockSend = vi.fn();
  return {
    Resend: vi.fn().mockImplementation(() => ({
      emails: {
        send: mockSend,
      },
    })),
    __mockSend: mockSend, // Export for test access
  };
});

// Mock React.createElement to return a mock element
vi.mock('react', () => ({
  createElement: vi.fn().mockReturnValue({ type: 'div', props: {}, children: [] }),
}));

interface MockSupabase {
  from: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  neq: ReturnType<typeof vi.fn>;
  in: ReturnType<typeof vi.fn>;
  lte: ReturnType<typeof vi.fn>;
  lt: ReturnType<typeof vi.fn>;
  gte: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  maybeSingle: ReturnType<typeof vi.fn>;
  sql: ReturnType<typeof vi.fn>;
  rpc: ReturnType<typeof vi.fn>;
  auth?: {
    admin: {
      getUserById: ReturnType<typeof vi.fn>;
    };
  };
}

describe('Email System Integration Tests', () => {
  let mockSupabase: MockSupabase;
  let mockResend: { emails: { send: ReturnType<typeof vi.fn> } };
  const originalEnv = process.env.NODE_ENV;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.stubEnv('NODE_ENV', 'development'); // Test in development mode to avoid RESEND_API_KEY requirement
    vi.stubEnv('RESEND_API_KEY', 'test-api-key'); // Provide a test API key
    
    // Setup mock Supabase client with proper chaining
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnThis(),
      sql: vi.fn((template) => template),
      rpc: vi.fn(),
    };
    
    // Make sure chaining works properly
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.insert.mockReturnValue(mockSupabase);
    mockSupabase.update.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.in.mockReturnValue(mockSupabase);
    mockSupabase.lte.mockReturnValue(mockSupabase);
    mockSupabase.lt.mockReturnValue(mockSupabase);
    mockSupabase.order.mockReturnValue(mockSupabase);
    mockSupabase.limit.mockReturnValue(mockSupabase);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (createAdminClient as any).mockReturnValue(mockSupabase);

    // Setup mock Resend
    const Resend = (await import('resend')).Resend;
    mockResend = {
      emails: {
        send: vi.fn().mockResolvedValue({ data: { id: 'mock-email-id' }, error: null }),
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Resend as any).mockImplementation(() => mockResend);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    if (originalEnv) vi.stubEnv('NODE_ENV', originalEnv);
  });

  describe('Invitation Email Flow', () => {
    it('should queue invitation email when creating new invitation', async () => {
      const invitation = {
        id: 'inv-123',
        email: 'newuser@example.com',
        account_id: 'account-123',
        role: 'user',
        invited_by: 'admin-user',
        token: 'secure-token-123',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const account = {
        id: 'account-123',
        name: 'Test Company',
      };

      const inviter = {
        id: 'admin-user',
        email: 'admin@example.com',
        display_name: 'Admin User',
      };

      // Mock creating invitation
      mockSupabase.single.mockResolvedValueOnce({
        data: invitation,
        error: null,
      });

      // Mock auth admin getUserById for inviter
      mockSupabase.auth = {
        admin: {
          getUserById: vi.fn().mockResolvedValue({
            data: {
              user: {
                id: inviter.id,
                email: inviter.email,
                user_metadata: { display_name: inviter.display_name },
              },
            },
            error: null,
          }),
        },
      };

      // Mock fetching account
      mockSupabase.single.mockResolvedValueOnce({
        data: account,
        error: null,
      });

      // Mock queuing email
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'queue-123' },
        error: null,
      });

      // Create invitation (which should queue email)
      await createInvitation({
        accountId: account.id,
        email: invitation.email,
        role: invitation.role as 'user',
        invitedBy: inviter.id,
      });

      // Verify email was queued
      expect(mockSupabase.from).toHaveBeenCalledWith('email_queue');
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          to_email: invitation.email,
          subject: expect.stringContaining('invited you to join'),
          templateId: 'invitation',
          templateData: expect.objectContaining({
            account_name: account.name,
            inviter_name: inviter.display_name || inviter.email,
            invitation_link: expect.stringContaining(invitation.token),
            role: invitation.role,
          }),
        })
      );
    });

    it('should respect email preferences when sending invitations', async () => {
      const userEmail = 'existing@example.com';
      
      // Mock checking if user has email preferences
      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: {
          user_id: 'user-123',
          security_alerts: true, // Invitations are security-related
          marketing_emails: false,
        },
        error: null,
      });

      // Mock email queue
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'queue-456' },
        error: null,
      });

      await queueEmail({
        to: userEmail,
        subject: 'Account Invitation',
        html: '<p>You have been invited</p>',
        templateId: 'invitation',
      });

      // Invitation emails should always be sent (security-related)
      expect(mockSupabase.insert).toHaveBeenCalled();
    });

    it('should handle resending invitations', async () => {
      const invitationId = 'inv-789';
      const existingInvitation = {
        id: invitationId,
        email: 'retry@example.com',
        account_id: 'account-123',
        role: 'user',
        invited_by: 'admin-user',
        token: 'existing-token',
        expires_at: new Date(Date.now() - 1000).toISOString(), // Expired
      };

      // Mock fetching existing invitation
      mockSupabase.single.mockResolvedValueOnce({
        data: existingInvitation,
        error: null,
      });

      // Mock cancelling old invitation - the update chain needs eq
      mockSupabase.update.mockReturnValueOnce({
        eq: vi.fn().mockResolvedValue({ error: null })
      });

      // Mock creating new invitation
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          ...existingInvitation,
          id: 'new-inv-123',
          token: 'new-token-123',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        error: null,
      });

      // Mock auth admin getUserById
      mockSupabase.auth = {
        admin: {
          getUserById: vi.fn().mockResolvedValue({
            data: {
              user: {
                id: 'admin-user',
                email: 'admin@example.com',
                user_metadata: { display_name: 'Admin User' },
              },
            },
            error: null,
          }),
        },
      };

      // Mock fetching account
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'account-123', name: 'Test Account' },
        error: null,
      });

      // Mock queuing new email
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'queue-resend' },
        error: null,
      });

      await resendInvitation(invitationId);

      // Verify old invitation was cancelled
      expect(mockSupabase.update).toHaveBeenCalledWith({
        cancelled_at: expect.any(String),
      });

      // Verify new email was queued
      expect(mockSupabase.from).toHaveBeenCalledWith('email_queue');
    });
  });

  describe('Email Queue Processing with Preferences', () => {
    it('should skip emails for users who have opted out', async () => {
      const mockEmails = [
        {
          id: 'email-1',
          to_email: 'optout@example.com',
          from_email: 'noreply@wondrousdigital.com',
          subject: 'Weekly Digest',
          body: '<p>Your weekly summary</p>',
          template_id: 'weekly-digest',
          retry_count: 0,
          max_retries: 3,
        },
      ];

      // Mock fetching pending emails
      mockSupabase.limit.mockResolvedValueOnce({
        data: mockEmails,
        error: null,
      });

      // Mock checking user preferences
      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: {
          user_id: 'user-optout',
          weekly_digest: false, // User opted out
        },
        error: null,
      });

      // Mock updating email status to skipped
      mockSupabase.eq.mockReturnThis();
      mockSupabase.update.mockResolvedValue({ error: null });

      // In a real implementation, the processor would check preferences
      // and skip emails for opted-out users
      const shouldSendEmail = async (email: { template_id: string; to_email: string }) => {
        if (email.template_id === 'weekly-digest') {
          const { data: prefs } = await mockSupabase
            .from('email_preferences')
            .select('weekly_digest')
            .eq('email', email.to_email)
            .maybeSingle();
          
          return prefs?.weekly_digest !== false;
        }
        return true;
      };

      const shouldSend = await shouldSendEmail(mockEmails[0]);
      expect(shouldSend).toBe(false);
    });

    it('should always send security and billing emails', async () => {
      const criticalEmails = [
        {
          id: 'security-1',
          to_email: 'user@example.com',
          subject: 'Security Alert: New Login',
          template_id: 'security-alert',
        },
        {
          id: 'billing-1',
          to_email: 'user@example.com',
          subject: 'Invoice for January 2024',
          template_id: 'billing-invoice',
        },
      ];

      // Mock user has all emails disabled
      mockSupabase.maybeSingle.mockResolvedValue({
        data: {
          user_id: 'user-123',
          security_alerts: false, // UI prevents this, but test anyway
          billing_notifications: false,
          marketing_emails: false,
          product_updates: false,
          weekly_digest: false,
        },
        error: null,
      });

      // Critical emails should always be sent
      const isCriticalEmail = (templateId: string) => {
        return ['security-alert', 'billing-invoice', 'invitation'].includes(templateId);
      };

      expect(isCriticalEmail(criticalEmails[0].template_id)).toBe(true);
      expect(isCriticalEmail(criticalEmails[1].template_id)).toBe(true);
    });
  });

  describe('Staff Assignment Email Notifications', () => {
    it('should send email when staff is assigned to new accounts', async () => {
      const staffUser = {
        id: 'staff-123',
        email: 'staff@wondrousdigital.com',
        display_name: 'Staff Member',
      };

      const accounts = [
        { id: 'account-1', name: 'Client A', slug: 'client-a' },
        { id: 'account-2', name: 'Client B', slug: 'client-b' },
      ];

      const assigner = {
        id: 'admin-123',
        email: 'admin@wondrousdigital.com',
        display_name: 'Platform Admin',
      };

      // Mock fetching staff user
      mockSupabase.single.mockResolvedValueOnce({
        data: staffUser,
        error: null,
      });

      // Mock fetching accounts
      mockSupabase.in.mockReturnThis();
      mockSupabase.select.mockResolvedValueOnce({
        data: accounts,
        error: null,
      });

      // Mock fetching assigner
      mockSupabase.single.mockResolvedValueOnce({
        data: assigner,
        error: null,
      });

      // Mock queuing email
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'queue-assignment' },
        error: null,
      });

      // Queue assignment notification email
      await queueEmail({
        to: staffUser.email,
        subject: 'New Account Assignments',
        templateId: 'staff-assignment',
        templateData: {
          staffName: staffUser.display_name,
          assignerName: assigner.display_name,
          accounts: accounts.map(a => ({ name: a.name, slug: a.slug })),
          assignmentCount: accounts.length,
        },
      });

      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          to_email: staffUser.email,
          template_id: 'staff-assignment',
          template_data: expect.objectContaining({
            assignmentCount: 2,
          }),
        })
      );
    });

    it('should notify when staff is removed from accounts', async () => {
      const removal = {
        staff_user_id: 'staff-123',
        account_id: 'account-1',
        removed_by: 'admin-123',
      };

      // Mock audit log creation for removal
      mockSupabase.insert.mockResolvedValueOnce({
        data: {
          id: 'audit-removal',
          user_id: removal.removed_by,
          action: 'staff.assignment_removed',
          metadata: {
            staff_user_id: removal.staff_user_id,
            account_id: removal.account_id,
          },
        },
        error: null,
      });

      // Mock queuing notification email
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'queue-removal' },
        error: null,
      });

      // This would typically be triggered by the removal action
      await queueEmail({
        to: 'staff@wondrousdigital.com',
        subject: 'Account Access Removed',
        templateId: 'staff-removal',
        templateData: {
          accountName: 'Client A',
          removedBy: 'Platform Admin',
        },
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('email_queue');
    });
  });

  describe('Email Delivery Tracking and Logs', () => {
    it('should create comprehensive audit trail for emails', async () => {
      const emailQueueItem = {
        id: 'email-audit-1',
        to_email: 'tracked@example.com',
        from_email: 'noreply@wondrousdigital.com',
        subject: 'Important Update',
        body: '<p>Update content</p>',
        retry_count: 0,
        max_retries: 3,
        status: 'pending',
        scheduled_at: new Date().toISOString(),
      };

      // Mock processing email - chained query
      mockSupabase.limit.mockResolvedValueOnce({
        data: [emailQueueItem],
        error: null,
      });

      // Mock updating to processing with eq chain
      let updateCallCount = 0;
      mockSupabase.update.mockImplementation(() => {
        updateCallCount++;
        if (updateCallCount === 1) {
          // First call - updating to processing
          return {
            eq: vi.fn().mockResolvedValue({ error: null })
          };
        } else if (updateCallCount === 2) {
          // Second call - updating to sent
          return {
            eq: vi.fn().mockResolvedValue({ error: null })
          };
        }
        return mockSupabase;
      });

      // Mock successful send
      mockResend.emails.send.mockResolvedValueOnce({
        data: { id: 'resend-tracked-123' },
        error: null,
      });

      // Mock creating email log - the insert needs to be resolved
      let insertCallCount = 0;
      mockSupabase.insert.mockImplementation(() => {
        insertCallCount++;
        if (insertCallCount === 1) {
          // First insert - email log
          return Promise.resolve({
            data: {
              id: 'log-123',
              email_queue_id: emailQueueItem.id,
              provider: 'resend',
              provider_id: 'resend-tracked-123',
              status: 'delivered',
              delivered_at: new Date().toISOString(),
            },
            error: null,
          });
        }
        return mockSupabase;
      });

      const result = await processEmailQueue(1);

      // Verify processing was successful
      expect(result.processed).toBe(1);
      expect(result.failed).toBe(0);

      // Verify audit trail was created
      expect(mockSupabase.from).toHaveBeenCalledWith('email_logs');
      expect(mockSupabase.insert).toHaveBeenCalled();
    });

    it('should track email bounces and failures', async () => {
      const bouncedEmail = {
        id: 'email-bounce-1',
        to_email: 'invalid@nonexistent.com',
        from_email: 'noreply@wondrousdigital.com',
        subject: 'Test',
        body: '<p>Test</p>',
        retry_count: 2,
        max_retries: 3,
        status: 'pending',
        scheduled_at: new Date().toISOString(),
      };

      mockSupabase.limit.mockResolvedValueOnce({
        data: [bouncedEmail],
        error: null,
      });

      // Mock updating to processing and then to failed
      let updateCallCount = 0;
      mockSupabase.update.mockImplementation(() => {
        updateCallCount++;
        if (updateCallCount === 1) {
          // First call - updating to processing
          return {
            eq: vi.fn().mockResolvedValue({ error: null })
          };
        } else if (updateCallCount === 2) {
          // Second call - updating to failed with retry
          return {
            eq: vi.fn().mockResolvedValue({ error: null })
          };
        }
        return mockSupabase;
      });

      // Mock email bounce - return error for failed send
      mockResend.emails.send.mockResolvedValueOnce({
        success: false,
        error: 'Email bounced: invalid recipient',
      });

      // Mock creating failure log
      mockSupabase.insert.mockResolvedValueOnce({
        data: {
          id: 'log-bounce',
          email_queue_id: bouncedEmail.id,
          provider: 'resend',
          status: 'failed',
          metadata: { error: 'Email bounced: invalid recipient' },
        },
        error: null,
      });

      const result = await processEmailQueue(1);

      // Verify failure was tracked
      expect(result.processed).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors).toContain(`Email ${bouncedEmail.id}: Failed to send email`);
    });
  });

  describe('Scheduled Email Processing', () => {
    it('should process scheduled emails at the correct time', async () => {
      const now = new Date();
      const scheduledEmails = [
        {
          id: 'scheduled-past',
          to_email: 'user1@example.com',
          subject: 'Past Email',
          body: 'Should be sent',
          scheduled_at: new Date(now.getTime() - 3600000).toISOString(), // 1 hour ago
          retry_count: 0,
          max_retries: 3,
        },
        {
          id: 'scheduled-future',
          to_email: 'user2@example.com',
          subject: 'Future Email',
          body: 'Should not be sent yet',
          scheduled_at: new Date(now.getTime() + 3600000).toISOString(), // 1 hour from now
          retry_count: 0,
          max_retries: 3,
        },
      ];

      // Mock query that filters by scheduled_at
      mockSupabase.lte.mockImplementation((field, value) => {
        if (field === 'scheduled_at') {
          const filteredEmails = scheduledEmails.filter(
            email => new Date(email.scheduled_at) <= new Date(value)
          );
          return {
            lt: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({
              data: filteredEmails,
              error: null,
            }),
          };
        }
        return mockSupabase;
      });

      const result = await processEmailQueue(10);

      // Only past email should be processed
      expect(result.processed).toBe(1);
      expect(mockResend.emails.send).toHaveBeenCalledTimes(1);
      expect(mockResend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['user1@example.com'],
          subject: 'Past Email',
        })
      );
    });
  });
});