import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../route';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/config';

// Mock dependencies
vi.mock('@/lib/supabase/server');
vi.mock('@/lib/stripe/config');
vi.mock('@/lib/stripe/prices', () => ({
  TIER_PRICING: {
    PRO: {
      monthlyPrice: 39700,
      yearlyPrice: 397000,
      monthlyPriceId: 'price_pro_monthly',
      yearlyPriceId: 'price_pro_yearly',
    },
    SCALE: {
      monthlyPrice: 69700,
      yearlyPrice: 697000,
      monthlyPriceId: 'price_scale_monthly', 
      yearlyPriceId: 'price_scale_yearly',
    },
    MAX: {
      monthlyPrice: 99700,
      yearlyPrice: 1076700,
      monthlyPriceId: 'price_max_monthly',
      yearlyPriceId: 'price_max_yearly',
    },
  },
  PERFORM_ADDON_PRICING: {
    monthlyPrice: 45900,
    yearlyPrice: 459000,
    monthlyPriceId: 'price_perform_monthly',
    yearlyPriceId: 'price_perform_yearly',
  },
}));

describe('/api/stripe/subscription-preview', () => {
  let mockSupabase: any;
  let mockStripe: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(),
    };
    
    mockStripe = {
      subscriptions: {
        retrieve: vi.fn(),
      },
      invoices: {
        createPreview: vi.fn(),
      },
    };
    
    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSupabase as any);
    vi.mocked(getStripe).mockReturnValue(mockStripe as any);
  });

  describe('No Existing Subscription', () => {
    it('should calculate pricing for new subscription', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'account-123',
                tier: 'FREE',
                stripe_subscription_id: null,
              },
              error: null,
            }),
          }),
        }),
      });

      const request = new NextRequest('http://localhost/api/stripe/subscription-preview', {
        method: 'POST',
        body: JSON.stringify({
          accountId: 'account-123',
          targetTier: 'PRO',
          action: 'upgrade',
          billingPeriod: 'monthly',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.hasSubscription).toBe(false);
      expect(data.immediateCharge).toBe(397); // $397 monthly
      expect(data.futureAmount).toBe(397);
      expect(data.setupFees).toBe(1500); // Marketing platform setup fee
    });
  });

  describe('Upgrade Scenarios', () => {
    it('should calculate proration for PRO to SCALE upgrade', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockAccount = {
        id: 'account-123',
        tier: 'PRO',
        stripe_subscription_id: 'sub_123',
      };

      const mockSubscription = {
        id: 'sub_123',
        status: 'active',
        customer: 'cus_123',
        items: {
          data: [{
            id: 'si_123',
            price: {
              id: 'price_pro_monthly',
              unit_amount: 39700,
              recurring: { interval: 'month' },
            },
            quantity: 1,
            current_period_start: 1756065938,
            current_period_end: 1758744338,
          }],
        },
      };

      const mockInvoicePreview = {
        total: 30000, // Prorated amount
        lines: {
          data: [
            {
              proration: true,
              amount: 30000,
              description: 'Proration',
            },
            {
              proration: false,
              type: 'subscription',
              amount: 69700,
              description: 'SCALE Monthly',
            },
          ],
        },
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

      mockStripe.subscriptions.retrieve.mockResolvedValue(mockSubscription);
      mockStripe.invoices.createPreview.mockResolvedValue(mockInvoicePreview);

      const request = new NextRequest('http://localhost/api/stripe/subscription-preview', {
        method: 'POST',
        body: JSON.stringify({
          accountId: 'account-123',
          targetTier: 'SCALE',
          action: 'upgrade',
          billingPeriod: 'monthly',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.hasSubscription).toBe(true);
      expect(data.changes.immediateCharge).toBe(300); // $300 prorated
      expect(data.changes.futureAmount).toBe(697); // $697 monthly
      expect(data.currentPlan.tier).toBe('PRO');
    });
  });

  describe('Downgrade Scenarios', () => {
    it('should calculate credit for MAX to PRO downgrade', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockAccount = {
        id: 'account-123',
        tier: 'MAX',
        stripe_subscription_id: 'sub_123',
      };

      const mockSubscription = {
        id: 'sub_123',
        status: 'active',
        customer: 'cus_123',
        items: {
          data: [{
            id: 'si_123',
            price: {
              id: 'price_max_yearly',
              unit_amount: 1076700,
              recurring: { interval: 'year' },
            },
            quantity: 1,
            current_period_start: 1756065938,
            current_period_end: 1787601938,
          }],
        },
      };

      const mockInvoicePreview = {
        total: -500000, // Credit
        lines: {
          data: [
            {
              proration: true,
              amount: -500000, // Negative for credit
              description: 'Unused time credit',
            },
            {
              proration: false,
              type: 'subscription',
              amount: 39700,
              description: 'PRO Monthly',
            },
          ],
        },
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

      mockStripe.subscriptions.retrieve.mockResolvedValue(mockSubscription);
      mockStripe.invoices.createPreview.mockResolvedValue(mockInvoicePreview);

      const request = new NextRequest('http://localhost/api/stripe/subscription-preview', {
        method: 'POST',
        body: JSON.stringify({
          accountId: 'account-123',
          targetTier: 'PRO',
          action: 'downgrade',
          billingPeriod: 'monthly',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.hasSubscription).toBe(true);
      expect(data.changes.credit).toBe(5000); // $5000 credit
      expect(data.changes.immediateCharge).toBe(0);
      expect(data.changes.futureAmount).toBe(397); // $397 monthly
    });
  });

  describe('Billing Period Switch', () => {
    it('should handle monthly to yearly switch', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockAccount = {
        id: 'account-123',
        tier: 'PRO',
        stripe_subscription_id: 'sub_123',
      };

      const mockSubscription = {
        id: 'sub_123',
        status: 'active',
        customer: 'cus_123',
        items: {
          data: [{
            id: 'si_123',
            price: {
              id: 'price_pro_monthly',
              unit_amount: 39700,
              recurring: { interval: 'month' },
            },
            quantity: 1,
            current_period_start: 1756065938,
            current_period_end: 1758744338,
          }],
        },
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

      mockStripe.subscriptions.retrieve.mockResolvedValue(mockSubscription);
      mockStripe.invoices.createPreview.mockResolvedValue({
        total: 397000,
        lines: {
          data: [{
            proration: false,
            type: 'subscription',
            amount: 397000,
            description: 'PRO Yearly',
          }],
        },
      });

      const request = new NextRequest('http://localhost/api/stripe/subscription-preview', {
        method: 'POST',
        body: JSON.stringify({
          accountId: 'account-123',
          targetTier: 'PRO',
          action: 'switch-billing',
          billingPeriod: 'yearly',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.currentPlan.interval).toBe('monthly');
      expect(data.changes.futureAmount).toBe(3970); // $3970 yearly
    });
  });

  describe('PERFORM Addon', () => {
    it('should add PERFORM addon to existing subscription', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockAccount = {
        id: 'account-123',
        tier: 'PRO',
        stripe_subscription_id: 'sub_123',
        perform_setup_fee_paid: false,
      };

      const mockSubscription = {
        id: 'sub_123',
        status: 'active',
        customer: 'cus_123',
        items: {
          data: [{
            id: 'si_123',
            price: {
              id: 'price_pro_monthly',
              unit_amount: 39700,
              recurring: { interval: 'month' },
            },
            quantity: 1,
            current_period_start: 1756065938,
            current_period_end: 1758744338,
          }],
        },
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

      mockStripe.subscriptions.retrieve.mockResolvedValue(mockSubscription);
      mockStripe.invoices.createPreview.mockResolvedValue({
        total: 45900,
        lines: {
          data: [{
            proration: false,
            type: 'subscription',
            amount: 45900,
            description: 'PERFORM SEO Platform',
          }],
        },
      });

      const request = new NextRequest('http://localhost/api/stripe/subscription-preview', {
        method: 'POST',
        body: JSON.stringify({
          accountId: 'account-123',
          targetTier: 'PRO',
          action: 'addon',
          addon: 'PERFORM',
          billingPeriod: 'monthly',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.changes.setupFees).toBe(750); // $750 PERFORM setup fee
      expect(data.changes.futureAmount).toBe(459); // $459 monthly for addon
    });
  });

  describe('Error Handling', () => {
    it('should return 401 for unauthenticated requests', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost/api/stripe/subscription-preview', {
        method: 'POST',
        body: JSON.stringify({
          accountId: 'account-123',
          targetTier: 'PRO',
          action: 'upgrade',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('You must be logged in to preview changes');
    });

    it('should return 404 for non-existent account', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      });

      const request = new NextRequest('http://localhost/api/stripe/subscription-preview', {
        method: 'POST',
        body: JSON.stringify({
          accountId: 'account-123',
          targetTier: 'PRO',
          action: 'upgrade',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Account not found');
    });
  });
});