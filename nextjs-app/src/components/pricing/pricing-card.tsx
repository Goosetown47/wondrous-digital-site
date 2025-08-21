'use client';

import { Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/stripe/client-utils';
import type { TierName } from '@/types/database';

interface PricingCardProps {
  tier: TierName;
  name: string;
  description: string;
  monthlyPrice: number; // in cents
  setupFee: number; // in cents
  features: string[];
  isPopular?: boolean;
  currentPlan?: TierName | null;
  isAuthenticated: boolean;
  onSelect: (tier: TierName) => void;
  disabled?: boolean;
}

export function PricingCard({
  tier,
  name,
  description,
  monthlyPrice,
  setupFee,
  features,
  isPopular = false,
  currentPlan,
  isAuthenticated,
  onSelect,
  disabled = false,
}: PricingCardProps) {
  const isCurrentPlan = currentPlan === tier;
  const isUpgrade = currentPlan && ['FREE', 'BASIC'].includes(currentPlan) && !['FREE', 'BASIC'].includes(tier);

  // Determine button text based on user state
  const getButtonText = () => {
    if (isCurrentPlan) return 'Current Plan';
    if (isUpgrade) return 'Upgrade';
    if (isAuthenticated) return 'Select Plan';
    return 'Get Started';
  };

  const getButtonVariant = () => {
    if (isCurrentPlan) return 'secondary';
    if (isPopular) return 'default';
    return 'outline';
  };

  return (
    <Card className={`relative flex flex-col ${isPopular ? 'border-primary shadow-lg' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="gap-1 px-3 py-1">
            <Star className="h-3 w-3 fill-current" />
            Most Popular
          </Badge>
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-2xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
        
        <div className="mt-4 space-y-1">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">{formatCurrency(monthlyPrice)}</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          {setupFee > 0 && (
            <p className="text-sm text-muted-foreground">
              + {formatCurrency(setupFee)} one-time setup fee
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={getButtonVariant()}
          size="lg"
          disabled={isCurrentPlan || disabled}
          onClick={() => onSelect(tier)}
        >
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  );
}