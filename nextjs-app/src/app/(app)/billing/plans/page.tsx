'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/providers/auth-provider';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { 
  getPurchasableTiers, 
  TIER_FEATURES, 
  PERFORM_ADDON_PRICING,
  TIER_PRICING 
} from '@/lib/stripe/prices';
import { TIER_HIERARCHY } from '@/lib/tier-features';
import type { Account, TierName } from '@/types/database';

interface AccountWithSetupFees extends Account {
  perform_setup_fee_paid?: boolean;
  perform_setup_fee_paid_at?: string;
}

export default function BillingPlansPage() {
  const router = useRouter();
  const { user, currentAccount } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accountDetails, setAccountDetails] = useState<AccountWithSetupFees | null>(null);
  const [yearlyBilling, setYearlyBilling] = useState(false);
  const [billingLoading, setBillingLoading] = useState(true);
  const [detectedBillingPeriod, setDetectedBillingPeriod] = useState<'monthly' | 'yearly' | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !currentAccount) {
      router.push('/dashboard');
      return;
    }
    fetchAccountDetails();
  }, [user, currentAccount, router]);

  const fetchAccountDetails = async () => {
    if (!currentAccount) return;
    
    setLoading(true);
    try {
      const { data: account, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', currentAccount.id)
        .single();
        
      if (error) throw error;
      setAccountDetails(account);
      
      // Detect current billing period if user has a subscription
      if (account.stripe_subscription_id && account.tier && account.tier !== 'FREE') {
        try {
          // Fetch subscription details to get current price ID
          const response = await fetch('/api/stripe/subscription-preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              accountId: account.id,
              targetTier: account.tier,
              action: 'downgrade', // Dummy action just to get current plan info
              billingPeriod: 'monthly', // Dummy, we'll detect the real one
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            // Check if current plan is yearly
            const isYearly = data.currentPlan?.isYearly;
            setYearlyBilling(isYearly);
            setDetectedBillingPeriod(isYearly ? 'yearly' : 'monthly');
          }
        } catch (error) {
          console.error('Error detecting billing period:', error);
        }
      }
      setBillingLoading(false);
    } catch (error) {
      console.error('Error fetching account details:', error);
      toast.error('Failed to load account information');
    } finally {
      setLoading(false);
      setBillingLoading(false);
    }
  };

  const handlePlanChange = async (targetTier: TierName, action: 'upgrade' | 'downgrade') => {
    if (!accountDetails) return;
    
    // For users without active subscriptions (FREE tier), use checkout session
    if (!accountDetails.stripe_subscription_id) {
      setCheckoutLoading(targetTier);
      try {
        const response = await fetch('/api/stripe/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tier: targetTier,
            accountId: accountDetails.id,
            billingPeriod: yearlyBilling ? 'yearly' : 'monthly',
            flow: 'billing',
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || 'Failed to create checkout session');
        }

        const { url } = await response.json();
        window.location.href = url;
      } catch (error) {
        console.error('Error creating checkout session:', error);
        toast.error('Failed to start checkout process');
        setCheckoutLoading(null);
      }
      return;
    }
    
    // For users with active subscriptions, redirect to confirmation page
    const params = new URLSearchParams({
      from: accountDetails.tier,
      to: targetTier,
      action: action,
      billing: yearlyBilling ? 'yearly' : 'monthly',
    });
    
    router.push(`/billing/confirm?${params.toString()}`);
  };

  const handleAddPerform = async () => {
    if (!accountDetails) return;
    
    // Check if user has a premium package
    if (accountDetails.tier === 'FREE' || accountDetails.tier === 'BASIC') {
      toast.error('PERFORM addon requires a premium package (PRO, SCALE, or MAX)');
      return;
    }
    
    // Redirect to confirmation page for PERFORM addon
    const params = new URLSearchParams({
      from: accountDetails.tier,
      to: accountDetails.tier, // Same tier, just adding addon
      action: 'addon',
      addon: 'PERFORM',
      billing: yearlyBilling ? 'yearly' : 'monthly',
    });
    
    router.push(`/billing/confirm?${params.toString()}`);
  };

  const handleRemovePerform = async () => {
    if (!accountDetails) return;
    
    setCheckoutLoading('PERFORM_REMOVE');
    try {
      // TODO: Implement remove PERFORM addon endpoint
      toast.info('Remove PERFORM feature coming soon');
      setCheckoutLoading(null);
    } catch (error) {
      console.error('Error removing PERFORM addon:', error);
      toast.error('Failed to remove PERFORM addon');
      setCheckoutLoading(null);
    }
  };

  if (loading || !accountDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const currentTier = accountDetails.tier;
  const hasPerformAddon = accountDetails.has_perform_addon;
  const hasMarketingSetupFeePaid = accountDetails.setup_fee_paid;
  const hasPerformSetupFeePaid = accountDetails.perform_setup_fee_paid;
  const tiers = getPurchasableTiers();

  // Exact yearly prices with 10% discount
  const getYearlyPrice = (tier: TierName): number => {
    const yearlyPrices: Record<string, number> = {
      PRO: 4287,   // $4,287/year (corrected from docs)
      SCALE: 7527, // $7,527/year  
      MAX: 10767,  // $10,767/year
    };
    return yearlyPrices[tier] || 0;
  };

  // Get yearly price for PERFORM addon
  const getPerformYearlyPrice = () => {
    return 4957; // $4,957/year
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      {/* Header with back button */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/billing')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Billing
        </Button>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription plan
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <Label htmlFor="yearly-billing" className="text-base">
          Monthly
        </Label>
        <Switch
          id="yearly-billing"
          checked={yearlyBilling}
          onCheckedChange={setYearlyBilling}
          disabled={billingLoading}
        />
        <Label htmlFor="yearly-billing" className="text-base">
          Yearly
          <Badge variant="secondary" className="ml-2">Save 10%</Badge>
        </Label>
      </div>

      {/* Plan Cards */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {tiers.map(({ tier, pricing }) => {
          const features = TIER_FEATURES[tier as keyof typeof TIER_FEATURES];
          // Check if this is the current plan AND billing period
          const isCurrentPlan = tier === currentTier;
          // Check if current billing matches the toggle
          const isCurrentBilling = isCurrentPlan && !billingLoading && 
            detectedBillingPeriod === (yearlyBilling ? 'yearly' : 'monthly');
          // Allow billing switch if on same tier but different billing period
          const isBillingSwitch = isCurrentPlan && !isCurrentBilling && !billingLoading && detectedBillingPeriod !== null;
          const tierLevel = TIER_HIERARCHY[tier];
          const currentLevel = TIER_HIERARCHY[currentTier];
          const isUpgrade = tierLevel > currentLevel;
          const isDowngrade = tierLevel < currentLevel;
          
          const monthlyPrice = pricing.displayPrice / 100;
          const yearlyPrice = getYearlyPrice(tier);
          const displayPrice = yearlyBilling ? yearlyPrice : monthlyPrice;
          const billingPeriod = yearlyBilling ? '/year' : '/month';

          // Show setup fee only for new customers or those upgrading from FREE/BASIC
          const shouldShowSetupFee = !hasMarketingSetupFeePaid && 
            (currentTier === 'FREE' || currentTier === 'BASIC');

          return (
            <Card 
              key={tier} 
              className={`relative ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
            >
              {features.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{features.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${displayPrice.toLocaleString()}</span>
                  <span className="text-muted-foreground">{billingPeriod}</span>
                </div>
                {!isCurrentPlan && shouldShowSetupFee && (
                  <p className="text-sm text-muted-foreground mt-2">
                    + $1,500 one-time Smart Marketing Platform setup fee
                  </p>
                )}
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Smart Marketing Platform Section */}
                  <div>
                    <h4 className="font-semibold mb-2">Smart Marketing Platform</h4>
                    <ul className="space-y-1 text-sm">
                      {features.marketingFeatures.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  {/* Platform Features Section */}
                  <div>
                    <h4 className="font-semibold mb-2">Platform Features</h4>
                    <ul className="space-y-1 text-sm">
                      {features.platformFeatures.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6">
                  {isCurrentBilling ? (
                    <Button className="w-full" disabled>
                      Current Plan ({yearlyBilling ? 'Yearly' : 'Monthly'})
                    </Button>
                  ) : isBillingSwitch ? (
                    <Button 
                      className="w-full" 
                      variant="secondary"
                      onClick={() => {
                        const params = new URLSearchParams({
                          from: currentTier,
                          to: currentTier,
                          action: 'switch-billing',
                          billing: yearlyBilling ? 'yearly' : 'monthly',
                        });
                        router.push(`/billing/confirm?${params.toString()}`);
                      }}
                      disabled={checkoutLoading !== null || !accountDetails?.stripe_subscription_id}
                    >
                      Switch to {yearlyBilling ? 'Yearly' : 'Monthly'}
                    </Button>
                  ) : isUpgrade ? (
                    <Button 
                      className="w-full" 
                      onClick={() => handlePlanChange(tier, 'upgrade')}
                      disabled={checkoutLoading !== null}
                    >
                      {checkoutLoading === tier ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Upgrade to {tier}
                    </Button>
                  ) : isDowngrade ? (
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => handlePlanChange(tier, 'downgrade')}
                      disabled={checkoutLoading !== null}
                    >
                      {checkoutLoading === tier ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Downgrade to {tier}
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* PERFORM Addon Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                PERFORM SEO Addon
              </CardTitle>
              <CardDescription>
                Advanced SEO tools to rank higher and drive more traffic
              </CardDescription>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold">
                ${yearlyBilling ? getPerformYearlyPrice().toLocaleString() : '459'}
              </span>
              <span className="text-muted-foreground">
                {yearlyBilling ? '/year' : '/month'}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <ul className="space-y-1 text-sm">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>AI SEO Automation</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Site Audits & 24/7 Monitoring</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Keyword Rank Tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Competitor Analysis</span>
              </li>
            </ul>
            <ul className="space-y-1 text-sm">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Google Business Profile Management</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Local SEO Heatmaps</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Content Optimization Scanner</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Automated SEO Reporting</span>
              </li>
            </ul>
          </div>
          
          <div className="mt-6 flex items-center justify-between">
            {!hasPerformAddon && !hasPerformSetupFeePaid && (
              <p className="text-sm text-muted-foreground">
                + $750 one-time SEO Platform setup fee
              </p>
            )}
            <div className="ml-auto">
              {hasPerformAddon ? (
                <Button 
                  onClick={handleRemovePerform}
                  disabled={checkoutLoading !== null}
                  variant="outline"
                >
                  {checkoutLoading === 'PERFORM_REMOVE' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Remove PERFORM
                </Button>
              ) : (
                <Button 
                  onClick={handleAddPerform}
                  disabled={checkoutLoading !== null || currentTier === 'FREE' || currentTier === 'BASIC'}
                >
                  {checkoutLoading === 'PERFORM' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="mr-2 h-4 w-4" />
                  )}
                  Purchase PERFORM
                </Button>
              )}
            </div>
          </div>
          {(currentTier === 'FREE' || currentTier === 'BASIC') && !hasPerformAddon && (
            <p className="text-sm text-muted-foreground mt-2 text-right">
              Requires PRO, SCALE, or MAX package
            </p>
          )}
        </CardContent>
      </Card>

    </div>
  );
}