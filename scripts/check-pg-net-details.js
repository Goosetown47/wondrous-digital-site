import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function checkPgNetDetails() {
  console.log('🔍 Checking pg_net installation details...\n');
  
  try {
    // Check installed extensions
    console.log('1. Checking installed extensions:');
    const { data: extensions, error: extError } = await supabase.rpc('get_pg_extensions');
    
    if (extError) {
      console.log('   Could not list extensions via RPC');
      
      // Try direct query
      const { data: extData, error: queryError } = await supabase
        .from('pg_extension')
        .select('extname, extversion')
        .order('extname');
      
      if (extData) {
        console.log('   Installed extensions:');
        extData.forEach(ext => {
          console.log(`   - ${ext.extname} (${ext.extversion || 'unknown version'})`);
        });
      }
    } else if (extensions) {
      console.log('   Extensions found:', extensions.length);
      const pgNet = extensions.find(e => e.name === 'pg_net');
      if (pgNet) {
        console.log('   ✅ pg_net is listed as installed');
      } else {
        console.log('   ❌ pg_net is NOT in the extensions list');
      }
    }
    
    // Check schemas
    console.log('\n2. Checking database schemas:');
    const { data: schemas, error: schemaError } = await supabase.rpc('get_schemas');
    
    if (schemaError) {
      console.log('   Could not list schemas via RPC');
    } else if (schemas) {
      const hasNet = schemas.some(s => s.schema_name === 'net');
      console.log(`   Total schemas: ${schemas.length}`);
      console.log(`   net schema exists: ${hasNet ? '✅ Yes' : '❌ No'}`);
    }
    
    // Check if we can see pg_net functions
    console.log('\n3. Checking pg_net functions:');
    const { data: functions, error: funcError } = await supabase.rpc('check_pg_net_functions');
    
    if (funcError) {
      console.log('   Could not check functions via RPC');
      console.log('   Error:', funcError.message);
    } else if (functions) {
      console.log('   pg_net functions available:', functions);
    }
    
    console.log('\n📝 Summary:');
    console.log('   The pg_net extension needs to be enabled at the database level.');
    console.log('   This typically requires superuser privileges.');
    console.log('   You may need to contact Supabase support to enable it.');
    
    console.log('\n🔧 Alternative Solution:');
    console.log('   Since the Edge Function works when called directly,');
    console.log('   we could use a different trigger mechanism:');
    console.log('   1. External cron service (like cron-job.org)');
    console.log('   2. GitHub Actions on a schedule');
    console.log('   3. Vercel Cron Jobs');
    console.log('   4. Manual triggers from the admin UI');
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

// Add RPC function definitions
async function createRPCFunctions() {
  console.log('Creating helper RPC functions...\n');
  
  const queries = [
    // Get extensions
    `
    CREATE OR REPLACE FUNCTION get_pg_extensions()
    RETURNS TABLE(name text, default_version text, installed_version text)
    LANGUAGE sql
    SECURITY DEFINER
    AS $$
      SELECT 
        e.extname as name,
        e.extversion as default_version,
        e.extversion as installed_version
      FROM pg_extension e
      ORDER BY e.extname;
    $$;`,
    
    // Get schemas
    `
    CREATE OR REPLACE FUNCTION get_schemas()
    RETURNS TABLE(schema_name text)
    LANGUAGE sql
    SECURITY DEFINER
    AS $$
      SELECT nspname as schema_name
      FROM pg_namespace
      WHERE nspname NOT LIKE 'pg_%'
      AND nspname != 'information_schema'
      ORDER BY nspname;
    $$;`,
    
    // Check pg_net functions
    `
    CREATE OR REPLACE FUNCTION check_pg_net_functions()
    RETURNS json
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      result json;
    BEGIN
      SELECT json_build_object(
        'http_post_exists', EXISTS(
          SELECT 1 FROM pg_proc p
          JOIN pg_namespace n ON p.pronamespace = n.oid
          WHERE n.nspname = 'net' AND p.proname = 'http_post'
        ),
        'net_schema_exists', EXISTS(
          SELECT 1 FROM pg_namespace WHERE nspname = 'net'
        )
      ) INTO result;
      
      RETURN result;
    END;
    $$;`
  ];
  
  for (const query of queries) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      if (error) {
        console.log('Could not create RPC function:', error.message);
      }
    } catch (e) {
      // Function might already exist
    }
  }
}

// Run the checks
checkPgNetDetails();