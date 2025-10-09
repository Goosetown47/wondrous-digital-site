/**
 * API Route: Individual Project Section
 *
 * PATCH  - Update a global section
 * DELETE - Delete a global section
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ id: string; sectionId: string }>;
}

/**
 * PATCH /api/projects/[id]/sections/[sectionId]
 * Update a global section
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id: projectId, sectionId } = await context.params;
    const body = await request.json();

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

    // If not platform admin, verify user has owner/admin access to this project
    if (!platformAccess) {
      const { data: project, error: projectError } = await supabase
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

      if (projectError || !project) {
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

    // Verify section belongs to this project
    const { data: existingSection, error: fetchError } = await serviceClient
      .from('project_sections')
      .select('id')
      .eq('id', sectionId)
      .eq('project_id', projectId)
      .single();

    if (fetchError || !existingSection) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      );
    }

    // Build update object (only include fields that are present)
    const updates: Record<string, unknown> = {};

    if (body.component_name !== undefined) updates.component_name = body.component_name;
    if (body.content !== undefined) updates.content = body.content;
    if (body.section_placement !== undefined) {
      // Validate section_placement
      const validPlacements = ['global_header', 'global_footer', 'above_content', 'below_content'];
      if (!validPlacements.includes(body.section_placement)) {
        return NextResponse.json(
          { error: `Invalid section_placement. Must be one of: ${validPlacements.join(', ')}` },
          { status: 400 }
        );
      }
      updates.section_placement = body.section_placement;
    }
    if (body.display_order !== undefined) updates.display_order = body.display_order;
    if (body.is_published !== undefined) updates.is_published = body.is_published;
    if (body.library_item_id !== undefined) updates.library_item_id = body.library_item_id;
    if (body.library_version !== undefined) updates.library_version = body.library_version;

    // Update the section
    const { data: section, error } = await serviceClient
      .from('project_sections')
      .update(updates)
      .eq('id', sectionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating project section:', error);
      return NextResponse.json(
        { error: 'Failed to update section' },
        { status: 500 }
      );
    }

    return NextResponse.json(section);
  } catch (error) {
    console.error('Unexpected error in PATCH /api/projects/[projectId]/sections/[sectionId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]/sections/[sectionId]
 * Delete a global section
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id: projectId, sectionId } = await context.params;

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

    // If not platform admin, verify user has owner/admin access to this project
    if (!platformAccess) {
      const { data: project, error: projectError } = await supabase
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

      if (projectError || !project) {
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

    // Delete the section (RLS will ensure it belongs to this project)
    const { error } = await supabase
      .from('project_sections')
      .delete()
      .eq('id', sectionId)
      .eq('project_id', projectId);

    if (error) {
      console.error('Error deleting project section:', error);
      return NextResponse.json(
        { error: 'Failed to delete section' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/projects/[projectId]/sections/[sectionId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
