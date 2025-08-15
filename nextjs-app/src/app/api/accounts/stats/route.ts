import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { env } from '@/env.mjs';

export async function GET(request: Request) {
  console.log('🔍 [API/Accounts/Stats] Fetching account statistics...');

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

    // Verify user is authenticated
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    
    if (userError || !user) {
      console.log('❌ [API/Accounts/Stats] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/Accounts/Stats] Authenticated user:', user.email);

    // Parse query params for specific account IDs
    const url = new URL(request.url);
    const accountIds = url.searchParams.get('ids')?.split(',').filter(Boolean);

    // Use service role client to bypass RLS
    const serviceClient = createAdminClient();

    // Check if user is admin or staff
    const { data: adminCheck } = await serviceClient
      .from('account_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('account_id', '00000000-0000-0000-0000-000000000000')
      .in('role', ['admin', 'staff'])
      .single();
    
    const isAdminOrStaff = !!adminCheck;
    console.log('🔍 [API/Accounts/Stats] User admin/staff status:', isAdminOrStaff);

    let accountsToFetch: string[] = [];

    if (accountIds && accountIds.length > 0) {
      // Specific accounts requested
      if (isAdminOrStaff) {
        // Admin/staff can see stats for any account
        accountsToFetch = accountIds;
      } else {
        // Regular users can only see stats for their own accounts
        const { data: userAccounts } = await serviceClient
          .from('account_users')
          .select('account_id')
          .eq('user_id', user.id)
          .in('account_id', accountIds);
        
        accountsToFetch = userAccounts?.map(ua => ua.account_id) || [];
      }
    } else {
      // No specific accounts requested, fetch all accessible
      if (isAdminOrStaff) {
        // Admin/staff: fetch all accounts
        const { data: allAccounts } = await serviceClient
          .from('accounts')
          .select('id')
          .neq('id', '00000000-0000-0000-0000-000000000000');
        
        accountsToFetch = allAccounts?.map(a => a.id) || [];
      } else {
        // Regular users: fetch their accounts
        const { data: userAccounts } = await serviceClient
          .from('account_users')
          .select('account_id')
          .eq('user_id', user.id);
        
        accountsToFetch = userAccounts?.map(ua => ua.account_id) || [];
      }
    }

    console.log('🔍 [API/Accounts/Stats] Fetching stats for', accountsToFetch.length, 'accounts');

    // Fetch stats for all accounts in parallel
    const statsPromises = accountsToFetch.map(async (accountId) => {
      const [
        projectsResult,
        usersResult,
        pagesResult,
        recentActivityResult,
      ] = await Promise.all([
        // Get project counts
        serviceClient
          .from('projects')
          .select('id, archived_at')
          .eq('account_id', accountId),
        
        // Get user count
        serviceClient
          .from('account_users')
          .select('user_id')
          .eq('account_id', accountId),
        
        // Get total pages (join through projects table)
        serviceClient
          .from('pages')
          .select('id, projects!inner(account_id)')
          .eq('projects.account_id', accountId),
        
        // Get recent activity
        serviceClient
          .from('audit_logs')
          .select('created_at')
          .eq('account_id', accountId)
          .order('created_at', { ascending: false })
          .limit(1),
      ]);

      const projects = projectsResult.data || [];
      const activeProjects = projects.filter((p: { archived_at: string | null }) => !p.archived_at);
      const archivedProjects = projects.filter((p: { archived_at: string | null }) => p.archived_at);

      return {
        account_id: accountId,
        project_count: projects.length,
        active_projects: activeProjects.length,
        archived_projects: archivedProjects.length,
        user_count: usersResult.data?.length || 0,
        total_pages: pagesResult.data?.length || 0,
        storage_used: 0, // TODO: Calculate actual storage usage
        last_activity: recentActivityResult.data?.[0]?.created_at || null,
      };
    });

    const stats = await Promise.all(statsPromises);

    console.log('✅ [API/Accounts/Stats] Successfully fetched stats for', stats.length, 'accounts');

    // Return stats as a map for easy lookup
    const statsMap = stats.reduce((acc, stat) => {
      acc[stat.account_id] = stat;
      return acc;
    }, {} as Record<string, typeof stats[0]>);

    return NextResponse.json(statsMap);

  } catch (error) {
    console.error('❌ [API/Accounts/Stats] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}