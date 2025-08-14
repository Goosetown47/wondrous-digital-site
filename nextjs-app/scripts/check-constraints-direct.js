#!/usr/bin/env node

/**
 * Check constraints on reserved_domain_permissions table
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: {
    schema: 'public'
  },
  auth: {
    persistSession: false
  }
});

async function checkConstraints() {
  console.log('Checking constraints on reserved_domain_permissions...\n');

  // First, try to insert duplicate data to see what error we get
  console.log('Testing ON CONFLICT behavior...');
  
  const testData = {
    account_id: '19519371-1db4-44a1-ac70-3d5c5cfc32ee',
    domain: 'test-conflict.com',
    notes: 'Test for conflict'
  };

  // Try to insert
  const { data: insertData, error: insertError } = await supabase
    .from('reserved_domain_permissions')
    .insert(testData)
    .select();

  if (insertError) {
    console.log('First insert error (expected if exists):', insertError.message);
  } else {
    console.log('First insert succeeded:', insertData);
  }

  // Try to insert again (should cause conflict if unique constraint exists)
  const { data: conflictData, error: conflictError } = await supabase
    .from('reserved_domain_permissions')
    .insert(testData)
    .select();

  if (conflictError) {
    console.log('Second insert error (shows constraint):', conflictError.message);
    console.log('Error details:', conflictError.details);
    console.log('Error hint:', conflictError.hint);
  } else {
    console.log('Second insert succeeded (no unique constraint!):', conflictData);
  }

  // Clean up test data
  const { error: deleteError } = await supabase
    .from('reserved_domain_permissions')
    .delete()
    .eq('domain', 'test-conflict.com');

  if (deleteError) {
    console.log('Cleanup error:', deleteError.message);
  } else {
    console.log('Test data cleaned up');
  }

  // Now check existing data
  console.log('\n📊 Existing data in reserved_domain_permissions:');
  const { data: existing, error: fetchError } = await supabase
    .from('reserved_domain_permissions')
    .select('*');

  if (fetchError) {
    console.log('Error fetching data:', fetchError.message);
  } else {
    console.log('Rows:', existing.length);
    existing.forEach(row => {
      console.log(`  - ${row.domain} (account: ${row.account_id})`);
    });
  }

  // Check if we can use upsert
  console.log('\n📋 Testing UPSERT capability...');
  const upsertData = {
    account_id: '19519371-1db4-44a1-ac70-3d5c5cfc32ee',
    domain: 'wondrousdigital.com',
    notes: 'Updated via upsert test'
  };

  const { data: upsertResult, error: upsertError } = await supabase
    .from('reserved_domain_permissions')
    .upsert(upsertData, {
      onConflict: 'account_id,domain',
      ignoreDuplicates: false
    })
    .select();

  if (upsertError) {
    console.log('Upsert error:', upsertError.message);
    console.log('This means no unique constraint on (account_id, domain)');
  } else {
    console.log('Upsert succeeded:', upsertResult);
  }
}

checkConstraints().catch(console.error);