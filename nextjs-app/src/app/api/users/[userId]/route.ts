import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { env } from '@/env.mjs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  console.log('🔍 [API/Users/UserId] Fetching user:', userId);

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
      console.log('❌ [API/Users/UserId] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/Users/UserId] Authenticated user:', user.email);

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    console.log('🔍 [API/Users/UserId] Using service role to query specific user...');

    // Get specific user from auth.users
    const { data: authUser, error: authError } = await serviceClient.auth.admin.getUserById(userId);

    if (authError || !authUser) {
      console.error('❌ [API/Users/UserId] User not found:', authError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('✅ [API/Users/UserId] Found auth user:', authUser.user.email);

    // Get account relationships for this user
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
      `)
      .eq('user_id', userId);

    if (accountError) {
      console.error('❌ [API/Users/UserId] Account users error:', accountError);
      return NextResponse.json({ error: accountError.message }, { status: 500 });
    }

    console.log('✅ [API/Users/UserId] Found account relationships:', accountUsers.length);

    // Transform account data
    const userAccounts = accountUsers.map(au => {
      // Handle case where accounts might be an array
      const account = Array.isArray(au.accounts) ? au.accounts[0] : au.accounts;
      return {
        account_id: account.id,
        account_name: account.name,
        account_slug: account.slug,
        role: au.role,
        joined_at: au.joined_at ? new Date(au.joined_at).toISOString() : null
      };
    });

    // Determine primary account (platform account if admin/staff, otherwise first account)
    const platformAccount = userAccounts.find(
      acc => acc.account_id === '00000000-0000-0000-0000-000000000000'
    );
    const primaryAccount = platformAccount || userAccounts[0];

    const userWithAccounts = {
      id: authUser.user.id,
      email: authUser.user.email,
      display_name: authUser.user.user_metadata?.display_name || authUser.user.email?.split('@')[0],
      user_metadata: authUser.user.user_metadata || {},
      created_at: authUser.user.created_at ? new Date(authUser.user.created_at).toISOString() : null,
      last_sign_in_at: authUser.user.last_sign_in_at ? new Date(authUser.user.last_sign_in_at).toISOString() : null,
      email_confirmed_at: authUser.user.email_confirmed_at ? new Date(authUser.user.email_confirmed_at).toISOString() : null,
      accounts: userAccounts,
      primary_account: primaryAccount
    };

    console.log('✅ [API/Users/UserId] User with account data prepared');

    return NextResponse.json({ user: userWithAccounts });

  } catch (error) {
    console.error('❌ [API/Users/UserId] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  console.log('🔍 [API/Users/UserId] Updating user:', userId);

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
      console.log('❌ [API/Users/UserId] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { display_name, phone, metadata } = body;

    console.log('🔍 [API/Users/UserId] Updating user metadata with service role...', { display_name, phone, metadata });

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    // Prepare the user metadata structure
    const userMetadata = {
      display_name,
      phone,
      ...(metadata || {}),
    };

    // Update user metadata using service role
    const { data: updatedUser, error: updateError } = await serviceClient.auth.admin.updateUserById(
      userId,
      {
        user_metadata: userMetadata,
      }
    );

    if (updateError) {
      console.error('❌ [API/Users/UserId] Update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    console.log('✅ [API/Users/UserId] User updated:', userId);

    // Log the action
    await serviceClient
      .from('audit_logs')
      .insert({
        account_id: '00000000-0000-0000-0000-000000000000', // Platform account
        user_id: user.id,
        action: 'user.update',
        resource_type: 'user',
        resource_id: userId,
        metadata: {
          updated_user_id: userId,
          updated_by: user.id,
          changes: { display_name, phone, metadata }
        }
      });

    // Return updated user data in consistent format
    const userWithAccounts = {
      id: updatedUser.user.id,
      email: updatedUser.user.email,
      display_name: updatedUser.user.user_metadata?.display_name,
      user_metadata: updatedUser.user.user_metadata || {},
      created_at: updatedUser.user.created_at ? new Date(updatedUser.user.created_at).toISOString() : null,
      last_sign_in_at: updatedUser.user.last_sign_in_at ? new Date(updatedUser.user.last_sign_in_at).toISOString() : null,
      email_confirmed_at: updatedUser.user.email_confirmed_at ? new Date(updatedUser.user.email_confirmed_at).toISOString() : null,
    };

    return NextResponse.json({ user: userWithAccounts });
  } catch (error) {
    console.error('❌ [API/Users/UserId] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  console.log('🔍 [API/Users/UserId] Delete user request:', userId);

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
      console.log('❌ [API/Users/UserId] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/Users/UserId] Delete requested by:', user.email);

    // Create service role client
    const serviceClient = createAdminClient();

    // Check if current user is admin
    const { data: currentUserRole } = await serviceClient
      .from('account_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('account_id', '00000000-0000-0000-0000-000000000000')
      .single();

    if (!currentUserRole || currentUserRole.role !== 'admin') {
      console.log('❌ [API/Users/UserId] Access denied - not an admin');
      return NextResponse.json({ error: 'Access denied. Admin role required.' }, { status: 403 });
    }

    // Prevent self-deletion
    if (userId === user.id) {
      console.log('❌ [API/Users/UserId] Cannot delete yourself');
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Get user details before deletion for audit log
    const { data: targetUser, error: fetchError } = await serviceClient.auth.admin.getUserById(userId);
    
    if (fetchError || !targetUser) {
      console.log('❌ [API/Users/UserId] User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if target user is also an admin (extra safety)
    const { data: targetUserRole } = await serviceClient
      .from('account_users')
      .select('role')
      .eq('user_id', userId)
      .eq('account_id', '00000000-0000-0000-0000-000000000000')
      .single();

    if (targetUserRole && targetUserRole.role === 'admin') {
      console.log('❌ [API/Users/UserId] Cannot delete admin users');
      return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 400 });
    }

    console.log('🔍 [API/Users/UserId] Deleting user:', targetUser.user.email);

    // Log the deletion before actually deleting
    await serviceClient
      .from('audit_logs')
      .insert({
        account_id: '00000000-0000-0000-0000-000000000000',
        user_id: user.id,
        action: 'user.deleted',
        resource_type: 'user',
        resource_id: userId,
        metadata: {
          deleted_user_email: targetUser.user.email,
          deleted_by: user.email,
          deleted_at: new Date().toISOString(),
        }
      });

    // Manually delete related records first (Supabase cascade doesn't always work with auth.users)
    console.log('🔍 [API/Users/UserId] Deleting related records...');

    // Clean up account_invitations first
    console.log('🔍 [API/Users/UserId] Cleaning up invitations...');
    
    // 1. Delete invitations created by this user
    const { error: invitedByError } = await serviceClient
      .from('account_invitations')
      .delete()
      .eq('invited_by', userId);
    
    if (invitedByError) {
      console.error('⚠️ [API/Users/UserId] Error deleting invitations by user:', invitedByError);
    } else {
      console.log('✅ [API/Users/UserId] Deleted invitations created by user');
    }
    
    // 2. Set accepted_by to NULL for invitations they accepted
    const { error: acceptedByError } = await serviceClient
      .from('account_invitations')
      .update({ accepted_by: null })
      .eq('accepted_by', userId);
    
    if (acceptedByError) {
      console.error('⚠️ [API/Users/UserId] Error updating accepted invitations:', acceptedByError);
    } else {
      console.log('✅ [API/Users/UserId] Updated invitations accepted by user');
    }
    
    // 3. Delete pending invitations for their email
    if (targetUser.user.email) {
      const { error: pendingInviteError } = await serviceClient
        .from('account_invitations')
        .delete()
        .eq('email', targetUser.user.email.toLowerCase())
        .is('accepted_at', null);
      
      if (pendingInviteError) {
        console.error('⚠️ [API/Users/UserId] Error deleting pending invitations:', pendingInviteError);
      } else {
        console.log('✅ [API/Users/UserId] Deleted pending invitations for user email');
      }
    }

    // Delete from account_users
    const { error: accountUsersError } = await serviceClient
      .from('account_users')
      .delete()
      .eq('user_id', userId);

    if (accountUsersError) {
      console.error('⚠️ [API/Users/UserId] Error deleting account_users:', accountUsersError);
      // Continue anyway - might already be deleted
    } else {
      console.log('✅ [API/Users/UserId] Deleted from account_users');
    }

    // Delete from user_profiles
    const { error: profileError } = await serviceClient
      .from('user_profiles')
      .delete()
      .eq('user_id', userId);

    if (profileError) {
      console.error('⚠️ [API/Users/UserId] Error deleting user_profiles:', profileError);
      // Continue anyway - might already be deleted
    } else {
      console.log('✅ [API/Users/UserId] Deleted from user_profiles');
    }

    // Delete from profiles (legacy table if it exists)
    const { error: legacyProfileError } = await serviceClient
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (legacyProfileError) {
      // This table might not exist or have data, which is fine
      console.log('ℹ️ [API/Users/UserId] Legacy profiles table not found or no data');
    } else {
      console.log('✅ [API/Users/UserId] Deleted from legacy profiles table');
    }

    // Now delete the user from auth.users
    console.log('🔍 [API/Users/UserId] Deleting from auth.users...');
    const { error: deleteError } = await serviceClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('❌ [API/Users/UserId] Delete error:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    console.log('✅ [API/Users/UserId] User deleted successfully from all tables');

    return NextResponse.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });

  } catch (error) {
    console.error('❌ [API/Users/UserId] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}