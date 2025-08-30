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
const TEST_PRICE_IDS: Record<Exclude<TierName, 'FREE' | 'BASIC'>, TierPricing> = {
  PRO: {
    monthlyPriceId: 'price_1RgXKSAyYiuNghuY8997ajmt', // PRO Monthly TEST
    yearlyPriceId: 'price_1Rws76AyYiuNghuY3ODhD0pD', // PRO Yearly TEST
    setupFeeId: 'price_1RgXJLAyYiuNghuYFkAxotJ4', // Marketing Platform Setup Fee TEST
    displayPrice: 39700, // $397
    setupFeeAmount: 150000, // $1500
  },
  SCALE: {
    monthlyPriceId: 'price_1RgXLDAyYiuNghuYO7vO7iwe', // SCALE Monthly TEST
    yearlyPriceId: 'price_1Rws7gAyYiuNghuYWA1qawwo', // SCALE Yearly TEST
    setupFeeId: 'price_1RgXJLAyYiuNghuYFkAxotJ4', // Marketing Platform Setup Fee TEST
    displayPrice: 69700, // $697
    setupFeeAmount: 150000, // $1500
  },
  MAX: {
    monthlyPriceId: 'price_1RgXLqAyYiuNghuYwGyGgHav', // MAX Monthly TEST
    yearlyPriceId: 'price_1Rws8FAyYiuNghuY3tuqdA2u', // MAX Yearly TEST
    setupFeeId: 'price_1RgXJLAyYiuNghuYFkAxotJ4', // Marketing Platform Setup Fee TEST
    displayPrice: 99700, // $997
    setupFeeAmount: 150000, // $1500
  },
};

// PERFORM addon pricing (for future use in PACKET 3)
const PERFORM_ADDON_PRICING_PROD = {
  monthlyPriceId: 'price_1RgXdcAyYiuNghuYDXhEEKyM', // PERFORM Monthly $459 PROD
  yearlyPriceId: 'price_1RwqOAAyYiuNghuYfoOQUaMV', // PERFORM Yearly $4,957 PROD
  setupFeeId: 'price_1RgXfRAyYiuNghuYVSQpUNRx', // SEO Platform Setup Fee $750 PROD
  displayPrice: 45900, // $459
  setupFeeAmount: 75000, // $750
};

const PERFORM_ADDON_PRICING_TEST = {
  monthlyPriceId: 'price_1RgXNcAyYiuNghuYB9txOkxQ', // PERFORM Monthly TEST
  yearlyPriceId: 'price_1Rws98AyYiuNghuYNF49WAKD', // PERFORM Yearly TEST
  setupFeeId: 'price_1RgXNIAyYiuNghuYaaLOjLOu', // SEO Platform Setup Fee TEST
  displayPrice: 45900, // $459
  setupFeeAmount: 75000, // $750
};

export const PERFORM_ADDON_PRICING = getStripeMode() === 'live' 
  ? PERFORM_ADDON_PRICING_PROD 
  : PERFORM_ADDON_PRICING_TEST;

// BASIC tier pricing (for reference, not currently used)
const BASIC_PRICING_PROD = {
  monthlyPriceId: 'price_1RwqOvAyYiuNghuYtWrlZiUw', // BASIC Monthly $29 PROD
  displayPrice: 2900, // $29
};

const BASIC_PRICING_TEST = {
  monthlyPriceId: 'price_1Rws46AyYiuNghuYAkCZo5RA', // BASIC Monthly TEST
  displayPrice: 2900, // $29
};

export const BASIC_PRICING = getStripeMode() === 'live'
  ? BASIC_PRICING_PROD
  : BASIC_PRICING_TEST;

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
 * Export TIER_PRICING for direct access
 */
export const TIER_PRICING = getPriceIds();

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
  marketingFeatures: string[];
  platformFeatures: string[];
  highlighted?: boolean;
}> = {
  PRO: {
    name: 'PRO',
    marketingFeatures: [
      '10,000 emails',
      '250 SMS/calls',
      '1,000 AI words',
      '100 premium automation executions',
      '25 workflow AI executions',
      'Unlimited forms/calendar bookings',
    ],
    platformFeatures: [
      '3 user accounts',
      '5 projects',
      'Custom domains',
      'Premium support',
    ],
  },
  SCALE: {
    name: 'SCALE',
    highlighted: true, // Popular badge
    marketingFeatures: [
      '20,000 emails',
      '750 SMS/calls',
      '5,000 AI words',
      '500 premium automation executions',
      '150 workflow AI executions',
      'Unlimited forms/calendar bookings',
    ],
    platformFeatures: [
      '5 user accounts',
      '10 projects',
      'Custom domains',
      'Premium support',
    ],
  },
  MAX: {
    name: 'MAX',
    marketingFeatures: [
      '45,000 emails',
      '1,500 SMS/calls',
      '10,000 AI words',
      '1,000 premium automation executions',
      '300 workflow AI executions',
      'Unlimited forms/calendar bookings',
    ],
    platformFeatures: [
      '10 user accounts',
      '25 projects',
      'Custom domains',
      'Premium support',
    ],
  },
};