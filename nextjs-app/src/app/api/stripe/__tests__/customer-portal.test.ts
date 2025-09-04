import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../customer-portal/route';

// Mock dependencies
const mockStripe = {
  billingPortal: {
    sessions: {
      create: vi.fn(),
    },
    configurations: {
      list: vi.fn().mockResolvedValue({ data: [] }),
    },
  },
};

vi.mock('@/lib/stripe/config', () => ({
  getStripe: vi.fn(() => mockStripe),
}));

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}));

import { createSupabaseServerClient } from '@/lib/supabase/server';

// Type for our mock Supabase client
const createMockSupabase = () => ({
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
});

describe.skip('POST /api/stripe/customer-portal', () => {
  let mockSupabase: ReturnType<typeof createMockSupabase>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset configurations list mock for each test
    mockStripe.billingPortal.configurations.list.mockResolvedValue({ data: [] });
    
    mockSupabase = createMockSupabase();
    
    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSupabase as never);
    
    // Reset environment
    process.env.NEXT_PUBLIC_APP_URL = 'https://test.com';
  });

  it('should create portal session for authenticated account owner', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user_123',
          email: 'owner@example.com',
        },
      },
      error: null,
    });

    // Mock account with Stripe customer ID
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                account_id: 'acc_123',
                accounts: {
                  stripe_customer_id: 'cus_stripe_123',
                },
              },
              error: null,
            })),
          })),
        })),
      })),
    });

    // Mock Stripe portal session creation
    mockStripe.billingPortal.sessions.create.mockResolvedValue({
      id: 'bps_123',
      url: 'https://billing.stripe.com/session/xxx',
    });

    const request = new NextRequest('http://localhost:3000/api/stripe/customer-portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: 'acc_123' }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      url: 'https://billing.stripe.com/session/xxx',
    });

    expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith({
      customer: 'cus_stripe_123',
      return_url: 'https://test.com/billing',
    });
  });

  it('should reject unauthenticated requests', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    });

    const request = new NextRequest('http://localhost:3000/api/stripe/customer-portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: 'acc_123' }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({
      error: 'You must be logged in to manage billing',
    });
  });

  it('should reject users without billing accounts', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user_123',
          email: 'user@example.com',
        },
      },
      error: null,
    });

    // Mock user without Stripe customer ID
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                account_id: 'acc_123',
                accounts: {
                  stripe_customer_id: null,
                },
              },
              error: null,
            })),
          })),
        })),
      })),
    });

    const request = new NextRequest('http://localhost:3000/api/stripe/customer-portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: 'acc_123' }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: 'No billing account found',
    });
  });

  it('should reject non-account-owner users', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user_123',
          email: 'user@example.com',
        },
      },
      error: null,
    });

    // Mock query returning no results (user is not account_owner)
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: null,
              error: { message: 'No rows found' },
            })),
          })),
        })),
      })),
    });

    const request = new NextRequest('http://localhost:3000/api/stripe/customer-portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: 'acc_123' }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: 'No billing account found',
    });
  });

  it('should use localhost as fallback URL', async () => {
    delete process.env.NEXT_PUBLIC_APP_URL;

    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user_123',
          email: 'owner@example.com',
        },
      },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                account_id: 'acc_123',
                accounts: {
                  stripe_customer_id: 'cus_stripe_123',
                },
              },
              error: null,
            })),
          })),
        })),
      })),
    });

    mockStripe.billingPortal.sessions.create.mockResolvedValue({
      id: 'bps_123',
      url: 'https://billing.stripe.com/session/xxx',
    });

    const request = new NextRequest('http://localhost:3000/api/stripe/customer-portal');
    await POST(request);

    expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith({
      customer: 'cus_stripe_123',
      return_url: 'http://localhost:3000/billing',
    });
  });

  it('should handle Stripe API errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user_123',
          email: 'owner@example.com',
        },
      },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                account_id: 'acc_123',
                accounts: {
                  stripe_customer_id: 'cus_stripe_123',
                },
              },
              error: null,
            })),
          })),
        })),
      })),
    });

    // Mock Stripe error
    mockStripe.billingPortal.sessions.create.mockRejectedValue(
      new Error('Stripe API error')
    );

    const request = new NextRequest('http://localhost:3000/api/stripe/customer-portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: 'acc_123' }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to create billing portal session');
    expect(data.message).toBe('Stripe API error');
  });
});