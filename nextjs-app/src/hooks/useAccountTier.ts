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
  
  // Get limits for current tier
  const limits = TIER_LIMITS[tier];
  
  // Override SEO tools if PERFORM addon is active
  const effectiveLimits: TierLimits = {
    ...limits,
    seoTools: hasPerformAddon,
  };
  
  /**
   * Check if a specific feature is available for the current tier
   */
  const canUseFeature = (feature: keyof TierLimits): boolean => {
    const value = effectiveLimits[feature];
    return typeof value === 'boolean' ? value : value !== 0;
  };
  
  /**
   * Check if the current tier meets or exceeds a minimum tier requirement
   */
  const meetsMinimumTier = (minimumTier: TierName): boolean => {
    return TIER_HIERARCHY[tier] >= TIER_HIERARCHY[minimumTier];
  };
  
  /**
   * Check if a user can create more of a limited resource
   */
  const canCreateMore = (
    resource: 'projects' | 'users',
    currentCount: number
  ): boolean => {
    const limit = effectiveLimits[resource];
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
    const limit = effectiveLimits[resource];
    return Math.max(0, limit - currentCount);
  };
  
  /**
   * Get upgrade message for a feature
   */
  const getUpgradeMessage = (feature: keyof TierLimits): string => {
    // Find the minimum tier that has this feature
    const availableTiers = Object.entries(TIER_LIMITS)
      .filter(([, limits]) => {
        const value = limits[feature];
        return typeof value === 'boolean' ? value : value > 0;
      })
      .map(([tierName]) => tierName as TierName);
    
    if (availableTiers.length === 0) {
      return 'This feature is not available in any tier.';
    }
    
    const minimumTier = availableTiers.reduce((min, current) => 
      TIER_HIERARCHY[current] < TIER_HIERARCHY[min] ? current : min
    );
    
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
    limits: effectiveLimits,
    canUseFeature,
    meetsMinimumTier,
    canCreateMore,
    getRemainingCount,
    getUpgradeMessage,
    canAccessContent,
  };
}