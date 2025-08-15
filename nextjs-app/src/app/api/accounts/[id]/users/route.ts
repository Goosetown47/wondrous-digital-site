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
      
      // Check if user is account_owner for accessing team management
      const isAccountOwner = memberCheck.role === 'account_owner';
      console.log('🔍 [API/Accounts/Users] User role:', memberCheck.role, 'Is account owner:', isAccountOwner);
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
    
    // Fetch user profiles for display names
    const { data: userProfiles } = await serviceClient
      .from('user_profiles')
      .select('user_id, display_name, phone, avatar_url')
      .in('user_id', userIds);

    // Combine account_users data with auth.users data and profiles
    const usersWithDetails = accountUsers?.map(au => {
      const authUser = userDetails.find(u => u?.id === au.user_id);
      const profile = userProfiles?.find(p => p.user_id === au.user_id);
      
      return {
        account_id: au.account_id,
        user_id: au.user_id,
        role: au.role,
        joined_at: au.joined_at,
        invited_by: au.invited_by,
        email: authUser?.email || '',
        email_confirmed_at: authUser?.email_confirmed_at || null,
        display_name: profile?.display_name || 
                     authUser?.user_metadata?.display_name || 
                     authUser?.user_metadata?.full_name || 
                     authUser?.email?.split('@')[0] || '',
        avatar_url: profile?.avatar_url || authUser?.user_metadata?.avatar_url || null,
        phone: profile?.phone || null,
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: accountId } = await params;
  console.log('🔍 [API/Accounts/Users] Updating user role for account:', accountId);

  try {
    // Verify authentication
    const cookieStore = await cookies();
    const authClient = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
        },
      }
    );

    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      console.log('❌ [API/Accounts/Users] No authenticated user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 [API/Accounts/Users] Authenticated user:', user.email);

    // Get request body
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
    }

    // Validate role
    const validRoles = ['admin', 'staff', 'account_owner', 'user'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Check if current user has permission to update roles
    // First check if they're an account owner or admin for this account
    const { data: currentUserRole } = await authClient
      .from('account_users')
      .select('role')
      .eq('account_id', accountId)
      .eq('user_id', user.id)
      .single();

    const isAccountOwner = currentUserRole?.role === 'account_owner';
    
    // Check if user is platform admin
    const { data: adminCheck } = await authClient
      .from('account_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('account_id', '00000000-0000-0000-0000-000000000000')
      .eq('role', 'admin')
      .single();

    const isAdmin = !!adminCheck;

    console.log('🔍 [API/Accounts/Users] User role:', currentUserRole?.role, 'Is account owner:', isAccountOwner);

    if (!isAccountOwner && !isAdmin) {
      console.log('❌ [API/Accounts/Users] User lacks permission to update roles');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Use service role client to update the role
    const serviceClient = createAdminClient();

    // Check if this would remove the last account_owner (only prevent for non-admins)
    if (!isAdmin && role !== 'account_owner') {
      const { data: accountOwners } = await serviceClient
        .from('account_users')
        .select('user_id')
        .eq('account_id', accountId)
        .eq('role', 'account_owner');

      if (accountOwners && accountOwners.length === 1 && accountOwners[0].user_id === userId) {
        console.log('❌ [API/Accounts/Users] Cannot remove the last account owner (non-admin restriction)');
        return NextResponse.json({ 
          error: 'Cannot remove the last account owner' 
        }, { status: 400 });
      }
    } else if (isAdmin && role !== 'account_owner') {
      console.log('✅ [API/Accounts/Users] Admin override - allowing role change from last account owner if needed');
    }

    // Update the user's role
    const { error: updateError } = await serviceClient
      .from('account_users')
      .update({ role })
      .eq('account_id', accountId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('❌ [API/Accounts/Users] Failed to update role:', updateError);
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
    }

    console.log('✅ [API/Accounts/Users] Role updated successfully');
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ [API/Accounts/Users] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: accountId } = await params;
  console.log('🔍 [API/Accounts/Users] Removing user from account:', accountId);

  try {
    // Verify authentication
    const cookieStore = await cookies();
    const authClient = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
        },
      }
    );

    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      console.log('❌ [API/Accounts/Users] No authenticated user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 [API/Accounts/Users] Authenticated user:', user.email);

    // Get userId from query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Prevent self-removal
    if (userId === user.id) {
      return NextResponse.json({ error: 'Cannot remove yourself from account' }, { status: 400 });
    }

    // Check if current user has permission to remove users
    const { data: currentUserRole } = await authClient
      .from('account_users')
      .select('role')
      .eq('account_id', accountId)
      .eq('user_id', user.id)
      .single();

    const isAccountOwner = currentUserRole?.role === 'account_owner';
    
    // Check if user is platform admin
    const { data: adminCheck } = await authClient
      .from('account_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('account_id', '00000000-0000-0000-0000-000000000000')
      .eq('role', 'admin')
      .single();

    const isAdmin = !!adminCheck;

    console.log('🔍 [API/Accounts/Users] User role:', currentUserRole?.role, 'Is account owner:', isAccountOwner);

    if (!isAccountOwner && !isAdmin) {
      console.log('❌ [API/Accounts/Users] User lacks permission to remove users');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Use service role client
    const serviceClient = createAdminClient();

    // Check if this would remove the last account_owner (only prevent for non-admins)
    if (!isAdmin) {
      const { data: userToRemove } = await serviceClient
        .from('account_users')
        .select('role')
        .eq('account_id', accountId)
        .eq('user_id', userId)
        .single();

      if (userToRemove?.role === 'account_owner') {
        const { data: accountOwners } = await serviceClient
          .from('account_users')
          .select('user_id')
          .eq('account_id', accountId)
          .eq('role', 'account_owner');

        if (accountOwners && accountOwners.length === 1) {
          console.log('❌ [API/Accounts/Users] Cannot remove the last account owner (non-admin restriction)');
          return NextResponse.json({ 
            error: 'Cannot remove the last account owner' 
          }, { status: 400 });
        }
      }
    } else {
      console.log('✅ [API/Accounts/Users] Admin override - allowing removal of last account owner if needed');
    }

    // Remove the user from the account
    const { error: deleteError } = await serviceClient
      .from('account_users')
      .delete()
      .eq('account_id', accountId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('❌ [API/Accounts/Users] Failed to remove user:', deleteError);
      return NextResponse.json({ error: 'Failed to remove user' }, { status: 500 });
    }

    console.log('✅ [API/Accounts/Users] User removed successfully');
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ [API/Accounts/Users] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}