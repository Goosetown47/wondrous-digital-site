import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  verifyWebhookSignature, 
  createCheckoutSession, 
  updateAccountTier, 
  startGracePeriod 
} from '../utils';
import type { TierName } from '@/types/database';

// Mock Stripe
const mockStripe = {
  webhooks: {
    constructEvent: vi.fn(),
  },
  checkout: {
    sessions: {
      create: vi.fn(),
    },
  },
  customers: {
    create: vi.fn(),
  },
};

vi.mock('../config', () => ({
  getStripe: vi.fn(() => mockStripe),
  STRIPE_CONFIG: {
    paymentMethodTypes: ['card'],
    getSuccessUrl: vi.fn((id?: string) => `https://test.com/success${id ? `?id=${id}` : ''}`),
    getCancelUrl: vi.fn(() => 'https://test.com/cancel'),
  },
}));

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    update: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null })),
    })),
    insert: vi.fn(() => Promise.resolve({ error: null })),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ 
          data: { stripe_customer_id: 'cus_existing' },
          error: null,
        })),
      })),
    })),
  })),
};

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

describe('Stripe Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('verifyWebhookSignature', () => {
    it('should verify webhook signature successfully', () => {
      const mockEvent = { id: 'evt_123', type: 'checkout.session.completed' };
      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

      const result = verifyWebhookSignature('body', 'sig_123', 'secret_123');
      
      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        'body',
        'sig_123',
        'secret_123'
      );
      expect(result).toEqual(mockEvent);
    });

    it('should throw error for invalid signature', () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      expect(() => verifyWebhookSignature('body', 'bad_sig', 'secret')).toThrow('Invalid signature');
    });
  });

  describe('createCheckoutSession', () => {
    const tier = 'PRO' as TierName;
    const accountId = 'acc_123';
    const userId = 'user_123';
    const customerId = 'cus_existing';
    const flow = 'upgrade' as const;

    it('should create checkout session for existing customer', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: { stripe_customer_id: 'cus_existing' },
              error: null,
            })),
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
        insert: vi.fn(() => Promise.resolve({ error: null })),
      } as ReturnType<typeof mockSupabase.from>);

      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_123',
        url: 'https://checkout.stripe.com/session',
      });

      const session = await createCheckoutSession(tier, accountId, userId, customerId, flow);

      expect(mockStripe.customers.create).not.toHaveBeenCalled();
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_existing',
          mode: 'subscription',
          metadata: {
            account_id: 'acc_123',
            user_id: 'user_123',
            tier: 'PRO',
            flow: 'upgrade',
          },
        })
      );
      expect(session).toEqual({
        id: 'cs_123',
        url: 'https://checkout.stripe.com/session',
      });
    });

    it('should create new customer if none exists', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: { stripe_customer_id: null },
              error: null,
            })),
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
        insert: vi.fn(() => Promise.resolve({ error: null })),
      } as ReturnType<typeof mockSupabase.from>);

      mockStripe.customers.create.mockResolvedValue({
        id: 'cus_new',
      });

      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_123',
        url: 'https://checkout.stripe.com/session',
      });

      await createCheckoutSession(tier, accountId, userId, 'cus_new', flow);

      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        metadata: {
          account_id: 'acc_123',
          account_name: 'Test Account',
        },
      });
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_new',
        })
      );
    });

    it('should include correct line items with setup fee', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: { stripe_customer_id: 'cus_123' },
              error: null,
            })),
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
        insert: vi.fn(() => Promise.resolve({ error: null })),
      } as ReturnType<typeof mockSupabase.from>);

      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_123',
        url: 'https://checkout.stripe.com/session',
      });

      await createCheckoutSession(tier, accountId, userId, 'cus_new', flow);

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: 'Setup Fee',
                  description: 'One-time setup and onboarding',
                },
                unit_amount: 150000,
              },
              quantity: 1,
            },
            {
              price: 'price_pro_monthly',
              quantity: 1,
            },
          ],
        })
      );
    });
  });

  describe('updateAccountTier', () => {
    it('should update account tier successfully', async () => {
      const updateMock = vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      }));
      
      const insertMock = vi.fn(() => Promise.resolve({ error: null }));

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'accounts') {
          return { 
            update: updateMock,
            insert: insertMock,
            select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: null, error: null })) })) }))
          };
        }
        if (table === 'account_billing_history') {
          return { 
            insert: insertMock,
            update: updateMock,
            select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: null, error: null })) })) }))
          };
        }
        return {
          update: updateMock,
          insert: insertMock,
          select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: null, error: null })) })) }))
        };
      });

      await updateAccountTier('acc_123', 'PRO', 'cus_123', 'sub_123');

      expect(updateMock).toHaveBeenCalledWith({
        tier: 'PRO',
        stripe_customer_id: 'cus_123',
        stripe_subscription_id: 'sub_123',
        subscription_status: 'active',
        setup_fee_paid: true,
        setup_fee_paid_at: expect.any(String),
      });

      expect(insertMock).toHaveBeenCalledWith({
        account_id: 'acc_123',
        event_type: 'tier_change',
        new_tier: 'PRO',
        metadata: {
          stripe_customer_id: 'cus_123',
          stripe_subscription_id: 'sub_123',
        },
      });
    });

    it('should throw error if update fails', async () => {
      const updateMock = vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: { message: 'Update failed' } })),
      }));
      
      mockSupabase.from.mockReturnValue({
        update: updateMock,
        insert: vi.fn(() => Promise.resolve({ error: null })),
        select: vi.fn(() => ({ 
          eq: vi.fn(() => ({ 
            single: vi.fn(() => Promise.resolve({ 
              data: { stripe_customer_id: '' } as { stripe_customer_id: string }, 
              error: null 
            })) 
          })) 
        }))
      } as ReturnType<typeof mockSupabase.from>);

      await expect(updateAccountTier('acc_123', 'PRO', 'cus_123', 'sub_123'))
        .rejects.toThrow('Failed to update account tier: Update failed');
    });
  });

  describe('startGracePeriod', () => {
    it('should start grace period with default 10 days', async () => {
      const updateMock = vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      }));
      
      const insertMock = vi.fn(() => Promise.resolve({ error: null }));

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'accounts') {
          return { 
            update: updateMock,
            insert: insertMock,
            select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: null, error: null })) })) }))
          };
        }
        if (table === 'account_billing_history') {
          return { 
            insert: insertMock,
            update: updateMock,
            select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: null, error: null })) })) }))
          };
        }
        return {
          update: updateMock,
          insert: insertMock,
          select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: null, error: null })) })) }))
        };
      });

      await startGracePeriod('acc_123');

      expect(updateMock).toHaveBeenCalledWith({
        grace_period_ends_at: expect.any(String),
        subscription_status: 'past_due',
      });

      // Check that grace period is roughly 10 days from now
      const calls = updateMock.mock.calls;
      if (!calls || !calls[0] || !calls[0][0]) {
        throw new Error('Update mock was not called correctly');
      }
      const gracePeriodDate = new Date(calls[0][0].grace_period_ends_at);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 10);
      
      const diffInDays = Math.abs(gracePeriodDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffInDays).toBeLessThan(0.1); // Less than 0.1 day difference
    });

    it('should start grace period with custom days', async () => {
      const updateMock = vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      }));

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'accounts') {
          return { 
            update: updateMock,
            insert: vi.fn(() => Promise.resolve({ error: null })),
            select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: null, error: null })) })) }))
          };
        }
        return { 
          insert: vi.fn(() => Promise.resolve({ error: null })),
          update: updateMock,
          select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: null, error: null })) })) }))
        };
      });

      await startGracePeriod('acc_123', 5);

      // Check that grace period is roughly 5 days from now
      const calls = updateMock.mock.calls;
      if (!calls || !calls[0] || !calls[0][0]) {
        throw new Error('Update mock was not called correctly');
      }
      const gracePeriodDate = new Date(calls[0][0].grace_period_ends_at);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 5);
      
      const diffInDays = Math.abs(gracePeriodDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffInDays).toBeLessThan(0.1);
    });

    it('should throw error if update fails', async () => {
      const updateMock = vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: { message: 'Grace period failed' } })),
      }));
      
      mockSupabase.from.mockReturnValue({
        update: updateMock,
        insert: vi.fn(() => Promise.resolve({ error: null })),
        select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: null, error: null })) })) }))
      });

      await expect(startGracePeriod('acc_123'))
        .rejects.toThrow('Failed to start grace period: Grace period failed');
    });
  });
});