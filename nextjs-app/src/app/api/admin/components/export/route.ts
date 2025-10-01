import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerClient } from '@supabase/ssr';
import { getBuildSafeCookieStore } from '@/lib/cookies/build-safe';
import { env } from '@/env.mjs';
import { isAdminServer, isStaffServer } from '@/lib/permissions/server-checks';
import fs from 'fs/promises';
import path from 'path';

/**
 * Export component data as SQL migration
 * Generates INSERT statements for selected components
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await getBuildSafeCookieStore();
    const authClient = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { user }, error: userError } = await authClient.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user is admin or staff
    const [isAdmin, isStaff] = await Promise.all([
      isAdminServer(user.id),
      isStaffServer(user.id)
    ]);

    if (!isAdmin && !isStaff) {
      return NextResponse.json(
        { error: 'Access denied. Admin or staff role required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { componentIds } = body as { componentIds: string[] };

    if (!componentIds || !Array.isArray(componentIds) || componentIds.length === 0) {
      return NextResponse.json(
        { error: 'No component IDs provided' },
        { status: 400 }
      );
    }

    // Use admin client to get components
    const supabase = createAdminClient();

    const { data: components, error: fetchError } = await supabase
      .from('core_components')
      .select('*')
      .in('id', componentIds)
      .order('code_name');

    if (fetchError) {
      console.error('Failed to fetch components:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch components' },
        { status: 500 }
      );
    }

    if (!components || components.length === 0) {
      return NextResponse.json(
        { error: 'No components found' },
        { status: 404 }
      );
    }

    // Generate SQL migration
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const filename = `${timestamp}_export_components.sql`;
    const sql = generateMigrationSQL(components);

    // Save to supabase/exports/migrations/ folder for permanent record
    try {
      const exportsDir = path.join(process.cwd(), 'supabase', 'exports', 'migrations');
      const filePath = path.join(exportsDir, filename);

      // Ensure directory exists
      await fs.mkdir(exportsDir, { recursive: true });

      // Write SQL file
      await fs.writeFile(filePath, sql, 'utf-8');

      console.log(`✅ Saved export migration to: ${filePath}`);
    } catch (fsError) {
      console.error('⚠️ Failed to save export file locally:', fsError);
      // Don't fail the request if file save fails - user can still download
    }

    return NextResponse.json({
      success: true,
      filename,
      sql,
      componentCount: components.length
    });

  } catch (error: unknown) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

/**
 * Generate SQL INSERT statements for components
 */
function generateMigrationSQL(components: Record<string, unknown>[]): string {
  const header = `-- Component Export Migration
-- Generated: ${new Date().toISOString()}
-- Components: ${components.length}
--
-- INSTRUCTIONS:
-- 1. Review this SQL carefully before applying
-- 2. Apply to PROD database via Supabase Dashboard
-- 3. Go to SQL Editor and paste this entire file
-- 4. Click "Run" to execute
-- 5. Verify components appear in core_components table
--

`;

  const inserts = components.map(comp => {
    // Escape single quotes in text fields
    const escapeSQLString = (str: string | null | undefined): string => {
      if (!str) return 'NULL';
      return `'${str.replace(/'/g, "''")}'`;
    };

    const escapeSQLValue = (value: unknown): string => {
      if (value === null || value === undefined) return 'NULL';
      if (typeof value === 'string') return escapeSQLString(value);
      if (typeof value === 'boolean') return value ? 'true' : 'false';
      if (typeof value === 'number') return String(value);
      if (typeof value === 'object') return escapeSQLString(JSON.stringify(value));
      return escapeSQLString(String(value));
    };

    return `-- Component: ${comp.name}
INSERT INTO core_components (
  id,
  name,
  code_name,
  type,
  source,
  code,
  dependencies,
  imports,
  metadata,
  deployment_status,
  pipeline_status,
  auto_number,
  base_type,
  default_content,
  editable_fields,
  created_at,
  updated_at
) VALUES (
  ${escapeSQLValue(comp.id)},
  ${escapeSQLValue(comp.name)},
  ${escapeSQLValue(comp.code_name)},
  ${escapeSQLValue(comp.type)},
  ${escapeSQLValue(comp.source)},
  ${escapeSQLValue(comp.code)},
  ${escapeSQLValue(comp.dependencies)},
  ${escapeSQLValue(comp.imports)},
  ${escapeSQLValue(comp.metadata)},
  ${escapeSQLValue(comp.deployment_status)},
  ${escapeSQLValue(comp.pipeline_status)},
  ${escapeSQLValue(comp.auto_number)},
  ${escapeSQLValue(comp.base_type)},
  ${escapeSQLValue(comp.default_content)},
  ${escapeSQLValue(comp.editable_fields)},
  ${escapeSQLValue(comp.created_at)},
  ${escapeSQLValue(comp.updated_at)}
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code_name = EXCLUDED.code_name,
  type = EXCLUDED.type,
  source = EXCLUDED.source,
  code = EXCLUDED.code,
  dependencies = EXCLUDED.dependencies,
  imports = EXCLUDED.imports,
  metadata = EXCLUDED.metadata,
  deployment_status = EXCLUDED.deployment_status,
  pipeline_status = EXCLUDED.pipeline_status,
  auto_number = EXCLUDED.auto_number,
  base_type = EXCLUDED.base_type,
  default_content = EXCLUDED.default_content,
  editable_fields = EXCLUDED.editable_fields,
  updated_at = EXCLUDED.updated_at;

`;
  }).join('\n');

  const footer = `-- Migration complete!
-- ${components.length} component(s) exported
`;

  return header + inserts + footer;
}