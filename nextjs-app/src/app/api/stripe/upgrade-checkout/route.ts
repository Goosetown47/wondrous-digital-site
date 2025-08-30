import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/config';
import { getAppUrl } from '@/lib/utils/app-url';
import type { TierName } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const supabase = await createSupabaseServerClient();
    const body = await request.json();
    
    const {
      targetTier,
      accountId,
      billingPeriod = 'monthly',
      prorationAmount, // The exact amount calculated by the preview
    } = body as {
      targetTier: TierName;
      accountId: string;
      billingPeriod?: 'monthly' | 'yearly';
      prorationAmount: number; // In dollars (not cents)
    };

    // Validate tier
    if (!targetTier || !['PRO', 'SCALE', 'MAX'].includes(targetTier)) {
      return NextResponse.json(
        { error: 'Invalid tier selected' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to upgrade' },
        { status: 401 }
      );
    }

    // Verify the account and get subscription details
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .single();
    
    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Verify user has permission (account owner or platform admin)
    const { data: accountUser } = await supabase
      .from('account_users')
      .select('role, account_id')
      .eq('user_id', user.id)
      .in('account_id', [accountId, '00000000-0000-0000-0000-000000000000']);
    
    const isOwner = accountUser?.some(u => u.account_id === accountId && u.role === 'account_owner');
    const isPlatformAdmin = accountUser?.some(u => 
      u.account_id === '00000000-0000-0000-0000-000000000000' && u.role === 'admin'
    );
    
    if (!isOwner && !isPlatformAdmin) {
      return NextResponse.json(
        { error: 'Only account owners or platform admins can upgrade plans' },
        { status: 403 }
      );
    }

    // Check if account has an active subscription
    if (!account.stripe_subscription_id || !account.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No active subscription found. Please contact support.' },
        { status: 400 }
      );
    }

    // Get the Stripe customer
    const customer = await stripe.customers.retrieve(account.stripe_customer_id);
    if (customer.deleted) {
      return NextResponse.json(
        { error: 'Customer not found in Stripe' },
        { status: 400 }
      );
    }

    // Create a checkout session that will generate an invoice
    // This gives us both the professional invoice AND proper return URL support
    const session = await stripe.checkout.sessions.create({
      customer: account.stripe_customer_id,
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Upgrade to ${targetTier} ${billingPeriod === 'yearly' ? 'Yearly' : 'Monthly'}`,
              description: `Prorated upgrade charge for ${targetTier} plan (${billingPeriod} billing)`,
            },
            unit_amount: Math.round(prorationAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      // Enable invoice creation - this creates a proper invoice with download options
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `Upgrade to ${targetTier} ${billingPeriod === 'yearly' ? 'Yearly' : 'Monthly'}`,
          metadata: {
            type: 'subscription_upgrade',
            account_id: accountId,
            user_id: user.id,
            target_tier: targetTier,
            billing_period: billingPeriod,
            subscription_id: account.stripe_subscription_id,
            current_tier: account.tier,
            proration_amount: prorationAmount.toString(),
          },
        },
      },
      success_url: `${getAppUrl()}/billing?upgrade=success`,
      cancel_url: `${getAppUrl()}/billing/plans`,
      // Session metadata (for webhook processing if needed)
      metadata: {
        type: 'subscription_upgrade',
        account_id: accountId,
        user_id: user.id,
        target_tier: targetTier,
        billing_period: billingPeriod,
        subscription_id: account.stripe_subscription_id,
        current_tier: account.tier,
        proration_amount: prorationAmount.toString(),
      },
    });

    console.log('Created upgrade checkout session with invoice creation:', {
      sessionId: session.id,
      targetTier,
      prorationAmount,
      billingPeriod,
      accountId,
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });

  } catch (error) {
    console.error('Upgrade checkout error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create upgrade checkout session',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}