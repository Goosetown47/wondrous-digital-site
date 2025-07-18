#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

const SUPABASE_URL = 'https://bpdhbxvsguklkbusqtke.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM';

async function applyMigration() {
  console.log('🚀 Applying Tab Categorization Fix Migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250117_fix_tab_categorization.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');
    
    console.log('📄 Migration SQL loaded successfully');

    // Create Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Use fetch to execute the SQL directly
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        query: migrationSQL
      })
    });

    if (response.ok) {
      console.log('✅ Migration applied successfully!');
      
      // Test the view to ensure it's working
      const { data: testData, error: testError } = await supabase
        .from('project_management_view')
        .select('project_name, project_status, tab_category')
        .limit(5);
        
      if (testError) {
        console.error('❌ Error testing view:', testError);
      } else {
        console.log('\n📋 Sample data from updated view:');
        console.table(testData);
      }
    } else {
      // If the above doesn't work, try a different approach
      console.log('First approach failed, trying alternative method...');
      
      // Execute as raw SQL using a different endpoint
      const rawResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sql',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: migrationSQL
      });
      
      if (!rawResponse.ok) {
        throw new Error(`Failed to execute migration: ${rawResponse.statusText}`);
      }
      
      console.log('✅ Migration applied successfully using alternative method!');
    }

    console.log('\n🎉 Tab categorization fix completed!');
    console.log('Projects with "paused-maintenance" status will now appear in the Archive tab.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    // Provide manual instructions as fallback
    console.log('\n📝 Manual Application Instructions:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to the SQL Editor');
    console.log('3. Run the following SQL:');
    console.log('\n' + '='.repeat(60));
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250117_fix_tab_categorization.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');
    console.log(migrationSQL);
    console.log('='.repeat(60));
    
    process.exit(1);
  }
}

// Run the migration
applyMigration();