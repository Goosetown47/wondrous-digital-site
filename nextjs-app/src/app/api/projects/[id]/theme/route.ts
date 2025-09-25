import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { getBuildSafeCookieStore } from '@/lib/cookies/build-safe';
import { env } from '@/env.mjs';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  console.log('🔍 [API/Projects/Theme] Applying theme to project:', projectId);

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
      console.log('❌ [API/Projects/Theme] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { themeId, overrides = {} } = body;

    console.log('🔍 [API/Projects/Theme] Applying theme with service role...', {
      themeId: themeId || 'null (removing theme)',
      hasOverrides: Object.keys(overrides).length > 0
    });

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    // Verify project exists and get project info
    const { data: project, error: projectError } = await serviceClient
      .from('projects')
      .select('id, name, account_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      console.error('❌ [API/Projects/Theme] Project not found:', projectError);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // If themeId provided, verify theme exists
    let themeName = null;
    if (themeId) {
      const { data: theme, error: themeError } = await serviceClient
        .from('library_items')
        .select('name')
        .eq('id', themeId)
        .eq('type', 'theme')
        .single();

      if (themeError || !theme) {
        console.error('❌ [API/Projects/Theme] Theme not found:', themeError);
        return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
      }
      themeName = theme.name;
    }

    // Apply theme to project using service role
    const { data: updatedProject, error: updateError } = await serviceClient
      .from('projects')
      .update({
        theme_id: themeId,
        theme_overrides: overrides,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ [API/Projects/Theme] Update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    console.log('✅ [API/Projects/Theme] Theme applied to project:', projectId);

    // Log the action
    await serviceClient
      .from('audit_logs')
      .insert({
        account_id: project.account_id,
        user_id: user.id,
        action: themeId ? 'project.theme_apply' : 'project.theme_remove',
        resource_type: 'project',
        resource_id: projectId,
        metadata: {
          project_name: project.name,
          theme_id: themeId,
          theme_name: themeName,
          has_overrides: Object.keys(overrides).length > 0,
          applied_via_api: true
        }
      });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('❌ [API/Projects/Theme] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}