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
      // For password recovery, redirect to update-password page
      if (type === 'recovery') {
        const updatePasswordUrl = new URL('/auth/update-password', origin);
        return NextResponse.redirect(updatePasswordUrl);
      }
      
      // For other types, redirect to the specified next page or dashboard
      const redirectTo = new URL(next, origin);
      return NextResponse.redirect(redirectTo);
    }
  }

  // Verification failed - redirect to login with error
  const loginUrl = new URL('/login', origin);
  loginUrl.searchParams.set('error', 'verification_failed');
  return NextResponse.redirect(loginUrl);
}