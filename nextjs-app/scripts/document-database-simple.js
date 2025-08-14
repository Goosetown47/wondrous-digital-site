#!/usr/bin/env node

/**
 * Simple Database Documentation Script
 * Lists tables and row counts for database isolation planning
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
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Known tables in the system (based on our migrations)
const knownTables = [
  'accounts',
  'account_users',
  'account_permissions',
  'projects',
  'pages',
  'domains',
  'domain_verifications',
  'library_items',
  'library_versions',
  'lab_drafts',
  'user_profiles',
  'audit_logs',
  'types',
  'email_templates',
  'email_logs',
  'project_templates',
  'project_deployments',
  'api_keys',
  'billing_plans',
  'subscriptions',
  'usage_metrics',
  'support_tickets',
  'notifications',
  'scheduled_tasks',
  'feature_flags',
  'webhook_endpoints',
  'webhook_logs'
];

async function documentDatabase() {
  console.log('📊 Starting database documentation...\n');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const outputFile = path.join(__dirname, `../database-documentation-${timestamp}.md`);
  
  let documentation = `# Production Database Documentation\n\n`;
  documentation += `Generated: ${new Date().toLocaleString()}\n\n`;
  documentation += `Database URL: ${supabaseUrl}\n\n`;
  
  documentation += `## Table Row Counts\n\n`;
  documentation += `| Table Name | Row Count | Has User Data | Notes |\n`;
  documentation += `|------------|-----------|---------------|-------|\n`;
  
  const tablesWithData = [];
  const emptyTables = [];
  const missingTables = [];
  let totalRows = 0;
  
  for (const tableName of knownTables) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        if (error.code === '42P01') {
          missingTables.push(tableName);
          documentation += `| ${tableName} | - | - | Table not found |\n`;
        } else {
          documentation += `| ${tableName} | Error | ❓ | ${error.message} |\n`;
        }
      } else {
        const hasData = count > 0;
        const isUserData = ['accounts', 'account_users', 'projects', 'pages', 'domains', 'user_profiles', 'audit_logs'].includes(tableName);
        
        documentation += `| ${tableName} | ${count} | ${hasData && isUserData ? '⚠️ Yes' : 'No'} | ${hasData ? 'Has data' : 'Empty'} |\n`;
        
        if (hasData) {
          tablesWithData.push({ name: tableName, count, isUserData });
          totalRows += count;
        } else {
          emptyTables.push(tableName);
        }
      }
    } catch (e) {
      documentation += `| ${tableName} | Error | ❓ | ${e.message} |\n`;
    }
  }
  
  documentation += `\n## Summary\n\n`;
  documentation += `- **Total tables checked:** ${knownTables.length}\n`;
  documentation += `- **Tables with data:** ${tablesWithData.length}\n`;
  documentation += `- **Empty tables:** ${emptyTables.length}\n`;
  documentation += `- **Missing tables:** ${missingTables.length}\n`;
  documentation += `- **Total rows across all tables:** ${totalRows}\n\n`;
  
  // List tables with user data
  documentation += `## Tables with User Data\n\n`;
  documentation += `These tables contain production user data and need special handling:\n\n`;
  
  const userDataTables = tablesWithData.filter(t => t.isUserData);
  userDataTables.sort((a, b) => b.count - a.count);
  
  for (const table of userDataTables) {
    documentation += `- **${table.name}**: ${table.count} rows\n`;
  }
  
  // Platform data tables
  documentation += `\n## Platform Configuration Tables\n\n`;
  documentation += `These tables contain platform configuration (safe to copy structure):\n\n`;
  
  const configTables = tablesWithData.filter(t => !t.isUserData);
  for (const table of configTables) {
    documentation += `- **${table.name}**: ${table.count} rows\n`;
  }
  
  // Check for test accounts
  documentation += `\n## Test Account Analysis\n\n`;
  try {
    const { data: testAccounts } = await supabase
      .from('accounts')
      .select('id, name, created_at')
      .or('name.ilike.%test%,name.ilike.%demo%,name.ilike.%example%');
    
    if (testAccounts && testAccounts.length > 0) {
      documentation += `Found ${testAccounts.length} potential test accounts:\n\n`;
      for (const acc of testAccounts) {
        documentation += `- ${acc.name} (created: ${new Date(acc.created_at).toLocaleDateString()})\n`;
      }
    } else {
      documentation += `No obvious test accounts found.\n`;
    }
  } catch (e) {
    documentation += `Unable to analyze test accounts.\n`;
  }
  
  // Database size estimate
  documentation += `\n## Storage Estimate\n\n`;
  documentation += `Based on row counts (rough estimate):\n`;
  documentation += `- Small tables (<100 rows): ${tablesWithData.filter(t => t.count < 100).length}\n`;
  documentation += `- Medium tables (100-1000 rows): ${tablesWithData.filter(t => t.count >= 100 && t.count < 1000).length}\n`;
  documentation += `- Large tables (1000+ rows): ${tablesWithData.filter(t => t.count >= 1000).length}\n\n`;
  
  // Recommendations
  documentation += `## Recommendations for Development Database\n\n`;
  documentation += `### 1. Schema Migration\n`;
  documentation += `- Export schema using: \`supabase db dump --schema-only\`\n`;
  documentation += `- This will copy all table structures, indexes, and functions\n\n`;
  
  documentation += `### 2. Data Handling\n`;
  documentation += `**DO NOT COPY** these tables with user data:\n`;
  for (const table of userDataTables) {
    documentation += `- ${table.name} (${table.count} rows)\n`;
  }
  
  documentation += `\n**SAFE TO COPY** structure only:\n`;
  documentation += `- All table schemas\n`;
  documentation += `- All functions and triggers\n`;
  documentation += `- All RLS policies\n\n`;
  
  documentation += `### 3. Test Data Requirements\n`;
  documentation += `Create seed data for:\n`;
  documentation += `- Test accounts (3-5)\n`;
  documentation += `- Sample projects (2-3 per account)\n`;
  documentation += `- Demo pages and content\n`;
  documentation += `- Test users with different roles\n\n`;
  
  documentation += `### 4. Critical Configurations\n`;
  documentation += `- Ensure auth settings match production\n`;
  documentation += `- Set up same RLS policies\n`;
  documentation += `- Configure email templates (if used)\n`;
  
  // Write to file
  fs.writeFileSync(outputFile, documentation);
  console.log(`\n✅ Documentation generated: ${outputFile}`);
  console.log(`\n📄 Please review the documentation to understand your database structure.`);
}

// Run the documentation
documentDatabase().catch(console.error);