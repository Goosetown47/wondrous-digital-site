import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

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

describe('GET /api/stripe/billing-details', () => {
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
      },
      invoices: {
        list: vi.fn(),
        createPreview: vi.fn(),
      },
    };

    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSupabase);
    vi.mocked(getStripe).mockReturnValue(mockStripe);
  });

  describe('Pending Change Information', () => {
    it('should return pending change details when downgrade is scheduled', async () => {
      // Setup user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Mock account with pending change
      const mockAccount = {
        id: 'account-123',
        tier: 'MAX',
        stripe_customer_id: 'cus-123',
        stripe_subscription_id: 'sub-123',
        pending_tier_change: 'SCALE',
        pending_tier_change_date: '2025-03-01T00:00:00Z',
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
          };
        }
        if (table === 'account_users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { role: 'account_owner' },
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        if (table === 'account_billing_history') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockReturnValue({
                      single: vi.fn().mockResolvedValue({
                        data: { created_at: '2025-01-15T00:00:00Z' },
                        error: null,
                      }),
                    }),
                  }),
                }),
              }),
            }),
          };
        }
        return mockSupabase.from(table);
      });

      // Mock subscription
      mockStripe.subscriptions.retrieve.mockResolvedValue({
        id: 'sub-123',
        status: 'active',
        items: {
          data: [
            {
              id: 'si-123',
              price: { 
                id: 'price_max_yearly',
                recurring: { interval: 'year' },
                unit_amount: 99700,
              },
              quantity: 1,
              current_period_start: 1704067200,
              current_period_end: 1735689600,
            },
          ],
        },
      });

      // Mock invoices
      mockStripe.invoices.list.mockResolvedValue({
        data: [],
      });

      mockRequest = new NextRequest('http://localhost:3000/api/stripe/billing-details?accountId=account-123');

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pendingChange).toBeDefined();
      expect(data.pendingChange.targetTier).toBe('SCALE');
      expect(data.pendingChange.currentTier).toBe('MAX');
      expect(data.pendingChange.changeDate).toContain('2025-03-01');
      expect(data.pendingChange.remainingTime).toBeDefined();
      expect(data.account.pendingTierChange).toBe('SCALE');
    });

    it('should calculate remaining time correctly', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Set up an account with a pending change 45 days in the future
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 45);

      const mockAccount = {
        id: 'account-123',
        tier: 'MAX',
        stripe_customer_id: 'cus-123',
        stripe_subscription_id: 'sub-123',
        pending_tier_change: 'PRO',
        pending_tier_change_date: futureDate.toISOString(),
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
          };
        }
        if (table === 'account_users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { role: 'account_owner' },
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        if (table === 'account_billing_history') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockReturnValue({
                      single: vi.fn().mockResolvedValue({
                        data: null,
                        error: null,
                      }),
                    }),
                  }),
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
        items: {
          data: [
            {
              price: { recurring: { interval: 'month' } },
              current_period_end: Math.floor(futureDate.getTime() / 1000),
            },
          ],
        },
      });

      mockStripe.invoices.list.mockResolvedValue({ data: [] });

      mockRequest = new NextRequest('http://localhost:3000/api/stripe/billing-details?accountId=account-123');

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pendingChange).toBeDefined();
      expect(data.pendingChange.remainingTime).toContain('1 month');
      expect(data.pendingChange.daysRemaining).toBeGreaterThanOrEqual(44);
      expect(data.pendingChange.daysRemaining).toBeLessThanOrEqual(46);
    });

    it('should return null pending change when no downgrade scheduled', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockAccount = {
        id: 'account-123',
        tier: 'PRO',
        stripe_customer_id: 'cus-123',
        stripe_subscription_id: 'sub-123',
        pending_tier_change: null,
        pending_tier_change_date: null,
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
          };
        }
        if (table === 'account_users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { role: 'account_owner' },
                    error: null,
                  }),
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
        items: { data: [] },
      });

      mockStripe.invoices.list.mockResolvedValue({ data: [] });

      mockRequest = new NextRequest('http://localhost:3000/api/stripe/billing-details?accountId=account-123');

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pendingChange).toBeNull();
    });
  });

  describe('Billing Status', () => {
    it('should show paid status for active subscription', async () => {
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
                    stripe_customer_id: 'cus-123',
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
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { role: 'account_owner' },
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        return mockSupabase.from(table);
      });

      const periodEnd = Math.floor(Date.now() / 1000) + 2592000; // 30 days from now
      mockStripe.subscriptions.retrieve.mockResolvedValue({
        id: 'sub-123',
        status: 'active',
        items: {
          data: [
            {
              price: { recurring: { interval: 'month' } },
              current_period_end: periodEnd,
            },
          ],
        },
      });

      mockStripe.invoices.list.mockResolvedValue({ data: [] });

      mockRequest = new NextRequest('http://localhost:3000/api/stripe/billing-details?accountId=account-123');

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.billingStatus.status).toBe('paid');
      expect(data.billingStatus.message).toContain("You're paid until");
    });

    it('should show no subscription status when no Stripe customer', async () => {
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
                    tier: 'FREE',
                    stripe_customer_id: null,
                    stripe_subscription_id: null,
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
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { role: 'account_owner' },
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        return mockSupabase.from(table);
      });

      mockRequest = new NextRequest('http://localhost:3000/api/stripe/billing-details?accountId=account-123');

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.billingStatus.status).toBe('no_subscription');
      expect(data.subscription).toBeNull();
      expect(data.invoices).toEqual([]);
    });
  });

  describe('Permission Checks', () => {
    it('should deny access to unauthorized users', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'unauthorized-user' } },
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
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: null,
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        return mockSupabase.from(table);
      });

      mockRequest = new NextRequest('http://localhost:3000/api/stripe/billing-details?accountId=account-123');

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Access denied');
    });

    it('should require authentication', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      mockRequest = new NextRequest('http://localhost:3000/api/stripe/billing-details?accountId=account-123');

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('must be logged in');
    });

    it('should require account ID parameter', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockRequest = new NextRequest('http://localhost:3000/api/stripe/billing-details');

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Account ID is required');
    });
  });
});