import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { getBuildSafeCookieStore } from '@/lib/cookies/build-safe';
import { env } from '@/env.mjs';
import { analyzeContentStructure } from '@/lib/editable-field-detector';
import { ComponentRegistry } from '@/lib/register-components';

/**
 * GET /api/core-components/editable-fields?componentId=xxx
 * Fetch editable field configuration for a component
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const componentId = searchParams.get('componentId');
    const componentName = searchParams.get('componentName');

    if (!componentId && !componentName) {
      return NextResponse.json(
        { error: 'Component ID or name is required' },
        { status: 400 }
      );
    }

    // Create service role client to bypass RLS
    const serviceClient = createAdminClient();

    // If we have a component name, get it from the registry first
    if (componentName && !componentId) {
      const registryEntry = ComponentRegistry.get(componentName);
      if (registryEntry?.editableFields) {
        return NextResponse.json({
          fields: registryEntry.editableFields,
          source: 'registry'
        });
      }
    }

    // Otherwise fetch from database
    const query = componentId
      ? serviceClient.from('core_components').select('*').eq('id', componentId)
      : serviceClient.from('core_components').select('*').eq('name', componentName);

    const { data: component, error } = await query.single();

    if (error || !component) {
      // Try to get from registry if database lookup fails
      if (componentName) {
        const registryEntry = ComponentRegistry.get(componentName);
        if (registryEntry?.editableFields) {
          return NextResponse.json({
            fields: registryEntry.editableFields,
            source: 'registry'
          });
        }
      }

      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }

    // Return editable fields if they exist
    if (component.editable_fields) {
      return NextResponse.json({
        fields: component.editable_fields,
        source: 'database'
      });
    }

    // If no fields defined, try to auto-detect from default content
    if (component.default_content) {
      const detectedFields = analyzeContentStructure(component.default_content);
      return NextResponse.json({
        fields: detectedFields,
        source: 'auto-detected'
      });
    }

    // No fields available
    return NextResponse.json({
      fields: [],
      source: 'none'
    });
  } catch (error) {
    console.error('Error fetching editable fields:', error);
    return NextResponse.json(
      { error: 'Failed to fetch editable fields' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/core-components/editable-fields
 * Update editable field configuration for a component
 */
export async function PUT(request: NextRequest) {
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
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { componentId, fields } = body;

    if (!componentId) {
      return NextResponse.json(
        { error: 'Component ID is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(fields)) {
      return NextResponse.json(
        { error: 'Fields must be an array' },
        { status: 400 }
      );
    }

    // Create service role client to bypass RLS
    const serviceClient = createAdminClient();

    // Update the component's editable fields
    const { data: updatedComponent, error: updateError } = await serviceClient
      .from('core_components')
      .update({
        editable_fields: fields,
        updated_at: new Date().toISOString(),
      })
      .eq('id', componentId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating editable fields:', updateError);
      return NextResponse.json(
        { error: 'Failed to update editable fields' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      component: updatedComponent
    });
  } catch (error) {
    console.error('Error updating editable fields:', error);
    return NextResponse.json(
      { error: 'Failed to update editable fields' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/core-components/editable-fields/analyze
 * Analyze content structure to suggest editable fields
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'object') {
      return NextResponse.json(
        { error: 'Content object is required' },
        { status: 400 }
      );
    }

    // Analyze the content structure
    const detectedFields = analyzeContentStructure(content as Record<string, unknown>);

    return NextResponse.json({
      fields: detectedFields,
      count: detectedFields.length
    });
  } catch (error) {
    console.error('Error analyzing content:', error);
    return NextResponse.json(
      { error: 'Failed to analyze content structure' },
      { status: 500 }
    );
  }
}