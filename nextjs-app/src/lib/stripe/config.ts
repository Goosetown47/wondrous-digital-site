import Stripe from 'stripe';
import { getAppUrl } from '@/lib/utils/app-url';
import { getStripeMode, getEnvironmentName } from '@/lib/utils/environment';

/**
 * Stripe configuration
 * Lazy loads the Stripe SDK to avoid initialization at module load time
 * Supports both test and live modes based on environment
 */

let stripeInstance: Stripe | null = null;

/**
 * Get or create the Stripe instance
 * Uses lazy loading to avoid initialization issues
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    // Log Stripe mode for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      const mode = getStripeMode();
      console.log(`🔑 Initializing Stripe in ${mode} mode for ${getEnvironmentName()}`);
    }

    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-07-30.basil',
      typescript: true,
    });
  }

  return stripeInstance;
}

/**
 * Stripe configuration constants
 */
export const STRIPE_CONFIG = {
  // Currency for all transactions
  currency: 'usd' as const,
  
  // Payment method types to accept
  paymentMethodTypes: ['card'] as const,
  
  // Checkout session mode
  mode: 'subscription' as const,
  
  // Success and cancel URLs (will be updated with actual domain)
  getSuccessUrl: (sessionId?: string) => {
    const baseUrl = getAppUrl();
    return `${baseUrl}/payment/success${sessionId ? `?session_id=${sessionId}` : ''}`;
  },
  
  getCancelUrl: () => {
    const baseUrl = getAppUrl();
    return `${baseUrl}/payment/cancel`;
  },
} as const;

/**
 * Stripe webhook event types we handle
 */
export const WEBHOOK_EVENTS = {
  CHECKOUT_COMPLETED: 'checkout.session.completed',
  PAYMENT_FAILED: 'invoice.payment_failed',
  SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  CUSTOMER_UPDATED: 'customer.updated',
} as const;

export type WebhookEventType = typeof WEBHOOK_EVENTS[keyof typeof WEBHOOK_EVENTS];