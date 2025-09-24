import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { navigationService } from '@/lib/services/navigation';
import type { NavigationMenu } from '@/types/navigation';
import { env } from '@/env.mjs';

// GET /api/navigation - Get navigation menus for a project
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore cookie setting errors
            }
          },
        },
      }
    );
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Get navigation menus for the project
    const menus = await navigationService.getByProject(projectId);
    
    return NextResponse.json(menus);
  } catch (error) {
    console.error('Error fetching navigation menus:', error);
    return NextResponse.json(
      { error: 'Failed to fetch navigation menus' },
      { status: 500 }
    );
  }
}

// POST /api/navigation - Create a new navigation menu
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore cookie setting errors
            }
          },
        },
      }
    );
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { project_id, type, library_item_id, items, settings } = body;

    if (!project_id || !type) {
      return NextResponse.json(
        { error: 'Project ID and type are required' },
        { status: 400 }
      );
    }

    // Create the navigation menu
    const menu: Omit<NavigationMenu, 'id' | 'created_at' | 'updated_at'> = {
      project_id,
      type,
      library_item_id: library_item_id || null,
      items: items || [],
      settings: settings || {},
      is_active: false,
    };

    const newMenu = await navigationService.create(menu);
    
    return NextResponse.json(newMenu, { status: 201 });
  } catch (error) {
    console.error('Error creating navigation menu:', error);
    return NextResponse.json(
      { error: 'Failed to create navigation menu' },
      { status: 500 }
    );
  }
}