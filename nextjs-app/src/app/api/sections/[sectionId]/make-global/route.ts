/**
 * API Route: Convert Page Section to Global
 *
 * POST - Convert a page-specific section to a global project section
 * NOTE: Sections are stored in pages.sections JSONB array, not in a separate table
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ sectionId: string }>;
}

interface PageSection {
  id: string;
  component_name: string;
  content?: Record<string, unknown>;
  order?: number;
  library_item_id?: string;
  library_version?: number;
  [key: string]: unknown;
}

interface Page {
  id: string;
  project_id: string;
  sections: PageSection[];
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

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the page that contains this section in its sections JSONB array
    // We need to search all pages for this section ID
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('id, project_id, sections')
      .not('sections', 'is', null);

    if (pagesError) {
      console.error('Error fetching pages:', pagesError);
      return NextResponse.json(
        { error: 'Failed to fetch pages' },
        { status: 500 }
      );
    }

    // Find the page containing this section
    let targetPage: Page | null = null;
    let targetSection: PageSection | null = null;

    for (const page of pages as Page[]) {
      if (Array.isArray(page.sections)) {
        const section = page.sections.find((s: PageSection) => s.id === sectionId);
        if (section) {
          targetPage = page;
          targetSection = section;
          break;
        }
      }
    }

    if (!targetPage || !targetSection) {
      return NextResponse.json(
        { error: 'Section not found in any page' },
        { status: 404 }
      );
    }

    const projectId = targetPage.project_id;

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

    // Authorization passed - use service role client for DB operations
    // This bypasses RLS to avoid circular dependency issues
    // (project_sections RLS checks account_users which has its own RLS)
    const serviceClient = createSupabaseServiceClient();

    // Create the global section
    const { data: globalSection, error: createError } = await serviceClient
      .from('project_sections')
      .insert({
        project_id: projectId,
        component_name: targetSection.component_name,
        content: targetSection.content || {},
        section_placement: body.section_placement,
        display_order: body.display_order || 0,
        is_published: false,
        library_item_id: targetSection.library_item_id || null,
        library_version: targetSection.library_version || null,
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

    // Remove the section from the page's sections array
    const updatedSections = targetPage.sections.filter((s: PageSection) => s.id !== sectionId);

    // Update the page - remove from BOTH sections and published_sections
    const { error: updateError } = await serviceClient
      .from('pages')
      .update({
        sections: updatedSections,
        published_sections: updatedSections, // Also update published to prevent duplicates
      })
      .eq('id', targetPage.id);

    if (updateError) {
      console.error('Error updating page sections:', updateError);
      // Rollback: delete the global section we just created
      await serviceClient
        .from('project_sections')
        .delete()
        .eq('id', globalSection.id);

      return NextResponse.json(
        { error: 'Failed to remove section from page' },
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
