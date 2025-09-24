import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name: componentName } = await params;

    if (!componentName) {
      return NextResponse.json({ error: 'Component name is required' }, { status: 400 });
    }

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    // Query by name or by metadata.component_code (for className mapping)
    const { data: component, error } = await serviceClient
      .from('core_components')
      .select('*')
      .or(`name.eq.${componentName},metadata->>component_code.eq.${componentName}`)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching component by name:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!component) {
      return NextResponse.json({ error: 'Component not found' }, { status: 404 });
    }

    return NextResponse.json(component);
  } catch (error) {
    console.error('Error in component by-name API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}