import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { env } from '@/env.mjs';

export async function GET(request: NextRequest) {
  console.log('🔍 [API/Accounts] Starting accounts fetch (using service role)...');

  try {
    // First, verify the request is from an authenticated user
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

    // Verify user is authenticated (basic security check)
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    
    if (userError || !user) {
      console.log('❌ [API/Accounts] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/Accounts] Authenticated user:', user.email);

    // Check if user is admin or staff
    const serviceClient = createAdminClient();
    const { data: adminCheck } = await serviceClient
      .from('account_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('account_id', '00000000-0000-0000-0000-000000000000')
      .in('role', ['admin', 'staff'])
      .single();
    
    const isAdminOrStaff = !!adminCheck;
    console.log('🔍 [API/Accounts] User admin/staff status:', isAdminOrStaff);

    let accounts;
    let accountsError;

    if (isAdminOrStaff) {
      // Admin/Staff: Use service role to see all accounts
      console.log('🔍 [API/Accounts] Using service role for admin/staff user...');
      ({ data: accounts, error: accountsError } = await serviceClient
        .from('accounts')
        .select('id, name, slug, plan, created_at, updated_at, settings')
        .neq('id', '00000000-0000-0000-0000-000000000000') // Exclude platform account
        .order('name'));
    } else {
      // Regular users: Use auth client with RLS
      console.log('🔍 [API/Accounts] Using RLS for regular user...');
      ({ data: accounts, error: accountsError } = await authClient
        .from('accounts')
        .select(`
          id, 
          name, 
          slug, 
          plan, 
          created_at, 
          updated_at, 
          settings,
          account_users!inner(
            user_id,
            role
          )
        `)
        .eq('account_users.user_id', user.id)
        .order('name'));
    }

    console.log('🔍 [API/Accounts] Service role query result:', {
      hasData: !!accounts,
      dataLength: accounts?.length || 0,
      error: accountsError?.message || 'none'
    });

    if (accountsError) {
      console.error('❌ [API/Accounts] Database error:', accountsError);
      return NextResponse.json({ error: accountsError.message }, { status: 500 });
    }

    console.log('✅ [API/Accounts] Service role query successful!');
    console.log('📊 [API/Accounts] Found accounts:', accounts?.map(acc => acc.name) || []);

    // Ensure consistent date formatting to prevent "Invalid time value" errors
    const accountsWithFormattedDates = (accounts || []).map(account => ({
      ...account,
      created_at: account.created_at ? new Date(account.created_at).toISOString() : null,
      updated_at: account.updated_at ? new Date(account.updated_at).toISOString() : null,
    }));

    return NextResponse.json(accountsWithFormattedDates);

  } catch (error) {
    console.error('❌ [API/Accounts] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}