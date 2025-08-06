#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../.env.local') });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
    },
  }
);

async function checkDomainColumns() {
  console.log('Checking project_domains table structure...');

  try {
    // Get a sample domain to see what columns exist
    const { data: domains, error } = await supabaseAdmin
      .from('project_domains')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error fetching domains:', error);
      return;
    }

    if (domains && domains.length > 0) {
      console.log('Current columns in project_domains:');
      console.log(Object.keys(domains[0]));
      
      console.log('\nSample domain data:');
      console.log(JSON.stringify(domains[0], null, 2));
    } else {
      console.log('No domains found in the table');
    }

    // Try to select specific columns to see if they exist
    const { data: sslCheck, error: sslError } = await supabaseAdmin
      .from('project_domains')
      .select('id, ssl_state, verification_details')
      .limit(1);

    if (sslError) {
      console.log('\nSSL columns do not exist yet:', sslError.message);
    } else {
      console.log('\nSSL columns already exist!');
      console.log(sslCheck);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkDomainColumns();