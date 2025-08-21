import { getStripe, STRIPE_CONFIG } from './config';
import { createSupabaseServerClient } from '@/lib/supabase/server';
// import { createSupabaseServiceClient } from '@/lib/supabase/service';
import type { TierName } from '@/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';

/**
 * Create or retrieve a Stripe customer for an account
 */
export async function createOrRetrieveCustomer(
  email: string,
  accountId: string,
  name?: string
): Promise<string> {
  const stripe = getStripe();
  const supabaseClient = await createSupabaseServerClient();

  // Check if account already has a Stripe customer ID
  const { data: account } = await supabaseClient
    .from('accounts')
    .select('stripe_customer_id')
    .eq('id', accountId)
    .single();

  if (account?.stripe_customer_id) {
    return account.stripe_customer_id;
  }

  // Search for existing customer by email
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });

  let customerId: string;

  if (customers.data.length > 0) {
    customerId = customers.data[0].id;
  } else {
    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        account_id: accountId,
      },
    });
    customerId = customer.id;
  }

  // Update account with Stripe customer ID
  await supabaseClient
    .from('accounts')
    .update({ stripe_customer_id: customerId })
    .eq('id', accountId);

  return customerId;
}

/**
 * Create a Stripe checkout session for tier subscription
 */
export async function createCheckoutSession(
  tier: TierName,
  accountId: string,
  userId: string,
  customerId: string,
  flow: 'cold' | 'invitation' | 'upgrade' | 'signup',
  billingPeriod: 'monthly' | 'yearly' = 'monthly'
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  const { getPricesByTier } = await import('./prices');
  const prices = getPricesByTier(tier);

  if (!prices) {
    throw new Error(`No prices configured for tier: ${tier}`);
  }

  // Select the appropriate price ID based on billing period
  const subscriptionPriceId = billingPeriod === 'yearly' 
    ? prices.yearlyPriceId 
    : prices.monthlyPriceId;

  if (!subscriptionPriceId) {
    throw new Error(`No ${billingPeriod} price configured for tier: ${tier}`);
  }

  // Build line items - Setup fee as one-time charge, then subscription
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      price: prices.setupFeeId,
      quantity: 1,
    },
    {
      price: subscriptionPriceId,
      quantity: 1,
    },
  ];

  // Determine URLs based on flow
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const successUrl = flow === 'signup' 
    ? `${baseUrl}/signup/success?session_id={CHECKOUT_SESSION_ID}`
    : STRIPE_CONFIG.getSuccessUrl('{CHECKOUT_SESSION_ID}');
  const cancelUrl = flow === 'signup'
    ? `${baseUrl}/signup/pricing`
    : STRIPE_CONFIG.getCancelUrl();

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: lineItems,
    mode: 'subscription',
    payment_method_types: [...STRIPE_CONFIG.paymentMethodTypes],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      account_id: accountId,
      user_id: userId,
      tier,
      flow,
      billing_period: billingPeriod,
    },
    subscription_data: {
      metadata: {
        account_id: accountId,
        tier,
        billing_period: billingPeriod,
      },
    },
    allow_promotion_codes: true,
  });

  return session;
}

/**
 * Update account tier after successful payment
 * @param supabaseClient - Optional Supabase client (pass service client from webhooks)
 */
export async function updateAccountTier(
  accountId: string,
  tier: TierName,
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  supabaseClient?: SupabaseClient
): Promise<void> {
  // Use provided client or create server client
  const supabase = supabaseClient || await createSupabaseServerClient();

  const { error } = await supabase
    .from('accounts')
    .update({
      tier,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      subscription_status: 'active',
      setup_fee_paid: true,
      setup_fee_paid_at: new Date().toISOString(),
    })
    .eq('id', accountId);

  if (error) {
    throw new Error(`Failed to update account tier: ${error.message}`);
  }

  // Log the tier change in billing history
  await supabase
    .from('account_billing_history')
    .insert({
      account_id: accountId,
      event_type: 'tier_change',
      new_tier: tier,
      metadata: {
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
      },
    });
}

/**
 * Start grace period for failed payment
 * @param supabaseClient - Optional Supabase client (pass service client from webhooks)
 */
export async function startGracePeriod(
  accountId: string,
  graceDays: number = 10,
  supabaseClient?: SupabaseClient
): Promise<void> {
  // Use provided client or create server client
  const supabase = supabaseClient || await createSupabaseServerClient();
  
  const gracePeriodEnd = new Date();
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + graceDays);

  const { error } = await supabase
    .from('accounts')
    .update({
      grace_period_ends_at: gracePeriodEnd.toISOString(),
      subscription_status: 'past_due',
    })
    .eq('id', accountId);

  if (error) {
    throw new Error(`Failed to start grace period: ${error.message}`);
  }

  // Log the grace period start
  await supabase
    .from('account_billing_history')
    .insert({
      account_id: accountId,
      event_type: 'grace_period_started',
      metadata: {
        grace_period_ends_at: gracePeriodEnd.toISOString(),
        grace_days: graceDays,
      },
    });
}

/**
 * Format currency for display
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/**
 * Get formatted price display for a tier
 */
export function getTierPriceDisplay(tier: TierName): {
  monthly: string;
  setupFee: string;
  total: string;
} {
  const prices: Record<TierName, { monthly: number; setup: number }> = {
    FREE: { monthly: 0, setup: 0 },
    BASIC: { monthly: 2900, setup: 0 },
    PRO: { monthly: 39700, setup: 150000 },
    SCALE: { monthly: 69700, setup: 150000 },
    MAX: { monthly: 99700, setup: 150000 },
  };

  const price = prices[tier];
  
  return {
    monthly: formatCurrency(price.monthly),
    setupFee: formatCurrency(price.setup),
    total: formatCurrency(price.monthly + price.setup),
  };
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  const stripe = getStripe();
  
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err}`);
  }
}