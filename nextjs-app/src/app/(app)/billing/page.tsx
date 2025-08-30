'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { 
  AlertCircle,
  Download,
  Loader2,
  Check,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';
import { TIER_PRICING } from '@/lib/stripe/prices';
import type { TierName } from '@/types/database';

interface LineItem {
  description: string;
  amount: number;
  quantity: number;
  isSetupFee?: boolean;
  period?: {
    start: string;
    end: string;
  } | null;
}

interface Invoice {
  id: string;
  number: string | null;
  status: string;
  amount: number;
  subtotal: number;
  total: number;
  created: string;
  paidAt: string | null;
  lineItems: LineItem[];
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
}

interface BillingDetails {
  account: {
    tier: string;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    pendingTierChange: string | null;
    pendingTierChangeDate: string | null;
  };
  billingStatus: {
    status: 'paid' | 'overdue' | 'no_subscription';
    message: string;
    paidUntil: string | null;
    amountDue: number;
    creditBalance?: number;
    creditExhaustionDate?: string | null;
    creditCoversMonths?: number;
    billingAnniversaryChange?: { from: number; to: number } | null;
  };
  subscription: {
    id: string;
    status: string;
    currentPeriodEnd: string | null;
    currentPeriodStart: string | null;
    billingPeriod: 'monthly' | 'yearly';
    nextBillingDate: string | null;
    nextBillingAmount: number;
    cancelAtPeriodEnd: boolean;
    canceledAt: string | null;
    items: Array<{
      priceId: string;
      productName: string;
      amount: number;
      quantity: number;
      interval: string;
    }>;
  } | null;
  invoices: Invoice[];
  upcomingInvoice: {
    amount: number;
    dueDate: string | null;
    lineItems: Array<{
      description: string;
      amount: number;
      quantity: number;
    }>;
  } | null;
  pendingChange: {
    targetTier: string;
    changeDate: string;
    requestDate: string;
    currentTier: string;
    remainingTime: string;
    daysRemaining: number;
    newRate?: number;
    isBillingSwitch?: boolean;
    currentBillingPeriod?: 'monthly' | 'yearly';
    targetBillingPeriod?: 'monthly' | 'yearly';
    hasYearlyDiscount?: boolean;
  } | null;
}

// Loading component for Suspense
function BillingLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

// Main billing content component that uses useSearchParams
function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, currentAccount: selectedAccount } = useAuth();
  const [loading, setLoading] = useState(true);
  const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(null);
  const [creatingPortalSession, setCreatingPortalSession] = useState(false);
  const [expandedInvoices, setExpandedInvoices] = useState<string[]>([]);

  // Toggle invoice expansion
  const toggleInvoiceExpanded = useCallback((invoiceId: string) => {
    setExpandedInvoices(prev => 
      prev.includes(invoiceId)
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  }, []);

  // Handle success messages from upgrade flows
  useEffect(() => {
    const upgrade = searchParams.get('upgrade');
    
    if (upgrade === 'success') {
      toast.success('Upgrade successful! Your plan has been updated.');
      // Clean up the URL
      router.replace('/billing', { scroll: false });
    }
  }, [searchParams, router]);

  // Fetch billing details
  useEffect(() => {
    const fetchBillingDetails = async () => {
      if (!selectedAccount) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/stripe/billing-details?accountId=${selectedAccount.id}`);
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to fetch billing details');
        }
        
        const data = await response.json();
        setBillingDetails(data);
      } catch (error) {
        console.error('Error fetching billing details:', error);
        toast.error('Failed to load billing details');
      } finally {
        setLoading(false);
      }
    };

    fetchBillingDetails();
  }, [selectedAccount]);

  // Create Stripe portal session
  const handleManageBilling = async () => {
    if (!selectedAccount) return;

    setCreatingPortalSession(true);
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: selectedAccount.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Portal session error:', error);
      toast.error('Failed to open billing portal');
      setCreatingPortalSession(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!selectedAccount) {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select an account to view billing details.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { account, billingStatus, subscription, invoices = [], upcomingInvoice } = billingDetails || {};
  const hasActiveSubscription = subscription?.status === 'active';
  const hasStripeCustomer = !!account?.stripeCustomerId;

  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return 'N/A';
    }
  };

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Get ordinal suffix for day numbers (1st, 2nd, 3rd, etc.)
  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  // Get current billing day with proper formatting
  const getBillingDay = () => {
    if (!subscription || !subscription.currentPeriodEnd) return null;
    
    try {
      // Always use current period end for the actual billing day
      const date = new Date(subscription.currentPeriodEnd);
      const day = date.getDate();
      const interval = subscription.billingPeriod === 'yearly' ? 'year' : 'month';
      return `${day}${getOrdinalSuffix(day)} of each ${interval}`;
    } catch {
      return null;
    }
  };

  // Get plan display name
  const getPlanDisplayName = () => {
    if (!subscription || !account) return 'No active plan';
    const tierName = account.tier;
    const interval = subscription.billingPeriod === 'yearly' ? 'Yearly' : 'Monthly';
    return `${tierName} ${interval}`;
  };

  // Get paid until date (accounting for credit balance)
  const getPaidUntilDate = () => {
    if (!subscription) return null;
    // Use credit exhaustion date if available
    if (billingStatus?.creditExhaustionDate) {
      return formatDate(billingStatus.creditExhaustionDate);
    }
    return formatDate(subscription.currentPeriodEnd);
  };

  // Get next payment details (accounting for credit balance)
  const getNextPaymentDetails = () => {
    if (!subscription || subscription.cancelAtPeriodEnd) return null;
    
    // Use credit exhaustion date if available
    const nextDate = billingStatus?.creditExhaustionDate 
      ? formatDate(billingStatus.creditExhaustionDate)
      : subscription.nextBillingDate ? formatDate(subscription.nextBillingDate) : null;
    const nextAmount = subscription.nextBillingAmount;
    
    return { date: nextDate, amount: nextAmount };
  };

  // Feature data matching the confirmation page
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

  // Get the new tier pricing
  const getNewTierPricing = (targetTier: TierName, billingPeriod: 'monthly' | 'yearly') => {
    if (targetTier === 'FREE' || targetTier === 'BASIC') return 0;
    const tierPricing = TIER_PRICING[targetTier as 'PRO' | 'SCALE' | 'MAX'];
    if (!tierPricing) return 0;
    
    // Use the correct price based on billing period
    if (billingPeriod === 'yearly' && tierPricing.yearlyPriceId) {
      // Calculate yearly price from monthly (multiply by 12 and apply discount)
      const yearlyPrices = { PRO: 4287, SCALE: 7527, MAX: 10767 };
      return yearlyPrices[targetTier as keyof typeof yearlyPrices] || 0;
    } else {
      return tierPricing.displayPrice / 100; // Convert from cents to dollars
    }
  };

  const billingDay = getBillingDay();
  const planName = getPlanDisplayName();
  const paidUntil = getPaidUntilDate();
  const nextPayment = getNextPaymentDetails();

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground mt-2">
          Your subscription details and payment history
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="addons">Addons Preview</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="flex gap-8">
            {/* Main Content */}
            <div className="flex-1">
              {/* Account Status */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Account Status</h3>
                {hasActiveSubscription ? (
                  <Badge className="bg-green-500 text-white">ACTIVE</Badge>
                ) : (
                  <Badge variant="secondary">INACTIVE</Badge>
                )}
              </div>

              {/* Summary Section */}
              {hasActiveSubscription && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Summary</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5" />
                      <p>You are currently billed on the <strong>{billingDay || 'N/A'}</strong></p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5" />
                      <p>You are currently on the <strong>{planName}</strong> plan</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Section */}
              {hasActiveSubscription && (
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Billing</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5" />
                      <p>You have paid for <strong>{planName}</strong> until <strong>{paidUntil || 'N/A'}</strong></p>
                    </div>
                    {billingStatus?.creditBalance && billingStatus.creditBalance > 0 ? (
                      <div className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 mt-0.5" />
                        <p>You have a credit balance of <strong>{formatCurrency(billingStatus.creditBalance)}</strong> which covers approximately <strong>{billingStatus.creditCoversMonths?.toFixed(1)} month{billingStatus.creditCoversMonths !== 1 ? 's' : ''}</strong></p>
                      </div>
                    ) : null}
                    {!subscription?.cancelAtPeriodEnd && !billingDetails?.pendingChange && !billingStatus?.billingAnniversaryChange && (
                      <div className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 mt-0.5" />
                        <p>Your next payment of <strong>{formatCurrency(nextPayment?.amount || 0)}</strong> will be processed on <strong>{nextPayment?.date || 'N/A'}</strong></p>
                      </div>
                    )}
                    {subscription?.cancelAtPeriodEnd && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Your subscription will end on {formatDate(subscription.currentPeriodEnd)}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              )}

              {/* Upcoming Changes Section - Shows for credit anniversary changes or pending tier changes */}
              {billingStatus?.billingAnniversaryChange && !billingDetails?.pendingChange && (
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Upcoming Changes</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5" />
                      <p>
                        Starting <strong>{formatDate(billingStatus.creditExhaustionDate || null)}</strong>, your billing will move to the{' '}
                        <strong>{billingStatus.billingAnniversaryChange.to}{getOrdinalSuffix(billingStatus.billingAnniversaryChange.to)}</strong> of each month
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5" />
                      <p>Your next payment of <strong>{formatCurrency(nextPayment?.amount || 0)}</strong> will be processed on <strong>{nextPayment?.date || 'N/A'}</strong></p>
                    </div>
                  </div>
                </div>
              )}

              {/* Upcoming Changes Section - For pending tier changes */}
              {billingDetails?.pendingChange && (
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Upcoming Changes</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5" />
                      <p>
                        You scheduled a change to your subscription on <strong>{formatDate(billingDetails.pendingChange.requestDate)}</strong> to{' '}
                        <strong>
                          {billingDetails.pendingChange.targetTier}{' '}
                          {billingDetails.pendingChange.targetBillingPeriod === 'yearly' ? 'Yearly' : 'Monthly'}
                        </strong>
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5" />
                      <p>
                        Your account has <strong>{billingDetails.pendingChange.remainingTime}</strong> remaining of{' '}
                        <strong>
                          {billingDetails.pendingChange.currentTier}{' '}
                          {billingDetails.pendingChange.currentBillingPeriod === 'yearly' ? 'Yearly' : 'Monthly'}
                          {billingDetails.pendingChange.hasYearlyDiscount && ' at a 10% discount'}
                        </strong>
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5" />
                      <p>
                        The change to{' '}
                        <strong>
                          {billingDetails.pendingChange.targetTier}{' '}
                          {billingDetails.pendingChange.targetBillingPeriod === 'yearly' ? 'Yearly' : 'Monthly'}
                        </strong>{' '}
                        will occur on <strong>{formatDate(billingDetails.pendingChange.changeDate)}</strong>
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5" />
                      <p>
                        We will charge you at the new rate of{' '}
                        <strong>
                          {formatCurrency(billingDetails.pendingChange.newRate || 0)}
                          {billingDetails.pendingChange.targetBillingPeriod === 'yearly' ? '/year' : '/month'}
                        </strong>{' '}
                        on <strong>{formatDate(billingDetails.pendingChange.changeDate)}</strong>
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5" />
                      <p>We will remind you 30, 7, and 1 day before the change happens via email</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium mb-2">Account Changes</p>
                        <p className="text-sm text-muted-foreground mb-3">
                          Important note: This is what's included in your monthly fee. You can still go over your usage
                          amounts, at which point we charge per use pricing which you can find{' '}
                          <a href="/pricing" className="text-primary hover:underline">here</a>.
                        </p>
                        {billingDetails.pendingChange.currentTier !== 'FREE' && billingDetails.pendingChange.currentTier !== 'BASIC' && 
                         billingDetails.pendingChange.targetTier !== 'FREE' && billingDetails.pendingChange.targetTier !== 'BASIC' && (() => {
                          const currentFeatures = TIER_FEATURES[billingDetails.pendingChange.currentTier as keyof typeof TIER_FEATURES];
                          const newFeatures = TIER_FEATURES[billingDetails.pendingChange.targetTier as keyof typeof TIER_FEATURES];
                          
                          return (
                            <div className="space-y-2">
                              <div className="text-sm flex items-start">
                                <span className="mr-2">•</span>
                                <div>
                                  <strong>{newFeatures.userAccounts} user accounts</strong>
                                  {newFeatures.userAccounts !== currentFeatures.userAccounts && (
                                    <span className="text-muted-foreground ml-1">
                                      ({newFeatures.userAccounts < currentFeatures.userAccounts ? 'down' : 'up'} from {currentFeatures.userAccounts} user accounts)
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-sm flex items-start">
                                <span className="mr-2">•</span>
                                <div>
                                  <strong>{newFeatures.projects} projects</strong>
                                  {newFeatures.projects !== currentFeatures.projects && (
                                    <span className="text-muted-foreground ml-1">
                                      ({newFeatures.projects < currentFeatures.projects ? 'down' : 'up'} from {currentFeatures.projects} projects)
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-sm flex items-start">
                                <span className="mr-2">•</span>
                                <div>
                                  <strong>{newFeatures.emails.toLocaleString()} emails</strong>
                                  {newFeatures.emails !== currentFeatures.emails && (
                                    <span className="text-muted-foreground ml-1">
                                      ({newFeatures.emails < currentFeatures.emails ? 'down' : 'up'} from {currentFeatures.emails.toLocaleString()} emails)
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-sm flex items-start">
                                <span className="mr-2">•</span>
                                <div>
                                  <strong>{newFeatures.smsCalls.toLocaleString()} SMS/calls</strong>
                                  {newFeatures.smsCalls !== currentFeatures.smsCalls && (
                                    <span className="text-muted-foreground ml-1">
                                      ({newFeatures.smsCalls < currentFeatures.smsCalls ? 'down' : 'up'} from {currentFeatures.smsCalls.toLocaleString()} sms/calls)
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-sm flex items-start">
                                <span className="mr-2">•</span>
                                <div>
                                  <strong>{newFeatures.aiWords.toLocaleString()} AI words</strong>
                                  {newFeatures.aiWords !== currentFeatures.aiWords && (
                                    <span className="text-muted-foreground ml-1">
                                      ({newFeatures.aiWords < currentFeatures.aiWords ? 'down' : 'up'} from {currentFeatures.aiWords.toLocaleString()} AI words)
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-sm flex items-start">
                                <span className="mr-2">•</span>
                                <div>
                                  <strong>{newFeatures.premiumAutomations} premium automations</strong>
                                  {newFeatures.premiumAutomations !== currentFeatures.premiumAutomations && (
                                    <span className="text-muted-foreground ml-1">
                                      ({newFeatures.premiumAutomations < currentFeatures.premiumAutomations ? 'down' : 'up'} from {currentFeatures.premiumAutomations} premium automations)
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-sm flex items-start">
                                <span className="mr-2">•</span>
                                <div>
                                  <strong>{newFeatures.workflowAI} workflow AI executions</strong>
                                  {newFeatures.workflowAI !== currentFeatures.workflowAI && (
                                    <span className="text-muted-foreground ml-1">
                                      ({newFeatures.workflowAI < currentFeatures.workflowAI ? 'down' : 'up'} from {currentFeatures.workflowAI} AI executions)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* No Subscription Message */}
              {!hasActiveSubscription && (
                <Alert className="mb-8">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You don't have an active subscription. Choose a plan to get started.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="w-80">
              <Card>
                <CardHeader>
                  <CardTitle>Account Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hasStripeCustomer && (
                    <Button 
                      onClick={handleManageBilling}
                      disabled={creatingPortalSession}
                      className="w-full"
                      variant="default"
                    >
                      {creatingPortalSession ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Opening Portal...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Manage Payment Method
                        </>
                      )}
                    </Button>
                  )}
                  
                  <Button 
                    onClick={() => {
                      if (billingDetails?.pendingChange) {
                        // Navigate to cancel confirmation page
                        const params = new URLSearchParams({
                          action: 'cancel-change',
                          from: billingDetails.pendingChange.currentTier,
                          to: billingDetails.pendingChange.targetTier,
                        });
                        router.push(`/billing/confirm?${params.toString()}`);
                      } else {
                        // Navigate to plans page
                        router.push('/billing/plans');
                      }
                    }} 
                    variant={billingDetails?.pendingChange ? "destructive" : "outline"}
                    className="w-full"
                  >
                    {billingDetails?.pendingChange ? "Cancel Planned Change" : "Change Plans"}
                  </Button>
                  
                  {hasActiveSubscription && account?.tier !== 'FREE' && !subscription?.cancelAtPeriodEnd && (
                    <Button 
                      onClick={() => router.push('/billing/cancel')}
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700"
                    >
                      Cancel Plan
                    </Button>
                  )}

                  <Separator className="my-4" />
                  
                  <div>
                    <h4 className="font-medium mb-2">Want to talk to someone?</h4>
                    <p className="text-sm text-muted-foreground">
                      Reach out to us at:
                    </p>
                    <a 
                      href="mailto:hello@wondrousdigital.com"
                      className="text-sm text-primary hover:underline"
                    >
                      hello@wondrousdigital.com
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="history">
          <div>
            <h2 className="text-2xl font-bold mb-2">Payment History</h2>
            <p className="text-muted-foreground mb-6">Receipts and transaction details</p>
            
            {invoices.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-muted-foreground">
                    No payment history available
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {invoices.map((invoice) => {
                  const isExpanded = expandedInvoices.includes(invoice.id);
                  
                  return (
                    <Card key={invoice.id}>
                      <div 
                        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleInvoiceExpanded(invoice.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <button className="p-1">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>
                            <div>
                              <p className="font-medium">
                                {formatDate(invoice.created)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Invoice {invoice.number || invoice.id.slice(-8)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(invoice.total)}</p>
                            </div>
                            <Badge className={invoice.status === 'PAID' ? 'bg-green-500 text-white' : ''}>
                              {invoice.status}
                            </Badge>
                            {invoice.invoicePdf && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (invoice.invoicePdf) {
                                    window.open(invoice.invoicePdf, '_blank');
                                  }
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="border-t px-6 pb-4">
                          <div className="py-4 space-y-3">
                            <h4 className="font-medium text-sm">Line Items</h4>
                            {invoice.lineItems.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <div>
                                  <p className="font-medium">{item.description}</p>
                                  {item.period && (
                                    <p className="text-xs text-muted-foreground">
                                      {formatDate(item.period.start)} - {formatDate(item.period.end)}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p>{formatCurrency(item.amount)}</p>
                                  {item.quantity > 1 && (
                                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                            
                            <Separator className="my-3" />
                            
                            <div className="flex justify-between font-medium">
                              <p>Total</p>
                              <p>{formatCurrency(invoice.total)}</p>
                            </div>
                            
                            {invoice.paidAt && (
                              <p className="text-xs text-muted-foreground mt-4">
                                Paid on {formatDate(invoice.paidAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Addons Preview Tab */}
        <TabsContent value="addons">
          <div>
            <h2 className="text-2xl font-bold mb-2">Addons Preview</h2>
            <p className="text-muted-foreground mb-6">Enhance your plan with powerful addons</p>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>PERFORM SEO Platform</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Advanced SEO tools and analytics for maximum visibility
                    </p>
                  </div>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold">
                      $459<span className="text-base font-normal">/month</span>
                    </p>
                    <p className="text-sm text-muted-foreground">Plus $750 one-time setup fee</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Features:</p>
                    <ul className="space-y-1">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5" />
                        <span className="text-sm">Advanced keyword research and tracking</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5" />
                        <span className="text-sm">Automated technical SEO audits</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5" />
                        <span className="text-sm">Competitor analysis and monitoring</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5" />
                        <span className="text-sm">Content optimization recommendations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5" />
                        <span className="text-sm">Backlink analysis and opportunities</span>
                      </li>
                    </ul>
                  </div>
                  <Button className="w-full" disabled>
                    Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Default export with Suspense boundary
export default function BillingPage() {
  return (
    <Suspense fallback={<BillingLoading />}>
      <BillingContent />
    </Suspense>
  );
}