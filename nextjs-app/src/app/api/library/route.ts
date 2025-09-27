import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { getBuildSafeCookieStore } from '@/lib/cookies/build-safe';
import { env } from '@/env.mjs';
import { isAdminServer, isStaffServer } from '@/lib/permissions/server-checks';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const published = searchParams.get('published');
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  console.log('🔍 [API/Library] Fetching library items with filters:', {
    type, published, category, search
  });

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
      console.log('❌ [API/Library] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/Library] Authenticated user:', user.email);

    // Check if user is admin or staff
    const [isAdmin, isStaff] = await Promise.all([
      isAdminServer(user.id),
      isStaffServer(user.id)
    ]);

    if (!isAdmin && !isStaff) {
      console.log('❌ [API/Library] Access denied - user is not admin or staff');
      return NextResponse.json({ 
        error: 'Access denied. Admin or staff role required.' 
      }, { status: 403 });
    }

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    console.log('🔍 [API/Library] Using service role to query library items...');

    // Build query with filters
    let query = serviceClient
      .from('library_items')
      .select('*')
      .order('updated_at', { ascending: false });

    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }

    if (published !== null && published !== undefined) {
      query = query.eq('published', published === 'true');
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: items, error } = await query;

    if (error) {
      console.error('❌ [API/Library] Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ [API/Library] Service role query successful!');
    console.log('📊 [API/Library] Found items:', items?.length || 0);

    return NextResponse.json(items || []);
  } catch (error) {
    console.error('❌ [API/Library] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('🔍 [API/Library] Creating new library item...');

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
      console.log('❌ [API/Library] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/Library] Authenticated user:', user.email);

    // Check if user is admin or staff
    const [isAdmin, isStaff] = await Promise.all([
      isAdminServer(user.id),
      isStaffServer(user.id)
    ]);

    if (!isAdmin && !isStaff) {
      console.log('❌ [API/Library] Access denied - user is not admin or staff');
      return NextResponse.json({ 
        error: 'Access denied. Admin or staff role required.' 
      }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { name, type, content, description, category, published = false } = body;

    if (!name || !type || !content) {
      return NextResponse.json({ 
        error: 'name, type, and content are required' 
      }, { status: 400 });
    }

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    console.log('🔍 [API/Library] Creating library item with service role...');

    // Create the library item using service role
    const { data: newItem, error: createError } = await serviceClient
      .from('library_items')
      .insert({
        name,
        type,
        content,
        description,
        category,
        published,
        usage_count: 0,
        created_by: user.id
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ [API/Library] Creation error:', createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    console.log('✅ [API/Library] Library item created:', newItem.id);

    // Log the action (we'll need to determine account_id, for now use platform account)
    await serviceClient
      .from('audit_logs')
      .insert({
        account_id: '00000000-0000-0000-0000-000000000000', // Platform account
        user_id: user.id,
        action: 'library_item.create',
        resource_type: 'library_item',
        resource_id: newItem.id,
        metadata: {
          item_name: name,
          item_type: type,
          created_via_api: true
        }
      });

    return NextResponse.json(newItem);
  } catch (error) {
    console.error('❌ [API/Library] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}