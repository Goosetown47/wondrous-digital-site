import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import type Stripe from 'stripe';

/**
 * TEST ENDPOINT - Webhook Simulator
 * 
 * Simulates a Stripe webhook event for testing the grace period flow.
 * This creates a properly formatted webhook payload and calls our webhook handler.
 * 
 * POST /api/test/webhook-simulator
 * Body: { 
 *   subscriptionId: string,
 *   eventType?: 'invoice.payment_failed' | 'invoice.payment_succeeded',
 *   customerId?: string
 * }
 */
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    const { 
      subscriptionId, 
      eventType = 'invoice.payment_failed',
      customerId 
    } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'subscriptionId is required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceClient();

    // Find account by subscription ID
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id, name, tier, stripe_customer_id, stripe_subscription_id')
      .eq('stripe_subscription_id', subscriptionId)
      .single();

    if (accountError || !account) {
      return NextResponse.json({
        error: 'No account found with this subscription ID',
        subscriptionId,
        suggestion: 'Make sure to use a subscription ID from an existing account in your database'
      }, { status: 404 });
    }

    // Create a mock Stripe event
    const mockEvent = {
      id: `evt_test_${Date.now()}`,
      object: 'event',
      api_version: '2024-06-20',
      created: Math.floor(Date.now() / 1000),
      type: eventType as Stripe.Event.Type,
      livemode: false,
      pending_webhooks: 0,
      request: null,
      data: {
        object: createMockInvoice(
          subscriptionId, 
          customerId || account.stripe_customer_id || 'cus_test',
          eventType === 'invoice.payment_failed' ? 'payment_failed' : 'paid'
        ) as Stripe.Invoice
      }
    };

    // Call our webhook handler directly
    const webhookUrl = new URL('/api/stripe/webhooks', request.url);
    const webhookRequest = new Request(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature' // Our handler should skip verification in dev
      },
      body: JSON.stringify(mockEvent)
    });

    // Import and call the webhook handler
    const { POST: webhookHandler } = await import('@/app/api/stripe/webhooks/route');
    const webhookResponse = await webhookHandler(webhookRequest as NextRequest);
    const webhookResult = await webhookResponse.json();

    // Check what happened in the database
    const { data: updatedAccount } = await supabase
      .from('accounts')
      .select('grace_period_ends_at, subscription_state')
      .eq('id', account.id)
      .single();

    const { data: notifications } = await supabase
      .from('grace_period_notifications')
      .select('notification_type, scheduled_for')
      .eq('account_id', account.id)
      .order('scheduled_for', { ascending: true });

    const { data: billingHistory } = await supabase
      .from('account_billing_history')
      .select('event_type, created_at')
      .eq('account_id', account.id)
      .order('created_at', { ascending: false })
      .limit(1);

    return NextResponse.json({
      success: webhookResponse.status === 200,
      testMode: true,
      message: '🧪 TEST MODE: Webhook simulated',
      event: {
        id: mockEvent.id,
        type: mockEvent.type,
        created: new Date(mockEvent.created * 1000).toISOString()
      },
      account: {
        id: account.id,
        name: account.name,
        tier: account.tier,
        stripeSubscriptionId: account.stripe_subscription_id
      },
      webhookResponse: {
        status: webhookResponse.status,
        result: webhookResult
      },
      databaseChanges: {
        gracePeriodSet: !!updatedAccount?.grace_period_ends_at,
        gracePeriodEndsAt: updatedAccount?.grace_period_ends_at,
        subscriptionState: updatedAccount?.subscription_state,
        notificationsScheduled: notifications?.length || 0,
        billingHistoryAdded: billingHistory?.[0]?.event_type === 'payment_failed'
      },
      notifications: notifications || [],
      nextSteps: eventType === 'invoice.payment_failed' ? [
        '1. Check /billing to see the grace period alert',
        '2. Test notification sending: GET /api/cron/grace-period?testEmail=your-email',
        '3. Clear grace period: POST /api/test/clear-grace-period'
      ] : [
        '1. Check that grace period was cleared (if one existed)',
        '2. Verify subscription is active'
      ]
    });

  } catch (error) {
    console.error('Webhook simulation failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to simulate webhook',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Create a mock Stripe invoice object
 */
function createMockInvoice(
  subscriptionId: string, 
  customerId: string,
  status: string
): Partial<Stripe.Invoice> {
  const now = Math.floor(Date.now() / 1000);
  
  return {
    id: `in_test_${Date.now()}`,
    object: 'invoice',
    account_country: 'US',
    account_name: 'Test Account',
    amount_due: 2900, // $29.00
    amount_paid: status === 'paid' ? 2900 : 0,
    amount_remaining: status === 'paid' ? 0 : 2900,
    attempt_count: status === 'paid' ? 1 : 3,
    attempted: true,
    auto_advance: true,
    billing_reason: 'subscription_cycle',
    charge: status === 'paid' ? `ch_test_${Date.now()}` : null,
    collection_method: 'charge_automatically',
    created: now,
    currency: 'usd',
    custom_fields: null,
    customer: customerId,
    customer_email: 'test@example.com',
    customer_name: 'Test Customer',
    description: null,
    discount: null,
    due_date: null,
    ending_balance: 0,
    footer: null,
    hosted_invoice_url: null,
    invoice_pdf: null,
    lines: {
      object: 'list',
      data: [{
        id: `il_test_${Date.now()}`,
        object: 'line_item',
        amount: 2900,
        currency: 'usd',
        description: 'Test Subscription',
        discount_amounts: [],
        discountable: true,
        discounts: [],
        livemode: false,
        metadata: {},
        period: {
          end: now + 2592000, // 30 days
          start: now
        },
        // plan: null, // Removed deprecated field
        // @ts-expect-error - price field exists in API but not in type
        price: {
          id: `price_test_${Date.now()}`,
          object: 'price',
          active: true,
          currency: 'usd',
          livemode: false,
          metadata: {},
          nickname: null,
          product: `prod_test_${Date.now()}`,
          recurring: {
            aggregate_usage: null,
            interval: 'month',
            interval_count: 1,
            usage_type: 'licensed'
          },
          type: 'recurring',
          unit_amount: 2900,
          unit_amount_decimal: '2900'
        },
        proration: false,
        quantity: 1,
        subscription: subscriptionId,
        subscription_item: `si_test_${Date.now()}`,
        tax_amounts: [],
        tax_rates: [],
        type: 'subscription'
      }],
      has_more: false,
      total_count: 1,
      url: '/v1/invoices/in_test/lines'
    },
    livemode: false,
    metadata: {
      test_mode: 'true',
      simulated_at: new Date().toISOString()
    },
    next_payment_attempt: status === 'paid' ? null : now + 86400, // 24 hours
    number: `TEST-${Date.now()}`,
    paid: status === 'paid',
    payment_intent: status === 'paid' ? `pi_test_${Date.now()}` : null,
    period_end: now,
    period_start: now - 2592000, // 30 days ago
    post_payment_credit_notes_amount: 0,
    pre_payment_credit_notes_amount: 0,
    receipt_number: null,
    starting_balance: 0,
    statement_descriptor: null,
    status: (status === 'paid' ? 'paid' : 'payment_failed') as Stripe.Invoice.Status,
    status_transitions: {
      finalized_at: now,
      marked_uncollectible_at: null,
      paid_at: status === 'paid' ? now : null,
      voided_at: null
    },
    subscription: subscriptionId,
    subtotal: 2900,
    tax: 0,
    total: 2900,
    total_discount_amounts: [],
    total_tax_amounts: [],
    webhooks_delivered_at: now
  };
}