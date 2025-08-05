import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();
    
    // Get all library items with their usage counts
    const { data: items, error } = await supabase
      .from('library_items')
      .select('id, name, type, usage_count')
      .order('usage_count', { ascending: false });
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Calculate some stats
    const stats = {
      totalItems: items.length,
      totalUsage: items.reduce((sum, item) => sum + (item.usage_count || 0), 0),
      itemsWithUsage: items.filter(item => item.usage_count > 0).length,
      topUsedItems: items.slice(0, 5),
    };
    
    return NextResponse.json({
      stats,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        usage_count: item.usage_count || 0,
      })),
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch library usage data' },
      { status: 500 }
    );
  }
}