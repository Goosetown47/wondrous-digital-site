import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../create-checkout-session/route';

// Mock the dependencies
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock('@/lib/stripe/utils', () => ({
  createCheckoutSession: vi.fn(),
  createOrRetrieveCustomer: vi.fn(),
  updateAccountTier: vi.fn(),
  formatCurrency: vi.fn(),
  getTierPriceDisplay: vi.fn(),
  verifyWebhookSignature: vi.fn(),
}));

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createCheckoutSession, createOrRetrieveCustomer } from '@/lib/stripe/utils';

// Type for our mock Supabase client
const createMockSupabase = () => ({
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
});

describe('POST /api/stripe/create-checkout-session', () => {
  let mockSupabase: ReturnType<typeof createMockSupabase>;
  let mockRequest: NextRequest;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockSupabase = createMockSupabase();
    
    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSupabase as never);
  });

  describe('Invitation flow', () => {
    beforeEach(() => {
      mockRequest = new NextRequest('http://localhost:3000/api/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          tier: 'PRO',
          flow: 'invitation',
          invitationToken: 'inv_token_123',
        }),
      });
    });

    it('should process valid invitation and create checkout session', async () => {
      // Mock invitation lookup
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                email: 'invited@example.com',
                account_id: 'acc_123',
                invited_by: 'inviter_user_123',
                accounts: { name: 'Test Account' },
              },
              error: null,
            })),
          })),
        })),
      });

      // Mock customer creation/retrieval
      vi.mocked(createOrRetrieveCustomer).mockResolvedValue('cus_123');
      
      // Mock checkout session creation
      vi.mocked(createCheckoutSession).mockResolvedValue({
        id: 'cs_123',
        url: 'https://checkout.stripe.com/session',
      } as Awaited<ReturnType<typeof createCheckoutSession>>);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        sessionId: 'cs_123',
        url: 'https://checkout.stripe.com/session',
      });

      expect(createCheckoutSession).toHaveBeenCalledWith(
        'PRO',
        'acc_123',
        'inviter_user_123', // userId will be the inviter's ID
        'cus_123',
        'invitation',
        'monthly'
      );
    });

    it('should reject invalid invitation token', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Not found' },
            })),
          })),
        })),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid invitation token' });
    });
  });

  describe('Upgrade flow', () => {
    beforeEach(() => {
      mockRequest = new NextRequest('http://localhost:3000/api/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          tier: 'SCALE',
          flow: 'upgrade',
        }),
      });
    });

    it('should process upgrade for authenticated user', async () => {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user_123',
            email: 'user@example.com',
          },
        },
        error: null,
      });

      // Mock account lookup
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                account_id: 'acc_456',
                accounts: { name: 'User Account' },
              },
              error: null,
            })),
          })),
        })),
      });

      // Mock customer creation/retrieval
      vi.mocked(createOrRetrieveCustomer).mockResolvedValue('cus_456');
      
      // Mock checkout session creation
      vi.mocked(createCheckoutSession).mockResolvedValue({
        id: 'cs_456',
        url: 'https://checkout.stripe.com/upgrade',
      } as Awaited<ReturnType<typeof createCheckoutSession>>);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        sessionId: 'cs_456',
        url: 'https://checkout.stripe.com/upgrade',
      });

      expect(createCheckoutSession).toHaveBeenCalledWith(
        'SCALE',
        'acc_456',
        'user_123',
        'cus_456',
        'upgrade',
        'monthly'
      );
    });

    it('should reject unauthenticated upgrade attempts', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'You must be logged in to upgrade' });
    });

    it('should reject users without accounts', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user_123',
            email: 'user@example.com',
          },
        },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: null,
              error: { message: 'No account' },
            })),
          })),
        })),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'No account found for user' });
    });
  });

  describe('Cold flow', () => {
    it('should process cold signup with email', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          tier: 'PRO',
          flow: 'cold',
          email: 'new@example.com',
        }),
      });

      // Mock customer creation/retrieval
      vi.mocked(createOrRetrieveCustomer).mockResolvedValue('cus_cold');
      
      // Mock checkout session creation
      vi.mocked(createCheckoutSession).mockResolvedValue({
        id: 'cs_cold',
        url: 'https://checkout.stripe.com/cold',
      } as Awaited<ReturnType<typeof createCheckoutSession>>);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        sessionId: 'cs_cold',
        url: 'https://checkout.stripe.com/cold',
      });
    });

    it('should reject cold signup without email', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          tier: 'PRO',
          flow: 'cold',
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ 
        error: 'Email is required for signup' 
      });
    });
  });

  describe('Validation', () => {
    it('should reject invalid tier', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          tier: 'INVALID_TIER',
          flow: 'upgrade',
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid tier selected' });
    });

    it('should reject missing tier', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          flow: 'upgrade',
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid tier selected' });
    });
  });

  describe('Error handling', () => {
    it('should handle checkout session creation errors', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          tier: 'PRO',
          flow: 'invitation',
          invitationToken: 'inv_token_123',
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                email: 'invited@example.com',
                account_id: 'acc_123',
                invited_by: 'inviter_user_123',
                accounts: { name: 'Test Account' },
              },
              error: null,
            })),
          })),
        })),
      });

      // Mock customer creation/retrieval
      vi.mocked(createOrRetrieveCustomer).mockResolvedValue('cus_789');
      
      vi.mocked(createCheckoutSession).mockRejectedValue(
        new Error('Stripe API error')
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create checkout session');
      expect(data.message).toBe('Stripe API error');
    });
  });
});