import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BillingPage from '../page';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Mock next/navigation
vi.mock('next/navigation');

// Mock date-fns
vi.mock('date-fns');

// Mock auth provider
vi.mock('@/providers/auth-provider');

// Mock sonner toast
vi.mock('sonner');

describe('BillingPage', () => {
  const mockFetch = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
    
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-123' },
      currentAccount: { id: 'account-123' },
    } as any);
    
    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
    } as any);
    
    vi.mocked(format).mockImplementation((date) => new Date(date).toLocaleDateString());
    
    vi.mocked(toast).error = vi.fn();
  });

  describe('Loading State', () => {
    it('should show loading spinner initially', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      const { container } = render(<BillingPage />);
      
      // Look for the spinner by class since it doesn't have role="status"
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('No Subscription', () => {
    it('should display no subscription message', async () => {
      const mockBillingData = {
        account: {
          tier: 'FREE',
          stripeCustomerId: null,
          stripeSubscriptionId: null,
        },
        billingStatus: {
          status: 'no_subscription',
          message: 'No active subscription',
          paidUntil: null,
          amountDue: 0,
        },
        subscription: null,
        invoices: [],
        upcomingInvoice: null,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockBillingData,
      });

      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText(/You don't have an active subscription/)).toBeInTheDocument();
        expect(screen.getByText('Change Plans')).toBeInTheDocument();
      });
    });
  });

  describe('Active Subscription', () => {
    it('should display subscription details correctly', async () => {
      const mockBillingData = {
        account: {
          tier: 'MAX',
          stripeCustomerId: 'cus_123',
          stripeSubscriptionId: 'sub_123',
        },
        billingStatus: {
          status: 'paid',
          message: "You're paid until August 24, 2026",
          paidUntil: '2026-08-24T00:00:00Z',
          amountDue: 0,
        },
        subscription: {
          id: 'sub_123',
          status: 'active',
          currentPeriodEnd: '2026-08-24T12:00:00Z', // 24th day
          currentPeriodStart: '2025-08-24T12:00:00Z',
          billingPeriod: 'yearly',
          nextBillingDate: '2026-08-24T12:00:00Z',
          nextBillingAmount: 10767,
          cancelAtPeriodEnd: false,
          canceledAt: null,
          items: [{
            priceId: 'price_max_yearly',
            productName: 'Subscription',
            amount: 10767,
            quantity: 1,
            interval: 'year',
          }],
        },
        invoices: [],
        upcomingInvoice: null,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockBillingData,
      });

      render(<BillingPage />);

      await waitFor(() => {
        // Account Status
        expect(screen.getByText('ACTIVE')).toBeInTheDocument();
        
        // Summary section
        expect(screen.getByText(/You are billed on the/)).toBeInTheDocument();
        expect(screen.getByText(/24th of each year/)).toBeInTheDocument();
        const maxYearlyElements = screen.getAllByText(/MAX Yearly/);
        expect(maxYearlyElements.length).toBeGreaterThan(0);
        
        // Billing section
        expect(screen.getByText(/You have paid for/)).toBeInTheDocument();
        expect(screen.getByText(/Your next payment of/)).toBeInTheDocument();
        expect(screen.getByText('$10,767.00')).toBeInTheDocument();
      });
    });

    it('should show correct billing day with ordinal suffix', async () => {
      const testCases = [
        { day: 1, expected: '1st' },
        { day: 2, expected: '2nd' },
        { day: 3, expected: '3rd' },
        { day: 21, expected: '21st' },
        { day: 22, expected: '22nd' },
        { day: 23, expected: '23rd' },
      ];

      for (const { day, expected } of testCases) {
        vi.clearAllMocks();
        
        // Re-mock the auth and router for each iteration
        vi.mocked(useAuth).mockReturnValue({
          user: { id: 'user-123' },
          currentAccount: { id: 'account-123' },
        } as any);
        
        vi.mocked(useRouter).mockReturnValue({
          push: vi.fn(),
        } as any);
        
        const date = new Date(2026, 0, day); // January with specific day
        const mockBillingData = {
          account: {
            tier: 'PRO',
            stripeCustomerId: 'cus_123',
            stripeSubscriptionId: 'sub_123',
          },
          billingStatus: {
            status: 'paid',
            message: `You're paid until ${date.toISOString()}`,
            paidUntil: date.toISOString(),
            amountDue: 0,
          },
          subscription: {
            id: 'sub_123',
            status: 'active',
            currentPeriodEnd: date.toISOString(),
            currentPeriodStart: new Date(2025, 0, day).toISOString(),
            billingPeriod: 'monthly',
            nextBillingDate: date.toISOString(),
            nextBillingAmount: 397,
            cancelAtPeriodEnd: false,
            canceledAt: null,
            items: [],
          },
          invoices: [],
          upcomingInvoice: null,
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => mockBillingData,
        });

        const { unmount } = render(<BillingPage />);

        await waitFor(() => {
          expect(screen.getByText(new RegExp(`${expected} of each month`))).toBeInTheDocument();
        });

        unmount(); // Clean up for next iteration
      }
    });
  });

  describe('Invoice History', () => {
    it('should display and expand invoice details', async () => {
      const mockBillingData = {
        account: {
          tier: 'PRO',
          stripeCustomerId: 'cus_123',
          stripeSubscriptionId: 'sub_123',
        },
        billingStatus: {
          status: 'paid',
          message: "You're paid until next month",
          paidUntil: '2025-09-24T00:00:00Z',
          amountDue: 0,
        },
        subscription: {
          id: 'sub_123',
          status: 'active',
          billingPeriod: 'monthly',
          currentPeriodEnd: '2025-09-24T00:00:00Z',
          currentPeriodStart: '2025-08-24T00:00:00Z',
          nextBillingDate: '2025-09-24T00:00:00Z',
          nextBillingAmount: 397,
          cancelAtPeriodEnd: false,
          items: [],
        },
        invoices: [{
          id: 'inv_123',
          number: 'INV-001',
          status: 'PAID',
          amount: 397,
          subtotal: 397,
          total: 397,
          created: '2025-08-24T00:00:00Z',
          paidAt: '2025-08-24T00:00:00Z',
          lineItems: [{
            description: 'PRO Monthly',
            amount: 397,
            quantity: 1,
            isSetupFee: false,
            period: {
              start: '2025-08-24T00:00:00Z',
              end: '2025-09-24T00:00:00Z',
            },
          }],
          hostedInvoiceUrl: 'https://stripe.com/invoice',
          invoicePdf: 'https://stripe.com/invoice.pdf',
        }],
        upcomingInvoice: null,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockBillingData,
      });

      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText('Payment History')).toBeInTheDocument();
        // The page shows the invoice number (INV-001)
        expect(screen.getByText('Invoice INV-001')).toBeInTheDocument();
        // There might be multiple $397.00 on the page
        const priceElements = screen.getAllByText('$397.00');
        expect(priceElements.length).toBeGreaterThan(0);
        expect(screen.getByText('PAID')).toBeInTheDocument();
      });

      // Click to expand invoice - look for the invoice card by text
      const invoiceElements = screen.getAllByText(/Invoice/);
      const invoiceCard = invoiceElements[0].closest('div')?.parentElement?.parentElement;
      if (invoiceCard) {
        fireEvent.click(invoiceCard);
      }

      await waitFor(() => {
        // After expansion, there will be multiple instances of PRO Monthly
        const proMonthlyElements = screen.getAllByText('PRO Monthly');
        expect(proMonthlyElements.length).toBeGreaterThan(0);
        expect(screen.getByText('Item')).toBeInTheDocument();
        expect(screen.getByText('Date')).toBeInTheDocument();
        expect(screen.getByText('Amount')).toBeInTheDocument();
      });
    });

    it('should handle empty invoice history', async () => {
      const mockBillingData = {
        account: {
          tier: 'FREE',
          stripeCustomerId: null,
          stripeSubscriptionId: null,
        },
        billingStatus: {
          status: 'no_subscription',
          message: 'No active subscription',
          paidUntil: null,
          amountDue: 0,
        },
        subscription: null,
        invoices: [],
        upcomingInvoice: null,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockBillingData,
      });

      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText('Payment History')).toBeInTheDocument();
        expect(screen.getByText('No payment history available')).toBeInTheDocument();
      });
    });
  });

  describe('Quick Actions', () => {
    it('should show manage billing button for Stripe customers', async () => {
      const mockBillingData = {
        account: {
          tier: 'PRO',
          stripeCustomerId: 'cus_123',
          stripeSubscriptionId: 'sub_123',
        },
        billingStatus: {
          status: 'paid',
          message: "You're paid",
          paidUntil: '2025-09-24T00:00:00Z',
          amountDue: 0,
        },
        subscription: {
          id: 'sub_123',
          status: 'active',
          billingPeriod: 'monthly',
          currentPeriodEnd: '2025-09-24T00:00:00Z',
          currentPeriodStart: '2025-08-24T00:00:00Z',
          nextBillingDate: '2025-09-24T00:00:00Z',
          nextBillingAmount: 397,
          cancelAtPeriodEnd: false,
          items: [],
        },
        invoices: [],
        upcomingInvoice: null,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockBillingData,
      });

      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText('Manage Payment Method')).toBeInTheDocument();
        expect(screen.getByText('Change Plans')).toBeInTheDocument();
        expect(screen.getByText('Cancel Plan')).toBeInTheDocument();
      });
    });

    it('should handle customer portal creation', async () => {
      const mockBillingData = {
        account: {
          tier: 'PRO',
          stripeCustomerId: 'cus_123',
          stripeSubscriptionId: 'sub_123',
        },
        billingStatus: { status: 'paid' },
        subscription: {
          id: 'sub_123',
          status: 'active',
          billingPeriod: 'monthly',
        },
        invoices: [],
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockBillingData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ url: 'https://billing.stripe.com/session' }),
        });

      // Mock window.location.href
      delete (window as any).location;
      window.location = { href: '' } as any;

      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText('Manage Payment Method')).toBeInTheDocument();
      });

      const manageButton = screen.getByText('Manage Payment Method');
      fireEvent.click(manageButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/stripe/customer-portal',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });
    });
  });

  describe('Cancelled Subscription', () => {
    it('should show cancellation warning', async () => {
      const mockBillingData = {
        account: {
          tier: 'PRO',
          stripeCustomerId: 'cus_123',
          stripeSubscriptionId: 'sub_123',
        },
        billingStatus: {
          status: 'paid',
          message: "You're paid until September 24",
          paidUntil: '2025-09-24T00:00:00Z',
          amountDue: 0,
        },
        subscription: {
          id: 'sub_123',
          status: 'active',
          currentPeriodEnd: '2025-09-24T00:00:00Z',
          currentPeriodStart: '2025-08-24T00:00:00Z',
          billingPeriod: 'monthly',
          nextBillingDate: '2025-09-24T00:00:00Z',
          nextBillingAmount: 397,
          cancelAtPeriodEnd: true,
          canceledAt: '2025-08-20T00:00:00Z',
          items: [],
        },
        invoices: [],
        upcomingInvoice: null,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockBillingData,
      });

      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText(/Your subscription will end on/)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error message on fetch failure', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText(/Unable to load billing information/)).toBeInTheDocument();
      });
    });

    it('should redirect if no user or account', async () => {
      const mockPush = vi.fn();
      
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        currentAccount: null,
      } as any);

      vi.mocked(useRouter).mockReturnValue({
        push: mockPush,
      } as any);

      render(<BillingPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });
  });
});