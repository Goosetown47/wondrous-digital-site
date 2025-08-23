import type { TierName } from '@/types/database';
import { getStripeMode } from '@/lib/utils/environment';

/**
 * Stripe price IDs for each tier
 * Supports both test and production modes
 */

interface TierPricing {
  monthlyPriceId: string;
  yearlyPriceId?: string;
  setupFeeId: string;
  displayPrice: number; // In cents
  setupFeeAmount: number; // In cents
}

// PRODUCTION Stripe Price IDs
const PRODUCTION_PRICE_IDS: Record<Exclude<TierName, 'FREE' | 'BASIC'>, TierPricing> = {
  PRO: {
    monthlyPriceId: 'price_1RgXbeAyYiuNghuYZ17FC9MK', // PRO Monthly $397 PROD
    yearlyPriceId: 'price_1RwqKuAyYiuNghuY3zj9y8Ho', // PRO Yearly $4,287 PROD
    setupFeeId: 'price_1RgXeBAyYiuNghuYFSfv8POh', // Marketing Platform Setup Fee $1,500 PROD
    displayPrice: 39700, // $397
    setupFeeAmount: 150000, // $1500
  },
  SCALE: {
    monthlyPriceId: 'price_1RgXcEAyYiuNghuYKvKDgOBW', // SCALE Monthly $697 PROD
    yearlyPriceId: 'price_1RwqM3AyYiuNghuYXwuImnnD', // SCALE Yearly $7,527 PROD
    setupFeeId: 'price_1RgXeBAyYiuNghuYFSfv8POh', // Marketing Platform Setup Fee $1,500 PROD
    displayPrice: 69700, // $697
    setupFeeAmount: 150000, // $1500
  },
  MAX: {
    monthlyPriceId: 'price_1RgXclAyYiuNghuYNX728lTl', // MAX Monthly $997 PROD
    yearlyPriceId: 'price_1RwqNOAyYiuNghuY98u6R6Fu', // MAX Yearly $10,767 PROD
    setupFeeId: 'price_1RgXeBAyYiuNghuYFSfv8POh', // Marketing Platform Setup Fee $1,500 PROD
    displayPrice: 99700, // $997
    setupFeeAmount: 150000, // $1500
  },
};

// TEST MODE Stripe Price IDs
// TODO: Replace these with your actual test price IDs from Stripe Dashboard
const TEST_PRICE_IDS: Record<Exclude<TierName, 'FREE' | 'BASIC'>, TierPricing> = {
  PRO: {
    monthlyPriceId: 'price_TEST_PRO_MONTHLY', // TODO: Replace with actual test price ID
    yearlyPriceId: 'price_TEST_PRO_YEARLY', // TODO: Replace with actual test price ID
    setupFeeId: 'price_TEST_SETUP_FEE', // TODO: Replace with actual test price ID
    displayPrice: 39700, // $397 - same as production
    setupFeeAmount: 150000, // $1500 - same as production
  },
  SCALE: {
    monthlyPriceId: 'price_TEST_SCALE_MONTHLY', // TODO: Replace with actual test price ID
    yearlyPriceId: 'price_TEST_SCALE_YEARLY', // TODO: Replace with actual test price ID
    setupFeeId: 'price_TEST_SETUP_FEE', // TODO: Replace with actual test price ID
    displayPrice: 69700, // $697 - same as production
    setupFeeAmount: 150000, // $1500 - same as production
  },
  MAX: {
    monthlyPriceId: 'price_TEST_MAX_MONTHLY', // TODO: Replace with actual test price ID
    yearlyPriceId: 'price_TEST_MAX_YEARLY', // TODO: Replace with actual test price ID
    setupFeeId: 'price_TEST_SETUP_FEE', // TODO: Replace with actual test price ID
    displayPrice: 99700, // $997 - same as production
    setupFeeAmount: 150000, // $1500 - same as production
  },
};

// PERFORM addon pricing (for future use in PACKET 3)
export const PERFORM_ADDON_PRICING = {
  monthlyPriceId: 'price_1RgXdcAyYiuNghuYDXhEEKyM', // PERFORM Monthly $459 PROD
  yearlyPriceId: 'price_1RwqOAAyYiuNghuYfoOQUaMV', // PERFORM Yearly $4,957 PROD
  setupFeeId: 'price_1RgXfRAyYiuNghuYVSQpUNRx', // SEO Platform Setup Fee $750 PROD
  displayPrice: 45900, // $459
  setupFeeAmount: 75000, // $750
};

// BASIC tier pricing (for reference, not currently used)
export const BASIC_PRICING = {
  monthlyPriceId: 'price_1RwqOvAyYiuNghuYtWrlZiUw', // BASIC Monthly $29 PROD
  displayPrice: 2900, // $29
};

/**
 * Get the appropriate price IDs based on current environment
 */
function getPriceIds(): Record<Exclude<TierName, 'FREE' | 'BASIC'>, TierPricing> {
  const stripeMode = getStripeMode();
  return stripeMode === 'live' ? PRODUCTION_PRICE_IDS : TEST_PRICE_IDS;
}

/**
 * Get pricing information for a tier
 */
export function getPricesByTier(tier: TierName): TierPricing | null {
  if (tier === 'FREE' || tier === 'BASIC') {
    // These tiers are not available for purchase
    return null;
  }
  
  const priceIds = getPriceIds();
  return priceIds[tier];
}

/**
 * Get all purchasable tiers with their pricing
 */
export function getPurchasableTiers(): Array<{
  tier: TierName;
  pricing: TierPricing;
}> {
  const priceIds = getPriceIds();
  return [
    { tier: 'PRO', pricing: priceIds.PRO },
    { tier: 'SCALE', pricing: priceIds.SCALE },
    { tier: 'MAX', pricing: priceIds.MAX },
  ];
}

/**
 * Tier features for display on pricing page
 * This data should match what's in the tier_features table
 */
export const TIER_FEATURES: Record<Exclude<TierName, 'FREE' | 'BASIC'>, {
  name: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}> = {
  PRO: {
    name: 'Professional',
    description: 'Perfect for growing businesses',
    features: [
      '5 Projects',
      '3 Team Members',
      'Custom Domains',
      'Marketing Platform Access',
      'Priority Support',
      'Remove Watermark',
      'Smart Sections',
    ],
  },
  SCALE: {
    name: 'Scale',
    description: 'Built for expanding teams',
    highlighted: true, // Popular badge
    features: [
      '10 Projects',
      '5 Team Members',
      'Custom Domains',
      'Marketing Platform Access',
      'Priority Support',
      'Remove Watermark',
      'Smart Sections',
      'Advanced Analytics',
    ],
  },
  MAX: {
    name: 'Maximum',
    description: 'Enterprise-ready solution',
    features: [
      '25 Projects',
      '10 Team Members',
      'Custom Domains',
      'Marketing Platform Access',
      'Dedicated Support',
      'Remove Watermark',
      'Smart Sections',
      'Advanced Analytics',
      'White Label Options',
    ],
  },
};