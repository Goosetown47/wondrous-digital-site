import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { EmailOtpType } from '@supabase/supabase-js';
import { acceptInvitationAfterSignup } from '@/lib/services/invitations';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const code = requestUrl.searchParams.get('code'); // Supabase sometimes uses 'code' instead
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null;
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';
  const flow = requestUrl.searchParams.get('flow'); // Check for unified flow
  const origin = requestUrl.origin;

  const supabase = await createSupabaseServerClient();
  let verificationError = null;

  // Handle code-based confirmation (new method for email signups)
  if (code && !type) {
    console.log('[Auth Confirm] Using exchangeCodeForSession for code:', code);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    verificationError = error;
    if (error) {
      console.error('[Auth Confirm] exchangeCodeForSession failed:', error);
    }
  }
  // Handle OTP-based confirmation (for recovery, magic links, etc.)
  else if ((token_hash || code) && type) {
    console.log('[Auth Confirm] Using verifyOtp with type:', type);
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token_hash || code!, // Use whichever is available
      type,
    });
    verificationError = error;
    if (error) {
      console.error('[Auth Confirm] verifyOtp failed:', error);
    }
  } else {
    console.log('[Auth Confirm] No valid confirmation parameters found');
    verificationError = new Error('Invalid confirmation parameters');
  }

  // If verification succeeded
  if (!verificationError) {
    // Get the current user to check for pending invitations
    const { data: { user } } = await supabase.auth.getUser();
    
    // Handle unified signup flow
    if (flow === 'unified' && user) {
      console.log(`[Unified Flow] Processing email confirmation for ${user.email}`);
      
      // Check if this is a warm prospect with an invitation token
      const invitationToken = user.user_metadata?.invitation_token;
      if (invitationToken) {
        console.log(`[Unified Flow] Found invitation token for warm prospect: ${invitationToken}`);
        
        // Get the invitation details
        const { data: invitation } = await supabase
          .from('account_invitations')
          .select('*, accounts!inner(name, slug)')
          .eq('token', invitationToken)
          .eq('email', user.email?.toLowerCase())
          .single();
        
        if (invitation) {
          console.log(`[Unified Flow] Found invitation for account ${invitation.account_id}`);
          
          // Accept the invitation and link user to account
          try {
            const result = await acceptInvitationAfterSignup(
              invitationToken,
              user.email!
            );
            
            if (result.success) {
              console.log(`[Unified Flow] Successfully linked user to account ${invitation.account_id}`);
              
              // Store account info in session for the pricing step
              // Note: This won't work across tabs, but we handle that in the login page
            } else {
              console.error('[Unified Flow] Failed to accept invitation:', result.error);
            }
          } catch (err) {
            console.error('[Unified Flow] Error accepting invitation:', err);
          }
        }
      }
      
      // Redirect to the signup login page
      const signupLoginUrl = new URL('/signup/login', origin);
      signupLoginUrl.searchParams.set('confirmed', 'true');
      // If this is a warm prospect, add flow parameter
      if (invitationToken) {
        signupLoginUrl.searchParams.set('flow', 'invitation');
      }
      return NextResponse.redirect(signupLoginUrl);
    }
    
    // For password recovery, redirect to update-password page
    if (type === 'recovery') {
      const updatePasswordUrl = new URL('/auth/update-password', origin);
      return NextResponse.redirect(updatePasswordUrl);
    }
    
    // For email confirmation, check for cold signup with account creation or pending invitation
    if (type === 'signup' || type === 'email') {
      
      // Legacy flow - Check if there's a pending invitation in the database
      if (user) {
          // Check if user already has an account
          const { data: existingAccount } = await supabase
            .from('account_users')
            .select('account_id')
            .eq('user_id', user.id)
            .single();
          
          // Only create account if user doesn't have one
          if (!existingAccount) {
            // Get account name from metadata or use a default
            const accountName = user.user_metadata?.account_name || user.email?.split('@')[0] || 'My Account';
            
            console.log(`[Email Confirmation] User ${user.email} has no account, creating one`);
            
            // Generate a slug from the account name
            const baseSlug = accountName.toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '')
              .substring(0, 50);
            
            // Ensure slug is unique
            let slug = baseSlug;
            let slugSuffix = 0;
            let attempts = 0;
            while (attempts < 10) {
              const { data: existing } = await supabase
                .from('accounts')
                .select('id')
                .eq('slug', slug)
                .single();
              
              if (!existing) break;
              
              slugSuffix++;
              slug = `${baseSlug}-${slugSuffix}`;
              attempts++;
            }
            
            // Create the account (start as FREE, will be updated if payment exists)
            const { data: newAccount, error: accountError } = await supabase
              .from('accounts')
              .insert({
                name: accountName,
                slug: slug,
                tier: 'FREE',
                settings: {},
              })
              .select()
              .single();
            
            if (!accountError && newAccount) {
              // Link user to account as account_owner
              await supabase
                .from('account_users')
                .insert({
                  account_id: newAccount.id,
                  user_id: user.id,
                  role: 'account_owner',
                });
              
              console.log(`[Cold Signup] Account created successfully: ${newAccount.id}`);
              
              // Check for pending Stripe payment
              const { data: pendingPayment } = await supabase
                .from('pending_stripe_payments')
                .select('*')
                .eq('email', user.email?.toLowerCase())
                .is('processed_at', null)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
              
              if (pendingPayment) {
                console.log(`[Cold Signup] Found pending payment for ${user.email}, applying tier ${pendingPayment.tier}`);
                
                // Update account with payment information
                const { error: updateError } = await supabase
                  .from('accounts')
                  .update({
                    tier: pendingPayment.tier,
                    stripe_customer_id: pendingPayment.stripe_customer_id,
                    stripe_subscription_id: pendingPayment.stripe_subscription_id,
                    subscription_status: 'active',
                    setup_fee_paid: true,
                    setup_fee_paid_at: new Date().toISOString(),
                  })
                  .eq('id', newAccount.id);
                
                if (!updateError) {
                  // Mark payment as processed
                  await supabase
                    .from('pending_stripe_payments')
                    .update({ processed_at: new Date().toISOString() })
                    .eq('id', pendingPayment.id);
                  
                  // Log to billing history
                  await supabase
                    .from('account_billing_history')
                    .insert({
                      account_id: newAccount.id,
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
                      },
                    });
                  
                  console.log(`[Cold Signup] Successfully applied ${pendingPayment.tier} tier to account`);
                } else {
                  console.error('[Cold Signup] Failed to update account with payment:', updateError);
                }
              } else {
                console.log(`[Cold Signup] No pending payment found for ${user.email}`);
              }
              
              // Redirect to dashboard
              const dashboardUrl = new URL('/dashboard', origin);
              return NextResponse.redirect(dashboardUrl);
            } else {
              console.error('[Email Confirmation] Failed to create account:', accountError);
              // Still redirect to dashboard, user can create account manually
              const dashboardUrl = new URL('/dashboard', origin);
              return NextResponse.redirect(dashboardUrl);
            }
          } else {
            console.log(`[Email Confirmation] User ${user.email} already has an account`);
          }
          
          // Check for pending invitation (for users who already have accounts)
          const { data: pendingInvitation } = await supabase
            .from('account_invitations')
            .select('token, accounts!inner(slug)')
            .eq('email', user.email?.toLowerCase())
            .is('accepted_at', null)
            .is('declined_at', null)
            .is('cancelled_at', null)
            .gt('expires_at', new Date().toISOString())
            .order('invited_at', { ascending: false })
            .limit(1)
            .single();
          
          if (pendingInvitation && 'accounts' in pendingInvitation && pendingInvitation.accounts && !Array.isArray(pendingInvitation.accounts)) {
            // Accept the invitation using direct service call
            try {
              const result = await acceptInvitationAfterSignup(
                pendingInvitation.token,
                user.email!
              );
              
              if (result.success) {
                // Successfully accepted - redirect to the account they just joined
                const accountSlug = (pendingInvitation.accounts as { slug: string }).slug;
                const accountUrl = new URL(`/tools/accounts/${accountSlug}`, origin);
                console.log(`[Invitation] Successfully accepted invitation for ${user.email} to account ${accountSlug}`);
                return NextResponse.redirect(accountUrl);
              } else {
                // Log the failure for monitoring (critical issue that needs attention)
                console.error('[Critical] Invitation acceptance failed after email confirmation', {
                  error: result.error,
                  email: user.email,
                  invitationToken: pendingInvitation.token,
                  timestamp: new Date().toISOString()
                });
                // Note: We still continue to dashboard rather than showing an error
                // This ensures the user can at least access the app
              }
            } catch (err) {
              console.error('[Critical] Unexpected error accepting invitation after email confirmation:', {
                error: err instanceof Error ? err.message : 'Unknown error',
                email: user.email,
                invitationToken: pendingInvitation.token,
                timestamp: new Date().toISOString()
              });
            }
          }
        }
      }
      
      // For other types or if no invitation, redirect to the specified next page or dashboard
      const redirectTo = new URL(next, origin);
      return NextResponse.redirect(redirectTo);
    }

  // Verification failed - redirect to login with error
  const loginUrl = new URL('/login', origin);
  loginUrl.searchParams.set('error', 'verification_failed');
  return NextResponse.redirect(loginUrl);
}