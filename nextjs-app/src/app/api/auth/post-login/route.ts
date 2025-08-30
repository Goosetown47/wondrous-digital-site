import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST() {
  try {
    // Get authenticated user
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Use admin client to check if user has any accounts
    const adminClient = createAdminClient();
    const { data: accounts, error: accountsError } = await adminClient
      .from('account_users')
      .select('account_id')
      .eq('user_id', user.id)
      .limit(1);

    if (accountsError) {
      console.error('Error checking user accounts:', accountsError);
      // Default to dashboard on error
      return NextResponse.json({ redirect: '/dashboard' });
    }

    // Determine redirect based on whether user has accounts
    const hasAccounts = accounts && accounts.length > 0;
    
    // If user has an account, check if it needs tier update from pending payment
    if (hasAccounts && accounts[0]) {
      const { data: accountData } = await adminClient
        .from('accounts')
        .select('id, tier')
        .eq('id', accounts[0].account_id)
        .single();
      
      // If account exists but tier is FREE, check for pending payments
      if (accountData && accountData.tier === 'FREE') {
        const { data: pendingPayment } = await adminClient
          .from('pending_stripe_payments')
          .select('*')
          .eq('email', user.email?.toLowerCase())
          .is('processed_at', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (pendingPayment) {
          console.log(`[Post-Login] Found pending payment for ${user.email}, applying tier ${pendingPayment.tier}`);
          
          // Update account with payment information
          await adminClient
            .from('accounts')
            .update({
              tier: pendingPayment.tier,
              stripe_customer_id: pendingPayment.stripe_customer_id,
              stripe_subscription_id: pendingPayment.stripe_subscription_id,
              subscription_status: 'active',
              setup_fee_paid: true,
              setup_fee_paid_at: new Date().toISOString(),
            })
            .eq('id', accountData.id);
          
          // Mark payment as processed
          await adminClient
            .from('pending_stripe_payments')
            .update({ processed_at: new Date().toISOString() })
            .eq('id', pendingPayment.id);
          
          // Log to billing history
          await adminClient
            .from('account_billing_history')
            .insert({
              account_id: accountData.id,
              event_type: 'payment_processed_from_pending',
              new_tier: pendingPayment.tier,
              amount_cents: pendingPayment.amount_paid,
              currency: pendingPayment.currency,
              stripe_event_id: pendingPayment.stripe_session_id,
              metadata: {
                pending_payment_id: pendingPayment.id,
                stripe_customer_id: pendingPayment.stripe_customer_id,
                stripe_subscription_id: pendingPayment.stripe_subscription_id,
                original_created_at: pendingPayment.created_at,
                applied_at: 'post_login',
              },
            });
          
          console.log(`[Post-Login] Successfully applied ${pendingPayment.tier} tier to account`);
        }
      }
    }
    
    // Check if user is in unified signup flow without an account
    if (!hasAccounts) {
      // Check if this is a unified signup user
      const isUnifiedSignup = user.user_metadata?.signup_flow === 'unified';
      
      if (isUnifiedSignup) {
        // User is mid-signup, determine appropriate step
        const invitationToken = user.user_metadata?.invitation_token;
        
        const redirect = invitationToken 
          ? '/signup/profile?flow=invitation'  // Warm prospect
          : '/signup/account';                  // Cold prospect
        
        console.log(`[Post-Login] Unified signup user ${user.email} - Redirecting to: ${redirect}`);
        
        return NextResponse.json({ 
          redirect,
          hasAccounts: false,
          userId: user.id,
          email: user.email,
          signupFlow: 'unified'
        });
      }
      
      // For legacy users without accounts (shouldn't happen for new users)
      console.error(`[Post-Login] Legacy user ${user.email} has no account - redirecting to signup`);
      // Force them through unified signup
      return NextResponse.json({ 
        redirect: '/signup',
        hasAccounts: false,
        userId: user.id,
        email: user.email,
        needsSignup: true
      });
    }

    // User has accounts - go to dashboard
    const redirect = '/dashboard';
    console.log(`[Post-Login] User ${user.email} - Has accounts: ${hasAccounts} - Redirecting to: ${redirect}`);

    return NextResponse.json({ 
      redirect,
      hasAccounts: true,
      userId: user.id,
      email: user.email
    });

  } catch (error) {
    console.error('Unexpected error in post-login:', error);
    // Default to dashboard on error
    return NextResponse.json({ redirect: '/dashboard' });
  }
}