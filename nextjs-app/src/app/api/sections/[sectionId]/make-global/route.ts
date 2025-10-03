/**
 * API Route: Convert Page Section to Global
 *
 * POST - Convert a page-specific section to a global project section
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ sectionId: string }>;
}

/**
 * POST /api/sections/[sectionId]/make-global
 * Convert a page-specific section to a global project section
 *
 * Body:
 * - section_placement: 'global_header' | 'global_footer' | 'above_content' | 'below_content'
 * - display_order: number (optional, defaults to 0)
 */
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { sectionId } = await context.params;
    const body = await request.json();

    // Validate required fields
    if (!body.section_placement) {
      return NextResponse.json(
        { error: 'Missing required field: section_placement' },
        { status: 400 }
      );
    }

    // Validate section_placement
    const validPlacements = ['global_header', 'global_footer', 'above_content', 'below_content'];
    if (!validPlacements.includes(body.section_placement)) {
      return NextResponse.json(
        { error: `Invalid section_placement. Must be one of: ${validPlacements.join(', ')}` },
        { status: 400 }
      );
    }

    // Fetch the page section
    const { data: pageSection, error: fetchError } = await supabase
      .from('page_sections')
      .select('*, pages!inner(project_id)')
      .eq('id', sectionId)
      .single();

    if (fetchError || !pageSection) {
      return NextResponse.json(
        { error: 'Page section not found' },
        { status: 404 }
      );
    }

    // Get project_id from the joined pages table
    const projectId = (pageSection.pages as { project_id: string }).project_id;

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First check if user is a platform admin/staff
    const { data: platformAccess } = await supabase
      .from('account_users')
      .select('role')
      .eq('account_id', '00000000-0000-0000-0000-000000000000')
      .eq('user_id', user.id)
      .in('role', ['admin', 'staff'])
      .single();

    // If not platform admin, verify user has owner/admin access to the project
    if (!platformAccess) {
      const { data: project, error: projectCheckError } = await supabase
        .from('projects')
        .select(`
          id,
          accounts!inner(
            id,
            account_users!inner(
              user_id,
              role
            )
          )
        `)
        .eq('id', projectId)
        .eq('accounts.account_users.user_id', user.id)
        .single();

      if (projectCheckError || !project) {
        return NextResponse.json(
          { error: 'Project not found or access denied' },
          { status: 404 }
        );
      }

      // Check if user has owner/admin role
      const accounts = project.accounts as unknown as { account_users: Array<{ role: string }> };
      const userRole = accounts.account_users[0]?.role;

      if (!userRole || !['owner', 'admin'].includes(userRole)) {
        return NextResponse.json(
          { error: 'Unauthorized - Owner or Admin access required' },
          { status: 403 }
        );
      }
    }

    // Create the global section
    const { data: globalSection, error: createError } = await supabase
      .from('project_sections')
      .insert({
        project_id: projectId,
        component_name: pageSection.component_name,
        content: pageSection.content || {},
        section_placement: body.section_placement,
        display_order: body.display_order || 0,
        is_published: pageSection.is_published || false,
        library_item_id: pageSection.library_item_id || null,
        library_version: pageSection.library_version || null,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating global section:', createError);
      return NextResponse.json(
        { error: 'Failed to create global section' },
        { status: 500 }
      );
    }

    // Delete the page section
    const { error: deleteError } = await supabase
      .from('page_sections')
      .delete()
      .eq('id', sectionId);

    if (deleteError) {
      console.error('Error deleting page section:', deleteError);
      // Rollback: delete the global section we just created
      await supabase
        .from('project_sections')
        .delete()
        .eq('id', globalSection.id);

      return NextResponse.json(
        { error: 'Failed to delete page section' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      globalSection,
      message: 'Section successfully converted to global'
    }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in POST /api/sections/[sectionId]/make-global:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
