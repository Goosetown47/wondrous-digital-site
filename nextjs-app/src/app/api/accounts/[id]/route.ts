import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { env } from '@/env.mjs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('🔍 [API/Accounts/Id] Fetching account:', id);

  try {
    // Verify authentication
    const cookieStore = await cookies();
    const authClient = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore cookie setting errors
            }
          },
        },
      }
    );

    const { data: { user }, error: userError } = await authClient.auth.getUser();
    
    if (userError || !user) {
      console.log('❌ [API/Accounts/Id] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/Accounts/Id] Authenticated user:', user.email);

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    console.log('🔍 [API/Accounts/Id] Using service role to query specific account...');

    // Get specific account
    const { data: account, error: accountError } = await serviceClient
      .from('accounts')
      .select(`
        *,
        account_users(
          user_id,
          role,
          joined_at,
          invited_by
        )
      `)
      .eq('id', id)
      .single();

    if (accountError || !account) {
      console.error('❌ [API/Accounts/Id] Account not found:', accountError);
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    console.log('✅ [API/Accounts/Id] Found account:', account.name);

    // Format dates consistently
    const accountWithFormattedDates = {
      ...account,
      created_at: account.created_at ? new Date(account.created_at).toISOString() : null,
      updated_at: account.updated_at ? new Date(account.updated_at).toISOString() : null,
    };

    return NextResponse.json(accountWithFormattedDates);

  } catch (error) {
    console.error('❌ [API/Accounts/Id] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}