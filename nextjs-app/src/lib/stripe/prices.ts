import type { TierName } from '@/types/database';

/**
 * Stripe price IDs for each tier
 * These need to be created in the Stripe Dashboard and added here
 * 
 * TODO: Replace these with actual price IDs from Stripe Dashboard
 */

interface TierPricing {
  monthlyPriceId: string;
  yearlyPriceId?: string; // For future use in PACKET 3
  setupFeeId: string;
  displayPrice: number; // In cents
  setupFeeAmount: number; // In cents
}

// TEST Mode Stripe Price IDs from the dashboard
const PRICE_IDS: Record<Exclude<TierName, 'FREE' | 'BASIC'>, TierPricing> = {
  PRO: {
    monthlyPriceId: 'price_1RgXKSAyYiuNghuY8997ajmt', // PRO Monthly $397 TEST
    yearlyPriceId: 'price_1Rws76AyYiuNghuY3ODhD0pD', // PRO Yearly $4,287 TEST
    setupFeeId: 'price_1RgXJLAyYiuNghuYFkAxotJ4', // Marketing Platform Setup Fee $1,500 TEST
    displayPrice: 39700, // $397
    setupFeeAmount: 150000, // $1500
  },
  SCALE: {
    monthlyPriceId: 'price_1RgXLDAyYiuNghuYO7vO7iwe', // SCALE Monthly $697 TEST
    yearlyPriceId: 'price_1Rws7gAyYiuNghuYWA1qawwo', // SCALE Yearly $7,527 TEST
    setupFeeId: 'price_1RgXJLAyYiuNghuYFkAxotJ4', // Marketing Platform Setup Fee $1,500 TEST
    displayPrice: 69700, // $697
    setupFeeAmount: 150000, // $1500
  },
  MAX: {
    monthlyPriceId: 'price_1RgXLqAyYiuNghuYwGyGgHav', // MAX Monthly $997 TEST
    yearlyPriceId: 'price_1Rws8FAyYiuNghuY3tuqdA2u', // MAX Yearly $10,767 TEST
    setupFeeId: 'price_1RgXJLAyYiuNghuYFkAxotJ4', // Marketing Platform Setup Fee $1,500 TEST
    displayPrice: 99700, // $997
    setupFeeAmount: 150000, // $1500
  },
};

// PERFORM addon pricing (for future use in PACKET 3)
export const PERFORM_ADDON_PRICING = {
  monthlyPriceId: 'price_1RgXNcAyYiuNghuYB9txOkxQ', // PERFORM Monthly $459 TEST
  yearlyPriceId: 'price_1Rws98AyYiuNghuYNF49WAKD', // PERFORM Yearly $4,957 TEST
  setupFeeId: 'price_1RgXNIAyYiuNghuYaaLOjLOu', // SEO Platform Setup Fee $750 TEST
  displayPrice: 45900, // $459
  setupFeeAmount: 75000, // $750
};

// BASIC tier pricing (for reference, not currently used)
export const BASIC_PRICING = {
  monthlyPriceId: 'price_1Rws46AyYiuNghuYAkCZo5RA', // BASIC Monthly $29 TEST
  displayPrice: 2900, // $29
};

/**
 * Get pricing information for a tier
 */
export function getPricesByTier(tier: TierName): TierPricing | null {
  if (tier === 'FREE' || tier === 'BASIC') {
    // These tiers are not available for purchase
    return null;
  }
  
  return PRICE_IDS[tier];
}

/**
 * Get all purchasable tiers with their pricing
 */
export function getPurchasableTiers(): Array<{
  tier: TierName;
  pricing: TierPricing;
}> {
  return [
    { tier: 'PRO', pricing: PRICE_IDS.PRO },
    { tier: 'SCALE', pricing: PRICE_IDS.SCALE },
    { tier: 'MAX', pricing: PRICE_IDS.MAX },
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