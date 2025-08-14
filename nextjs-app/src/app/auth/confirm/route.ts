import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null;
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';
  const origin = requestUrl.origin;

  if (token_hash && type) {
    const supabase = await createSupabaseServerClient();
    
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });

    if (!error) {
      // Get the current user to check for pending invitations
      const { data: { user } } = await supabase.auth.getUser();
      
      // For password recovery, redirect to update-password page
      if (type === 'recovery') {
        const updatePasswordUrl = new URL('/auth/update-password', origin);
        return NextResponse.redirect(updatePasswordUrl);
      }
      
      // For email confirmation, check for pending invitation
      if (type === 'signup' || type === 'email') {
        // Check if there's a pending invitation in the database
        if (user) {
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
            // Accept the invitation automatically
            try {
              const response = await fetch(`${origin}/api/invitations/accept-after-signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  token: pendingInvitation.token,
                  email: user.email 
                }),
              });
              
              if (response.ok) {
                // Redirect to the account they just joined
                const accountSlug = (pendingInvitation.accounts as { slug: string }).slug;
                const accountUrl = new URL(`/tools/accounts/${accountSlug}`, origin);
                return NextResponse.redirect(accountUrl);
              }
            } catch (err) {
              console.error('Error accepting invitation after email confirmation:', err);
            }
          }
        }
      }
      
      // For other types or if no invitation, redirect to the specified next page or dashboard
      const redirectTo = new URL(next, origin);
      return NextResponse.redirect(redirectTo);
    }
  }

  // Verification failed - redirect to login with error
  const loginUrl = new URL('/login', origin);
  loginUrl.searchParams.set('error', 'verification_failed');
  return NextResponse.redirect(loginUrl);
}