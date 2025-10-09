/**
 * API Route: Convert Global Section to Page-Specific
 *
 * POST - Convert a global project section to a page-specific section
 * NOTE: This is the inverse of make-global
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ sectionId: string }>;
}

interface ProjectSection {
  id: string;
  project_id: string;
  component_name: string;
  content: Record<string, unknown>;
  section_placement: string;
  display_order: number;
  is_published: boolean;
  library_item_id?: string;
  library_version?: number;
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
  published_sections: PageSection[];
}

/**
 * POST /api/sections/[sectionId]/make-local
 * Convert a global project section to a page-specific section
 *
 * Body:
 * - page_id: string (required) - The page to add this section to
 * - project_id: string (required) - The project ID for authorization
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
    if (!body.page_id) {
      return NextResponse.json(
        { error: 'Missing required field: page_id' },
        { status: 400 }
      );
    }

    if (!body.project_id) {
      return NextResponse.json(
        { error: 'Missing required field: project_id' },
        { status: 400 }
      );
    }

    const projectId = body.project_id;

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

    // Authorization passed - use service role client for DB operations
    // This bypasses RLS to avoid circular dependency issues
    const serviceClient = createSupabaseServiceClient();

    // Now find the global section using service client
    const { data: globalSection, error: sectionError } = await serviceClient
      .from('project_sections')
      .select('*')
      .eq('id', sectionId)
      .eq('project_id', projectId)
      .single();

    if (sectionError || !globalSection) {
      return NextResponse.json(
        { error: 'Global section not found' },
        { status: 404 }
      );
    }

    const typedGlobalSection = globalSection as ProjectSection;

    // Verify the target page exists and belongs to the same project
    const { data: page, error: pageError } = await serviceClient
      .from('pages')
      .select('id, project_id, sections, published_sections')
      .eq('id', body.page_id)
      .eq('project_id', projectId)
      .single();

    if (pageError || !page) {
      return NextResponse.json(
        { error: 'Page not found or does not belong to this project' },
        { status: 404 }
      );
    }

    const typedPage = page as Page;

    // Create new page section from global section
    const existingSections = Array.isArray(typedPage.sections) ? typedPage.sections : [];
    const existingPublished = Array.isArray(typedPage.published_sections) ? typedPage.published_sections : [];

    // Calculate next order value
    const nextOrder = existingSections.length > 0
      ? Math.max(...existingSections.map(s => s.order || 0)) + 1
      : 0;

    // Create page section object
    const newPageSection: PageSection = {
      id: `section-${Date.now()}`, // Generate new ID for page section
      component_name: typedGlobalSection.component_name,
      content: typedGlobalSection.content || {},
      order: nextOrder,
      library_item_id: typedGlobalSection.library_item_id || undefined,
      library_version: typedGlobalSection.library_version || undefined,
    };

    // Add to both sections and published_sections arrays
    const updatedSections = [...existingSections, newPageSection];
    const updatedPublished = [...existingPublished, newPageSection];

    // Update the page with new section
    const { error: updateError } = await serviceClient
      .from('pages')
      .update({
        sections: updatedSections,
        published_sections: updatedPublished, // Also update published to keep in sync
      })
      .eq('id', typedPage.id);

    if (updateError) {
      console.error('Error updating page sections:', updateError);
      return NextResponse.json(
        { error: 'Failed to add section to page' },
        { status: 500 }
      );
    }

    // Delete the global section from project_sections table
    const { error: deleteError } = await serviceClient
      .from('project_sections')
      .delete()
      .eq('id', sectionId);

    if (deleteError) {
      console.error('Error deleting global section:', deleteError);
      // Rollback: remove the section we just added to the page
      await serviceClient
        .from('pages')
        .update({
          sections: existingSections,
          published_sections: existingPublished,
        })
        .eq('id', typedPage.id);

      return NextResponse.json(
        { error: 'Failed to remove global section' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      pageSection: newPageSection,
      message: 'Section successfully converted to page-specific'
    }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in POST /api/sections/[sectionId]/make-local:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
