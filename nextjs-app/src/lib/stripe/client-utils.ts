/**
 * Client-safe Stripe utilities
 * These functions can be used in client components
 */

/**
 * Format currency for display
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/**
 * Get formatted price display for a tier
 */
export function getTierPriceDisplay(tier: string): {
  monthly: string;
  setupFee: string;
  total: string;
} {
  const prices: Record<string, { monthly: number; setup: number }> = {
    FREE: { monthly: 0, setup: 0 },
    BASIC: { monthly: 2900, setup: 0 },
    PRO: { monthly: 39700, setup: 150000 },
    SCALE: { monthly: 69700, setup: 150000 },
    MAX: { monthly: 99700, setup: 150000 },
  };

  const price = prices[tier] || { monthly: 0, setup: 0 };
  
  return {
    monthly: formatCurrency(price.monthly),
    setupFee: formatCurrency(price.setup),
    total: formatCurrency(price.monthly + price.setup),
  };
}