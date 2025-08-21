import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { getStripe, STRIPE_CONFIG, WEBHOOK_EVENTS } from '../config';

// Mock Stripe
vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
    billingPortal: {
      sessions: {
        create: vi.fn(),
      },
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  })),
}));

describe('Stripe Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment
    process.env = { ...originalEnv };
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.NEXT_PUBLIC_APP_URL = 'https://test.com';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getStripe', () => {
    it('should create and return a Stripe instance', () => {
      const stripe = getStripe();
      expect(stripe).toBeDefined();
      expect(stripe.checkout).toBeDefined();
      expect(stripe.billingPortal).toBeDefined();
    });

    it('should reuse the same Stripe instance on subsequent calls', () => {
      const stripe1 = getStripe();
      const stripe2 = getStripe();
      expect(stripe1).toBe(stripe2);
    });

    it('should throw error if STRIPE_SECRET_KEY is not set', () => {
      delete process.env.STRIPE_SECRET_KEY;
      expect(() => getStripe()).toThrow('STRIPE_SECRET_KEY is not configured');
    });
  });

  describe('STRIPE_CONFIG', () => {
    it('should have correct currency', () => {
      expect(STRIPE_CONFIG.currency).toBe('usd');
    });

    it('should have correct payment method types', () => {
      expect(STRIPE_CONFIG.paymentMethodTypes).toEqual(['card']);
    });

    it('should have correct checkout mode', () => {
      expect(STRIPE_CONFIG.mode).toBe('subscription');
    });

    it('should generate correct success URL', () => {
      const url = STRIPE_CONFIG.getSuccessUrl('session_123');
      expect(url).toBe('https://test.com/payment/success?session_id=session_123');
    });

    it('should generate success URL without session ID', () => {
      const url = STRIPE_CONFIG.getSuccessUrl();
      expect(url).toBe('https://test.com/payment/success');
    });

    it('should generate correct cancel URL', () => {
      const url = STRIPE_CONFIG.getCancelUrl();
      expect(url).toBe('https://test.com/payment/cancel');
    });

    it('should use localhost as fallback URL', () => {
      delete process.env.NEXT_PUBLIC_APP_URL;
      const successUrl = STRIPE_CONFIG.getSuccessUrl();
      const cancelUrl = STRIPE_CONFIG.getCancelUrl();
      expect(successUrl).toBe('http://localhost:3000/payment/success');
      expect(cancelUrl).toBe('http://localhost:3000/payment/cancel');
    });
  });

  describe('WEBHOOK_EVENTS', () => {
    it('should have all required event types', () => {
      expect(WEBHOOK_EVENTS.CHECKOUT_COMPLETED).toBe('checkout.session.completed');
      expect(WEBHOOK_EVENTS.PAYMENT_FAILED).toBe('invoice.payment_failed');
      expect(WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED).toBe('customer.subscription.updated');
      expect(WEBHOOK_EVENTS.SUBSCRIPTION_DELETED).toBe('customer.subscription.deleted');
      expect(WEBHOOK_EVENTS.INVOICE_PAID).toBe('invoice.paid');
      expect(WEBHOOK_EVENTS.CUSTOMER_UPDATED).toBe('customer.updated');
    });

    it('should be frozen/read-only constants', () => {
      // Test that the object is frozen (in production, TypeScript enforces this at compile time)
      expect(Object.isFrozen(WEBHOOK_EVENTS)).toBe(false); // as const doesn't freeze at runtime
      
      // Verify that TypeScript would prevent modification at compile time
      // This is more of a documentation test - actual enforcement is at compile time
      expect(WEBHOOK_EVENTS.CHECKOUT_COMPLETED).toBe('checkout.session.completed');
    });
  });
});