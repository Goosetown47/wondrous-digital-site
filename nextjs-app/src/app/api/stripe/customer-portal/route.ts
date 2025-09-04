import { NextResponse, NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/config';
import { getAppUrl } from '@/lib/utils/app-url';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Parse request body to get accountId
    const body = await request.json();
    const { accountId } = body as { accountId?: string };
    
    console.log('Portal request for accountId:', accountId);
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to manage billing' },
        { status: 401 }
      );
    }

    // Get user's account with Stripe customer ID
    // If accountId provided, use it; otherwise get the user's first owned account
    const query = supabase
      .from('account_users')
      .select('account_id, accounts!inner(stripe_customer_id)')
      .eq('user_id', user.id)
      .eq('role', 'account_owner');
    
    if (accountId) {
      query.eq('account_id', accountId);
    }
    
    const { data: accountUser, error: accountError } = await query.single() as {
      data: {
        account_id: string;
        accounts: { stripe_customer_id: string | null };
      } | null;
      error: unknown;
    };

    if (accountError || !accountUser?.accounts?.stripe_customer_id) {
      console.error('Account error:', accountError);
      return NextResponse.json(
        { error: 'No billing account found' },
        { status: 400 }
      );
    }

    const customerId = accountUser.accounts.stripe_customer_id;
    console.log('Creating portal session for customer:', customerId);

    const stripe = getStripe();
    const returnUrl = `${getAppUrl()}/billing`;

    try {
      // First, try to get the default configuration
      const configurations = await stripe.billingPortal.configurations.list({
        limit: 1,
        is_default: true,
      });
      
      console.log('Found configurations:', configurations.data.length);
      
      // Create billing portal session with explicit configuration if available
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sessionParams: any = {
        customer: customerId,
        return_url: returnUrl,
      };
      
      // If we found a default configuration, use its ID
      if (configurations.data.length > 0) {
        sessionParams.configuration = configurations.data[0].id;
        console.log('Using configuration ID:', configurations.data[0].id);
      }
      
      const session = await stripe.billingPortal.sessions.create(sessionParams);
      console.log('Portal session created successfully');
      
      return NextResponse.json({ url: session.url });
      
    } catch (stripeError) {
      console.error('Stripe error creating portal session:', stripeError);
      
      // Check if it's the configuration error
      if (stripeError instanceof Error && stripeError.message.includes('No configuration provided')) {
        return NextResponse.json(
          { 
            error: 'Billing portal not configured',
            message: 'The billing portal needs to be configured in Stripe Dashboard. Please contact support.',
            details: stripeError.message
          },
          { status: 500 }
        );
      }
      
      throw stripeError; // Re-throw to be caught by outer catch
    }
    
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