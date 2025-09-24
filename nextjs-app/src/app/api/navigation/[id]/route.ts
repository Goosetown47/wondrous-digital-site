import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { navigationService } from '@/lib/services/navigation';
import { env } from '@/env.mjs';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/navigation/[id] - Get a single navigation menu
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
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

    const menu = await navigationService.getById(id);
    
    if (!menu) {
      return NextResponse.json({ error: 'Navigation menu not found' }, { status: 404 });
    }
    
    return NextResponse.json(menu);
  } catch (error) {
    console.error('Error fetching navigation menu:', error);
    return NextResponse.json(
      { error: 'Failed to fetch navigation menu' },
      { status: 500 }
    );
  }
}

// PUT /api/navigation/[id] - Update a navigation menu
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
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
    const updatedMenu = await navigationService.update(id, body);
    
    return NextResponse.json(updatedMenu);
  } catch (error) {
    console.error('Error updating navigation menu:', error);
    return NextResponse.json(
      { error: 'Failed to update navigation menu' },
      { status: 500 }
    );
  }
}

// DELETE /api/navigation/[id] - Delete a navigation menu
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
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

    await navigationService.delete(id);
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting navigation menu:', error);
    return NextResponse.json(
      { error: 'Failed to delete navigation menu' },
      { status: 500 }
    );
  }
}