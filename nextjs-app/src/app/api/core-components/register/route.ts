import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { getBuildSafeCookieStore } from '@/lib/cookies/build-safe';
import { env } from '@/env.mjs';
import { getComponentCodeName } from '@/lib/component-name-mapping';

interface RegisterRequest {
  componentId: string;
  type: 'section' | 'navigation' | 'page';
  typeId?: string;
  defaultContent?: Record<string, unknown>;
  description?: string;
}

/**
 * API endpoint to register a component (mark it as configured and ready to use)
 */
export async function POST(request: NextRequest) {
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

    const body: RegisterRequest = await request.json();
    const { componentId, typeId, defaultContent, description } = body;

    // Validate required fields
    if (!componentId) {
      return NextResponse.json(
        { error: 'Component ID is required' },
        { status: 400 }
      );
    }

    // Create service role client to bypass RLS
    const serviceClient = createAdminClient();

    // Get the component first to have its name
    const { data: component } = await serviceClient
      .from('core_components')
      .select('*')
      .eq('id', componentId)
      .single();

    if (!component) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }

    // Get the code name for this component
    const componentCodeName = getComponentCodeName(component.name);

    // Update the component in database to mark it as registered
    const { data: updatedComponent, error: updateError } = await serviceClient
      .from('core_components')
      .update({
        is_registered: true,
        registered_at: new Date().toISOString(),
        registered_by: user.id,
        type_id: typeId || null,
        default_content: defaultContent || {},
        description: description || null,
        metadata: {
          ...(component.metadata || {}),
          component_code: componentCodeName // Store the code name in metadata
        }
      })
      .eq('id', componentId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating component registration:', updateError);
      return NextResponse.json(
        { error: 'Failed to register component' },
        { status: 500 }
      );
    }

    // Note: We don't register in ComponentRegistry here anymore
    // The ComponentRegistry is pre-populated with actual component implementations
    // in register-components.ts

    return NextResponse.json({
      success: true,
      message: `Component registered successfully`,
      component: updatedComponent
    });
  } catch (error) {
    console.error('Error registering component:', error);
    return NextResponse.json(
      { error: 'Failed to register component' },
      { status: 500 }
    );
  }
}