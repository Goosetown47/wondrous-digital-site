import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../reactivate-subscription/route';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/config';
import type { MockSupabaseClient, MockStripeClient } from '@/test/mocks/types';
import { createMockSupabaseClient, createMockStripeClient } from '@/test/mocks/types';

// Mock dependencies
vi.mock('@/lib/supabase/server');
vi.mock('@/lib/stripe/config');

describe('Reactivate Subscription API', () => {
  let mockSupabase: MockSupabaseClient;
  let mockStripe: MockStripeClient;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock Supabase client
    mockSupabase = createMockSupabaseClient();
    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);
    
    // Setup mock Stripe
    mockStripe = createMockStripeClient({
      subscriptions: {
        retrieve: vi.fn().mockResolvedValue({
          id: 'sub_123',
          cancel_at_period_end: true,
          current_period_end: 1735689600,
        }),
        update: vi.fn().mockResolvedValue({
          id: 'sub_123',
          cancel_at_period_end: false,
          current_period_end: 1735689600,
        }),
      },
    });
    vi.mocked(getStripe).mockReturnValue(mockStripe as unknown as ReturnType<typeof getStripe>);
  });

  describe('POST /api/stripe/reactivate-subscription', () => {
    it('should reactivate a canceled subscription', async () => {
      // Setup mock user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { 
          user: { 
            id: 'user-123', 
            email: 'test@example.com' 
          } 
        },
        error: null,
      });

      // Setup mock account
      const mockAccount = {
        id: 'account-123',
        tier: 'PRO',
        stripe_subscription_id: 'sub_123',
        subscription_state: 'canceling',
      };

      // Mock database operations
      const mockFrom = vi.fn();
      mockSupabase.from = mockFrom;

      // Mock account fetch
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: mockAccount,
              error: null,
            })),
          })),
        })),
      });

      // Mock account_users check (owner)
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            in: vi.fn(() => ({
              data: [{ account_id: 'account-123', role: 'account_owner' }],
              error: null,
            })),
          })),
        })),
      });

      // Mock account update
      mockFrom.mockReturnValueOnce({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => ({
                data: { ...mockAccount, subscription_state: 'active' },
                error: null,
              })),
            })),
          })),
        })),
      });

      // Mock billing history insert
      mockFrom.mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { id: 'history-123' },
              error: null,
            })),
          })),
        })),
      });

      // Create request
      const request = new NextRequest('http://localhost:3000/api/stripe/reactivate-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: 'account-123',
        }),
      });

      // Execute
      const response = await POST(request);
      const data = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('reactivated');

      // Verify Stripe API was called correctly
      expect(mockStripe.subscriptions.retrieve).toHaveBeenCalledWith('sub_123');
      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith('sub_123', {
        cancel_at_period_end: false,
      });

      // Verify database was updated
      const updateCall = mockFrom.mock.results[2].value.update;
      expect(updateCall).toHaveBeenCalledWith({
        subscription_state: 'active',
      });

      // Verify billing history was logged
      expect(mockFrom).toHaveBeenCalledWith('account_billing_history');
      const insertCall = mockFrom.mock.results[3].value.insert;
      expect(insertCall).toHaveBeenCalledWith(
        expect.objectContaining({
          account_id: 'account-123',
          event_type: 'subscription_reactivated',
        })
      );
    });

    it('should only allow reactivation of canceled subscriptions', async () => {
      // Setup mock user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { 
          user: { 
            id: 'user-123', 
            email: 'test@example.com' 
          } 
        },
        error: null,
      });

      // Mock Stripe subscription that's not canceled
      mockStripe.subscriptions.retrieve.mockResolvedValue({
        id: 'sub_123',
        cancel_at_period_end: false, // Not canceled
        current_period_end: 1735689600,
      });

      // Setup mock account
      const mockAccount = {
        id: 'account-123',
        tier: 'PRO',
        stripe_subscription_id: 'sub_123',
        subscription_state: 'active',
      };

      // Mock database operations
      const mockFrom = vi.fn();
      mockSupabase.from = mockFrom;

      // Mock account fetch
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: mockAccount,
              error: null,
            })),
          })),
        })),
      });

      // Mock account_users check (owner)
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            in: vi.fn(() => ({
              data: [{ account_id: 'account-123', role: 'account_owner' }],
              error: null,
            })),
          })),
        })),
      });

      // Create request
      const request = new NextRequest('http://localhost:3000/api/stripe/reactivate-subscription', {
        method: 'POST',
        body: JSON.stringify({
          accountId: 'account-123',
        }),
      });

      // Execute
      const response = await POST(request);
      const data = await response.json();

      // Assertions
      expect(response.status).toBe(400);
      expect(data.error).toContain('not scheduled for cancellation');
      expect(mockStripe.subscriptions.update).not.toHaveBeenCalled();
    });

    it('should require account owner permission', async () => {
      // Setup mock user (not owner)
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { 
          user: { 
            id: 'user-456', 
            email: 'notowner@example.com' 
          } 
        },
        error: null,
      });

      // Mock account fetch
      const mockFrom = vi.fn();
      mockSupabase.from = mockFrom;

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                id: 'account-123',
                stripe_subscription_id: 'sub_123',
                subscription_state: 'canceling',
              },
              error: null,
            })),
          })),
        })),
      });

      // Mock account_users check (not owner)
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            in: vi.fn(() => ({
              data: [{ account_id: 'account-123', role: 'member' }],
              error: null,
            })),
          })),
        })),
      });

      // Create request
      const request = new NextRequest('http://localhost:3000/api/stripe/reactivate-subscription', {
        method: 'POST',
        body: JSON.stringify({
          accountId: 'account-123',
        }),
      });

      // Execute
      const response = await POST(request);
      const data = await response.json();

      // Assertions
      expect(response.status).toBe(403);
      expect(data.error).toContain('Only account owners');
      expect(mockStripe.subscriptions.retrieve).not.toHaveBeenCalled();
    });

    it('should handle subscription not found', async () => {
      // Setup mock user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { 
          user: { 
            id: 'user-123', 
            email: 'test@example.com' 
          } 
        },
        error: null,
      });

      // Mock account without subscription
      const mockFrom = vi.fn();
      mockSupabase.from = mockFrom;

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                id: 'account-123',
                tier: 'FREE',
                stripe_subscription_id: null,
              },
              error: null,
            })),
          })),
        })),
      });

      // Create request
      const request = new NextRequest('http://localhost:3000/api/stripe/reactivate-subscription', {
        method: 'POST',
        body: JSON.stringify({
          accountId: 'account-123',
        }),
      });

      // Execute
      const response = await POST(request);
      const data = await response.json();

      // Assertions
      expect(response.status).toBe(400);
      expect(data.error).toContain('No subscription found');
      expect(mockStripe.subscriptions.retrieve).not.toHaveBeenCalled();
    });
  });
});