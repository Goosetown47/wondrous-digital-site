import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { env } from '@/env.mjs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  
  console.log('🔍 [API/Pages/Homepage] Get or create homepage for project:', projectId);

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
      console.log('❌ [API/Pages/Homepage] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/Pages/Homepage] Authenticated user:', user.email);

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    // First get the project to ensure it exists and get account_id
    const { data: project, error: projectError } = await serviceClient
      .from('projects')
      .select('id, account_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      console.error('❌ [API/Pages/Homepage] Project not found:', projectError);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check if homepage already exists
    const { data: existingPage } = await serviceClient
      .from('pages')
      .select('*')
      .eq('project_id', projectId)
      .eq('path', '/')
      .single();

    if (existingPage) {
      console.log('✅ [API/Pages/Homepage] Found existing homepage:', existingPage.id);
      return NextResponse.json(existingPage);
    }

    console.log('🔍 [API/Pages/Homepage] Creating new homepage...');

    // Create homepage using service role (bypasses RLS)
    const { data: newPage, error: createError } = await serviceClient
      .from('pages')
      .insert({
        project_id: projectId,
        path: '/',
        title: 'Home',
        sections: [],
        published_sections: [], // Initialize published_sections as empty array
        metadata: {
          description: 'Homepage',
          isHomepage: true
        }
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ [API/Pages/Homepage] Homepage creation error:', createError);
      return NextResponse.json({ 
        error: `Failed to create homepage: ${createError.message}`,
        details: createError
      }, { status: 500 });
    }

    console.log('✅ [API/Pages/Homepage] Homepage created successfully:', newPage.id);

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
          project_id: projectId,
          path: '/',
          title: 'Home',
          auto_created: true,
          created_via_api: true
        }
      });

    return NextResponse.json(newPage);

  } catch (error) {
    console.error('❌ [API/Pages/Homepage] Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}