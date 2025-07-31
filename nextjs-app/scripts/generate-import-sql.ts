#!/usr/bin/env node

/**
 * Generate SQL statements to import components into Core
 * This creates a migration file that can be run to populate the core_components table
 */

import * as fs from 'fs';
import * as path from 'path';
import { ComponentParser } from './lib/component-parser';
import { ShadcnFetcher } from './lib/shadcn-fetcher';

const parser = new ComponentParser();
const fetcher = new ShadcnFetcher();

function generateSQL() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0].replace(/-/g, '');
  const sqlStatements: string[] = [];
  
  sqlStatements.push(`-- Auto-generated component import migration`);
  sqlStatements.push(`-- Generated on ${new Date().toISOString()}\n`);

  // Get all installed shadcn components
  const installedComponents = fetcher.getInstalledComponents();
  console.log(`Found ${installedComponents.length} installed shadcn components\n`);

  installedComponents.forEach(componentName => {
    const componentPath = fetcher.getComponentPath(componentName);
    if (!componentPath) return;

    try {
      const parsed = parser.parseComponentFile(componentPath);
      const componentInfo = fetcher.getComponent(componentName);
      
      const sql = `
INSERT INTO core_components (name, type, source, code, dependencies, imports, metadata)
VALUES (
  '${parsed.name}',
  '${parsed.type}',
  'shadcn',
  $code$${parsed.code}$code$,
  '${JSON.stringify(componentInfo?.dependencies || parsed.dependencies)}'::jsonb,
  '${JSON.stringify(parsed.imports)}'::jsonb,
  '${JSON.stringify({
    ...parsed.metadata,
    originalName: componentName,
    importDate: new Date().toISOString(),
    autoImported: true,
  })}'::jsonb
) ON CONFLICT (name, source) DO UPDATE SET
  code = EXCLUDED.code,
  dependencies = EXCLUDED.dependencies,
  imports = EXCLUDED.imports,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();`;

      sqlStatements.push(sql);
      console.log(`✅ Generated SQL for ${componentName}`);
    } catch (error) {
      console.error(`❌ Failed to process ${componentName}:`, error);
    }
  });

  // Write to migration file
  const migrationDir = path.join(process.cwd(), 'supabase/migrations');
  const migrationFile = path.join(migrationDir, `${timestamp}_import_shadcn_components.sql`);
  
  fs.writeFileSync(migrationFile, sqlStatements.join('\n\n'));
  console.log(`\n✅ Migration file created: ${migrationFile}`);
  console.log('\nRun this command to apply the migration:');
  console.log(`npx supabase db push --password 'your-password'`);
}

// Run the generator
generateSQL();