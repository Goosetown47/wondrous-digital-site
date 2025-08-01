import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { env } from '@/env.mjs';

const PLATFORM_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';

export async function GET() {
  console.log('🔍 [API/Platform/Admins] Fetching platform admins (using service role)...');

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
      console.log('❌ [API/Platform/Admins] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/Platform/Admins] Authenticated user:', user.email);

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    // Get platform admins with their user data
    const { data: platformAdmins, error } = await serviceClient
      .from('account_users')
      .select('user_id, role, joined_at')
      .eq('account_id', PLATFORM_ACCOUNT_ID)
      .in('role', ['admin', 'staff']);

    if (error) {
      console.error('❌ [API/Platform/Admins] Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ [API/Platform/Admins] Found platform users:', platformAdmins.length);

    // Get auth user data for each platform user
    const { data: authUsers, error: authError } = await serviceClient.auth.admin.listUsers();

    if (authError) {
      console.error('❌ [API/Platform/Admins] Auth admin error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // Combine platform roles with auth user data
    const adminsWithUserData = platformAdmins
      .map(admin => {
        const authUser = authUsers.users.find(u => u.id === admin.user_id);
        if (!authUser) return null;

        return {
          user_id: admin.user_id,
          role: admin.role,
          joined_at: admin.joined_at ? new Date(admin.joined_at).toISOString() : null,
          email: authUser.email,
          display_name: authUser.user_metadata?.display_name || authUser.email?.split('@')[0],
          created_at: authUser.created_at ? new Date(authUser.created_at).toISOString() : null,
          last_sign_in_at: authUser.last_sign_in_at ? new Date(authUser.last_sign_in_at).toISOString() : null,
          email_confirmed_at: authUser.email_confirmed_at ? new Date(authUser.email_confirmed_at).toISOString() : null
        };
      })
      .filter(Boolean);

    console.log('✅ [API/Platform/Admins] Admins with user data:', adminsWithUserData.length);

    return NextResponse.json({ admins: adminsWithUserData });

  } catch (error) {
    console.error('❌ [API/Platform/Admins] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('🔍 [API/Platform/Admins] Promoting user to admin...');

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
      console.log('❌ [API/Platform/Admins] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    console.log('🔍 [API/Platform/Admins] Promoting user:', user_id);

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    // Check if user exists in auth
    const { data: userData, error: userCheckError } = await serviceClient.auth.admin.getUserById(user_id);
    if (userCheckError || !userData) {
      console.log('❌ [API/Platform/Admins] User not found:', user_id);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Add or update user as admin in platform account
    const { data: adminData, error: upsertError } = await serviceClient
      .from('account_users')
      .upsert({
        user_id,
        account_id: PLATFORM_ACCOUNT_ID,
        role: 'admin',
        joined_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (upsertError) {
      console.error('❌ [API/Platform/Admins] Upsert error:', upsertError);
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    console.log('✅ [API/Platform/Admins] User promoted to admin:', user_id);

    // Log the action
    await serviceClient
      .from('audit_logs')
      .insert({
        account_id: PLATFORM_ACCOUNT_ID,
        user_id: user.id,
        action: 'platform.admin_promoted',
        resource_type: 'user',
        resource_id: user_id,
        metadata: {
          promoted_user_id: user_id,
          promoted_by: user.id,
          promoted_user_email: userData.user.email
        },
      });

    return NextResponse.json({ success: true, data: adminData });

  } catch (error) {
    console.error('❌ [API/Platform/Admins] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  console.log('🔍 [API/Platform/Admins] Demoting admin...');

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
      console.log('❌ [API/Platform/Admins] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    console.log('🔍 [API/Platform/Admins] Demoting user:', user_id);

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    // Check if this would remove the last admin
    const { count: adminCount } = await serviceClient
      .from('account_users')
      .select('user_id', { count: 'exact', head: true })
      .eq('account_id', PLATFORM_ACCOUNT_ID)  
      .eq('role', 'admin');

    if (adminCount && adminCount <= 1) {
      console.log('❌ [API/Platform/Admins] Cannot remove last admin');
      return NextResponse.json({ error: 'Cannot remove the last admin' }, { status: 400 });
    }

    // Check if user exists and is admin
    const { data: existingRole, error: checkError } = await serviceClient
      .from('account_users')
      .select('*')
      .eq('user_id', user_id)
      .eq('account_id', PLATFORM_ACCOUNT_ID)
      .single();

    if (checkError || !existingRole) {
      console.log('❌ [API/Platform/Admins] User not found in platform account:', user_id);
      return NextResponse.json({ error: 'User not found in platform account' }, { status: 404 });
    }

    if (existingRole.role !== 'admin') {
      console.log('❌ [API/Platform/Admins] User is not an admin:', user_id);
      return NextResponse.json({ error: 'User is not an admin' }, { status: 400 });
    }

    // Demote to staff
    const { data: demotedData, error: demoteError } = await serviceClient
      .from('account_users')
      .update({ role: 'staff' })
      .eq('user_id', user_id)
      .eq('account_id', PLATFORM_ACCOUNT_ID)
      .select()
      .single();

    if (demoteError) {
      console.error('❌ [API/Platform/Admins] Demote error:', demoteError);
      return NextResponse.json({ error: demoteError.message }, { status: 500 });
    }

    console.log('✅ [API/Platform/Admins] User demoted to staff:', user_id);

    // Log the action
    await serviceClient
      .from('audit_logs')
      .insert({
        account_id: PLATFORM_ACCOUNT_ID,
        user_id: user.id,
        action: 'platform.admin_demoted',
        resource_type: 'user',
        resource_id: user_id,
        metadata: {
          demoted_user_id: user_id,
          demoted_by: user.id,
        },
      });

    return NextResponse.json({ success: true, data: demotedData });

  } catch (error) {
    console.error('❌ [API/Platform/Admins] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}