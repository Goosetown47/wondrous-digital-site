import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { env } from '@/env.mjs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const source = searchParams.get('source');
  const search = searchParams.get('search');

  console.log('🔍 [API/CoreComponents] Fetching core components with filters:', {
    type, source, search
  });

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
      console.log('❌ [API/CoreComponents] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/CoreComponents] Authenticated user:', user.email);

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    console.log('🔍 [API/CoreComponents] Using service role to query core components...');

    // Build query with filters
    let query = serviceClient
      .from('core_components')
      .select('*')
      .order('name');

    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }

    if (source) {
      query = query.eq('source', source);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: components, error } = await query;

    if (error) {
      console.error('❌ [API/CoreComponents] Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ [API/CoreComponents] Service role query successful!');
    console.log('📊 [API/CoreComponents] Found components:', components?.length || 0);

    return NextResponse.json(components || []);

  } catch (error) {
    console.error('❌ [API/CoreComponents] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('🔍 [API/CoreComponents] Creating new core component...');

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
      console.log('❌ [API/CoreComponents] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/CoreComponents] Authenticated user:', user.email);

    // Parse request body
    const body = await request.json();
    const { 
      name, 
      type, 
      source, 
      code, 
      dependencies = [], 
      imports = {}, 
      description,
      metadata = {} 
    } = body;

    if (!name || !type || !source || !code) {
      return NextResponse.json({ 
        error: 'name, type, source, and code are required' 
      }, { status: 400 });
    }

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    console.log('🔍 [API/CoreComponents] Creating core component with service role...');

    // Create the core component using service role
    const { data: newComponent, error: createError } = await serviceClient
      .from('core_components')
      .insert({
        name,
        type,
        source,
        code,
        dependencies,
        imports,
        description,
        metadata
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ [API/CoreComponents] Creation error:', createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    console.log('✅ [API/CoreComponents] Core component created:', newComponent.id);

    // Log the action
    await serviceClient
      .from('audit_logs')
      .insert({
        account_id: '00000000-0000-0000-0000-000000000000', // Platform account
        user_id: user.id,
        action: 'core_component.create',
        resource_type: 'core_component',
        resource_id: newComponent.id,
        metadata: {
          component_name: name,
          component_type: type,
          source,
          created_via_api: true
        }
      });

    return NextResponse.json(newComponent);

  } catch (error) {
    console.error('❌ [API/CoreComponents] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}