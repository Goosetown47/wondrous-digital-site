import type { Account, TierName } from '@/types/database';

export interface TierLimits {
  projects: number;
  users: number;
  customDomains: boolean;
  advancedAnalytics: boolean;
  prioritySupport: boolean;
  whiteLabel: boolean;
  apiAccess: boolean;
  seoTools: boolean;
  marketingPlatform: boolean;
}

// Define tier limits based on business requirements
export const TIER_LIMITS: Record<TierName, TierLimits> = {
  FREE: {
    projects: 1,
    users: 1,
    customDomains: false,
    advancedAnalytics: false,
    prioritySupport: false,
    whiteLabel: false,
    apiAccess: false,
    seoTools: false,
    marketingPlatform: false,
  },
  BASIC: {
    projects: 3,
    users: 1,  // Updated from 3 to 1
    customDomains: true,
    advancedAnalytics: false,
    prioritySupport: false,  // Regular support
    whiteLabel: false,
    apiAccess: false,
    seoTools: false,
    marketingPlatform: false,  // No Smart Marketing Platform
  },
  PRO: {
    projects: 5,  // Updated from 10 to 5
    users: 3,  // Updated from 10 to 3
    customDomains: true,
    advancedAnalytics: true,
    prioritySupport: true,  // Premium support
    whiteLabel: false,
    apiAccess: true,
    seoTools: false,
    marketingPlatform: true,  // Smart Marketing Platform included
  },
  SCALE: {
    projects: 10,  // Updated from 50 to 10
    users: 5,  // Updated from 50 to 5
    customDomains: true,
    advancedAnalytics: true,
    prioritySupport: true,  // Premium support
    whiteLabel: true,
    apiAccess: true,
    seoTools: false,
    marketingPlatform: true,  // Smart Marketing Platform included
  },
  MAX: {
    projects: 25,  // Updated from unlimited to 25
    users: 10,  // Updated from unlimited to 10
    customDomains: true,
    advancedAnalytics: true,
    prioritySupport: true,  // Premium support
    whiteLabel: true,
    apiAccess: true,
    seoTools: false,
    marketingPlatform: true,  // Smart Marketing Platform included
  },
};

// Tier hierarchy for comparison
export const TIER_HIERARCHY: Record<TierName, number> = {
  FREE: 0,
  BASIC: 1,
  PRO: 2,
  SCALE: 3,
  MAX: 4,
};

/**
 * Check if a specific feature is available for a given account
 */
export function canUseFeature(
  account: Pick<Account, 'tier' | 'has_perform_addon'> | null,
  feature: keyof TierLimits
): boolean {
  if (!account) return false;
  
  const tier = account.tier || 'FREE';
  const hasPerformAddon = account.has_perform_addon || false;
  
  const limits = TIER_LIMITS[tier];
  
  // Special case for SEO tools - requires PERFORM addon
  if (feature === 'seoTools') {
    return hasPerformAddon;
  }
  
  const value = limits[feature];
  return typeof value === 'boolean' ? value : value !== 0;
}

/**
 * Check if an account meets or exceeds a minimum tier requirement
 */
export function meetsMinimumTier(
  account: Pick<Account, 'tier'> | null,
  minimumTier: TierName
): boolean {
  if (!account) return false;
  
  const tier = account.tier || 'FREE';
  return TIER_HIERARCHY[tier] >= TIER_HIERARCHY[minimumTier];
}

/**
 * Check if an account can create more of a limited resource
 */
export function canCreateMore(
  account: Pick<Account, 'tier'> | null,
  resource: 'projects' | 'users',
  currentCount: number
): boolean {
  if (!account) return false;
  
  const tier = account.tier || 'FREE';
  const limit = TIER_LIMITS[tier][resource];
  
  // Check if current count is below the limit
  return currentCount < limit;
}

/**
 * Get remaining count for a limited resource
 */
export function getRemainingCount(
  account: Pick<Account, 'tier'> | null,
  resource: 'projects' | 'users',
  currentCount: number
): number {
  if (!account) return 0;
  
  const tier = account.tier || 'FREE';
  const limit = TIER_LIMITS[tier][resource];
  
  return Math.max(0, limit - currentCount);
}

/**
 * Get upgrade message for a feature
 */
export function getUpgradeMessage(
  account: Pick<Account, 'tier' | 'has_perform_addon'> | null,
  feature: keyof TierLimits
): string {
  const currentTier = account?.tier || 'FREE';
  const hasPerformAddon = account?.has_perform_addon || false;
  
  // Special message for SEO tools
  if (feature === 'seoTools' && !hasPerformAddon) {
    return 'Add the PERFORM SEO addon to access advanced SEO tools.';
  }
  
  // Find the minimum tier that has this feature
  const availableTiers = Object.entries(TIER_LIMITS)
    .filter(([, limits]) => {
      const value = limits[feature];
      return typeof value === 'boolean' ? value : value > 0;
    })
    .map(([tierName]) => tierName as TierName)
    .filter(tierName => TIER_HIERARCHY[tierName] > TIER_HIERARCHY[currentTier]);
  
  if (availableTiers.length === 0) {
    if (TIER_HIERARCHY[currentTier] === TIER_HIERARCHY.MAX) {
      return 'You already have the highest tier available.';
    }
    return 'This feature is not available in your current tier.';
  }
  
  const minimumTier = availableTiers.reduce((min, current) => 
    TIER_HIERARCHY[current] < TIER_HIERARCHY[min] ? current : min
  );
  
  return `Upgrade to ${minimumTier} or higher to access this feature.`;
}

/**
 * Check if content is restricted by tier
 */
export function canAccessContent(
  account: Pick<Account, 'tier'> | null,
  tierRestrictions: TierName[] | null | undefined
): boolean {
  // If no restrictions or empty array, content is available to all
  if (!tierRestrictions || tierRestrictions.length === 0) {
    return true;
  }
  
  if (!account) return false;
  
  const tier = account.tier || 'FREE';
  
  // Check if current tier is in the allowed list
  return tierRestrictions.includes(tier);
}

/**
 * Get list of features available for a tier
 */
export function getTierFeatures(tier: TierName, hasPerformAddon = false): string[] {
  const limits = TIER_LIMITS[tier];
  const features: string[] = [];
  
  if (limits.projects > 0) {
    features.push(`Up to ${limits.projects} project${limits.projects > 1 ? 's' : ''}`);
  }
  
  if (limits.users > 0) {
    features.push(`Up to ${limits.users} user account${limits.users > 1 ? 's' : ''}`);
  }
  
  if (limits.customDomains) features.push('Custom domains');
  if (limits.advancedAnalytics) features.push('Advanced analytics');
  if (limits.prioritySupport) features.push('Priority support');
  if (limits.whiteLabel) features.push('White-label branding');
  if (limits.apiAccess) features.push('API access');
  if (limits.marketingPlatform) features.push('Marketing platform');
  if (hasPerformAddon) features.push('SEO tools (PERFORM addon)');
  
  return features;
}

/**
 * Compare two tiers
 */
export function compareTiers(tier1: TierName, tier2: TierName): -1 | 0 | 1 {
  const hierarchy1 = TIER_HIERARCHY[tier1];
  const hierarchy2 = TIER_HIERARCHY[tier2];
  
  if (hierarchy1 < hierarchy2) return -1;
  if (hierarchy1 > hierarchy2) return 1;
  return 0;
}