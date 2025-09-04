import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';

/**
 * TEST ENDPOINT - Clear Stripe IDs from account
 * POST /api/test/clear-stripe-ids
 * Body: { accountId: string }
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    const { accountId } = await request.json();

    if (!accountId) {
      return NextResponse.json(
        { error: 'accountId is required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceClient();

    // Clear Stripe IDs
    const { data, error } = await supabase
      .from('accounts')
      .update({
        stripe_customer_id: null,
        stripe_subscription_id: null
      })
      .eq('id', accountId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to clear Stripe IDs', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Stripe IDs cleared',
      account: {
        id: data.id,
        name: data.name,
        stripeCustomerId: data.stripe_customer_id,
        stripeSubscriptionId: data.stripe_subscription_id
      }
    });

  } catch (error) {
    console.error('Failed to clear Stripe IDs:', error);
    return NextResponse.json(
      { 
        error: 'Failed to clear Stripe IDs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}