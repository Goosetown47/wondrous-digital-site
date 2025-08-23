'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  CreditCard, 
  Calendar, 
  Package, 
  RefreshCcw,
  AlertCircle,
  Download,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/providers/auth-provider';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { Account } from '@/types/database';

interface BillingHistory {
  id: string;
  account_id: string;
  created_at: string;
  description: string;
  amount: number;
  status: string;
  receipt_url?: string | null;
  metadata?: Record<string, unknown>;
}

export default function BillingPage() {
  const router = useRouter();
  const { user, currentAccount: selectedAccount } = useAuth();
  const [loading, setLoading] = useState(true);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [accountDetails, setAccountDetails] = useState<Account | null>(null);
  const [creatingPortalSession, setCreatingPortalSession] = useState(false);

  const fetchBillingData = useCallback(async () => {
    if (!selectedAccount) return;
    
    try {
      // Fetch account details
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', selectedAccount.id)
        .single();
        
      if (accountError) throw accountError;
      setAccountDetails(account);
      
      // Fetch billing history
      const { data: history, error: historyError } = await supabase
        .from('account_billing_history')
        .select('*')
        .eq('account_id', selectedAccount.id)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (historyError) throw historyError;
      setBillingHistory(history || []);
    } catch (error) {
      console.error('Error fetching billing data:', error);
      toast.error('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  }, [selectedAccount]);

  useEffect(() => {
    if (!user || !selectedAccount) {
      router.push('/dashboard');
      return;
    }
    fetchBillingData();
  }, [user, selectedAccount, router, fetchBillingData]);

  const handleManageBilling = async () => {
    setCreatingPortalSession(true);
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: selectedAccount?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      toast.error('Failed to open billing portal');
      setCreatingPortalSession(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      trialing: 'secondary',
      past_due: 'destructive',
      canceled: 'outline',
      incomplete: 'destructive',
    };
    
    return (
      <Badge variant={statusColors[status] || 'default'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getTierBadge = (tier: string) => {
    const tierColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      FREE: 'outline',
      BASIC: 'secondary',
      PRO: 'default',
      SCALE: 'default',
      MAX: 'default',
    };
    
    return (
      <Badge variant={tierColors[tier] || 'default'} className="font-semibold">
        {tier}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!accountDetails) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No billing information</AlertTitle>
          <AlertDescription>
            Unable to load billing information for this account.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasActiveSubscription = accountDetails.subscription_status === 'active';
  const hasStripeCustomer = !!accountDetails.stripe_customer_id;

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription, view payment history, and download receipts
        </p>
      </div>

      {/* Grace Period Alert */}
      {accountDetails.grace_period_ends_at && new Date(accountDetails.grace_period_ends_at) > new Date() && (
        <Alert className="mb-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payment Required</AlertTitle>
          <AlertDescription>
            Your recent payment failed. Please update your payment method by{' '}
            {format(new Date(accountDetails.grace_period_ends_at), 'PPP')} to maintain access.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Plan Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your active subscription and billing details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Package className="mr-2 h-4 w-4" />
                Plan Tier
              </div>
              <div className="text-2xl font-bold">{getTierBadge(accountDetails.tier)}</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <CreditCard className="mr-2 h-4 w-4" />
                Status
              </div>
              <div className="text-lg">
                {getStatusBadge(accountDetails.subscription_status || 'inactive')}
              </div>
            </div>
            
            {/* Next billing date would come from Stripe subscription data */}
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                Billing Status
              </div>
              <div className="text-lg font-medium">
                {accountDetails.subscription_status === 'active' ? 'Active' : 'Inactive'}
              </div>
            </div>
            
            {accountDetails.has_perform_addon && (
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Add-ons
                </div>
                <Badge variant="secondary">PERFORM SEO</Badge>
              </div>
            )}
          </div>
          
          <Separator className="my-6" />
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => router.push('/pricing')} variant="outline">
              <Package className="mr-2 h-4 w-4" />
              Change Plan
            </Button>
            
            {hasStripeCustomer && (
              <Button 
                onClick={handleManageBilling}
                disabled={creatingPortalSession}
              >
                {creatingPortalSession ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Opening Portal...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Manage Billing
                  </>
                )}
              </Button>
            )}
            
            {hasActiveSubscription && (
              <Button 
                onClick={() => router.push('/billing/cancel')}
                variant="destructive"
              >
                Cancel Subscription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Your recent transactions and receipts</CardDescription>
        </CardHeader>
        <CardContent>
          {billingHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payment history available
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingHistory.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.created_at), 'PPP')}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      ${(transaction.amount / 100).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={transaction.status === 'succeeded' ? 'default' : 'destructive'}>
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.receipt_url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(transaction.receipt_url!, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}