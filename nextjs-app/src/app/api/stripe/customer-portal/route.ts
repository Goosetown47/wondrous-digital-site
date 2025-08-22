import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/config';
import { getAppUrl } from '@/lib/utils/app-url';

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to manage billing' },
        { status: 401 }
      );
    }

    // Get user's account with Stripe customer ID
    const { data: accountUser, error: accountError } = await supabase
      .from('account_users')
      .select('account_id, accounts!inner(stripe_customer_id)')
      .eq('user_id', user.id)
      .eq('role', 'account_owner')
      .single() as {
        data: {
          account_id: string;
          accounts: { stripe_customer_id: string | null };
        } | null;
        error: unknown;
      };

    if (accountError || !accountUser?.accounts?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No billing account found' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const returnUrl = `${getAppUrl()}/billing`;

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: accountUser.accounts.stripe_customer_id,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: session.url });
    
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create billing portal session',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}