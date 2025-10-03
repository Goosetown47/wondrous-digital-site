/**
 * API Route: Project Global Sections
 *
 * GET    - Fetch all global sections for a project
 * POST   - Create a new global section
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/projects/[id]/sections
 * Fetch all global sections for a project
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id: projectId } = await context.params;

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

    // If not platform admin, verify user has access to this specific project
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
    }

    // Fetch all global sections for this project
    const { data: sections, error } = await supabase
      .from('project_sections')
      .select('*')
      .eq('project_id', projectId)
      .order('section_placement')
      .order('display_order');

    if (error) {
      console.error('Error fetching project sections:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sections' },
        { status: 500 }
      );
    }

    return NextResponse.json(sections || []);
  } catch (error) {
    console.error('Unexpected error in GET /api/projects/[projectId]/sections:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[projectId]/sections
 * Create a new global section
 */
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id: projectId } = await context.params;
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

    // Validate required fields
    if (!body.component_name || !body.section_placement) {
      return NextResponse.json(
        { error: 'Missing required fields: component_name, section_placement' },
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

    // Create the section
    const { data: section, error } = await supabase
      .from('project_sections')
      .insert({
        project_id: projectId,
        component_name: body.component_name,
        content: body.content || {},
        section_placement: body.section_placement,
        display_order: body.display_order || 0,
        is_published: body.is_published || false,
        library_item_id: body.library_item_id || null,
        library_version: body.library_version || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project section:', error);
      return NextResponse.json(
        { error: 'Failed to create section' },
        { status: 500 }
      );
    }

    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/projects/[projectId]/sections:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
