import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../create-checkout-session/route';

// Mock the dependencies
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock('@/lib/stripe/utils', () => ({
  createCheckoutSession: vi.fn(),
}));

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createCheckoutSession } from '@/lib/stripe/utils';

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
                accounts: { name: 'Test Account' },
              },
              error: null,
            })),
          })),
        })),
      });

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

      expect(createCheckoutSession).toHaveBeenCalledWith({
        accountId: 'acc_123',
        userId: 'inv_token_123',
        tier: 'PRO',
        email: 'invited@example.com',
        name: 'Test Account',
        flow: 'invitation',
      });
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

      expect(createCheckoutSession).toHaveBeenCalledWith({
        accountId: 'acc_456',
        userId: 'user_123',
        tier: 'SCALE',
        email: 'user@example.com',
        name: 'User Account',
        flow: 'upgrade',
      });
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
    it('should return not implemented for direct signups', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          tier: 'PRO',
          flow: null,
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ 
        error: 'Direct signup not yet implemented. Please contact sales.' 
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
      expect(data).toEqual({ error: 'Tier is required' });
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
                accounts: { name: 'Test Account' },
              },
              error: null,
            })),
          })),
        })),
      });

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