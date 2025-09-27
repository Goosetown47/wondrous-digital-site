import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { getBuildSafeCookieStore } from '@/lib/cookies/build-safe';
import { env } from '@/env.mjs';

export async function GET() {
  console.log('🔍 [API/Users] Fetching all users (using service role)...');

  try {
    // Verify authentication
    const cookieStore = await getBuildSafeCookieStore();
    const authClient = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { user }, error: userError } = await authClient.auth.getUser();
    
    if (userError || !user) {
      console.log('❌ [API/Users] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/Users] Authenticated user:', user.email);

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    console.log('🔍 [API/Users] Using service role to query users and account relationships...');

    // Get all users from auth.users table with their account relationships
    const { data: authUsers, error: authError } = await serviceClient.auth.admin.listUsers();

    if (authError) {
      console.error('❌ [API/Users] Auth admin error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    console.log('✅ [API/Users] Found auth users:', authUsers.users.length);

    // Get account relationships for all users
    const { data: accountUsers, error: accountError } = await serviceClient
      .from('account_users')
      .select(`
        user_id,
        role,
        joined_at,
        accounts!inner(
          id,
          name,
          slug
        )
      `);

    if (accountError) {
      console.error('❌ [API/Users] Account users error:', accountError);
      return NextResponse.json({ error: accountError.message }, { status: 500 });
    }

    console.log('✅ [API/Users] Found account relationships:', accountUsers.length);

    // Combine auth users with account data
    const usersWithAccounts = authUsers.users.map(authUser => {
      const userAccounts = accountUsers
        .filter(au => au.user_id === authUser.id)
        .map(au => {
          // Handle case where accounts might be an array
          const account = Array.isArray(au.accounts) ? au.accounts[0] : au.accounts;
          return {
            account_id: account.id,
            account_name: account.name,
            account_slug: account.slug,
            role: au.role,
            joined_at: au.joined_at
          };
        });

      // Determine primary account (platform account if admin/staff, otherwise first account)
      const platformAccount = userAccounts.find(
        acc => acc.account_id === '00000000-0000-0000-0000-000000000000'
      );
      const primaryAccount = platformAccount || userAccounts[0];

      return {
        id: authUser.id,
        email: authUser.email,
        display_name: authUser.user_metadata?.display_name || authUser.email?.split('@')[0],
        created_at: authUser.created_at ? new Date(authUser.created_at).toISOString() : null,
        last_sign_in_at: authUser.last_sign_in_at ? new Date(authUser.last_sign_in_at).toISOString() : null,
        email_confirmed_at: authUser.email_confirmed_at ? new Date(authUser.email_confirmed_at).toISOString() : null,
        accounts: userAccounts.map(acc => ({
          ...acc,
          joined_at: acc.joined_at ? new Date(acc.joined_at).toISOString() : null
        })),
        primary_account: primaryAccount ? {
          ...primaryAccount,
          joined_at: primaryAccount.joined_at ? new Date(primaryAccount.joined_at).toISOString() : null
        } : null
      };
    });

    console.log('✅ [API/Users] Users with account data prepared:', usersWithAccounts.length);

    return NextResponse.json({ users: usersWithAccounts });
  } catch (error) {
    console.error('❌ [API/Users] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}