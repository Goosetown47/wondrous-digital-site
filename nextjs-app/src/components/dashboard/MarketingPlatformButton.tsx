'use client';

import { Button } from '@/components/ui/button';
import { Rocket } from 'lucide-react';
import { toast } from 'sonner';
import type { TierName } from '@/types/database';

interface MarketingPlatformButtonProps {
  tier: TierName;
  className?: string;
}

export function MarketingPlatformButton({ tier, className }: MarketingPlatformButtonProps) {
  // Only show for PRO, SCALE, and MAX tiers
  const canAccessMarketingPlatform = tier === 'PRO' || tier === 'SCALE' || tier === 'MAX';

  if (!canAccessMarketingPlatform) {
    return null;
  }

  const handleLaunch = () => {
    // TODO: Implement actual marketing platform launch
    toast.info('Marketing Platform coming soon!');
  };

  return (
    <Button 
      onClick={handleLaunch}
      className={className}
      size="lg"
    >
      <Rocket className="mr-2 h-5 w-5" />
      Launch Marketing Platform
    </Button>
  );
}