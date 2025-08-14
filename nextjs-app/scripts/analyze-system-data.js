#!/usr/bin/env node

/**
 * Analyze System Data Differences Between Production and Development
 * This script identifies critical system data that exists in production but is missing in dev
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.production.local') });

// Production credentials
const prodUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const prodServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Dev credentials (hardcoded since we know them)
const devUrl = 'https://hlpvvwlxjzexpgitsjlw.supabase.co';
const devServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscHZ2d2x4anpleHBnaXRzamx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk2MjEzNCwiZXhwIjoyMDcwNTM4MTM0fQ.p5QzbvcRzj0Qv0O2FY6t2ixF6kffbpgIEYc_MMGOlow';

if (!prodUrl || !prodServiceKey) {
  console.error('❌ Missing production environment variables');
  console.error('Make sure .env.production.local exists with production credentials');
  process.exit(1);
}

const prodSupabase = createClient(prodUrl, prodServiceKey);
const devSupabase = createClient(devUrl, devServiceKey);

// Tables that typically contain system/critical data
const SYSTEM_DATA_TABLES = [
  'roles',
  'permissions',
  'types',
  'accounts',
  'themes',
  'core_components',
  'library_items',
  'security_configuration_checks'
];

async function analyzeTable(tableName) {
  console.log(`\n📊 Analyzing ${tableName}...`);
  
  try {
    // Get counts
    const { count: prodCount } = await prodSupabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    const { count: devCount } = await devSupabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    console.log(`  Production: ${prodCount || 0} rows`);
    console.log(`  Development: ${devCount || 0} rows`);
    
    // If prod has data but dev doesn't, get sample data
    if (prodCount > 0 && devCount === 0) {
      console.log(`  ⚠️  Missing all data in dev!`);
      
      const { data: sampleData } = await prodSupabase
        .from(tableName)
        .select('*')
        .limit(5);
      
      if (sampleData && sampleData.length > 0) {
        console.log(`  Sample data from production:`);
        sampleData.forEach(row => {
          console.log(`    - ${JSON.stringify(row).substring(0, 100)}...`);
        });
      }
    } else if (prodCount > devCount) {
      console.log(`  ⚠️  Dev is missing ${prodCount - devCount} rows`);
    }
    
    // Special analysis for specific tables
    if (tableName === 'accounts') {
      const { data: platformAccount } = await prodSupabase
        .from('accounts')
        .select('*')
        .eq('id', '00000000-0000-0000-0000-000000000000')
        .single();
      
      if (platformAccount) {
        console.log(`  ✅ Production has platform account (00000000-0000-0000-0000-000000000000)`);
      } else {
        console.log(`  ❌ Production missing platform account with correct ID!`);
        const { data: wrongPlatform } = await prodSupabase
          .from('accounts')
          .select('*')
          .eq('slug', 'wondrous-digital')
          .single();
        if (wrongPlatform) {
          console.log(`  Found platform account with wrong ID: ${wrongPlatform.id}`);
        }
      }
    }
    
    if (tableName === 'roles') {
      const { data: systemRoles } = await prodSupabase
        .from('roles')
        .select('name, permissions, is_system')
        .eq('is_system', true);
      
      if (systemRoles && systemRoles.length > 0) {
        console.log(`  System roles in production:`);
        systemRoles.forEach(role => {
          console.log(`    - ${role.name}: ${role.permissions.length} permissions`);
        });
      }
    }
    
    return { tableName, prodCount: prodCount || 0, devCount: devCount || 0 };
  } catch (error) {
    console.error(`  ❌ Error analyzing ${tableName}:`, error.message);
    return { tableName, error: error.message };
  }
}

async function generateSystemDataSQL() {
  console.log('\n\n📝 Generating system data SQL...\n');
  
  // Get actual data from production for critical tables
  const results = [];
  
  // 1. Platform Account
  const { data: accounts } = await prodSupabase
    .from('accounts')
    .select('*')
    .or('id.eq.00000000-0000-0000-0000-000000000000,slug.eq.wondrous-digital');
  
  if (accounts && accounts.length > 0) {
    results.push('-- Platform Account');
    accounts.forEach(account => {
      // Fix the ID if it's wrong
      const correctId = '00000000-0000-0000-0000-000000000000';
      results.push(`DELETE FROM accounts WHERE id = '${correctId}';`);
      results.push(`INSERT INTO accounts (id, name, slug, plan, settings, created_at, updated_at)
VALUES ('${correctId}', '${account.name}', 'wondrous-digital-platform', '${account.plan || 'enterprise'}', '${JSON.stringify(account.settings || {})}', NOW(), NOW());`);
    });
  }
  
  // 2. System Roles
  const { data: roles } = await prodSupabase
    .from('roles')
    .select('*')
    .eq('is_system', true);
  
  if (roles && roles.length > 0) {
    results.push('\n-- System Roles');
    roles.forEach(role => {
      results.push(`INSERT INTO roles (id, name, permissions, account_id, description, is_system)
VALUES ('${role.id}', '${role.name}', ARRAY[${role.permissions.map(p => `'${p}'`).join(', ')}]::text[], ${role.account_id ? `'${role.account_id}'` : 'NULL'}, '${role.description || ''}', true)
ON CONFLICT (id) DO UPDATE SET permissions = EXCLUDED.permissions;`);
    });
  }
  
  // 3. Permissions
  const { data: permissions } = await prodSupabase
    .from('permissions')
    .select('*')
    .order('resource', 'action');
  
  if (permissions && permissions.length > 0) {
    results.push('\n-- System Permissions');
    permissions.forEach(perm => {
      results.push(`INSERT INTO permissions (id, resource, action, description)
VALUES ('${perm.id}', '${perm.resource}', '${perm.action}', '${perm.description || ''}')
ON CONFLICT (id) DO NOTHING;`);
    });
  }
  
  // 4. Component Types
  const { data: types } = await prodSupabase
    .from('types')
    .select('*')
    .order('category', 'name');
  
  if (types && types.length > 0) {
    results.push('\n-- Component Types');
    types.forEach(type => {
      results.push(`INSERT INTO types (id, name, display_name, category, description, icon, schema, metadata)
VALUES ('${type.id}', '${type.name}', '${type.display_name}', '${type.category}', ${type.description ? `'${type.description.replace(/'/g, "''")}'` : 'NULL'}, ${type.icon ? `'${type.icon}'` : 'NULL'}, ${type.schema ? `'${JSON.stringify(type.schema).replace(/'/g, "''")}'::jsonb` : 'NULL'}, '${JSON.stringify(type.metadata || {})}'::jsonb)
ON CONFLICT (id) DO NOTHING;`);
    });
  }
  
  return results.join('\n');
}

async function main() {
  console.log('🔍 Analyzing System Data Differences\n');
  console.log(`Production: ${prodUrl}`);
  console.log(`Development: ${devUrl}\n`);
  
  const results = [];
  
  // Analyze each system table
  for (const table of SYSTEM_DATA_TABLES) {
    const result = await analyzeTable(table);
    results.push(result);
  }
  
  // Summary
  console.log('\n\n📊 SUMMARY OF MISSING SYSTEM DATA');
  console.log('='*50);
  
  const missingData = results.filter(r => r.prodCount > 0 && r.devCount === 0);
  const partialData = results.filter(r => r.prodCount > r.devCount && r.devCount > 0);
  
  if (missingData.length > 0) {
    console.log('\n❌ Tables completely missing data in dev:');
    missingData.forEach(r => {
      console.log(`  - ${r.tableName}: ${r.prodCount} rows in production`);
    });
  }
  
  if (partialData.length > 0) {
    console.log('\n⚠️  Tables with partial data in dev:');
    partialData.forEach(r => {
      console.log(`  - ${r.tableName}: ${r.prodCount} rows in prod, ${r.devCount} in dev`);
    });
  }
  
  // Generate SQL
  const systemDataSQL = await generateSystemDataSQL();
  
  // Save to file
  const outputPath = path.join(__dirname, '../supabase/migrations-clean/00003_complete_system_data.sql');
  require('fs').writeFileSync(outputPath, `-- Complete System Data for Dev Environment
-- Generated from production data analysis

${systemDataSQL}

-- Reserved Domain Permissions (using correct platform account ID)
DELETE FROM reserved_domain_permissions WHERE account_id != '00000000-0000-0000-0000-000000000000';
INSERT INTO reserved_domain_permissions (account_id, domain, notes)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'wondrousdigital.com', 'Marketing website - apex domain'),
  ('00000000-0000-0000-0000-000000000000', 'www.wondrousdigital.com', 'Marketing website - www subdomain')
ON CONFLICT (account_id, domain) DO NOTHING;
`);
  
  console.log(`\n\n✅ System data SQL generated: ${outputPath}`);
  console.log('Run this in your dev Supabase SQL Editor to populate missing system data.');
}

main().catch(console.error);