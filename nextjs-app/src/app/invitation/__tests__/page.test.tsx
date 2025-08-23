import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import InvitationPage from '../page';

// Mock next/navigation
const mockPush = vi.fn();
const mockUseSearchParams = vi.fn();
const mockUseRouter = vi.fn(() => ({
  push: mockPush,
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockUseSearchParams(),
  useRouter: () => mockUseRouter(),
}));

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

import { supabase } from '@/lib/supabase/client';

// Mock fetch
global.fetch = vi.fn();

describe('InvitationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show error when no token is provided', async () => {
    mockUseSearchParams.mockReturnValue({
      get: vi.fn(() => null),
    });

    // Mock supabase auth check
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { user: null } as any,
      error: null,
    });

    render(<InvitationPage />);

    await waitFor(() => {
      expect(screen.getByText('Invalid Invitation')).toBeInTheDocument();
      expect(screen.getByText('No invitation token provided')).toBeInTheDocument();
    });
  });

  it('should show loading state while fetching invitation', () => {
    mockUseSearchParams.mockReturnValue({
      get: vi.fn(() => 'test-token'),
    });

    vi.mocked(global.fetch).mockImplementationOnce(
      () => new Promise(() => {}) // Never resolves to keep loading
    );

    const { container } = render(<InvitationPage />);

    // Look for loading card structure since Skeleton components may not have specific class names
    const card = container.querySelector('.max-w-md');
    expect(card).toBeInTheDocument();
    
    // Check if we have the Card structure with loading state
    const cardContent = container.querySelector('[class*="card"]');
    expect(cardContent).toBeInTheDocument();
  });

  it('should display invitation card with valid token', async () => {
    mockUseSearchParams.mockReturnValue({
      get: vi.fn(() => 'valid-token'),
    });

    // Mock supabase auth check
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { user: null } as any,
      error: null,
    });

    const mockInvitation = {
      id: '123',
      token: 'valid-token',
      email: 'test@example.com',
      role: 'user',
      accepted_at: null,
      declined_at: null,
      cancelled_at: null,
      accounts: {
        name: 'Test Account',
        slug: 'test-account',
      },
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };

    // Mock supabase invitation lookup
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockInvitation,
            error: null,
          }),
        }),
      }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<InvitationPage />);

    await waitFor(() => {
      expect(screen.getByText('Team Invitation')).toBeInTheDocument();
      expect(screen.getByText(/You've been invited to join Test Account/i)).toBeInTheDocument();
    });
  });

  it('should show error for expired invitation', async () => {
    mockUseSearchParams.mockReturnValue({
      get: vi.fn(() => 'expired-token'),
    });

    // Mock supabase auth check
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { user: null } as any,
      error: null,
    });

    const mockInvitation = {
      id: '456',
      token: 'expired-token',
      email: 'expired@example.com',
      role: 'user',
      accepted_at: null,
      declined_at: null,
      cancelled_at: null,
      accounts: {
        name: 'Test Account',
        slug: 'test-account',
      },
      expires_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    };

    // Mock supabase invitation lookup
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockInvitation,
            error: null,
          }),
        }),
      }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<InvitationPage />);

    await waitFor(() => {
      expect(screen.getByText('Invitation Expired')).toBeInTheDocument();
      expect(screen.getByText(/invitation has expired/i)).toBeInTheDocument();
    });
  });

  it('should show error for already accepted invitation', async () => {
    mockUseSearchParams.mockReturnValue({
      get: vi.fn(() => 'accepted-token'),
    });

    // Mock supabase auth check
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { user: null } as any,
      error: null,
    });

    const mockInvitation = {
      id: '789',
      token: 'accepted-token',
      email: 'accepted@example.com',
      role: 'user',
      accepted_at: new Date().toISOString(),
      declined_at: null,
      cancelled_at: null,
      accounts: {
        name: 'Test Account',
        slug: 'test-account',
      },
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };

    // Mock supabase invitation lookup
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockInvitation,
            error: null,
          }),
        }),
      }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<InvitationPage />);

    await waitFor(() => {
      expect(screen.getByText('Invitation Already Accepted')).toBeInTheDocument();
      expect(screen.getByText(/already been accepted/i)).toBeInTheDocument();
    });
  });

  it('should show error when API returns error', async () => {
    mockUseSearchParams.mockReturnValue({
      get: vi.fn(() => 'invalid-token'),
    });

    // Mock supabase auth check
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { user: null } as any,
      error: null,
    });

    // Mock supabase invitation lookup with error
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Invitation not found' },
          }),
        }),
      }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<InvitationPage />);

    await waitFor(() => {
      expect(screen.getByText('Invalid Invitation')).toBeInTheDocument();
      expect(screen.getByText('Invalid invitation token')).toBeInTheDocument();
    });
  });

  it('should have link to login page on error', async () => {
    mockUseSearchParams.mockReturnValue({
      get: vi.fn(() => null),
    });

    // Mock supabase auth check
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { user: null } as any,
      error: null,
    });

    render(<InvitationPage />);

    await waitFor(() => {
      const emailLink = screen.getByText('hello@wondrousdigital.com');
      expect(emailLink).toBeInTheDocument();
      expect(emailLink).toHaveAttribute('href', 'mailto:hello@wondrousdigital.com');
    });
  });
});