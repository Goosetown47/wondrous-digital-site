#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = 'https://bpdhbxvsguklkbusqtke.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM';

async function applyMigration() {
  console.log('🚀 Applying Tab Categorization Fix Migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250117_fix_tab_categorization.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');
    
    console.log('📄 Migration SQL:');
    console.log(migrationSQL);
    console.log('\n');

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // First, let's check current data
    console.log('📊 Checking current projects with their tab categories...');
    const { data: beforeData, error: beforeError } = await supabase
      .from('project_management_view')
      .select('project_name, project_status, tab_category')
      .order('project_name');
      
    if (beforeError) {
      console.error('Error fetching current data:', beforeError);
    } else {
      console.log('\nCurrent projects:');
      beforeData.forEach(p => {
        console.log(`- ${p.project_name}: ${p.project_status} → ${p.tab_category} tab`);
      });
    }

    // Apply the migration by executing raw SQL
    console.log('\n🔧 Applying migration...');
    
    // Use the query endpoint to execute raw SQL
    const { data, error } = await supabase.rpc('query', { 
      query_text: migrationSQL 
    }).catch(async (err) => {
      // If RPC doesn't exist, try direct execution
      console.log('RPC not available, trying direct SQL execution...');
      
      // Split the SQL and execute just the CREATE OR REPLACE VIEW part
      const viewSQL = migrationSQL.trim();
      
      // Execute through a raw HTTP request
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify({ sql: viewSQL })
      });
      
      if (!response.ok) {
        throw new Error('Direct SQL execution failed');
      }
      
      return { data: null, error: null };
    });

    if (error && error.message !== 'Direct SQL execution failed') {
      throw error;
    }

    console.log('✅ Migration applied successfully!');
    
    // Test the updated view
    console.log('\n📋 Verifying updated view...');
    const { data: afterData, error: afterError } = await supabase
      .from('project_management_view')
      .select('project_name, project_status, tab_category')
      .order('project_name');
      
    if (afterError) {
      console.error('❌ Error testing updated view:', afterError);
    } else {
      console.log('\nUpdated projects:');
      afterData.forEach(p => {
        console.log(`- ${p.project_name}: ${p.project_status} → ${p.tab_category} tab`);
      });
      
      // Check if any paused-maintenance projects are now in archive
      const pausedInArchive = afterData.filter(p => 
        p.project_status === 'paused-maintenance' && p.tab_category === 'archive'
      );
      
      if (pausedInArchive.length > 0) {
        console.log(`\n✅ Found ${pausedInArchive.length} paused-maintenance project(s) correctly in archive tab!`);
      }
    }

    console.log('\n🎉 Migration completed!');
    console.log('Note: If the migration didn\'t apply, you may need to run it manually in the Supabase SQL Editor.');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    // Provide the SQL for manual execution
    console.log('\n📝 Please apply this migration manually in your Supabase SQL Editor:');
    console.log('\n' + '='.repeat(80));
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250117_fix_tab_categorization.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');
    console.log(migrationSQL);
    console.log('='.repeat(80));
    console.log('\nThis will fix the tab categorization so that paused-maintenance projects appear in the Archive tab.');
  }
}

// Run the migration
applyMigration();