import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import BillingPage from './page';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/providers/auth-provider', () => ({
  useAuth: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('BillingPage', () => {
  const mockRouter = {
    push: vi.fn(),
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockAccount = {
    id: 'account-123',
    tier: 'MAX',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
  });

  describe('Tabbed Interface', () => {
    it('should render three tabs', async () => {
      const { useAuth } = vi.mocked(await import('@/providers/auth-provider'));
      useAuth.mockReturnValue({
        user: mockUser,
        currentAccount: mockAccount,
      } as any);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          account: {
            tier: 'MAX',
            stripeCustomerId: 'cus-123',
            stripeSubscriptionId: 'sub-123',
          },
          billingStatus: {
            status: 'paid',
            message: "You're paid until January 1, 2026",
          },
          subscription: {
            status: 'active',
            billingPeriod: 'yearly',
            currentPeriodEnd: '2026-01-01T00:00:00Z',
          },
          invoices: [],
          pendingChange: null,
        }),
      });

      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText('Overview')).toBeInTheDocument();
        expect(screen.getByText('Payment History')).toBeInTheDocument();
        expect(screen.getByText('Addons Preview')).toBeInTheDocument();
      });
    });

    it('should switch between tabs when clicked', async () => {
      const { useAuth } = vi.mocked(await import('@/providers/auth-provider'));
      useAuth.mockReturnValue({
        user: mockUser,
        currentAccount: mockAccount,
      } as any);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          account: { tier: 'PRO' },
          billingStatus: { status: 'paid' },
          subscription: null,
          invoices: [],
          pendingChange: null,
        }),
      });

      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText('Overview')).toBeInTheDocument();
      });

      // Click on Payment History tab
      const historyTab = screen.getByText('Payment History');
      fireEvent.click(historyTab);

      await waitFor(() => {
        expect(screen.getByText('Receipts and transaction details')).toBeInTheDocument();
      });

      // Click on Addons Preview tab
      const addonsTab = screen.getByText('Addons Preview');
      fireEvent.click(addonsTab);

      await waitFor(() => {
        expect(screen.getByText('PERFORM SEO Platform')).toBeInTheDocument();
      });
    });
  });

  describe('Upcoming Changes Section', () => {
    it('should display upcoming changes when pending downgrade exists', async () => {
      const { useAuth } = vi.mocked(await import('@/providers/auth-provider'));
      useAuth.mockReturnValue({
        user: mockUser,
        currentAccount: mockAccount,
      } as any);

      const mockBillingData = {
        account: {
          tier: 'MAX',
          stripeCustomerId: 'cus-123',
          stripeSubscriptionId: 'sub-123',
          pendingTierChange: 'SCALE',
          pendingTierChangeDate: '2025-03-01T00:00:00Z',
        },
        billingStatus: {
          status: 'paid',
          message: "You're paid until March 1, 2025",
        },
        subscription: {
          status: 'active',
          billingPeriod: 'yearly',
          currentPeriodEnd: '2025-03-01T00:00:00Z',
        },
        invoices: [],
        pendingChange: {
          targetTier: 'SCALE',
          changeDate: '2025-03-01T00:00:00Z',
          requestDate: '2025-01-15T00:00:00Z',
          currentTier: 'MAX',
          remainingTime: '1 month',
          daysRemaining: 35,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBillingData,
      });

      render(<BillingPage />);

      await waitFor(() => {
        // Check for Upcoming Changes section
        expect(screen.getByText('Upcoming Changes')).toBeInTheDocument();
        
        // Check for specific content with checkmarks
        expect(screen.getByText(/You changed your subscription on/)).toBeInTheDocument();
        expect(screen.getByText(/Your account has.*remaining of MAX/)).toBeInTheDocument();
        expect(screen.getByText(/The change to SCALE will occur on/)).toBeInTheDocument();
        expect(screen.getByText(/We will charge you at the new rate/)).toBeInTheDocument();
        expect(screen.getByText(/We will remind you 30, 7, and 1 day before/)).toBeInTheDocument();
      });
    });

    it('should not display upcoming changes when no pending change', async () => {
      const { useAuth } = vi.mocked(await import('@/providers/auth-provider'));
      useAuth.mockReturnValue({
        user: mockUser,
        currentAccount: mockAccount,
      } as any);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          account: {
            tier: 'PRO',
            stripeCustomerId: 'cus-123',
            stripeSubscriptionId: 'sub-123',
          },
          billingStatus: {
            status: 'paid',
            message: "You're paid until February 1, 2025",
          },
          subscription: {
            status: 'active',
            billingPeriod: 'monthly',
            currentPeriodEnd: '2025-02-01T00:00:00Z',
          },
          invoices: [],
          pendingChange: null,
        }),
      });

      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText('Account Status')).toBeInTheDocument();
      });

      // Upcoming Changes should not be present
      expect(screen.queryByText('Upcoming Changes')).not.toBeInTheDocument();
    });

    it('should display feature differences in upcoming changes', async () => {
      const { useAuth } = vi.mocked(await import('@/providers/auth-provider'));
      useAuth.mockReturnValue({
        user: mockUser,
        currentAccount: mockAccount,
      } as any);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          account: {
            tier: 'MAX',
            pendingTierChange: 'PRO',
            pendingTierChangeDate: '2025-04-01T00:00:00Z',
          },
          billingStatus: { status: 'paid' },
          subscription: {
            status: 'active',
            billingPeriod: 'yearly',
            currentPeriodEnd: '2025-04-01T00:00:00Z',
          },
          invoices: [],
          pendingChange: {
            targetTier: 'PRO',
            changeDate: '2025-04-01T00:00:00Z',
            requestDate: '2025-01-20T00:00:00Z',
            currentTier: 'MAX',
            remainingTime: '2 months',
            daysRemaining: 70,
          },
        }),
      });

      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText('Upcoming Changes')).toBeInTheDocument();
        // Check for feature differences
        expect(screen.getByText(/Project limit reduced from 25 to 5/)).toBeInTheDocument();
        expect(screen.getByText(/User accounts reduced from 10 to 3/)).toBeInTheDocument();
        expect(screen.getByText(/White label branding will be removed/)).toBeInTheDocument();
      });
    });
  });

  describe('Quick Actions Sidebar', () => {
    it('should show quick actions in overview tab', async () => {
      const { useAuth } = vi.mocked(await import('@/providers/auth-provider'));
      useAuth.mockReturnValue({
        user: mockUser,
        currentAccount: mockAccount,
      } as any);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          account: {
            tier: 'PRO',
            stripeCustomerId: 'cus-123',
            stripeSubscriptionId: 'sub-123',
          },
          billingStatus: { status: 'paid' },
          subscription: {
            status: 'active',
            billingPeriod: 'monthly',
          },
          invoices: [],
          pendingChange: null,
        }),
      });

      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText('Account Quick Actions')).toBeInTheDocument();
        expect(screen.getByText('Manage Payment Method')).toBeInTheDocument();
        expect(screen.getByText('Change Plans')).toBeInTheDocument();
        expect(screen.getByText('Cancel Plan')).toBeInTheDocument();
      });
    });

    it('should navigate to plans page when Change Plans clicked', async () => {
      const { useAuth } = vi.mocked(await import('@/providers/auth-provider'));
      useAuth.mockReturnValue({
        user: mockUser,
        currentAccount: mockAccount,
      } as any);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          account: { tier: 'PRO', stripeCustomerId: 'cus-123' },
          billingStatus: { status: 'paid' },
          subscription: { status: 'active' },
          invoices: [],
          pendingChange: null,
        }),
      });

      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText('Change Plans')).toBeInTheDocument();
      });

      const changePlansButton = screen.getByText('Change Plans');
      fireEvent.click(changePlansButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/billing/plans');
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner while fetching data', async () => {
      const { useAuth } = vi.mocked(await import('@/providers/auth-provider'));
      useAuth.mockReturnValue({
        user: mockUser,
        currentAccount: mockAccount,
      } as any);

      // Create a promise that doesn't resolve immediately
      (global.fetch as any).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({
            account: { tier: 'PRO' },
            billingStatus: { status: 'no_subscription' },
            subscription: null,
            invoices: [],
            pendingChange: null,
          }),
        }), 100))
      );

      const { container } = render(<BillingPage />);

      // Should show loading spinner
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();

      await waitFor(() => {
        expect(container.querySelector('.animate-spin')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error message when billing details fetch fails', async () => {
      const { useAuth } = vi.mocked(await import('@/providers/auth-provider'));
      const { toast } = vi.mocked(await import('sonner'));
      
      useAuth.mockReturnValue({
        user: mockUser,
        currentAccount: mockAccount,
      } as any);

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to fetch billing details' }),
      });

      render(<BillingPage />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to load billing details');
      });
    });

    it('should handle no account selected', async () => {
      const { useAuth } = vi.mocked(await import('@/providers/auth-provider'));
      useAuth.mockReturnValue({
        user: mockUser,
        currentAccount: null,
      } as any);

      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText('Please select an account to view billing details.')).toBeInTheDocument();
      });
    });
  });

  describe('Addons Tab', () => {
    it('should display PERFORM addon information', async () => {
      const { useAuth } = vi.mocked(await import('@/providers/auth-provider'));
      useAuth.mockReturnValue({
        user: mockUser,
        currentAccount: mockAccount,
      } as any);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          account: { tier: 'PRO' },
          billingStatus: { status: 'paid' },
          subscription: null,
          invoices: [],
          pendingChange: null,
        }),
      });

      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText('Addons Preview')).toBeInTheDocument();
      });

      // Click on Addons tab
      fireEvent.click(screen.getByText('Addons Preview'));

      await waitFor(() => {
        expect(screen.getByText('PERFORM SEO Platform')).toBeInTheDocument();
        expect(screen.getByText('$459')).toBeInTheDocument();
        expect(screen.getByText('Plus $750 one-time setup fee')).toBeInTheDocument();
        expect(screen.getByText('Advanced keyword research and tracking')).toBeInTheDocument();
        expect(screen.getByText('Coming Soon')).toBeInTheDocument();
      });
    });
  });
});