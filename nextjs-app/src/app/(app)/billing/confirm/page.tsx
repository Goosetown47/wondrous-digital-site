'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/providers/auth-provider';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { TierName } from '@/types/database';

// Pricing data (matches your document)
const TIER_PRICING = {
  PRO: { monthly: 397, yearly: 4287, monthlyPrice: 397, yearlyPrice: 428700 },
  SCALE: { monthly: 697, yearly: 7527, monthlyPrice: 697, yearlyPrice: 752700 },
  MAX: { monthly: 997, yearly: 10767, monthlyPrice: 997, yearlyPrice: 1076700 },
} as const;

const PERFORM_PRICING = {
  monthly: 459,
  yearly: 4957,
  setupFee: 750,
};

// Feature differences between tiers
const TIER_FEATURES = {
  PRO: {
    userAccounts: 3,
    projects: 5,
    emails: 10000,
    smsCalls: 250,
    aiWords: 1000,
    premiumAutomations: 100,
    workflowAI: 25,
  },
  SCALE: {
    userAccounts: 5,
    projects: 10,
    emails: 20000,
    smsCalls: 750,
    aiWords: 5000,
    premiumAutomations: 500,
    workflowAI: 150,
  },
  MAX: {
    userAccounts: 10,
    projects: 25,
    emails: 45000,
    smsCalls: 1500,
    aiWords: 10000,
    premiumAutomations: 1000,
    workflowAI: 300,
  },
};

function BillingConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, currentAccount } = useAuth();
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [calculations, setCalculations] = useState<any>(null);

  // Get params from URL
  const currentTier = searchParams.get('from') as TierName;
  const targetTier = searchParams.get('to') as TierName;
  const action = searchParams.get('action') as 'upgrade' | 'downgrade' | 'addon' | 'switch-billing' | 'cancel-change';
  const billingPeriod = searchParams.get('billing') as 'monthly' | 'yearly';
  const addon = searchParams.get('addon'); // 'PERFORM' or null

  useEffect(() => {
    if (action === 'cancel-change') {
      // For cancel action, we just need basic account data
      if (!currentTier || !targetTier) {
        toast.error('Missing required information');
        router.push('/billing');
        return;
      }
      fetchAccountDetails();
    } else {
      // For other actions, validate all params
      if (!currentTier || !targetTier || !action) {
        toast.error('Missing required information');
        router.push('/billing/plans');
        return;
      }
      fetchSubscriptionData();
    }
  }, [currentTier, targetTier, action]);

  const fetchSubscriptionData = async () => {
    if (!currentAccount) return;
    
    setLoading(true);
    try {
      // Get account details including subscription info
      const { data: account } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', currentAccount.id)
        .single();
        
      if (!account) throw new Error('Account not found');
      
      // Get real subscription preview from Stripe
      const response = await fetch('/api/stripe/subscription-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: currentAccount.id,
          targetTier,
          action,
          billingPeriod,
          addon,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get subscription preview');
      }
      
      const previewData = await response.json();
      
      // Transform Stripe data to our calculations format
      const calcs = {
        amountOwedNow: previewData.changes?.immediateCharge || 0,
        credit: previewData.changes?.credit || 0,
        futureAmount: previewData.changes?.futureAmount || 0,
        setupFees: previewData.changes?.setupFees || previewData.setupFees || 0,
        nextBillingDate: new Date(previewData.changes?.nextBillingDate || previewData.nextBillingDate),
        totalDueToday: (previewData.changes?.immediateCharge || 0) + (previewData.changes?.setupFees || previewData.setupFees || 0),
        daysRemaining: previewData.daysRemaining || Math.floor((new Date(previewData.changes?.nextBillingDate || previewData.nextBillingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        monthsRemaining: previewData.monthsRemaining || Math.round(previewData.daysRemaining / 30) || 0,
        hasSubscription: previewData.hasSubscription,
        currentPeriod: previewData.currentPeriod,
        currentPlan: previewData.currentPlan,
        changes: previewData.changes, // Include all change data for deferred detection
        stripeLineItems: previewData.stripeLineItems, // Keep for debugging
      };
      
      console.log('Calculations debugging:', {
        amountOwedNow: calcs.amountOwedNow,
        credit: calcs.credit,
        monthsRemaining: calcs.monthsRemaining,
        daysRemaining: calcs.daysRemaining,
        nextBillingDate: calcs.nextBillingDate,
        currentPeriod: previewData.currentPeriod,
        rawPreviewData: previewData,
      });
      
      setCalculations(calcs);
      setSubscriptionData(account);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast.error('Failed to load billing information');
      router.push('/billing/plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountDetails = async () => {
    if (!currentAccount) return;
    
    setLoading(true);
    try {
      // Get account details
      const { data: account } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', currentAccount.id)
        .single();
        
      if (!account) throw new Error('Account not found');
      
      setSubscriptionData(account);
      // For cancel-change, we don't need complex calculations
      setCalculations({ 
        nextBillingDate: new Date(),
        hasSubscription: true,
      });
    } catch (error) {
      console.error('Error fetching account data:', error);
      toast.error('Failed to load account information');
      router.push('/billing');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!currentAccount) return;
    
    // For cancel-change action, we don't need subscriptionData
    if (action !== 'cancel-change' && !subscriptionData) return;
    
    setProcessingPayment(true);
    try {
      // Handle different action types
      if (action === 'cancel-change') {
        // Cancel the pending change
        const response = await fetch('/api/stripe/cancel-scheduled-change', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accountId: currentAccount.id,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to cancel planned change');
        }
        
        const result = await response.json();
        toast.success(result.message || 'Planned change cancelled successfully');
        router.push('/billing');
      } else if (addon === 'PERFORM') {
        // PERFORM addon purchase
        const response = await fetch('/api/stripe/addon-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            addon: 'PERFORM',
            accountId: currentAccount.id,
            isYearly: billingPeriod === 'yearly',
          }),
        });
        
        if (!response.ok) throw new Error('Failed to start checkout');
        const { url } = await response.json();
        window.location.href = url;
      } else if (action === 'upgrade') {
        // For upgrades, check if payment is required
        if (calculations.amountOwedNow > 0) {
          // Paid upgrade - use checkout flow
          const response = await fetch('/api/stripe/upgrade-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              targetTier,
              accountId: currentAccount.id,
              billingPeriod,
              prorationAmount: calculations.amountOwedNow,
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create checkout session');
          }
          
          const { url } = await response.json();
          window.location.href = url;
        } else {
          // Free upgrade (shouldn't happen, but handle it)
          const response = await fetch('/api/stripe/subscription-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              targetTier,
              accountId: currentAccount.id,
              billingPeriod,
              action,
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update subscription');
          }
          
          const result = await response.json();
          toast.success(result.message);
          router.push('/billing');
        }
      } else if (action === 'downgrade') {
        // Downgrade - direct update (no payment needed)
        const response = await fetch('/api/stripe/subscription-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetTier,
            accountId: currentAccount.id,
            billingPeriod,
            action,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update subscription');
        }
        
        const result = await response.json();
        toast.success(result.message);
        router.push('/billing');
      } else if (action === 'switch-billing') {
        // Billing period switch - handled like a downgrade (deferred or immediate based on backend logic)
        const response = await fetch('/api/stripe/subscription-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetTier,  // Same tier for billing switches
            accountId: currentAccount.id,
            billingPeriod,
            action,  // 'switch-billing'
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update subscription');
        }
        
        const result = await response.json();
        toast.success(result.message);
        router.push('/billing');
      }
    } catch (error) {
      console.error('Error processing change:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process change');
      setProcessingPayment(false);
    }
  };

  if (loading || !calculations) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Get billing day
  const billingDay = calculations.nextBillingDate.getDate();
  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  // Format dates
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Get current and new prices - use ACTUAL current billing period from Stripe
  const actualCurrentBillingPeriod = calculations.currentPlan?.interval || billingPeriod;
  const currentTierPricing = TIER_PRICING[currentTier as keyof typeof TIER_PRICING];
  const currentPrice = calculations.currentPlan?.amount || 
    (currentTierPricing ? currentTierPricing[actualCurrentBillingPeriod as 'monthly' | 'yearly'] : 0);
  
  const targetTierPricing = TIER_PRICING[targetTier as keyof typeof TIER_PRICING];
  const newPrice = targetTierPricing ? targetTierPricing[billingPeriod] : 0;

  // Get feature changes
  const currentFeatures = TIER_FEATURES[currentTier as keyof typeof TIER_FEATURES];
  const newFeatures = TIER_FEATURES[targetTier as keyof typeof TIER_FEATURES];

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Header */}
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/billing/plans')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold mb-2">
              {action === 'cancel-change' ? 'Cancel Planned Change' : 'Review Your Changes'}
            </h1>
            <p className="text-muted-foreground">
              {action === 'cancel-change' 
                ? 'Please review what will happen if you cancel your planned change.'
                : 'Please review this summary of changes to your account before we proceed.'}
            </p>
          </div>

          {/* Overview Section */}
          {action === 'cancel-change' ? (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-4">What Will Happen</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    You currently have a pending change from <strong>{currentTier}</strong> to <strong>{targetTier}</strong>
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    If you cancel this change, you will <strong>remain on your {currentTier} plan</strong>
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    Your billing will <strong>continue as normal</strong> at your current rate
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    You can still make plan changes in the future if needed
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-4">Overview</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    You are billed on the <strong>{billingDay}{getOrdinalSuffix(billingDay)} of each {actualCurrentBillingPeriod === 'yearly' ? 'year' : 'month'}</strong>
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    You are changing from <strong>{currentTier} {actualCurrentBillingPeriod === 'yearly' ? 'Yearly' : 'Monthly'} at ${Math.round(currentPrice).toLocaleString()} {actualCurrentBillingPeriod === 'yearly' ? 'a year' : 'a month'}</strong> to{' '}
                    <strong>{targetTier} {billingPeriod === 'yearly' ? 'Yearly' : 'Monthly'} at ${newPrice.toLocaleString()} {billingPeriod === 'yearly' ? 'a year' : 'a month'}</strong>
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    {action === 'upgrade' ? (
                      <>
                        You get <strong>immediate access</strong> to {targetTier} features{' '}
                        {billingPeriod !== actualCurrentBillingPeriod && (
                          <>with <strong>{billingPeriod} billing</strong></>
                        )}
                      </>
                    ) : action === 'downgrade' ? (
                      <>
                        On <strong>{formatDate(calculations.nextBillingDate)}</strong> your account will change to{' '}
                        <strong>{targetTier} {billingPeriod}</strong>
                      </>
                    ) : action === 'switch-billing' ? (
                      <>
                        {/* Check if this is a deferred billing switch (yearly to monthly) */}
                        {calculations.changes?.isScheduledChange ? (
                          <>
                            On <strong>{formatDate(new Date(calculations.changes.scheduledDate))}</strong> your billing will switch to{' '}
                            <strong>{billingPeriod}</strong>
                          </>
                        ) : (
                          <>
                            Your billing will switch to <strong>{billingPeriod}</strong> immediately
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        Your change will take effect immediately
                      </>
                    )}
                  </span>
                </div>
                {action === 'upgrade' && (
                  <>
                    {/* Billing Anniversary - Show change when yearly to monthly with credit */}
                    {(() => {
                      const hasYearlyToMonthlyCredit = actualCurrentBillingPeriod === 'yearly' && 
                                                       billingPeriod === 'monthly' && 
                                                       calculations.credit > 0;
                      
                      if (hasYearlyToMonthlyCredit) {
                        const creditExhaustionDate = new Date(Date.now() + (calculations.credit / newPrice) * 30 * 24 * 60 * 60 * 1000);
                        const newDay = parseInt(format(creditExhaustionDate, 'd'));
                        
                        if (billingDay !== newDay) {
                          return (
                            <div className="flex items-start gap-3">
                              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>
                                Your billing anniversary will change from the <strong>{billingDay}{getOrdinalSuffix(billingDay)}</strong> to the <strong>{newDay}{getOrdinalSuffix(newDay)}</strong>
                              </span>
                            </div>
                          );
                        }
                      }
                      
                      return (
                        <div className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>
                            Your billing anniversary <strong>stays the same</strong> ({billingDay}{getOrdinalSuffix(billingDay)})
                          </span>
                        </div>
                      );
                    })()}
                    {calculations.monthsRemaining > 0 && (
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>
                          You have <strong>{calculations.monthsRemaining} {calculations.monthsRemaining === 1 ? 'month' : 'months'} remaining</strong> in your current {currentTier} {actualCurrentBillingPeriod} billing period
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Billing Section - Don't show for cancel-change */}
          {action !== 'cancel-change' && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-4">Billing</h2>
            <div className="space-y-3">
              {action === 'upgrade' ? (
                <>
                  {calculations.monthsRemaining > 0 && (
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>
                        You will have <strong>{calculations.monthsRemaining} {calculations.monthsRemaining === 1 ? 'month' : 'months'}</strong> on your new {targetTier} {billingPeriod} plan before your next billing cycle
                      </span>
                    </div>
                  )}
                  {actualCurrentBillingPeriod === billingPeriod && (
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>
                        {targetTier} {billingPeriod === 'yearly' ? 'Yearly' : 'Monthly'} costs <strong>${Math.abs(newPrice - currentPrice).toLocaleString()} more {actualCurrentBillingPeriod === 'yearly' ? 'per year' : 'per month'}</strong>
                      </span>
                    </div>
                  )}
                  {calculations.amountOwedNow > 0 && (
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="font-medium">
                        <strong>You'll be charged ${calculations.amountOwedNow.toLocaleString()} today</strong> (prorated for {calculations.monthsRemaining || 'remaining'} {calculations.monthsRemaining === 1 ? 'month' : 'months'})
                      </span>
                    </div>
                  )}
                  {/* Handle yearly to monthly switch with credit */}
                  {actualCurrentBillingPeriod === 'yearly' && billingPeriod === 'monthly' && calculations.credit > 0 && (
                    <>
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>
                          You have <strong>${calculations.credit.toLocaleString()} in credit</strong> from your annual plan
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>
                          This credit covers <strong>{Math.floor(calculations.credit / newPrice)} months</strong> of {targetTier} monthly
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>
                          Monthly billing will resume in <strong>{format(new Date(Date.now() + (calculations.credit / newPrice) * 30 * 24 * 60 * 60 * 1000), 'MMMM yyyy')}</strong>
                        </span>
                      </div>
                    </>
                  )}
                  {/* Next full payment - calculate correctly based on credit */}
                  {(() => {
                    // For yearly to monthly with credit, use credit exhaustion date
                    const hasYearlyToMonthlyCredit = actualCurrentBillingPeriod === 'yearly' && 
                                                     billingPeriod === 'monthly' && 
                                                     calculations.credit > 0;
                    
                    const nextPaymentDate = hasYearlyToMonthlyCredit
                      ? new Date(Date.now() + (calculations.credit / newPrice) * 30 * 24 * 60 * 60 * 1000)
                      : calculations.nextBillingDate;
                    
                    return (
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>
                          Your next full payment of <strong>${newPrice.toLocaleString()}</strong> will be on{' '}
                          <strong>{formatDate(nextPaymentDate)}</strong>
                        </span>
                      </div>
                    );
                  })()}
                </>
              ) : action === 'downgrade' ? (
                <>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      You have paid for <strong>{currentTier} {actualCurrentBillingPeriod}</strong> until{' '}
                      <strong>{formatDate(calculations.nextBillingDate)}</strong>
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>No charge today</strong> - you'll keep {currentTier} until your paid period ends
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Your first payment of <strong>${newPrice.toLocaleString()}</strong> for {targetTier} will be on{' '}
                      <strong>{formatDate(calculations.nextBillingDate)}</strong>
                    </span>
                  </div>
                </>
              ) : action === 'switch-billing' ? (
                // Billing period switch - check if deferred or immediate
                <>
                  {calculations.changes?.isScheduledChange ? (
                    // Deferred billing switch (yearly to monthly)
                    <>
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>
                          You have paid for <strong>{targetTier} {actualCurrentBillingPeriod}</strong> until{' '}
                          <strong>{formatDate(new Date(calculations.changes.scheduledDate))}</strong>
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>No charge today</strong> - you'll keep your yearly rate for the full paid period
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>
                          Your first monthly payment of <strong>${newPrice.toLocaleString()}</strong> will be on{' '}
                          <strong>{formatDate(new Date(calculations.changes.scheduledDate))}</strong>
                        </span>
                      </div>
                    </>
                  ) : (
                    // Immediate billing switch (monthly to yearly)
                    <>
                      {calculations.credit > 0 && (
                        <div className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>
                            You will receive a credit of <strong>${calculations.credit.toLocaleString()}</strong> for unused time
                          </span>
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>
                          Your next payment of <strong>${newPrice.toLocaleString()}</strong> will be on{' '}
                          <strong>{formatDate(calculations.nextBillingDate)}</strong>
                        </span>
                      </div>
                    </>
                  )}
                </>
              ) : (
                // Other action types
                <></>
              )}
            </div>
          </div>
          )}

          {/* Account Changes Section - Don't show for cancel-change */}
          {action !== 'cancel-change' && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-2">Account Changes</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Important note: This is what's included in your monthly fee. You can still go over your usage
              amounts, at which point we charge per use pricing which you can find{' '}
              <a href="/pricing" className="text-primary hover:underline">here</a>.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>{newFeatures.userAccounts} user accounts</strong>
                  {newFeatures.userAccounts < currentFeatures.userAccounts && (
                    <span className="text-muted-foreground ml-1">
                      (down from {currentFeatures.userAccounts} user accounts)
                    </span>
                  )}
                  {newFeatures.userAccounts > currentFeatures.userAccounts && (
                    <span className="text-muted-foreground ml-1">
                      (up from {currentFeatures.userAccounts} user accounts)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>{newFeatures.projects} projects</strong>
                  {newFeatures.projects < currentFeatures.projects && (
                    <span className="text-muted-foreground ml-1">
                      (down from {currentFeatures.projects} projects)
                    </span>
                  )}
                  {newFeatures.projects > currentFeatures.projects && (
                    <span className="text-muted-foreground ml-1">
                      (up from {currentFeatures.projects} projects)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>{newFeatures.emails.toLocaleString()} emails</strong>
                  {newFeatures.emails < currentFeatures.emails && (
                    <span className="text-muted-foreground ml-1">
                      (down from {currentFeatures.emails.toLocaleString()} emails)
                    </span>
                  )}
                  {newFeatures.emails > currentFeatures.emails && (
                    <span className="text-muted-foreground ml-1">
                      (up from {currentFeatures.emails.toLocaleString()} emails)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>{newFeatures.smsCalls.toLocaleString()} SMS/calls</strong>
                  {newFeatures.smsCalls < currentFeatures.smsCalls && (
                    <span className="text-muted-foreground ml-1">
                      (down from {currentFeatures.smsCalls.toLocaleString()} sms/calls)
                    </span>
                  )}
                  {newFeatures.smsCalls > currentFeatures.smsCalls && (
                    <span className="text-muted-foreground ml-1">
                      (up from {currentFeatures.smsCalls.toLocaleString()} sms/calls)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>{newFeatures.aiWords.toLocaleString()} AI words</strong>
                  {newFeatures.aiWords < currentFeatures.aiWords && (
                    <span className="text-muted-foreground ml-1">
                      (down from {currentFeatures.aiWords.toLocaleString()} AI words)
                    </span>
                  )}
                  {newFeatures.aiWords > currentFeatures.aiWords && (
                    <span className="text-muted-foreground ml-1">
                      (up from {currentFeatures.aiWords.toLocaleString()} AI words)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>{newFeatures.premiumAutomations} premium automations</strong>
                  {newFeatures.premiumAutomations < currentFeatures.premiumAutomations && (
                    <span className="text-muted-foreground ml-1">
                      (down from {currentFeatures.premiumAutomations} premium automations)
                    </span>
                  )}
                  {newFeatures.premiumAutomations > currentFeatures.premiumAutomations && (
                    <span className="text-muted-foreground ml-1">
                      (up from {currentFeatures.premiumAutomations} premium automations)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>{newFeatures.workflowAI} workflow AI executions</strong>
                  {newFeatures.workflowAI < currentFeatures.workflowAI && (
                    <span className="text-muted-foreground ml-1">
                      (down from {currentFeatures.workflowAI} AI executions)
                    </span>
                  )}
                  {newFeatures.workflowAI > currentFeatures.workflowAI && (
                    <span className="text-muted-foreground ml-1">
                      (up from {currentFeatures.workflowAI} AI executions)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Warning for yearly to monthly switch */}
          {actualCurrentBillingPeriod === 'yearly' && billingPeriod === 'monthly' && action !== 'cancel-change' && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Note:</strong> Switching from annual to monthly billing costs <strong>${((newPrice * 12) - (TIER_PRICING[targetTier as keyof typeof TIER_PRICING].yearlyPrice || 0) / 100).toLocaleString()} more per year</strong>. 
                Consider keeping annual billing to save money.
              </AlertDescription>
            </Alert>
          )}

          {/* Divider */}
          <Separator className="my-8" />

          {/* Actions */}
          <div className="space-y-4">
            <Button
              size="lg"
              className="w-full h-14 text-lg bg-slate-800 hover:bg-slate-900"
              onClick={handleConfirm}
              disabled={processingPayment}
            >
              {processingPayment ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : null}
              {action === 'cancel-change'
                ? 'Cancel Planned Change'
                : action === 'upgrade' 
                  ? `Confirm Upgrade to ${targetTier}`
                  : action === 'downgrade'
                    ? `Confirm Downgrade to ${targetTier}`
                    : 'Confirm Changes'
              }
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => router.push('/billing/plans')}
              disabled={processingPayment}
            >
              {action === 'cancel-change' 
                ? 'Never mind, keep the scheduled change'
                : 'Never mind, keep my current plan'}
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 lg:mt-[76px]">
          <Card className="p-6">
            {/* Need Help? */}
            <div>
              <h3 className="font-semibold mb-3">Need help?</h3>
              <p className="text-sm text-muted-foreground">
                If you need help understanding these changes first check out our documentation regarding
                account changes <a href="/docs/billing" className="text-primary hover:underline">here</a>.
              </p>
            </div>
            
            <Separator className="my-6" />
            
            {/* Want to talk to someone? */}
            <div>
              <h3 className="font-semibold mb-3">Want to talk to someone?</h3>
              <p className="text-sm text-muted-foreground">
                Reach out to us at:{' '}
                <a href="mailto:hello@wondrousdigital.com" className="text-primary hover:underline">
                  hello@wondrousdigital.com
                </a>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function BillingConfirmPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <BillingConfirmContent />
    </Suspense>
  );
}