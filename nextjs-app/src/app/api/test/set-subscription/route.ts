import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';

/**
 * TEST ENDPOINT - Set subscription ID for an account
 * POST /api/test/set-subscription
 * Body: { accountId: string, subscriptionId: string, customerId?: string }
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    const { accountId, subscriptionId, customerId } = await request.json();

    if (!accountId || !subscriptionId) {
      return NextResponse.json(
        { error: 'accountId and subscriptionId are required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceClient();

    // Update account with subscription details
    interface AccountUpdate {
      stripe_subscription_id: string | null;
      stripe_customer_id?: string | null;
    }
    
    const updateData: AccountUpdate = {
      stripe_subscription_id: subscriptionId
    };

    if (customerId) {
      updateData.stripe_customer_id = customerId;
    }

    const { data, error } = await supabase
      .from('accounts')
      .update(updateData)
      .eq('id', accountId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update account', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription ID updated',
      account: {
        id: data.id,
        name: data.name,
        stripeSubscriptionId: data.stripe_subscription_id,
        stripeCustomerId: data.stripe_customer_id
      }
    });

  } catch (error) {
    console.error('Failed to set subscription:', error);
    return NextResponse.json(
      { 
        error: 'Failed to set subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}