import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { getCodeNameWithAutoNumber, extractComponentType } from '@/lib/services/naming-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { displayName } = body;

    if (!displayName) {
      return NextResponse.json({
        success: false,
        error: 'displayName is required'
      }, { status: 400 });
    }

    // Create Supabase client
    const supabase = createClient();

    // Get types from database for testing
    const { data: types, error: typesError } = await supabase
      .from('types')
      .select('name, display_name')
      .eq('category', 'section');

    if (typesError) {
      console.error('Error fetching types:', typesError);
    }

    // Test the auto-numbering
    const codeName = await getCodeNameWithAutoNumber(displayName, supabase);

    // Also test the type extraction
    const extractedType = extractComponentType(displayName, types || undefined);

    // Get existing components of this type for context
    const { data: existingComponents } = await supabase
      .from('core_components')
      .select('code_name')
      .ilike('code_name', `${extractedType}%`)
      .order('code_name');

    return NextResponse.json({
      success: true,
      input: displayName,
      result: {
        codeName,
        baseType: extractedType,
        existingComponents: existingComponents?.map(c => c.code_name) || []
      },
      availableTypes: types?.map(t => ({
        name: t.name,
        display: t.display_name
      })) || [],
      message: `"${displayName}" → "${codeName}" (Type: ${extractedType})`
    });

  } catch (error) {
    console.error('Naming service test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}

export async function GET() {
  // Also provide a way to see current types in database
  const supabase = createClient();

  const { data: types } = await supabase
    .from('types')
    .select('name, display_name')
    .eq('category', 'section')
    .order('name');

  const { data: components } = await supabase
    .from('core_components')
    .select('code_name, base_type, auto_number')
    .order('code_name');

  return NextResponse.json({
    message: 'Auto-Numbering Test Endpoint',
    usage: 'POST /api/test/naming with { displayName: "Your Component Name" }',
    examples: [
      { displayName: 'Awesome Bento Box' },
      { displayName: 'Newsletter Signup Form' },
      { displayName: 'Epic Hero Banner' },
      { displayName: 'Random Widget' }
    ],
    currentTypes: types || [],
    existingComponents: components || []
  });
}