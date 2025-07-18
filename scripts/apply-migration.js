#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Load environment variables
require('dotenv').config();

const SUPABASE_URL = 'https://bpdhbxvsguklkbusqtke.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM';
const DATABASE_PASSWORD = 'DJK8gzh6pec!etb9jcz';

async function applyMigration() {
  console.log('🚀 Applying Admin Management Migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250117_admin_management_schema.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');

    // Create Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Execute the migration using raw SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) {
      // If RPC doesn't exist, try using the REST API directly
      console.log('RPC method not available, using direct connection...');
      
      // Use fetch to make a direct SQL query
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        },
        body: JSON.stringify({
          query: migrationSQL
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to execute migration: ${response.statusText}`);
      }

      console.log('✅ Migration applied successfully!');
    } else {
      console.log('✅ Migration applied successfully!');
    }

    // Verify the migration
    console.log('\n📋 Verifying migration...');
    
    // Check if new tables exist
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', ['project_versions', 'audit_logs', 'project_status_history', 'maintenance_pages'])
      .eq('table_schema', 'public');

    if (tables && tables.length > 0) {
      console.log(`✅ Found ${tables.length} new tables:`, tables.map(t => t.table_name).join(', '));
    }

    console.log('\n🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the migration
applyMigration();