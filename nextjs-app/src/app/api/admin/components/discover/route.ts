import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isAdminServer } from '@/lib/permissions/server-checks';
import { discoverExistingComponents, getComponentMetadata } from '@/lib/component-import/component-discovery';

export async function POST() {
  try {
    // Check authentication
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const isUserAdmin = await isAdminServer(user.id);
    if (!isUserAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.log('Starting component discovery...');

    // Discover existing components
    const discoveredComponents = await discoverExistingComponents();
    console.log(`Discovered ${discoveredComponents.length} components`);

    // Get existing component imports to avoid duplicates
    const { data: existingImports } = await supabase
      .from('component_imports')
      .select('name');

    const existingNames = new Set(existingImports?.map(imp => imp.name) || []);

    // Filter out components that are already tracked
    const newComponents = discoveredComponents.filter(
      component => !existingNames.has(component.name)
    );

    console.log(`Found ${newComponents.length} new components to register`);

    // Insert new historical components into database
    const componentsToInsert = newComponents.map(component => ({
      ...getComponentMetadata(component),
      imported_by: user.id // Set current admin as the discoverer
    }));

    if (componentsToInsert.length > 0) {
      const { data: insertedComponents, error: insertError } = await supabase
        .from('component_imports')
        .insert(componentsToInsert)
        .select();

      if (insertError) {
        console.error('Error inserting discovered components:', insertError);
        throw new Error(`Failed to save discovered components: ${insertError.message}`);
      }

      console.log(`Successfully registered ${insertedComponents?.length || 0} components`);
    }

    // Return summary
    const summary = {
      totalDiscovered: discoveredComponents.length,
      newlyRegistered: componentsToInsert.length,
      alreadyTracked: discoveredComponents.length - newComponents.length,
      components: discoveredComponents.map(comp => ({
        name: comp.name,
        source: comp.source,
        dependencies: comp.dependencies.length,
        isNew: !existingNames.has(comp.name)
      }))
    };

    return NextResponse.json({
      success: true,
      message: `Discovery complete! Found ${summary.totalDiscovered} components, registered ${summary.newlyRegistered} new ones.`,
      summary
    });

  } catch (error) {
    console.error('Component discovery error:', error);
    console.error('Error details:', error instanceof Error ? error.stack : error);
    return NextResponse.json({
      error: 'Failed to discover components',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}