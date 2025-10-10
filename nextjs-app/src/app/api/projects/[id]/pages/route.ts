/**
 * API Route: Get Project Pages
 *
 * Fetches all pages for a project (used by PageSelector)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface ProjectPage {
  id: string;
  name: string;
  path: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const { id: projectId } = await params;

    console.log('📄 [API/Pages] Fetching pages for project:', projectId);

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    // Fetch pages for the project
    // Note: pages table uses 'title' column, not 'name', and doesn't have 'published' column
    const { data: pages, error } = await supabase
      .from('pages')
      .select('id, title, path')
      .eq('project_id', projectId)
      .order('title', { ascending: true });

    if (error) {
      console.error('❌ [API/Pages] Error fetching project pages:', {
        projectId,
        error,
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error.details,
      });
      return NextResponse.json(
        { error: 'Failed to fetch pages', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ [API/Pages] Found pages:', pages?.length || 0);

    // Transform to match ProjectPage interface (map title -> name)
    const projectPages: ProjectPage[] = (pages || []).map((page) => ({
      id: page.id,
      name: page.title, // Map title to name for interface
      path: page.path,
    }));

    return NextResponse.json(projectPages);
  } catch (error) {
    console.error('Unexpected error in GET /api/projects/[id]/pages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
