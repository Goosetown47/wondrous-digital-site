import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from '@/env.mjs';
import { isAdmin, isStaff, getUserRole, getUserAccounts } from '@/lib/permissions';

const PLATFORM_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';

export async function GET() {
  console.log('🔍 [DEBUG/Auth] Starting comprehensive auth analysis...');

  try {
    const result: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      step1_cookies: {},
      step2_supabase_client: {},
      step3_authentication: {},
      step4_platform_account: {},
      step5_permission_functions: {},
      step6_rls_test: {},
      step7_summary: {}
    };

    // Step 1: Analyze all cookies
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    result.step1_cookies = {
      total_count: allCookies.length,
      all_cookie_names: allCookies.map(c => c.name),
      supabase_cookies: allCookies
        .filter(c => c.name.includes('supabase'))
        .map(c => ({
          name: c.name,
          has_value: !!c.value,
          value_length: c.value.length,
          preview: c.value.substring(0, 50) + (c.value.length > 50 ? '...' : '')
        })),
      other_cookies: allCookies
        .filter(c => !c.name.includes('supabase'))
        .map(c => ({ name: c.name, has_value: !!c.value }))
    };

    // Step 2: Create Supabase client and test basic functionality
    const supabase = createServerClient(
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
            } catch (e) {
              console.warn('Could not set cookies:', e);
            }
          },
        },
      }
    );

    result.step2_supabase_client = {
      client_created: true,
      supabase_url: env.NEXT_PUBLIC_SUPABASE_URL,
      has_anon_key: !!env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    };

    // Step 3: Test authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    result.step3_authentication = {
      has_user: !!user,
      user_id: user?.id || null,
      user_email: user?.email || null,
      user_error: userError?.message || null,
      has_session: !!session,
      session_expires_at: session?.expires_at || null,
      session_error: sessionError?.message || null,
      access_token_present: !!session?.access_token,
      refresh_token_present: !!session?.refresh_token
    };

    if (!user) {
      result.step7_summary = {
        issue: 'NO_USER_AUTHENTICATION',
        description: 'User is not authenticated - no valid session found in cookies',
        next_steps: [
          'Check if user is properly logged in',
          'Verify Supabase auth cookies are being set',
          'Check middleware is handling auth correctly'
        ]
      };
      return NextResponse.json(result);
    }

    // Step 4: Test platform account queries
    const { data: platformAccount, error: platformError } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', PLATFORM_ACCOUNT_ID)
      .single();

    const { data: allAccountUsers, error: allAccountUsersError } = await supabase
      .from('account_users')
      .select('user_id, account_id, role')
      .eq('user_id', user.id);

    const { data: platformAccountUsers, error: platformAccountUsersError } = await supabase
      .from('account_users')
      .select('user_id, account_id, role')
      .eq('user_id', user.id)
      .eq('account_id', PLATFORM_ACCOUNT_ID);

    result.step4_platform_account = {
      platform_account_exists: !!platformAccount,
      platform_account_error: platformError?.message || null,
      user_account_memberships: {
        total: allAccountUsers?.length || 0,
        memberships: allAccountUsers || [],
        error: allAccountUsersError?.message || null
      },
      platform_membership: {
        is_platform_member: (platformAccountUsers?.length || 0) > 0,
        platform_role: platformAccountUsers?.[0]?.role || null,
        error: platformAccountUsersError?.message || null
      }
    };

    // Step 5: Test permission functions
    const adminCheck = await isAdmin(user.id, supabase);
    const staffCheck = await isStaff(user.id, supabase);
    const userRole = await getUserRole(user.id, supabase);
    
    let userAccounts = null;
    let userAccountsError = null;
    try {
      userAccounts = await getUserAccounts(user.id, supabase);
    } catch (e) {
      userAccountsError = e instanceof Error ? e.message : 'Unknown error';
    }

    result.step5_permission_functions = {
      is_admin: adminCheck,
      is_staff: staffCheck,
      user_role: userRole,
      user_accounts: {
        count: userAccounts?.length || 0,
        accounts: userAccounts?.map((acc: { id: string; name: string; slug: string }) => ({ id: acc.id, name: acc.name, slug: acc.slug })) || [],
        error: userAccountsError
      }
    };

    // Step 6: Test RLS policies directly
    const { data: directProjectsQuery, error: directProjectsError } = await supabase
      .from('projects')
      .select('id, name, account_id, created_at')
      .limit(5);

    const { data: projectsWithAccountsQuery, error: projectsWithAccountsError } = await supabase
      .from('projects')
      .select(`
        id,
        name, 
        account_id,
        accounts!inner(name, slug)
      `)
      .limit(5);

    // Test the specific RLS policy condition
    const { data: rlsPolicyTest, error: rlsPolicyError } = await supabase
      .rpc('sql', {
        sql: `
          SELECT 
            EXISTS (
              SELECT 1 FROM account_users
              WHERE user_id = auth.uid()
              AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
              AND role = 'admin'
            ) as is_platform_admin,
            auth.uid() as current_user_id
        `
      });

    result.step6_rls_test = {
      direct_projects: {
        count: directProjectsQuery?.length || 0,
        error: directProjectsError?.message || null,
        projects: directProjectsQuery?.map(p => ({ id: p.id, name: p.name })) || []
      },
      projects_with_accounts: {
        count: projectsWithAccountsQuery?.length || 0,
        error: projectsWithAccountsError?.message || null,
        projects: projectsWithAccountsQuery?.map(p => ({ id: p.id, name: p.name })) || []
      },
      rls_policy_test: {
        result: rlsPolicyTest,
        error: rlsPolicyError?.message || null
      }
    };

    // Step 7: Summary and diagnosis
    const hasUser = !!user;
    const hasPlatformMembership = (platformAccountUsers?.length || 0) > 0;
    const isUserAdmin = adminCheck;
    const canSeeProjects = (directProjectsQuery?.length || 0) > 0;

    let diagnosis = 'UNKNOWN';
    let nextSteps: string[] = [];

    if (!hasUser) {
      diagnosis = 'NO_AUTHENTICATION';
      nextSteps = ['User needs to log in', 'Check auth middleware'];
    } else if (!hasPlatformMembership) {
      diagnosis = 'NO_PLATFORM_MEMBERSHIP';
      nextSteps = ['User needs to be added to platform account', 'Check account_users table'];
    } else if (!isUserAdmin) {
      diagnosis = 'NOT_ADMIN_ROLE';
      nextSteps = ['User needs admin role in platform account', 'Update role in account_users'];
    } else if (!canSeeProjects) {
      diagnosis = 'RLS_POLICY_FAILING';
      nextSteps = ['RLS policy not working despite admin status', 'Check policy logic', 'Test auth.uid() context'];
    } else {
      diagnosis = 'ALL_CHECKS_PASSED';
      nextSteps = ['System should be working', 'Check frontend implementation'];
    }

    result.step7_summary = {
      diagnosis,
      next_steps: nextSteps,
      key_findings: {
        authenticated: hasUser,
        platform_member: hasPlatformMembership,
        is_admin: isUserAdmin,
        can_see_projects: canSeeProjects
      }
    };

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('❌ [DEBUG/Auth] Error:', error);
    return NextResponse.json({
      error: 'Debug endpoint failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}