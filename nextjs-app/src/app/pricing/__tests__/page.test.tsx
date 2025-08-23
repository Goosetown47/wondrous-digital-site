import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import PricingPage from '../page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
}));

// Mock pricing addons component
vi.mock('@/components/pricing/pricing-addons', () => ({
  PricingAddons: vi.fn(() => <div data-testid="pricing-addons">Pricing Addons</div>),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

import { toast } from 'sonner';

// Mock fetch
global.fetch = vi.fn();

// Mock window.location.href
Object.defineProperty(window, 'location', {
  value: {
    href: '',
    origin: 'http://localhost:3000',
  },
  writable: true,
});

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

  beforeEach(() => {
    vi.clearAllMocks();
    window.location.href = '';
    
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
    // Type assertion through unknown to satisfy ReadonlyURLSearchParams interface
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as unknown as ReadonlyURLSearchParams);
  });

  describe('Cold visitor flow', () => {
    it('should render pricing page for unauthenticated users', () => {
      render(<PricingPage />);
      
      expect(screen.getByText('Choose the right plan for you')).toBeInTheDocument();
      expect(screen.getByText('Cancel any time, without any hassle')).toBeInTheDocument();
    });

    it('should show all pricing tiers', () => {
      render(<PricingPage />);
      
      expect(screen.getByText('PRO')).toBeInTheDocument();
      expect(screen.getByText('SCALE')).toBeInTheDocument();
      expect(screen.getByText('MAX')).toBeInTheDocument();
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
      
      expect(screen.getByText('Complete your account setup by selecting a plan')).toBeInTheDocument();
    });
  });

  describe('Upgrade flow', () => {
    beforeEach(() => {
      vi.mocked(mockSearchParams.get).mockImplementation((key: string) => {
        if (key === 'flow') return 'upgrade';
        return null;
      });
    });

    it('should show standard pricing page for upgrade flow', () => {
      render(<PricingPage />);
      
      // The pricing page doesn't actually show different content for upgrade flow
      expect(screen.getByText('Choose the right plan for you')).toBeInTheDocument();
    });

    it('should handle upgrade flow parameters', () => {
      render(<PricingPage />);
      
      expect(mockSearchParams.get).toHaveBeenCalledWith('flow');
    });
  });

  describe('Tier selection', () => {
    it('should handle tier selection for cold visitors with email dialog', async () => {
      render(<PricingPage />);
      
      const selectButton = screen.getByText('Get PRO');
      fireEvent.click(selectButton);
      
      // Should show email dialog for cold visitors
      await waitFor(() => {
        expect(screen.getByText('Get Started with PRO')).toBeInTheDocument();
        expect(screen.getByText('Enter your email to continue to checkout. You\'ll create your account after payment.')).toBeInTheDocument();
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
          url: 'https://checkout.stripe.com/session' 
        }),
      } as Response);

      render(<PricingPage />);
      
      const selectButton = screen.getByText('Get PRO');
      fireEvent.click(selectButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/stripe/create-checkout-session',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tier: 'PRO',
              flow: 'invitation',
              billingPeriod: 'monthly',
              invitationToken: 'inv_token_123',
              email: undefined,
            }),
          })
        );
      });
    });

    it('should handle API errors gracefully', async () => {
      vi.mocked(mockSearchParams.get).mockImplementation((key: string) => {
        if (key === 'flow') return 'invitation';
        if (key === 'token') return 'inv_token_123';
        return null;
      });

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Payment failed' }),
      } as Response);

      render(<PricingPage />);
      
      const selectButton = screen.getByText('Get PRO');
      fireEvent.click(selectButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Payment failed');
      });
    });

    it('should handle network errors', async () => {
      vi.mocked(mockSearchParams.get).mockImplementation((key: string) => {
        if (key === 'flow') return 'invitation';
        if (key === 'token') return 'inv_token_123';
        return null;
      });

      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      render(<PricingPage />);
      
      const selectButton = screen.getByText('Get PRO');
      fireEvent.click(selectButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Network error');
      });
    });
    
    it('should handle email submission for cold visitors', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          url: 'https://checkout.stripe.com/session' 
        }),
      } as Response);

      render(<PricingPage />);
      
      // Click Get PRO to open email dialog
      const selectButton = screen.getByText('Get PRO');
      fireEvent.click(selectButton);
      
      // Fill email and submit
      const emailInput = screen.getByPlaceholderText('you@example.com');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      
      const continueButton = screen.getByText('Continue to Checkout');
      fireEvent.click(continueButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/stripe/create-checkout-session',
          expect.objectContaining({
            body: JSON.stringify({
              tier: 'PRO',
              flow: 'cold',
              billingPeriod: 'monthly',
              invitationToken: undefined,
              email: 'test@example.com',
            }),
          })
        );
      });
    });
  });

  describe('Billing toggle', () => {
    it('should show monthly/yearly toggle', () => {
      render(<PricingPage />);
      
      expect(screen.getByText('Monthly')).toBeInTheDocument();
      expect(screen.getByText('Yearly')).toBeInTheDocument();
      expect(screen.getByText('Save 10%')).toBeInTheDocument();
    });

    it('should switch pricing when toggling billing period', () => {
      render(<PricingPage />);
      
      // Should show monthly pricing by default - all three tiers
      const monthlyPrices = screen.getAllByText(/\$\d+/);
      expect(monthlyPrices.length).toBeGreaterThan(0);
      
      // Check that PRO monthly price is displayed
      expect(monthlyPrices.some(el => el.textContent === '$397')).toBe(true);
      
      // Click on the radio button for yearly (not the label)
      const yearlyRadio = screen.getByRole('radio', { name: /Yearly/ });
      fireEvent.click(yearlyRadio);
      
      // Should show yearly pricing (monthly equivalent)
      const yearlyPrices = screen.getAllByText(/\$\d+/);
      expect(yearlyPrices.length).toBeGreaterThan(0);
      
      // Check that PRO yearly price (monthly equivalent) is displayed
      expect(yearlyPrices.some(el => el.textContent === '$357')).toBe(true);
    });
  });

  describe('Package features', () => {
    it('should display PRO package features', () => {
      render(<PricingPage />);
      
      expect(screen.getByText('5 Projects')).toBeInTheDocument();
      expect(screen.getByText('3 Team Members')).toBeInTheDocument();
      // Custom Domains appears multiple times (for different tiers)
      const customDomains = screen.getAllByText('Custom Domains');
      expect(customDomains.length).toBeGreaterThan(0);
    });

    it('should display SCALE package features', () => {
      render(<PricingPage />);
      
      expect(screen.getByText('10 Projects')).toBeInTheDocument();
      expect(screen.getByText('5 Team Members')).toBeInTheDocument();
      // Advanced Analytics appears for multiple tiers
      const analytics = screen.getAllByText('Advanced Analytics');
      expect(analytics.length).toBeGreaterThan(0);
    });

    it('should display MAX package features', () => {
      render(<PricingPage />);
      
      expect(screen.getByText('25 Projects')).toBeInTheDocument();
      // Team members text appears multiple times
      const teamMembers = screen.getAllByText(/Team Members/);
      expect(teamMembers.length).toBeGreaterThan(0);
      expect(screen.getByText('White Label Options')).toBeInTheDocument();
    });

    it('should show Most Popular badge for SCALE tier', () => {
      render(<PricingPage />);
      
      const badges = screen.getAllByText('Most Popular');
      expect(badges).toHaveLength(1);
    });
  });
});