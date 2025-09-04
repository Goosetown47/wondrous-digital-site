import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';

/**
 * TEST ENDPOINT - Get account subscription details
 * GET /api/test/get-subscription?accountId=xxx
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const accountId = searchParams.get('accountId');

  if (!accountId) {
    return NextResponse.json(
      { error: 'accountId query parameter is required' },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServiceClient();

  const { data: account, error } = await supabase
    .from('accounts')
    .select('id, name, tier, stripe_customer_id, stripe_subscription_id, subscription_state, grace_period_ends_at')
    .eq('id', accountId)
    .single();

  if (error || !account) {
    return NextResponse.json(
      { error: 'Account not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    account: {
      id: account.id,
      name: account.name,
      tier: account.tier,
      stripeCustomerId: account.stripe_customer_id,
      stripeSubscriptionId: account.stripe_subscription_id,
      subscriptionState: account.subscription_state,
      gracePeriodEndsAt: account.grace_period_ends_at
    }
  });
}