import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { env } from '@/env.mjs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const includeArchived = searchParams.get('includeArchived') === 'true';

  console.log('🔍 [API/Projects] Starting projects fetch (using service role)...');
  console.log('🔍 [API/Projects] Include archived:', includeArchived);

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
      console.log('❌ [API/Projects] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/Projects] Authenticated user:', user.email);

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    console.log('🔍 [API/Projects] Using service role to query projects...');
    
    // Build query using service role (bypasses all RLS policies)
    let query = serviceClient
      .from('projects')
      .select(`
        *,
        accounts(
          id,
          name,
          slug,
          plan
        )
      `)
      .order('created_at', { ascending: false });

    if (!includeArchived) {
      query = query.is('archived_at', null);
    }

    const { data: projects, error: projectsError } = await query;

    console.log('🔍 [API/Projects] Service role query result:', {
      hasData: !!projects,
      dataLength: projects?.length || 0,
      error: projectsError?.message || 'none'
    });

    if (projectsError) {
      console.error('❌ [API/Projects] Database error:', projectsError);
      return NextResponse.json({ error: projectsError.message }, { status: 500 });
    }

    console.log('✅ [API/Projects] Service role query successful!');
    console.log('📊 [API/Projects] Found projects:', projects?.map(p => p.name) || []);
    
    return NextResponse.json(projects || []);

  } catch (error) {
    console.error('❌ [API/Projects] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}