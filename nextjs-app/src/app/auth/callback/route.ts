import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // User is now authenticated and verified
      // Redirect directly to dashboard
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Auth flow failed, redirect to login
  return NextResponse.redirect(`${origin}/login`);
}