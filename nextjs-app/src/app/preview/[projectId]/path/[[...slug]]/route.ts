/**
 * Preview Path Redirect Route
 *
 * Converts page paths to page IDs for preview mode navigation.
 * This allows navigation links to stay within preview mode instead of
 * exiting to the live site.
 *
 * Flow:
 * 1. User clicks nav link in preview: /preview/abc123/path/about-us
 * 2. This route looks up the page with path "/about-us" in project "abc123"
 * 3. Redirects to: /preview/abc123/[pageId]
 * 4. User stays in preview mode with toolbar visible
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; slug: string[] }> }
) {
  // Next.js 15 requires awaiting params
  const { projectId, slug } = await params;

  // Reconstruct the page path from slug array
  // If slug is empty or undefined, path should be '/' (home page)
  // If slug is ['about-us'], path should be '/about-us'
  // If slug is ['services', 'consulting'], path should be '/services/consulting'
  const pagePath = slug && slug.length > 0 ? '/' + slug.join('/') : '/';

  const supabase = await createSupabaseServerClient();

  try {
    // Query for page with this path in this project
    const { data: page, error } = await supabase
      .from('pages')
      .select('id')
      .eq('project_id', projectId)
      .eq('path', pagePath)
      .single();

    if (error || !page) {
      // Page not found - return 404
      return new NextResponse(
        `Page not found: ${pagePath} in project ${projectId}`,
        { status: 404 }
      );
    }

    // Redirect to preview page
    const previewUrl = new URL(`/preview/${projectId}/${page.id}`, request.url);
    return NextResponse.redirect(previewUrl);

  } catch (error) {
    console.error('Preview path redirect error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
