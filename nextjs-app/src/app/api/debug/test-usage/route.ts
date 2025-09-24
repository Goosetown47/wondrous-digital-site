/* eslint-disable security/detect-object-injection */
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getComponentUsage } from '@/lib/services/component-usage-service';
import { getAllVariations, getCodeName } from '@/lib/services/naming-service';

export async function GET() {
  try {
    const serviceClient = createAdminClient();

    // Test data
    const testComponents = ['Nav Bar 1', 'HeroTwoColumn', 'Footer 1'];

    interface TestResults {
      coreComponents?: unknown;
      labDrafts?: unknown;
      libraryItems?: unknown;
      namingTests: Record<string, {
        codeName: string;
        variations: string[];
        usage: unknown;
      }>;
    }

    const results: TestResults = {
      namingTests: {}
    };

    // First, check what's in core_components
    const { data: coreComponents } = await serviceClient
      .from('core_components')
      .select('name, code_name')
      .in('name', testComponents);

    results.coreComponents = coreComponents;

    // Check what's in lab_drafts
    const { data: labDrafts } = await serviceClient
      .from('lab_drafts')
      .select('name, metadata')
      .limit(5);

    interface LabDraftMetadata {
      component_name?: string;
    }

    results.labDrafts = labDrafts?.map(d => ({
      name: d.name,
      component_name: (d.metadata as LabDraftMetadata)?.component_name
    }));

    // Check what's in library_items
    const { data: libraryItems } = await serviceClient
      .from('library_items')
      .select('name, component_name')
      .limit(5);

    results.libraryItems = libraryItems;

    // Test naming service
    for (const name of testComponents) {
      const variations = getAllVariations(name);
      const codeName = getCodeName(name);
      const usage = await getComponentUsage(name);

      results.namingTests[name] = {
        codeName,
        variations,
        usage
      };
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}