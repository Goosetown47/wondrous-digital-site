import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createOrRetrieveCustomer, createCheckoutSession } from '@/lib/stripe/utils';
import type { TierName } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await request.json();
    
    const { 
      tier, 
      flow = 'cold',
      billingPeriod = 'monthly',
      invitationToken,
      email: coldEmail,
      accountId: providedAccountId,
      isWarmProspect = false 
    } = body as {
      tier: TierName;
      flow: 'cold' | 'invitation' | 'upgrade' | 'signup';
      billingPeriod?: 'monthly' | 'yearly';
      invitationToken?: string;
      email?: string; // For cold signup flow
      accountId?: string; // For signup flow where account already exists
      isWarmProspect?: boolean; // For signup flow to indicate warm prospect
    };

    // Validate tier
    if (!tier || !['PRO', 'SCALE', 'MAX'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier selected' },
        { status: 400 }
      );
    }

    let userId: string;
    let accountId: string;
    let email: string;
    let name: string | undefined;

    // Handle different flows
    if (flow === 'invitation' && invitationToken) {
      // Verify invitation token
      const { data: invitation, error: inviteError } = await supabase
        .from('invitations')
        .select('*, accounts(*)')
        .eq('token', invitationToken)
        .single();

      if (inviteError || !invitation) {
        return NextResponse.json(
          { error: 'Invalid invitation token' },
          { status: 400 }
        );
      }

      // Check if invitation is still valid
      if (invitation.accepted_at || invitation.declined_at || invitation.cancelled_at) {
        return NextResponse.json(
          { error: 'Invitation has already been used' },
          { status: 400 }
        );
      }

      if (new Date(invitation.expires_at) < new Date()) {
        return NextResponse.json(
          { error: 'Invitation has expired' },
          { status: 400 }
        );
      }

      accountId = invitation.account_id;
      email = invitation.email;
      name = invitation.accounts?.name;
      
      // For invitation flow, we might not have a user yet
      // They'll create their account after payment
      userId = invitation.invited_by; // Use inviter as placeholder
      
    } else if (flow === 'upgrade') {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return NextResponse.json(
          { error: 'You must be logged in to upgrade' },
          { status: 401 }
        );
      }

      userId = user.id;
      email = user.email!;

      // Get user's current account
      const { data: accountUser, error: accountError } = await supabase
        .from('account_users')
        .select('account_id, accounts!inner(name)')
        .eq('user_id', userId)
        .single() as { 
          data: { 
            account_id: string; 
            accounts: { name: string } 
          } | null;
          error: unknown;
        };

      if (accountError || !accountUser) {
        return NextResponse.json(
          { error: 'No account found for user' },
          { status: 400 }
        );
      }

      accountId = accountUser.account_id;
      name = accountUser.accounts.name;
      
    } else if (flow === 'signup' && providedAccountId) {
      // Signup flow - account already created or exists (for warm prospects)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return NextResponse.json(
          { error: 'You must be logged in to complete signup' },
          { status: 401 }
        );
      }
      
      // Verify the account exists
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('id, name')
        .eq('id', providedAccountId)
        .single();
      
      if (accountError || !account) {
        console.error('[CreateCheckout] Invalid account ID:', providedAccountId, accountError);
        return NextResponse.json(
          { error: 'Invalid account ID' },
          { status: 400 }
        );
      }
      
      // For warm prospects, they might not be associated with the account yet
      // Check if user is already associated
      const { data: accountUser } = await supabase
        .from('account_users')
        .select('user_id, role')
        .eq('account_id', providedAccountId)
        .eq('user_id', user.id)
        .single();
      
      // If not associated, this might be a warm prospect who will be added after payment
      if (!accountUser) {
        console.log('[CreateCheckout] User not yet associated with account (warm prospect flow)');
        // Store this in session metadata for the webhook to process
      }
      
      userId = user.id;
      accountId = providedAccountId;
      email = user.email!;
      name = account.name;
      
    } else {
      // Cold flow - new customer signing up directly
      if (!coldEmail) {
        return NextResponse.json(
          { error: 'Email is required for signup' },
          { status: 400 }
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(coldEmail)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }

      // For cold flow, we'll use placeholder IDs that will be replaced after payment
      // The actual account will be created in the webhook handler
      email = coldEmail;
      accountId = `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      userId = accountId; // Temporary user ID
      name = undefined;
    }

    // Create or retrieve Stripe customer
    const customerId = await createOrRetrieveCustomer(email, accountId, name);

    // Create checkout session (pass warm prospect flag for signup flow)
    const session = await createCheckoutSession(
      tier,
      accountId,
      userId,
      customerId,
      flow,
      billingPeriod,
      isWarmProspect
    );

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id 
    });
    
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}