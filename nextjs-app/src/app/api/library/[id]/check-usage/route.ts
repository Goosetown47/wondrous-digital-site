import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  console.log('🔍 [API/Library] Checking actual usage for:', id);

  try {
    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    // First, get the library item to know what we're looking for
    const { data: libraryItem, error: libraryError } = await serviceClient
      .from('library_items')
      .select('id, name, component_name')
      .eq('id', id)
      .single();

    if (libraryError || !libraryItem) {
      console.error('❌ [API/Library] Library item not found:', libraryError);
      return NextResponse.json({ error: 'Library item not found' }, { status: 404 });
    }

    // Check if this library item is currently used in any pages
    // Pages store sections with library_item_id in their metadata
    const { data: pages, error: pagesError } = await serviceClient
      .from('pages')
      .select('id, project_id, path, sections');

    if (pagesError) {
      console.error('❌ [API/Library] Error fetching pages:', pagesError);
      return NextResponse.json({ error: 'Failed to check usage' }, { status: 500 });
    }

    // Check if any page sections reference this library item
    let isInUse = false;
    const usageLocations: Array<{ projectId: string; pagePath: string }> = [];

    if (pages) {
      for (const page of pages) {
        if (page.sections && Array.isArray(page.sections)) {
          for (const section of page.sections) {
            // Check if this section references our library item
            if (
              section.library_item_id === id ||
              section.metadata?.library_item_id === id ||
              section.source_library_id === id
            ) {
              isInUse = true;
              usageLocations.push({
                projectId: page.project_id,
                pagePath: page.path
              });
            }
          }
        }
      }
    }

    // Also check if it's used in any project's theme
    const { data: projects, error: projectsError } = await serviceClient
      .from('projects')
      .select('id, name, theme_id');

    if (!projectsError && projects) {
      for (const project of projects) {
        // If this library item is a theme and is being used
        if (libraryItem.id === project.theme_id) {
          isInUse = true;
          usageLocations.push({
            projectId: project.id,
            pagePath: 'theme'
          });
        }
      }
    }

    console.log(`✅ [API/Library] Usage check for ${libraryItem.name}:`, {
      isInUse,
      locationCount: usageLocations.length
    });

    return NextResponse.json({
      isInUse,
      usageCount: usageLocations.length,
      locations: usageLocations
    });
  } catch (error) {
    console.error('❌ [API/Library] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}