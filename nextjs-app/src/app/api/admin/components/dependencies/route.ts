import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isAdminServer } from '@/lib/permissions/server-checks';
import fs from 'fs/promises';
import path from 'path';

interface ComponentImport {
  id: string;
  name: string;
  source: string;
  source_url: string;
  dependencies: string[];
  transformations: string[];
  import_date: string;
  imported_by?: string;
  user?: {
    email: string;
  };
}

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const source = searchParams.get('source');
    const includeHistory = searchParams.get('includeHistory') === 'true';

    // Fetch component imports from database
    const query = supabase
      .from('component_imports')
      .select(includeHistory ? '*, user:imported_by(email)' : '*')
      .order('import_date', { ascending: false });

    const { data: imports, error: dbError } = await query;

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Filter by source if requested
    let filteredImports: ComponentImport[] = (imports || []) as unknown as ComponentImport[];
    if (source) {
      filteredImports = filteredImports.filter(
        (imp: ComponentImport) => imp.source === source
      );
    }

    // Get list of UI component files
    const componentsDir = path.join(process.cwd(), 'src', 'components', 'ui');
    let uiComponents: string[] = [];

    try {
      const files = await fs.readdir(componentsDir);
      uiComponents = files.filter(file =>
        file.endsWith('.tsx') || file.endsWith('.ts')
      );
    } catch {
      // Directory might not exist yet
      uiComponents = [];
    }

    // Get installed dependencies from package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    let installedDependencies: string[] = [];

    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      const deps = packageJson.dependencies || {};
      // Filter out dev dependencies and internal packages
      installedDependencies = Object.keys(deps).filter(dep =>
        !dep.startsWith('@types/') &&
        !dep.startsWith('next') &&
        !dep.includes('eslint') &&
        !dep.includes('typescript')
      );
    } catch {
      installedDependencies = [];
    }

    // Calculate statistics
    const bySource = filteredImports.reduce((acc: Record<string, number>, imp: ComponentImport) => {
      acc[imp.source] = (acc[imp.source] || 0) + 1;
      return acc;
    }, {});

    const allDependencies = new Set<string>();
    filteredImports.forEach((imp: ComponentImport) => {
      (imp.dependencies || []).forEach(dep => allDependencies.add(dep));
    });

    // Format response
    const response = {
      components: filteredImports.map((imp: ComponentImport) => ({
        id: imp.id,
        name: imp.name,
        source: imp.source,
        sourceUrl: imp.source_url,
        dependencies: imp.dependencies || [],
        transformations: imp.transformations || [],
        importDate: imp.import_date,
        importedBy: includeHistory && imp.user ? imp.user.email : undefined
      })),
      uiComponents,
      installedDependencies,
      stats: {
        totalComponents: filteredImports.length,
        totalUiFiles: uiComponents.length,
        bySource,
        uniqueDependencies: allDependencies.size
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Dependencies fetch error:', error);
    return NextResponse.json({
      error: 'Failed to fetch dependencies',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}