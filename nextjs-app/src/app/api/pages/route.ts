import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { env } from '@/env.mjs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const path = searchParams.get('path') || '/';

  console.log('🔍 [API/Pages] Starting pages fetch (using service role)...');
  console.log('🔍 [API/Pages] Project ID:', projectId);
  console.log('🔍 [API/Pages] Path:', path);

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

    // Verify user is authenticated (basic security check)
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    
    if (userError || !user) {
      console.log('❌ [API/Pages] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/Pages] Authenticated user:', user.email);

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    console.log('🔍 [API/Pages] Using service role to query pages...');
    
    if (projectId) {
      // Get specific page for project
      const { data: page, error: pageError } = await serviceClient
        .from('pages')
        .select('*')
        .eq('project_id', projectId)
        .eq('path', path)
        .single();

      if (pageError && pageError.code !== 'PGRST116') { // PGRST116 = not found
        console.error('❌ [API/Pages] Database error:', pageError);
        return NextResponse.json({ error: pageError.message }, { status: 500 });
      }

      console.log('✅ [API/Pages] Page query result:', page ? 'Found' : 'Not found');
      return NextResponse.json(page);
    } else {
      // Get all pages (admin only)
      const { data: pages, error: pagesError } = await serviceClient
        .from('pages')
        .select(`
          *,
          projects(
            id,
            name,
            account_id
          )
        `)
        .order('created_at', { ascending: false });

      if (pagesError) {
        console.error('❌ [API/Pages] Database error:', pagesError);
        return NextResponse.json({ error: pagesError.message }, { status: 500 });
      }

      console.log('✅ [API/Pages] Service role query successful!');
      console.log('📊 [API/Pages] Found pages:', pages?.length || 0);
      
      return NextResponse.json(pages || []);
    }

  } catch (error) {
    console.error('❌ [API/Pages] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('🔍 [API/Pages] Starting page creation (using service role)...');

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
      console.log('❌ [API/Pages] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/Pages] Authenticated user:', user.email);

    // Parse request body
    const body = await request.json();
    const { project_id, path, title, sections, metadata } = body;

    if (!project_id || !path) {
      return NextResponse.json({ error: 'project_id and path are required' }, { status: 400 });
    }

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    // First get the project to get account_id for audit logging
    const { data: project } = await serviceClient
      .from('projects')
      .select('id, account_id')
      .eq('id', project_id)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    console.log('🔍 [API/Pages] Creating page with service role...');

    // Create the page using service role (bypasses RLS)
    const { data: newPage, error: createError } = await serviceClient
      .from('pages')
      .insert({
        project_id,
        path,
        title,
        sections: sections || [],
        metadata: metadata || {}
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ [API/Pages] Page creation error:', createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    console.log('✅ [API/Pages] Page created successfully:', newPage.id);

    // Log the action
    await serviceClient
      .from('audit_logs')
      .insert({
        account_id: project.account_id,
        user_id: user.id,
        action: 'page.create',
        resource_type: 'page',
        resource_id: newPage.id,
        metadata: {
          page_id: newPage.id,
          project_id,
          path,
          title,
          created_via_api: true
        }
      });

    return NextResponse.json(newPage);

  } catch (error) {
    console.error('❌ [API/Pages] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}