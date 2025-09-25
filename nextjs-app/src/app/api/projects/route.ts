import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { getBuildSafeCookieStore } from '@/lib/cookies/build-safe';
import { env } from '@/env.mjs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const includeArchived = searchParams.get('includeArchived') === 'true';

  console.log('🔍 [API/Projects] Starting projects fetch (using service role)...');
  console.log('🔍 [API/Projects] Include archived:', includeArchived);

  try {
    // First, verify the request is from an authenticated user
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

    // Verify user is authenticated (basic security check)
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    
    if (userError || !user) {
      console.log('❌ [API/Projects] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/Projects] Authenticated user:', user.email);

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    // Check user's role to determine what projects they can see
    console.log('🔍 [API/Projects] Checking user permissions...');
    
    // Check if user is admin/staff (system-level access)
    const { data: systemRole } = await serviceClient
      .from('account_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('account_id', '00000000-0000-0000-0000-000000000000')
      .single();
    
    const isAdminOrStaff = systemRole?.role === 'admin' || systemRole?.role === 'staff';
    console.log('🔍 [API/Projects] Is admin/staff:', isAdminOrStaff);

    // Build base query
    let query = serviceClient
      .from('projects')
      .select(`
        *,
        accounts(
          id,
          name,
          slug,
          tier
        )
      `)
      .order('created_at', { ascending: false });

    if (!includeArchived) {
      query = query.is('archived_at', null);
    }

    let projects;
    
    if (isAdminOrStaff) {
      // Admin/staff can see ALL projects
      console.log('🔍 [API/Projects] User is admin/staff - fetching all projects');
      const { data, error } = await query;
      if (error) throw error;
      projects = data;
    } else {
      // For non-admin/staff users, we need to filter based on their access
      console.log('🔍 [API/Projects] User is not admin/staff - checking account memberships');
      
      // Get all accounts where user is an account_owner
      const { data: accountMemberships } = await serviceClient
        .from('account_users')
        .select('account_id, role')
        .eq('user_id', user.id)
        .neq('account_id', '00000000-0000-0000-0000-000000000000');
      
      const ownedAccountIds = accountMemberships
        ?.filter(m => m.role === 'account_owner')
        .map(m => m.account_id) || [];
      
      const memberAccountIds = accountMemberships
        ?.filter(m => m.role === 'user')
        .map(m => m.account_id) || [];
      
      console.log('🔍 [API/Projects] Account owner of:', ownedAccountIds.length, 'accounts');
      console.log('🔍 [API/Projects] Regular member of:', memberAccountIds.length, 'accounts');
      
      // Get projects user has explicit access to
      const { data: projectAccess } = await serviceClient
        .from('project_users')
        .select('project_id')
        .eq('user_id', user.id);
      
      const accessibleProjectIds = projectAccess?.map(pa => pa.project_id) || [];
      console.log('🔍 [API/Projects] Has explicit access to:', accessibleProjectIds.length, 'projects');
      
      // Fetch all projects and then filter
      const { data: allProjects, error } = await query;
      if (error) throw error;
      
      // Filter projects based on user's access
      projects = allProjects?.filter(project => {
        // User is account owner - can see all projects in their accounts
        if (ownedAccountIds.includes(project.account_id)) {
          return true;
        }
        // User is regular member - can only see projects they have explicit access to
        if (memberAccountIds.includes(project.account_id)) {
          return accessibleProjectIds.includes(project.id);
        }
        // User has no relationship with this account
        return false;
      }) || [];
      
      console.log('🔍 [API/Projects] Filtered to:', projects.length, 'accessible projects');
    }

    console.log('✅ [API/Projects] Query successful!');
    console.log('📊 [API/Projects] Returning projects:', projects?.map(p => p.name) || []);
    
    return NextResponse.json(projects || []);
  } catch (error) {
    console.error('❌ [API/Projects] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}