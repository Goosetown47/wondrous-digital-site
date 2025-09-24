import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const libraryItemId = searchParams.get('library_item_id');

  if (!libraryItemId) {
    return NextResponse.json({ error: 'library_item_id is required' }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('library_versions')
      .select('*')
      .eq('library_item_id', libraryItemId)
      .order('version', { ascending: false });

    if (error) {
      console.error('Failed to fetch library versions:', error);
      return NextResponse.json({ error: 'Failed to fetch library versions' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching library versions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}