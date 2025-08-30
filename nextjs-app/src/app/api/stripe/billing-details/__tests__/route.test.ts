import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../route';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/config';

// Mock Supabase
vi.mock('@/lib/supabase/server');

// Mock Stripe
vi.mock('@/lib/stripe/config');

describe('/api/stripe/billing-details', () => {
  let mockSupabase: any;
  let mockStripe: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup Supabase mock
    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
    };
    
    // Setup Stripe mock
    mockStripe = {
      subscriptions: {
        retrieve: vi.fn(),
      },
      invoices: {
        list: vi.fn(),
        createPreview: vi.fn(),
      },
    };
    
    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSupabase as any);
    vi.mocked(getStripe).mockReturnValue(mockStripe as any);
  });

  describe('Authentication', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost/api/stripe/billing-details?accountId=123');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('You must be logged in to view billing details');
    });

    it('should return 400 if accountId is missing', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const request = new NextRequest('http://localhost/api/stripe/billing-details');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Account ID is required');
    });
  });

  describe('No Subscription', () => {
    it('should return basic info when no Stripe customer exists', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockAccount = {
        id: 'account-123',
        tier: 'FREE',
        stripe_customer_id: null,
        stripe_subscription_id: null,
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockAccount,
              error: null,
            }),
          }),
        }),
      });

      // Mock account_users check
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
      });

      const request = new NextRequest('http://localhost/api/stripe/billing-details?accountId=account-123');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.account.tier).toBe('FREE');
      expect(data.account.stripeCustomerId).toBeNull();
      expect(data.billingStatus.status).toBe('no_subscription');
      expect(data.subscription).toBeNull();
      expect(data.invoices).toEqual([]);
    });
  });

  describe('Active Subscription', () => {
    it('should return full billing details with active subscription', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockAccount = {
        id: 'account-123',
        tier: 'PRO',
        stripe_customer_id: 'cus_123',
        stripe_subscription_id: 'sub_123',
      };

      const mockSubscription = {
        id: 'sub_123',
        status: 'active',
        cancel_at_period_end: false,
        canceled_at: null,
        items: {
          data: [{
            id: 'si_123',
            price: {
              id: 'price_123',
              unit_amount: 39700,
              recurring: { interval: 'month' },
            },
            quantity: 1,
            current_period_start: 1756065938, // Unix timestamp
            current_period_end: 1758744338,   // Unix timestamp
          }],
        },
      };

      const mockInvoices = {
        data: [{
          id: 'inv_123',
          number: 'INV-001',
          status: 'paid',
          amount_paid: 39700,
          subtotal: 39700,
          total: 39700,
          created: 1756065938,
          hosted_invoice_url: 'https://stripe.com/invoice',
          invoice_pdf: 'https://stripe.com/invoice.pdf',
          status_transitions: { paid_at: 1756065938 },
          lines: {
            data: [{
              description: 'PRO Monthly',
              amount: 39700,
              quantity: 1,
              price: { product: 'prod_123' },
              period: {
                start: 1756065938,
                end: 1758744338,
              },
            }],
          },
        }],
      };

      // Setup mocks
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
      });

      mockStripe.subscriptions.retrieve.mockResolvedValue(mockSubscription);
      mockStripe.invoices.list.mockResolvedValue(mockInvoices);
      mockStripe.invoices.createPreview.mockResolvedValue({
        total: 39700,
        period_end: 1758744338,
        lines: {
          data: [{
            description: 'PRO Monthly',
            amount: 39700,
            quantity: 1,
          }],
        },
      });

      const request = new NextRequest('http://localhost/api/stripe/billing-details?accountId=account-123');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.account.tier).toBe('PRO');
      expect(data.account.stripeCustomerId).toBe('cus_123');
      expect(data.billingStatus.status).toBe('paid');
      expect(data.subscription).toBeTruthy();
      expect(data.subscription.status).toBe('active');
      expect(data.subscription.billingPeriod).toBe('monthly');
      expect(data.invoices).toHaveLength(1);
      expect(data.invoices[0].status).toBe('PAID');
    });
  });

  describe('Basil API Compatibility', () => {
    it('should correctly access dates from subscription item level', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockAccount = {
        id: 'account-123',
        tier: 'MAX',
        stripe_customer_id: 'cus_123',
        stripe_subscription_id: 'sub_123',
      };

      // Basil API structure - dates at item level, not subscription level
      const mockSubscription = {
        id: 'sub_123',
        status: 'active',
        // These fields are undefined in Basil API
        current_period_start: undefined,
        current_period_end: undefined,
        items: {
          data: [{
            id: 'si_123',
            price: {
              id: 'price_123',
              unit_amount: 1076700, // $10,767 yearly
              recurring: { interval: 'year' },
            },
            quantity: 1,
            // Dates are here in Basil API
            current_period_start: 1756065938,
            current_period_end: 1787601938, // One year later
          }],
        },
      };

      // Setup mocks
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
      });

      mockStripe.subscriptions.retrieve.mockResolvedValue(mockSubscription);
      mockStripe.invoices.list.mockResolvedValue({ data: [] });
      mockStripe.invoices.createPreview.mockResolvedValue({
        total: 1076700,
        period_end: 1787601938,
        lines: {
          data: [{
            description: 'MAX Yearly',
            amount: 1076700,
            quantity: 1,
          }],
        },
      });

      const request = new NextRequest('http://localhost/api/stripe/billing-details?accountId=account-123');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Should use dates from item level, not subscription level
      expect(data.subscription.currentPeriodStart).toBeTruthy();
      expect(data.subscription.currentPeriodEnd).toBeTruthy();
      expect(data.subscription.billingPeriod).toBe('yearly');
      expect(data.billingStatus.status).toBe('paid');
    });
  });

  describe('Error Handling', () => {
    it('should handle Stripe errors gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockAccount = {
        id: 'account-123',
        tier: 'PRO',
        stripe_customer_id: 'cus_123',
        stripe_subscription_id: 'sub_123',
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
      });

      // Simulate Stripe error - should return partial data
      mockStripe.subscriptions.retrieve.mockRejectedValue(new Error('Stripe API error'));
      mockStripe.invoices.list.mockResolvedValue({ data: [] });

      const request = new NextRequest('http://localhost/api/stripe/billing-details?accountId=account-123');
      const response = await GET(request);
      const data = await response.json();

      // Should return basic account data even if subscription fetch fails
      expect(response.status).toBe(200);
      expect(data.account.tier).toBe('PRO');
      expect(data.subscription).toBeNull();
    });
  });
});