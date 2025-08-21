import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import PricingPage from '../page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
}));

// Mock auth provider
vi.mock('@/providers/auth-provider', () => ({
  useAuth: vi.fn(),
}));

// Mock components
vi.mock('@/components/pricing/pricing-grid', () => ({
  PricingGrid: vi.fn(({ onSelectTier, isLoading, currentTier, isAuthenticated }) => (
    <div data-testid="pricing-grid">
      <div>Loading: {isLoading ? 'true' : 'false'}</div>
      <div>Authenticated: {isAuthenticated ? 'true' : 'false'}</div>
      <div>Current Tier: {currentTier || 'none'}</div>
      <button onClick={() => onSelectTier('PRO')}>Select PRO</button>
    </div>
  )),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';

// Mock fetch
global.fetch = vi.fn();

describe('PricingPage', () => {
  let mockSearchParams: {
    get: ReturnType<typeof vi.fn>;
    getAll: ReturnType<typeof vi.fn>;
    has: ReturnType<typeof vi.fn>;
    keys: ReturnType<typeof vi.fn>;
    values: ReturnType<typeof vi.fn>;
    entries: ReturnType<typeof vi.fn>;
    forEach: ReturnType<typeof vi.fn>;
    toString: ReturnType<typeof vi.fn>;
    size: number;
    append: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    sort: ReturnType<typeof vi.fn>;
  };
  let mockAuth: ReturnType<typeof useAuth>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockSearchParams = {
      get: vi.fn(),
      getAll: vi.fn(),
      has: vi.fn(),
      keys: vi.fn(),
      values: vi.fn(),
      entries: vi.fn(),
      forEach: vi.fn(),
      toString: vi.fn(),
      size: 0,
      append: vi.fn(),
      delete: vi.fn(),
      set: vi.fn(),
      sort: vi.fn(),
    };
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as ReadonlyURLSearchParams);
    
    mockAuth = {
      user: null,
      currentAccount: null,
      loading: false,
      accounts: [],
      isAdmin: false,
      setCurrentAccount: vi.fn(),
      currentProject: null,
      setCurrentProject: vi.fn(),
      signOut: vi.fn(),
      refreshAccounts: vi.fn(),
    };
    vi.mocked(useAuth).mockReturnValue(mockAuth as ReturnType<typeof useAuth>);
  });

  describe('Cold visitor flow', () => {
    it('should render pricing grid for unauthenticated users', () => {
      render(<PricingPage />);
      
      expect(screen.getByTestId('pricing-grid')).toBeInTheDocument();
      expect(screen.getByText('Authenticated: false')).toBeInTheDocument();
    });

    it('should show loading state while auth is loading', () => {
      mockAuth.loading = true;
      render(<PricingPage />);
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Invitation flow', () => {
    beforeEach(() => {
      vi.mocked(mockSearchParams.get).mockImplementation((key: string) => {
        if (key === 'flow') return 'invitation';
        if (key === 'token') return 'inv_token_123';
        return null;
      });
    });

    it('should handle invitation flow parameters', () => {
      render(<PricingPage />);
      
      expect(mockSearchParams.get).toHaveBeenCalledWith('flow');
      expect(mockSearchParams.get).toHaveBeenCalledWith('token');
    });

    it('should show invitation-specific messaging', () => {
      render(<PricingPage />);
      
      expect(screen.getByText(/Complete Your Account Setup/)).toBeInTheDocument();
    });
  });

  describe('Upgrade flow', () => {
    beforeEach(() => {
      vi.mocked(mockSearchParams.get).mockImplementation((key: string) => {
        if (key === 'flow') return 'upgrade';
        return null;
      });
      
      mockAuth.user = { 
        id: 'user_123', 
        email: 'user@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
      } as NonNullable<typeof mockAuth.user>;
      mockAuth.currentAccount = { 
        id: 'acc_123', 
        tier: 'PRO' as const,
        name: 'Test Account',
        slug: 'test-account',
        settings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as NonNullable<typeof mockAuth.currentAccount>;
    });

    it('should show current tier for authenticated users', async () => {
      render(<PricingPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Current Tier: PRO')).toBeInTheDocument();
      });
    });

    it('should show upgrade messaging', () => {
      render(<PricingPage />);
      
      expect(screen.getByText(/Upgrade Your Plan/)).toBeInTheDocument();
    });
  });

  describe('Tier selection', () => {
    it('should handle tier selection for unauthenticated users', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          sessionId: 'cs_123', 
          url: 'https://checkout.stripe.com/session' 
        }),
      } as Response);

      render(<PricingPage />);
      
      const selectButton = screen.getByText('Select PRO');
      selectButton.click();
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/stripe/create-checkout-session',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tier: 'PRO',
              flow: null,
              token: undefined,
            }),
          })
        );
      });
    });

    it('should handle tier selection with invitation token', async () => {
      vi.mocked(mockSearchParams.get).mockImplementation((key: string) => {
        if (key === 'flow') return 'invitation';
        if (key === 'token') return 'inv_token_123';
        return null;
      });

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          sessionId: 'cs_123', 
          url: 'https://checkout.stripe.com/session' 
        }),
      } as Response);

      render(<PricingPage />);
      
      const selectButton = screen.getByText('Select PRO');
      selectButton.click();
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/stripe/create-checkout-session',
          expect.objectContaining({
            body: JSON.stringify({
              tier: 'PRO',
              flow: 'invitation',
              token: 'inv_token_123',
            }),
          })
        );
      });
    });

    it('should handle API errors gracefully', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Payment failed' }),
      } as Response);

      render(<PricingPage />);
      
      const selectButton = screen.getByText('Select PRO');
      selectButton.click();
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Payment failed');
      });
    });

    it('should handle network errors', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      render(<PricingPage />);
      
      const selectButton = screen.getByText('Select PRO');
      selectButton.click();
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to create checkout session');
      });
    });
  });

  describe('Page headers', () => {
    it('should show default header for cold visitors', () => {
      render(<PricingPage />);
      
      expect(screen.getByText('Choose Your Plan')).toBeInTheDocument();
      expect(screen.getByText(/Start building professional websites/)).toBeInTheDocument();
    });

    it('should show invitation header', () => {
      vi.mocked(mockSearchParams.get).mockImplementation((key: string) => {
        if (key === 'flow') return 'invitation';
        return null;
      });
      
      render(<PricingPage />);
      
      expect(screen.getByText('Complete Your Account Setup')).toBeInTheDocument();
      expect(screen.getByText(/Choose a plan to activate your account/)).toBeInTheDocument();
    });

    it('should show upgrade header', () => {
      vi.mocked(mockSearchParams.get).mockImplementation((key: string) => {
        if (key === 'flow') return 'upgrade';
        return null;
      });
      
      mockAuth.user = { 
        id: 'user_123',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
      } as NonNullable<typeof mockAuth.user>;
      
      render(<PricingPage />);
      
      expect(screen.getByText('Upgrade Your Plan')).toBeInTheDocument();
      expect(screen.getByText(/Unlock more features and capabilities/)).toBeInTheDocument();
    });
  });
});