#!/usr/bin/env node

/**
 * Export Schema from Production Database
 * 
 * This script connects to the production database and exports
 * the complete schema in the right order for migrations.
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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function exportSchema() {
  console.log('📊 Exporting schema from production database...\n');
  
  const outputDir = path.join(__dirname, '../supabase/migrations-clean');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Since we can't directly export schema without Docker, let's create 
  // a guide for manual export
  const exportGuide = `# Schema Export Guide

Since automated schema export requires Docker, here's how to export your schema manually:

## Option 1: Supabase Dashboard (Recommended)

1. Go to your production Supabase project
2. Navigate to SQL Editor
3. Create a new query with the following:

\`\`\`sql
-- Export all table definitions
SELECT 
    'CREATE TABLE IF NOT EXISTS ' || schemaname || '.' || tablename || ' (' || E'\\n' ||
    string_agg(
        '    ' || column_name || ' ' || 
        data_type || 
        CASE 
            WHEN character_maximum_length IS NOT NULL 
            THEN '(' || character_maximum_length || ')' 
            ELSE '' 
        END ||
        CASE 
            WHEN column_default IS NOT NULL 
            THEN ' DEFAULT ' || column_default 
            ELSE '' 
        END ||
        CASE 
            WHEN is_nullable = 'NO' 
            THEN ' NOT NULL' 
            ELSE '' 
        END,
        E',\\n' ORDER BY ordinal_position
    ) || E'\\n);'
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name NOT LIKE 'pg_%'
GROUP BY schemaname, tablename
ORDER BY tablename;
\`\`\`

4. Run the query and save the output as \`00001_initial_schema.sql\`

## Option 2: Use pg_dump locally

If you have PostgreSQL installed locally:

\`\`\`bash
pg_dump \\
  --host=db.${supabaseUrl.match(/https:\/\/([^.]+)/)[1]}.supabase.co \\
  --username=postgres \\
  --dbname=postgres \\
  --schema-only \\
  --no-owner \\
  --no-privileges \\
  --no-tablespaces \\
  --no-unlogged-table-data \\
  --schema=public \\
  > schema.sql
\`\`\`

## What to Extract:

1. **Tables** - All CREATE TABLE statements
2. **Indexes** - All CREATE INDEX statements  
3. **Functions** - All CREATE FUNCTION statements
4. **Triggers** - All CREATE TRIGGER statements
5. **RLS Policies** - All CREATE POLICY statements
6. **Extensions** - Any CREATE EXTENSION statements

## Order Matters:

1. Extensions first
2. Tables (in dependency order)
3. Functions
4. Triggers
5. Indexes
6. RLS Policies

## System Data vs Test Data:

**System Data** (goes in 00002_system_data.sql):
- Platform account (19519371-1db4-44a1-ac70-3d5c5cfc32ee)
- Reserved domains (wondrousdigital.com)
- Component types
- Email templates (if any)

**Test Data** (goes in /seed/):
- Test accounts
- Sample projects
- Demo content
`;

  fs.writeFileSync(path.join(outputDir, 'EXPORT_GUIDE.md'), exportGuide);

  // Create a template for the initial schema migration
  const schemaTemplate = `-- 00001_initial_schema.sql
-- Initial schema for Wondrous Digital Platform
-- This creates all tables, functions, and policies needed for a fresh database

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- =====================================================
-- TABLES
-- =====================================================

-- Paste the CREATE TABLE statements here from the export guide

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Paste CREATE FUNCTION statements here

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Paste CREATE TRIGGER statements here

-- =====================================================
-- INDEXES
-- =====================================================

-- Paste CREATE INDEX statements here

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS on all tables
-- ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Paste CREATE POLICY statements here
`;

  fs.writeFileSync(path.join(outputDir, '00001_initial_schema.sql'), schemaTemplate);

  // Create system data migration
  const systemDataMigration = `-- 00002_system_data.sql
-- Required system data for platform operation

-- Platform account (required for admin users)
INSERT INTO accounts (id, name, slug, settings, created_at, updated_at)
VALUES (
  '19519371-1db4-44a1-ac70-3d5c5cfc32ee',
  'Wondrous Digital',
  'wondrous-digital',
  '{}',
  '2025-07-26 00:00:00+00',
  '2025-07-26 00:00:00+00'
) ON CONFLICT (id) DO NOTHING;

-- Reserved domain permissions
INSERT INTO reserved_domain_permissions (account_id, domain, notes)
VALUES 
  ('19519371-1db4-44a1-ac70-3d5c5cfc32ee', 'wondrousdigital.com', 'Marketing website - apex domain'),
  ('19519371-1db4-44a1-ac70-3d5c5cfc32ee', 'www.wondrousdigital.com', 'Marketing website - www subdomain')
ON CONFLICT (account_id, domain) DO NOTHING;

-- Component types (if needed)
-- INSERT INTO types ...
`;

  fs.writeFileSync(path.join(outputDir, '00002_system_data.sql'), systemDataMigration);

  // Create seed data script
  const seedScript = `-- /supabase/seed/seed.sql
-- Development test data (not for production)

-- Test accounts
INSERT INTO accounts (name, slug, settings) VALUES
  ('Test Company 1', 'test-company-1', '{}'),
  ('Test Company 2', 'test-company-2', '{}'),
  ('Demo Agency', 'demo-agency', '{}')
ON CONFLICT DO NOTHING;

-- Test users (passwords should be set via auth)
-- Note: User creation should be done via Supabase Auth, not direct inserts

-- Sample projects
-- INSERT INTO projects (name, account_id, ...) VALUES ...

-- Sample pages
-- INSERT INTO pages (title, project_id, ...) VALUES ...
`;

  fs.writeFileSync(path.join(outputDir, '../seed/seed.sql'), seedScript);

  console.log(`✅ Export guide and templates created in: ${outputDir}`);
  console.log('\n📋 Next steps:');
  console.log('1. Follow the export guide to get your schema from Supabase Dashboard');
  console.log('2. Paste the schema into 00001_initial_schema.sql');
  console.log('3. Review 00002_system_data.sql for required data');
  console.log('4. Move test data to /seed/seed.sql');
  console.log('5. Apply migrations to dev database');
}

exportSchema().catch(console.error);