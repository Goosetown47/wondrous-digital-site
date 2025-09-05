'use client';

import { cn } from '@/lib/utils';
import type { TierName } from '@/types/database';

interface TierBadgeProps {
  tier: TierName;
  showBillingPeriod?: boolean;
  billingPeriod?: 'monthly' | 'yearly';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Tier Badge Component with standardized colors
 * 
 * Color specifications:
 * - MAX (Purple): BG #EFD0FA, Text #73248F
 * - SCALE (Blue): BG #DFF8FC, Text #247A8D
 * - PRO (Green): BG #CCF9D0, Text #197D3B
 * - BASIC (Gold): BG #FFE4BF, Text #B96427
 * - FREE (Charcoal): BG #F8F8F6, Text #1F1F1F
 */
export function TierBadge({ 
  tier, 
  showBillingPeriod = false, 
  billingPeriod,
  className,
  size = 'md' 
}: TierBadgeProps) {
  const getTierStyles = () => {
    switch (tier) {
      case 'MAX':
        return 'bg-[#EFD0FA] text-[#73248F]';
      case 'SCALE':
        return 'bg-[#DFF8FC] text-[#247A8D]';
      case 'PRO':
        return 'bg-[#CCF9D0] text-[#197D3B]';
      case 'BASIC':
        return 'bg-[#FFE4BF] text-[#B96427]';
      case 'FREE':
        return 'bg-[#F8F8F6] text-[#1F1F1F]';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'lg':
        return 'px-4 py-1.5 text-base';
      case 'md':
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  const displayText = showBillingPeriod && billingPeriod
    ? `${tier} ${billingPeriod === 'yearly' ? 'Yearly' : 'Monthly'}`
    : tier;

  return (
    <span 
      className={cn(
        'inline-flex items-center font-semibold rounded-full',
        getTierStyles(),
        getSizeStyles(),
        className
      )}
    >
      {displayText}
    </span>
  );
}