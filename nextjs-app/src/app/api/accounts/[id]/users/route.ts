import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { env } from '@/env.mjs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: accountId } = await params;
  console.log('🔍 [API/Accounts/Users] Fetching users for account:', accountId);

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
      console.log('❌ [API/Accounts/Users] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/Accounts/Users] Authenticated user:', user.email);

    // Use service role client to bypass RLS
    const serviceClient = createAdminClient();

    // Check if user is admin/staff
    const { data: adminCheck } = await serviceClient
      .from('account_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('account_id', '00000000-0000-0000-0000-000000000000')
      .in('role', ['admin', 'staff'])
      .single();
    
    const isAdminOrStaff = !!adminCheck;

    // Check if user has access to this account
    if (!isAdminOrStaff) {
      const { data: memberCheck } = await serviceClient
        .from('account_users')
        .select('role')
        .eq('user_id', user.id)
        .eq('account_id', accountId)
        .single();
      
      if (!memberCheck) {
        console.log('❌ [API/Accounts/Users] User not a member of this account');
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Fetch account users with details
    const { data: accountUsers, error: usersError } = await serviceClient
      .from('account_users')
      .select('*')
      .eq('account_id', accountId)
      .order('joined_at', { ascending: true });

    if (usersError) {
      console.error('❌ [API/Accounts/Users] Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Get user details from auth.users
    const userIds = accountUsers?.map(au => au.user_id) || [];
    
    if (userIds.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch user details for all users
    const userDetailsPromises = userIds.map(async (userId) => {
      const { data: authUser } = await serviceClient.auth.admin.getUserById(userId);
      return authUser?.user;
    });

    const userDetails = await Promise.all(userDetailsPromises);

    // Combine account_users data with auth.users data
    const usersWithDetails = accountUsers?.map(au => {
      const authUser = userDetails.find(u => u?.id === au.user_id);
      return {
        account_id: au.account_id,
        user_id: au.user_id,
        role: au.role,
        joined_at: au.joined_at,
        invited_by: au.invited_by,
        email: authUser?.email || '',
        email_confirmed_at: authUser?.email_confirmed_at || null,
        display_name: authUser?.user_metadata?.display_name || 
                     authUser?.user_metadata?.full_name || 
                     authUser?.email?.split('@')[0] || '',
        avatar_url: authUser?.user_metadata?.avatar_url || null,
        profile_metadata: {},
        raw_user_meta_data: authUser?.user_metadata || {}
      };
    }) || [];

    console.log(`✅ [API/Accounts/Users] Found ${usersWithDetails.length} users`);

    return NextResponse.json(usersWithDetails);

  } catch (error) {
    console.error('❌ [API/Accounts/Users] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}