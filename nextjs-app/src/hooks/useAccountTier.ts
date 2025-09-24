import { useAuth } from '@/providers/auth-provider';
import type { TierName } from '@/types/database';

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
const TIER_LIMITS: Record<TierName, TierLimits> = {
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
const TIER_HIERARCHY: Record<TierName, number> = {
  FREE: 0,
  BASIC: 1,
  PRO: 2,
  SCALE: 3,
  MAX: 4,
};

export function useAccountTier() {
  const { currentAccount: selectedAccount } = useAuth();
  
  const tier = selectedAccount?.tier || 'FREE';
  const hasPerformAddon = selectedAccount?.has_perform_addon || false;
  const isUnlocked = selectedAccount?.is_unlocked || false;
  
  // If account is unlocked, provide unlimited access
  const UNLIMITED_LIMITS: TierLimits = {
    projects: 999999, // Effectively unlimited
    users: 999999,    // Effectively unlimited
    customDomains: true,
    advancedAnalytics: true,
    prioritySupport: true,
    whiteLabel: true,
    apiAccess: true,
    seoTools: true,
    marketingPlatform: true,
  };
  
  // Get limits for current tier (use unlimited if unlocked)
  // Use switch to avoid bracket notation
  let limits: TierLimits;
  if (isUnlocked) {
    limits = UNLIMITED_LIMITS;
  } else {
    switch (tier) {
      case 'FREE':
        limits = TIER_LIMITS.FREE;
        break;
      case 'BASIC':
        limits = TIER_LIMITS.BASIC;
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
  }
  
  // Override SEO tools if PERFORM addon is active (only if not already unlocked)
  const effectiveLimits: TierLimits = {
    ...limits,
    seoTools: isUnlocked ? true : (hasPerformAddon || limits.seoTools),
  };
  
  /**
   * Check if a specific feature is available for the current tier
   */
  const canUseFeature = (feature: keyof TierLimits): boolean => {
    // Use Object.entries to safely access feature value
    const featureEntry = Object.entries(effectiveLimits).find(([key]) => key === feature);
    const value = featureEntry ? featureEntry[1] : false;
    return typeof value === 'boolean' ? value : value !== 0;
  };
  
  /**
   * Check if the current tier meets or exceeds a minimum tier requirement
   */
  const meetsMinimumTier = (minimumTier: TierName): boolean => {
    // Use switch to get hierarchy values
    let currentHierarchy: number;
    switch (tier) {
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
    
    let minimumHierarchy: number;
    switch (minimumTier) {
      case 'FREE':
        minimumHierarchy = TIER_HIERARCHY.FREE;
        break;
      case 'PRO':
        minimumHierarchy = TIER_HIERARCHY.PRO;
        break;
      case 'SCALE':
        minimumHierarchy = TIER_HIERARCHY.SCALE;
        break;
      case 'MAX':
        minimumHierarchy = TIER_HIERARCHY.MAX;
        break;
      default:
        minimumHierarchy = 0;
        break;
    }
    return currentHierarchy >= minimumHierarchy;
  };
  
  /**
   * Check if a user can create more of a limited resource
   */
  const canCreateMore = (
    resource: 'projects' | 'users',
    currentCount: number
  ): boolean => {
    // Get limit for specific resource
    let limit: number;
    if (resource === 'projects') {
      limit = effectiveLimits.projects;
    } else if (resource === 'users') {
      limit = effectiveLimits.users;
    } else {
      limit = 0;
    }
    // Check if current count is below the limit
    return currentCount < limit;
  };
  
  /**
   * Get remaining count for a limited resource
   */
  const getRemainingCount = (
    resource: 'projects' | 'users',
    currentCount: number
  ): number => {
    // Get limit for specific resource
    let limit: number;
    if (resource === 'projects') {
      limit = effectiveLimits.projects;
    } else if (resource === 'users') {
      limit = effectiveLimits.users;
    } else {
      limit = 0;
    }
    return Math.max(0, limit - currentCount);
  };
  
  /**
   * Get upgrade message for a feature
   */
  const getUpgradeMessage = (feature: keyof TierLimits): string => {
    // Find the minimum tier that has this feature
    const availableTiers = Object.entries(TIER_LIMITS)
      .filter(([, limits]) => {
        // Use Object.entries to safely access feature value
        const featureEntry = Object.entries(limits).find(([key]) => key === feature);
        const value = featureEntry ? featureEntry[1] : undefined;
        return typeof value === 'boolean' ? value : (typeof value === 'number' && value > 0);
      })
      .map(([tierName]) => tierName as TierName);
    
    if (availableTiers.length === 0) {
      return 'This feature is not available in any tier.';
    }
    
    const minimumTier = availableTiers.reduce((min, current) => {
      // Use switch to get hierarchy values
      let currentHier: number;
      switch (current) {
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
          currentHier = 999;
          break;
      }
      
      let minHier: number;
      switch (min) {
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
          minHier = 999;
          break;
      }
      return currentHier < minHier ? current : min;
    });
    
    if (feature === 'seoTools' && !hasPerformAddon) {
      return 'Add the PERFORM SEO addon to access advanced SEO tools.';
    }
    
    return `Upgrade to ${minimumTier} or higher to access this feature.`;
  };
  
  /**
   * Check if content is restricted by tier
   */
  const canAccessContent = (tierRestrictions: TierName[] | null): boolean => {
    // If no restrictions or empty array, content is available to all
    if (!tierRestrictions || tierRestrictions.length === 0) {
      return true;
    }
    
    // Check if current tier is in the allowed list
    return tierRestrictions.includes(tier);
  };
  
  return {
    tier,
    hasPerformAddon,
    isUnlocked,
    limits: effectiveLimits,
    canUseFeature,
    meetsMinimumTier,
    canCreateMore,
    getRemainingCount,
    getUpgradeMessage,
    canAccessContent,
  };
}