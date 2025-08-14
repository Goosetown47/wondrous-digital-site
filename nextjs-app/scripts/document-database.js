#!/usr/bin/env node

/**
 * Database Documentation Script
 * 
 * This script analyzes the production database and generates comprehensive documentation
 * to help with database isolation and development environment setup.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function documentDatabase() {
  console.log('📊 Starting database documentation...\n');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = path.join(__dirname, `../database-documentation-${timestamp}.md`);
  
  let documentation = `# Production Database Documentation\n\n`;
  documentation += `Generated: ${new Date().toLocaleString()}\n\n`;
  documentation += `Database URL: ${supabaseUrl}\n\n`;
  
  try {
    // 1. Get all tables
    console.log('📋 Fetching table list...');
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_info');
    
    if (tablesError) {
      // Fallback to basic query if RPC doesn't exist
      // Use raw SQL query to get tables
      const { data: tableList, error } = await supabase.rpc('get_tables_list');
      
      if (error) throw error;
      
      documentation += `## Tables Overview\n\n`;
      documentation += `Total tables found: ${tableList?.length || 0}\n\n`;
      
      // Get row counts for each table
      documentation += `### Table Row Counts\n\n`;
      documentation += `| Table Name | Row Count | Has Data |\n`;
      documentation += `|------------|-----------|----------|\n`;
      
      const tablesWithData = [];
      const emptyTables = [];
      
      for (const table of tableList || []) {
        try {
          const { count, error: countError } = await supabase
            .from(table.table_name)
            .select('*', { count: 'exact', head: true });
          
          if (!countError) {
            const hasData = count > 0;
            documentation += `| ${table.table_name} | ${count} | ${hasData ? '✅' : '❌'} |\n`;
            
            if (hasData) {
              tablesWithData.push({ name: table.table_name, count });
            } else {
              emptyTables.push(table.table_name);
            }
          }
        } catch (e) {
          documentation += `| ${table.table_name} | Error | ❓ |\n`;
        }
      }
      
      documentation += `\n### Summary\n\n`;
      documentation += `- **Tables with data:** ${tablesWithData.length}\n`;
      documentation += `- **Empty tables:** ${emptyTables.length}\n\n`;
      
      // List tables with significant data
      documentation += `### Tables with User Data\n\n`;
      const significantTables = tablesWithData.filter(t => t.count > 0);
      significantTables.sort((a, b) => b.count - a.count);
      
      for (const table of significantTables) {
        documentation += `- **${table.name}**: ${table.count} rows\n`;
      }
      
      // Identify critical user/account tables
      documentation += `\n### Critical Tables (Contain User/Account Data)\n\n`;
      const criticalPatterns = ['user', 'account', 'project', 'domain', 'page', 'audit'];
      const criticalTables = tablesWithData.filter(t => 
        criticalPatterns.some(pattern => t.name.toLowerCase().includes(pattern))
      );
      
      documentation += `These tables contain important user data and should be handled carefully:\n\n`;
      for (const table of criticalTables) {
        documentation += `- **${table.name}**: ${table.count} rows\n`;
      }
      
      // Get foreign key relationships
      documentation += `\n## Table Relationships\n\n`;
      try {
        const { data: fks } = await supabase.rpc('get_foreign_keys');
        if (fks && fks.length > 0) {
          documentation += `| From Table | From Column | To Table | To Column |\n`;
          documentation += `|------------|-------------|----------|----------|\n`;
          for (const fk of fks) {
            documentation += `| ${fk.table_name} | ${fk.column_name} | ${fk.foreign_table_name} | ${fk.foreign_column_name} |\n`;
          }
        }
      } catch (e) {
        documentation += `Unable to fetch foreign key relationships.\n`;
      }
      
    } else {
      // Use the RPC result if available
      documentation += `## Tables Overview\n\n`;
      documentation += `Total tables: ${tables?.length || 0}\n\n`;
      // Process tables data...
    }
    
    // Add migration status
    documentation += `\n## Migration Status\n\n`;
    try {
      const { data: migrations } = await supabase
        .from('supabase_migrations.schema_migrations')
        .select('version, name, executed_at')
        .order('executed_at', { ascending: false })
        .limit(10);
      
      if (migrations && migrations.length > 0) {
        documentation += `### Recent Migrations\n\n`;
        documentation += `| Version | Name | Executed At |\n`;
        documentation += `|---------|------|-------------|\n`;
        for (const m of migrations) {
          documentation += `| ${m.version} | ${m.name} | ${new Date(m.executed_at).toLocaleString()} |\n`;
        }
      }
    } catch (e) {
      documentation += `Unable to fetch migration history.\n`;
    }
    
    // Add recommendations
    documentation += `\n## Recommendations for Development Database\n\n`;
    documentation += `1. **Critical Data**: The following tables contain production user data and should NOT be copied to dev:\n`;
    documentation += `   - auth.users (if you have real user accounts)\n`;
    documentation += `   - audit_logs (contains user activity)\n`;
    documentation += `   - Any tables with personal/sensitive information\n\n`;
    documentation += `2. **Safe to Copy**: Schema and structure for all tables\n\n`;
    documentation += `3. **Test Data**: Consider creating seed scripts for:\n`;
    documentation += `   - Test accounts\n`;
    documentation += `   - Sample projects\n`;
    documentation += `   - Demo content\n\n`;
    
    // Write to file
    fs.writeFileSync(outputFile, documentation);
    console.log(`\n✅ Documentation generated: ${outputFile}`);
    
  } catch (error) {
    console.error('❌ Error documenting database:', error);
    documentation += `\n## Error\n\nFailed to complete documentation: ${error.message}\n`;
    fs.writeFileSync(outputFile, documentation);
  }
}

// Add RPC function creation script
async function createHelperFunctions() {
  console.log('🔧 Creating helper functions...');
  
  const functions = `
-- Helper function to get table information
CREATE OR REPLACE FUNCTION get_table_info()
RETURNS TABLE (
  table_name text,
  row_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname || '.' || tablename AS table_name,
    n_live_tup AS row_count
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
  ORDER BY n_live_tup DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get foreign keys
CREATE OR REPLACE FUNCTION get_foreign_keys()
RETURNS TABLE (
  table_name text,
  column_name text,
  foreign_table_name text,
  foreign_column_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tc.table_name::text,
    kcu.column_name::text,
    ccu.table_name::text AS foreign_table_name,
    ccu.column_name::text AS foreign_column_name
  FROM information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: functions });
    if (error) {
      console.log('Helper functions may already exist or require manual creation');
    }
  } catch (e) {
    // Functions might already exist
  }
}

// Run the documentation
(async () => {
  await createHelperFunctions();
  await documentDatabase();
})();