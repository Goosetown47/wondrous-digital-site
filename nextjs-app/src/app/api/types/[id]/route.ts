import { NextRequest, NextResponse } from 'next/server';
import { typesService } from '@/lib/supabase/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const type = await typesService.getById(id);
    return NextResponse.json(type);
  } catch (error) {
    console.error('Error fetching type:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const type = await typesService.update(id, body);
    return NextResponse.json(type);
  } catch (error) {
    console.error('Error updating type:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    await typesService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting type:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred' }, { status: 500 });
  }
}