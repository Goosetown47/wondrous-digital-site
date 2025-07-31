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
    const userAccounts = accountUsers.map(au => ({
      account_id: au.accounts.id,
      account_name: au.accounts.name,
      account_slug: au.accounts.slug,
      role: au.role,
      joined_at: au.joined_at ? new Date(au.joined_at).toISOString() : null
    }));

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