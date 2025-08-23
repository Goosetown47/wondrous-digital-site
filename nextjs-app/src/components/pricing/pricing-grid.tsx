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
        const features = TIER_FEATURES[tier];
        
        if (!pricing || !features) return null;

        return (
          <PricingCard
            key={tier}
            tier={tier}
            name={features.name}
            description={features.description}
            monthlyPrice={pricing.displayPrice}
            setupFee={pricing.setupFeeAmount}
            features={features.features}
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