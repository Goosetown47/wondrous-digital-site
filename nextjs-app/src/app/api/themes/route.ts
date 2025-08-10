import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { env } from '@/env.mjs';
import { isAdminServer, isStaffServer } from '@/lib/permissions/server-checks';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const published = searchParams.get('published');

  console.log('🔍 [API/Themes] Fetching themes, published filter:', published);

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
      console.log('❌ [API/Themes] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/Themes] Authenticated user:', user.email);

    // Check if user is admin or staff
    const [isAdmin, isStaff] = await Promise.all([
      isAdminServer(user.id),
      isStaffServer(user.id)
    ]);

    if (!isAdmin && !isStaff) {
      console.log('❌ [API/Themes] Access denied - user is not admin or staff');
      return NextResponse.json({ 
        error: 'Access denied. Admin or staff role required.' 
      }, { status: 403 });
    }

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    console.log('🔍 [API/Themes] Using service role to query themes from library...');

    // Build query - themes are stored as library items with type='theme'
    let query = serviceClient
      .from('library_items')
      .select('*')
      .eq('type', 'theme')
      .order('created_at', { ascending: false });

    // Apply published filter if specified
    if (published !== null && published !== undefined) {
      query = query.eq('published', published === 'true');
    }

    const { data: themeItems, error } = await query;

    if (error) {
      console.error('❌ [API/Themes] Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ [API/Themes] Service role query successful!');
    console.log('📊 [API/Themes] Found themes:', themeItems?.length || 0);

    // Transform library items to theme format for backwards compatibility
    const themes = (themeItems || []).map(item => ({
      id: item.id,
      name: item.name,
      variables: item.content?.variables || {},
      metadata: item.metadata || {},
      created_at: item.created_at,
      updated_at: item.updated_at,
      published: item.published,
      usage_count: item.usage_count || 0
    }));

    return NextResponse.json(themes);

  } catch (error) {
    console.error('❌ [API/Themes] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('🔍 [API/Themes] Creating new theme...');

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
      console.log('❌ [API/Themes] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/Themes] Authenticated user:', user.email);

    // Check if user is admin or staff
    const [isAdmin, isStaff] = await Promise.all([
      isAdminServer(user.id),
      isStaffServer(user.id)
    ]);

    if (!isAdmin && !isStaff) {
      console.log('❌ [API/Themes] Access denied - user is not admin or staff');
      return NextResponse.json({ 
        error: 'Access denied. Admin or staff role required.' 
      }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { name, variables, metadata = {}, published = false } = body;

    if (!name || !variables) {
      return NextResponse.json({ 
        error: 'name and variables are required' 
      }, { status: 400 });
    }

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    console.log('🔍 [API/Themes] Creating theme as library item with service role...');

    // Create the theme as a library item using service role
    const { data: newTheme, error: createError } = await serviceClient
      .from('library_items')
      .insert({
        name,
        type: 'theme',
        content: { variables },
        description: `Theme: ${name}`,
        category: 'theme',
        published,
        usage_count: 0,
        metadata,
        created_by: user.id
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ [API/Themes] Creation error:', createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    console.log('✅ [API/Themes] Theme created:', newTheme.id);

    // Log the action
    await serviceClient
      .from('audit_logs')
      .insert({
        account_id: '00000000-0000-0000-0000-000000000000', // Platform account
        user_id: user.id,
        action: 'theme.create',
        resource_type: 'theme',
        resource_id: newTheme.id,
        metadata: {
          theme_name: name,
          created_via_api: true
        }
      });

    // Transform back to theme format for response
    const themeResponse = {
      id: newTheme.id,
      name: newTheme.name,
      variables: newTheme.content?.variables || {},
      metadata: newTheme.metadata || {},
      created_at: newTheme.created_at,
      updated_at: newTheme.updated_at,
      published: newTheme.published,
      usage_count: newTheme.usage_count || 0
    };

    return NextResponse.json(themeResponse);

  } catch (error) {
    console.error('❌ [API/Themes] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}