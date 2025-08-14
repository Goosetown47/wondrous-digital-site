#!/usr/bin/env node

/**
 * Check database constraints and tables
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabase() {
  console.log('Checking DEV database structure...\n');

  // Check if reserved_domain_permissions table exists and its constraints
  const { data: tableInfo, error: tableError } = await supabase
    .rpc('get_table_constraints', { table_name: 'reserved_domain_permissions' })
    .single();

  if (tableError) {
    // Try a simpler query
    const { data: columns, error: colError } = await supabase
      .from('reserved_domain_permissions')
      .select('*')
      .limit(0);
    
    if (colError) {
      console.log('❌ Table reserved_domain_permissions not found or not accessible');
      console.log('Error:', colError.message);
    } else {
      console.log('✅ Table reserved_domain_permissions exists');
      
      // Try to get some data
      const { data: rows, error: dataError } = await supabase
        .from('reserved_domain_permissions')
        .select('*');
      
      if (!dataError) {
        console.log(`   Found ${rows.length} rows in the table`);
        if (rows.length > 0) {
          console.log('   Sample row:', rows[0]);
        }
      }
    }
  }

  // Check constraints using raw SQL
  const constraintQuery = `
    SELECT 
      tc.constraint_name,
      tc.constraint_type,
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    LEFT JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.table_name = 'reserved_domain_permissions'
      AND tc.table_schema = 'public'
    ORDER BY tc.constraint_type, tc.constraint_name;
  `;

  const { data: constraints, error: constraintError } = await supabase
    .rpc('execute_sql', { query: constraintQuery })
    .single();

  if (constraintError) {
    console.log('\n❌ Could not query constraints directly');
    console.log('This might be because execute_sql RPC function doesn\'t exist');
  } else if (constraints) {
    console.log('\n📋 Constraints on reserved_domain_permissions:');
    console.log(constraints);
  }

  // Check all tables
  const tablesQuery = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;

  console.log('\n📊 Checking all tables in database...');
  
  // Since we can't run raw SQL easily, let's check known tables
  const tables = [
    'accounts',
    'account_users', 
    'projects',
    'pages',
    'reserved_domain_permissions',
    'project_domains',
    'audit_logs',
    'themes',
    'library_items',
    'user_profiles'
  ];

  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .select('*')
      .limit(0);
    
    if (error) {
      console.log(`❌ ${table} - Not found or error`);
    } else {
      console.log(`✅ ${table} - Exists`);
    }
  }
}

checkDatabase().catch(console.error);