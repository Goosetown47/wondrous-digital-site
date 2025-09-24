'use client';

import { PricingCard } from './pricing-card';
import { TIER_FEATURES, getPricesByTier } from '@/lib/stripe/prices';
import type { TierName } from '@/types/database';

interface PricingGridProps {
  currentPlan?: TierName | null;
  isAuthenticated: boolean;
  onSelectTier: (tier: TierName) => void;
}

export function PricingGrid({
  currentPlan,
  isAuthenticated,
  onSelectTier,
}: PricingGridProps) {
  const tiers: Array<Exclude<TierName, 'FREE' | 'BASIC'>> = ['PRO', 'SCALE', 'MAX'];

  return (
    <div className="grid gap-8 md:grid-cols-3">
      {tiers.map((tier) => {
        const pricing = getPricesByTier(tier);
        // Get features without bracket notation to avoid object injection
        let features = null;
        switch (tier) {
          case 'PRO':
            features = TIER_FEATURES.PRO;
            break;
          case 'SCALE':
            features = TIER_FEATURES.SCALE;
            break;
          case 'MAX':
            features = TIER_FEATURES.MAX;
            break;
        }
        
        if (!pricing || !features) return null;

        return (
          <PricingCard
            key={tier}
            tier={tier}
            name={features.name}
            description=""
            monthlyPrice={pricing.displayPrice}
            setupFee={pricing.setupFeeAmount}
            features={[...features.marketingFeatures, ...features.platformFeatures]}
            isPopular={features.highlighted}
            currentPlan={currentPlan}
            isAuthenticated={isAuthenticated}
            onSelect={onSelectTier}
          />
        );
      })}
    </div>
  );
}