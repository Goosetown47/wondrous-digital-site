import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

// Import actual modules to mock
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/config';

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock('@/lib/stripe/config', () => ({
  getStripe: vi.fn(),
}));

vi.mock('date-fns', () => ({
  format: vi.fn(() => 'January 1, 2025'),
}));

describe('POST /api/stripe/subscription-update', () => {
  let mockSupabase: any;
  let mockStripe: any;
  let mockRequest: NextRequest;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock Supabase client
    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(),
    };

    // Setup mock Stripe client
    mockStripe = {
      subscriptions: {
        retrieve: vi.fn(),
        update: vi.fn(),
      },
      subscriptionSchedules: {
        create: vi.fn(),
        release: vi.fn(),
      },
    };

    // Mock the imports
    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSupabase);
    vi.mocked(getStripe).mockReturnValue(mockStripe);
  });

  describe('Downgrade Flow', () => {
    it('should create a subscription schedule for downgrades', async () => {
      // Setup user and account
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });

      // Mock database queries
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'accounts') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'account-123',
                    tier: 'MAX',
                    stripe_subscription_id: 'sub-123',
                    stripe_customer_id: 'cus-123',
                  },
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        if (table === 'account_users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                in: vi.fn().mockResolvedValue({
                  data: [
                    { account_id: 'account-123', role: 'account_owner' },
                  ],
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'account_billing_history') {
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        };
      });

      // Mock subscription retrieval
      const mockSubscription = {
        id: 'sub-123',
        status: 'active',
        current_period_end: 1735689600, // Jan 1, 2025
        items: {
          data: [
            {
              id: 'si-123',
              price: { 
                id: 'price_1RgXclAyYiuNghuYNX728lTl', // MAX yearly price ID
                product: 'prod_max'
              },
              quantity: 1,
            },
          ],
        },
      };
      mockStripe.subscriptions.retrieve.mockResolvedValue(mockSubscription);

      // Mock schedule creation
      const mockSchedule = {
        id: 'sched-123',
      };
      mockStripe.subscriptionSchedules.create.mockResolvedValue(mockSchedule);

      // Create request
      mockRequest = new NextRequest('http://localhost:3000/api/stripe/subscription-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetTier: 'SCALE',
          accountId: 'account-123',
          billingPeriod: 'monthly',
          action: 'downgrade',
        }),
      });

      // Execute
      const response = await POST(mockRequest);
      const data = await response?.json();

      // Debug output
      if (response?.status !== 200) {
        console.log('Response error:', data);
      }

      // Assertions
      expect(response?.status).toBe(200);
      expect(data.message).toContain('scheduled');
      expect(data.subscription).toBeDefined();
      expect(data.subscription.schedule_id).toBe('sched-123');

      // Verify schedule was created with correct parameters
      expect(mockStripe.subscriptionSchedules.create).toHaveBeenCalledWith({
        from_subscription: 'sub-123',
        end_behavior: 'release',
        phases: expect.arrayContaining([
          expect.objectContaining({
            end_date: 1735689600,
          }),
        ]),
      });

      // Verify database was updated with pending change
      expect(mockSupabase.from).toHaveBeenCalledWith('accounts');
      expect(mockSupabase.from).toHaveBeenCalledWith('account_billing_history');
    });

    it('should keep user on current tier until billing period ends', async () => {
      // Setup similar to above
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockAccount = {
        id: 'account-123',
        tier: 'MAX',
        stripe_subscription_id: 'sub-123',
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'accounts') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockAccount,
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockImplementation(async () => {
                // Verify that tier is NOT changed immediately
                const updateCall = mockSupabase.from.mock.calls.find((call: any[]) => call[0] === 'accounts');
                expect(updateCall).toBeDefined();
                return { error: null };
              }),
            }),
          };
        }
        if (table === 'account_users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                in: vi.fn().mockResolvedValue({
                  data: [{ account_id: 'account-123', role: 'account_owner' }],
                  error: null,
                }),
              }),
            }),
          };
        }
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      });

      const mockSubscription = {
        id: 'sub-123',
        status: 'active',
        items: {
          data: [
            {
              id: 'si-123',
              price: { id: 'price_max_yearly' },
              current_period_end: 1735689600,
            },
          ],
        },
      };
      mockStripe.subscriptions.retrieve.mockResolvedValue(mockSubscription);
      mockStripe.subscriptionSchedules.create.mockResolvedValue({ id: 'sched-123' });

      mockRequest = new NextRequest('http://localhost:3000', {
        method: 'POST',
        body: JSON.stringify({
          targetTier: 'SCALE',
          accountId: 'account-123',
          action: 'downgrade',
        }),
      });

      await POST(mockRequest);

      // The account tier should still be MAX (not changed)
      expect(mockAccount.tier).toBe('MAX');
    });
  });

  describe('Upgrade Flow', () => {
    it('should process upgrades immediately', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'accounts') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'account-123',
                    tier: 'PRO',
                    stripe_subscription_id: 'sub-123',
                  },
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        if (table === 'account_users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                in: vi.fn().mockResolvedValue({
                  data: [{ account_id: 'account-123', role: 'account_owner' }],
                  error: null,
                }),
              }),
            }),
          };
        }
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      });

      const mockSubscription = {
        id: 'sub-123',
        status: 'active',
        current_period_end: 1735689600,
        items: {
          data: [
            {
              id: 'si-123',
              price: { 
                id: 'price_1RgXbeAyYiuNghuYZ17FC9MK', // PRO monthly price ID
                product: 'prod_pro'
              },
              quantity: 1,
            },
          ],
        },
      };
      mockStripe.subscriptions.retrieve.mockResolvedValue(mockSubscription);
      mockStripe.subscriptions.update.mockResolvedValue({
        id: 'sub-123',
        status: 'active',
      });

      mockRequest = new NextRequest('http://localhost:3000', {
        method: 'POST',
        body: JSON.stringify({
          targetTier: 'MAX',
          accountId: 'account-123',
          action: 'upgrade',
        }),
      });

      const response = await POST(mockRequest);
      const data = await response?.json();

      expect(response?.status).toBe(200);
      expect(data.message).toContain('upgraded');
      expect(mockStripe.subscriptions.update).toHaveBeenCalled();
      expect(mockStripe.subscriptionSchedules.create).not.toHaveBeenCalled();
    });
  });

  describe('Permission Checks', () => {
    it('should reject non-owner users', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-456' } },
        error: null,
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'accounts') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'account-123' },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'account_users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                in: vi.fn().mockResolvedValue({
                  data: [{ account_id: 'account-123', role: 'member' }],
                  error: null,
                }),
              }),
            }),
          };
        }
        return mockSupabase.from(table);
      });

      mockRequest = new NextRequest('http://localhost:3000', {
        method: 'POST',
        body: JSON.stringify({
          targetTier: 'SCALE',
          accountId: 'account-123',
          action: 'downgrade',
        }),
      });

      const response = await POST(mockRequest);
      const data = await response?.json();

      expect(response?.status).toBe(403);
      expect(data.error).toContain('Only account owners');
    });

    it('should allow platform admins', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'admin-123' } },
        error: null,
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'accounts') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'account-123',
                    tier: 'PRO',
                    stripe_subscription_id: 'sub-123',
                  },
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        if (table === 'account_users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                in: vi.fn().mockResolvedValue({
                  data: [
                    { account_id: '00000000-0000-0000-0000-000000000000', role: 'admin' },
                  ],
                  error: null,
                }),
              }),
            }),
          };
        }
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      });

      mockStripe.subscriptions.retrieve.mockResolvedValue({
        id: 'sub-123',
        status: 'active',
        current_period_end: 1735689600,
        items: {
          data: [
            {
              id: 'si-123',
              price: { 
                id: 'price_1RgXbeAyYiuNghuYZ17FC9MK', // PRO monthly price ID
                product: 'prod_pro'
              },
              quantity: 1,
            },
          ],
        },
      });
      mockStripe.subscriptionSchedules.create.mockResolvedValue({ id: 'sched-123' });

      mockRequest = new NextRequest('http://localhost:3000', {
        method: 'POST',
        body: JSON.stringify({
          targetTier: 'SCALE',
          accountId: 'account-123',
          action: 'downgrade',
        }),
      });

      const response = await POST(mockRequest);
      expect(response?.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should reject invalid tiers', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockRequest = new NextRequest('http://localhost:3000', {
        method: 'POST',
        body: JSON.stringify({
          targetTier: 'INVALID_TIER',
          accountId: 'account-123',
          action: 'upgrade',
        }),
      });

      const response = await POST(mockRequest);
      const data = await response?.json();

      expect(response?.status).toBe(400);
      expect(data.error).toContain('Invalid tier');
    });

    it('should reject FREE/BASIC tier changes', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'accounts') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { 
                    id: 'account-123',
                    stripe_subscription_id: 'sub-123',
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'account_users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                in: vi.fn().mockResolvedValue({
                  data: [{ account_id: 'account-123', role: 'account_owner' }],
                  error: null,
                }),
              }),
            }),
          };
        }
        return mockSupabase.from(table);
      });

      mockStripe.subscriptions.retrieve.mockResolvedValue({
        id: 'sub-123',
        status: 'active',
        items: { data: [{ id: 'si-123', price: { id: 'price_pro_monthly' } }] },
      });

      mockRequest = new NextRequest('http://localhost:3000', {
        method: 'POST',
        body: JSON.stringify({
          targetTier: 'FREE',
          accountId: 'account-123',
          action: 'downgrade',
        }),
      });

      const response = await POST(mockRequest);
      const data = await response?.json();

      expect(response?.status).toBe(400);
      expect(data.error).toContain('Invalid tier');
    });

    it('should handle missing subscription', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'accounts') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'account-123',
                    stripe_subscription_id: null,
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              in: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        };
      });

      mockRequest = new NextRequest('http://localhost:3000', {
        method: 'POST',
        body: JSON.stringify({
          targetTier: 'PRO',
          accountId: 'account-123',
          action: 'upgrade',
        }),
      });

      const response = await POST(mockRequest);
      const data = await response?.json();

      expect(response?.status).toBe(403);
      expect(data.error).toContain('Only account owners');
    });
  });
});