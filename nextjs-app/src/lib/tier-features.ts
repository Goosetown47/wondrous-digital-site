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
  
  // Use switch to avoid bracket notation
  let limits: TierLimits;
  switch (tier) {
    case 'FREE':
      limits = TIER_LIMITS.FREE;
      break;
    case 'PRO':
      limits = TIER_LIMITS.PRO;
      break;
    case 'SCALE':
      limits = TIER_LIMITS.SCALE;
      break;
    case 'MAX':
      limits = TIER_LIMITS.MAX;
      break;
    default:
      limits = TIER_LIMITS.FREE;
      break;
  }
  
  // Special case for SEO tools - requires PERFORM addon
  if (feature === 'seoTools') {
    return hasPerformAddon;
  }
  
  // Use Object.entries to safely access feature value
  const featureEntry = Object.entries(limits).find(([key]) => key === feature);
  const value = featureEntry ? featureEntry[1] : 0;
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
  // Use switch to get hierarchy values
  let currentHier: number;
  switch (tier) {
    case 'FREE':
      currentHier = TIER_HIERARCHY.FREE;
      break;
    case 'PRO':
      currentHier = TIER_HIERARCHY.PRO;
      break;
    case 'SCALE':
      currentHier = TIER_HIERARCHY.SCALE;
      break;
    case 'MAX':
      currentHier = TIER_HIERARCHY.MAX;
      break;
    default:
      currentHier = 0;
      break;
  }
  
  let minHier: number;
  switch (minimumTier) {
    case 'FREE':
      minHier = TIER_HIERARCHY.FREE;
      break;
    case 'PRO':
      minHier = TIER_HIERARCHY.PRO;
      break;
    case 'SCALE':
      minHier = TIER_HIERARCHY.SCALE;
      break;
    case 'MAX':
      minHier = TIER_HIERARCHY.MAX;
      break;
    default:
      minHier = 0;
      break;
  }
  return currentHier >= minHier;
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
  // Use switch to avoid bracket notation
  let tierLimits: TierLimits;
  switch (tier) {
    case 'FREE':
      tierLimits = TIER_LIMITS.FREE;
      break;
    case 'PRO':
      tierLimits = TIER_LIMITS.PRO;
      break;
    case 'SCALE':
      tierLimits = TIER_LIMITS.SCALE;
      break;
    case 'MAX':
      tierLimits = TIER_LIMITS.MAX;
      break;
    default:
      tierLimits = TIER_LIMITS.FREE;
      break;
  }
  
  // Get limit for specific resource
  let limit: number;
  if (resource === 'projects') {
    limit = tierLimits.projects;
  } else if (resource === 'users') {
    limit = tierLimits.users;
  } else {
    limit = 0;
  }
  
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
  // Use switch to avoid bracket notation
  let tierLimits: TierLimits;
  switch (tier) {
    case 'FREE':
      tierLimits = TIER_LIMITS.FREE;
      break;
    case 'PRO':
      tierLimits = TIER_LIMITS.PRO;
      break;
    case 'SCALE':
      tierLimits = TIER_LIMITS.SCALE;
      break;
    case 'MAX':
      tierLimits = TIER_LIMITS.MAX;
      break;
    default:
      tierLimits = TIER_LIMITS.FREE;
      break;
  }
  
  // Get limit for specific resource
  let limit: number;
  if (resource === 'projects') {
    limit = tierLimits.projects;
  } else if (resource === 'users') {
    limit = tierLimits.users;
  } else {
    limit = 0;
  }
  
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
      // Use Object.entries to safely access feature value
  const featureEntry = Object.entries(limits).find(([key]) => key === feature);
  const value = featureEntry ? featureEntry[1] : 0;
      return typeof value === 'boolean' ? value : value > 0;
    })
    .map(([tierName]) => tierName as TierName)
    .filter(tierName => {
      // Use switch to get hierarchy values
      let tierHierarchy: number;
      switch (tierName) {
        case 'FREE':
          tierHierarchy = TIER_HIERARCHY.FREE;
          break;
        case 'PRO':
          tierHierarchy = TIER_HIERARCHY.PRO;
          break;
        case 'SCALE':
          tierHierarchy = TIER_HIERARCHY.SCALE;
          break;
        case 'MAX':
          tierHierarchy = TIER_HIERARCHY.MAX;
          break;
        default:
          tierHierarchy = 0;
          break;
      }
      
      let currentHierarchy: number;
      switch (currentTier) {
        case 'FREE':
          currentHierarchy = TIER_HIERARCHY.FREE;
          break;
        case 'PRO':
          currentHierarchy = TIER_HIERARCHY.PRO;
          break;
        case 'SCALE':
          currentHierarchy = TIER_HIERARCHY.SCALE;
          break;
        case 'MAX':
          currentHierarchy = TIER_HIERARCHY.MAX;
          break;
        default:
          currentHierarchy = 0;
          break;
      }
      return tierHierarchy > currentHierarchy;
    });
  
  if (availableTiers.length === 0) {
    // Use switch to get hierarchy value
    let currentHierarchy: number;
    switch (currentTier) {
      case 'FREE':
        currentHierarchy = TIER_HIERARCHY.FREE;
        break;
      case 'PRO':
        currentHierarchy = TIER_HIERARCHY.PRO;
        break;
      case 'SCALE':
        currentHierarchy = TIER_HIERARCHY.SCALE;
        break;
      case 'MAX':
        currentHierarchy = TIER_HIERARCHY.MAX;
        break;
      default:
        currentHierarchy = 0;
        break;
    }
    if (currentHierarchy === TIER_HIERARCHY.MAX) {
      return 'You already have the highest tier available.';
    }
    return 'This feature is not available in your current tier.';
  }
  
  const minimumTier = availableTiers.reduce((min, current) => {
    // Use switch to get hierarchy values
    let currentHierarchy: number;
    switch (current) {
      case 'FREE':
        currentHierarchy = TIER_HIERARCHY.FREE;
        break;
      case 'PRO':
        currentHierarchy = TIER_HIERARCHY.PRO;
        break;
      case 'SCALE':
        currentHierarchy = TIER_HIERARCHY.SCALE;
        break;
      case 'MAX':
        currentHierarchy = TIER_HIERARCHY.MAX;
        break;
      default:
        currentHierarchy = 0;
        break;
    }
    
    let minHierarchy: number;
    switch (min) {
      case 'FREE':
        minHierarchy = TIER_HIERARCHY.FREE;
        break;
      case 'PRO':
        minHierarchy = TIER_HIERARCHY.PRO;
        break;
      case 'SCALE':
        minHierarchy = TIER_HIERARCHY.SCALE;
        break;
      case 'MAX':
        minHierarchy = TIER_HIERARCHY.MAX;
        break;
      default:
        minHierarchy = 0;
        break;
    }
    return currentHierarchy < minHierarchy ? current : min;
  });
  
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
  // Use switch to avoid bracket notation
  let limits: TierLimits;
  switch (tier) {
    case 'FREE':
      limits = TIER_LIMITS.FREE;
      break;
    case 'PRO':
      limits = TIER_LIMITS.PRO;
      break;
    case 'SCALE':
      limits = TIER_LIMITS.SCALE;
      break;
    case 'MAX':
      limits = TIER_LIMITS.MAX;
      break;
    default:
      limits = TIER_LIMITS.FREE;
      break;
  }
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
  // Use switch to get hierarchy values
  let hierarchy1: number;
  switch (tier1) {
    case 'FREE':
      hierarchy1 = TIER_HIERARCHY.FREE;
      break;
    case 'PRO':
      hierarchy1 = TIER_HIERARCHY.PRO;
      break;
    case 'SCALE':
      hierarchy1 = TIER_HIERARCHY.SCALE;
      break;
    case 'MAX':
      hierarchy1 = TIER_HIERARCHY.MAX;
      break;
    default:
      hierarchy1 = 0;
      break;
  }
  
  let hierarchy2: number;
  switch (tier2) {
    case 'FREE':
      hierarchy2 = TIER_HIERARCHY.FREE;
      break;
    case 'PRO':
      hierarchy2 = TIER_HIERARCHY.PRO;
      break;
    case 'SCALE':
      hierarchy2 = TIER_HIERARCHY.SCALE;
      break;
    case 'MAX':
      hierarchy2 = TIER_HIERARCHY.MAX;
      break;
    default:
      hierarchy2 = 0;
      break;
  }
  
  if (hierarchy1 < hierarchy2) return -1;
  if (hierarchy1 > hierarchy2) return 1;
  return 0;
}