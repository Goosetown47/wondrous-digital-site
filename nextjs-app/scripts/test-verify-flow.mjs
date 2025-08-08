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

async function testVerifyFlow() {
  console.log('Testing domain verification flow...\n');

  try {
    // Get an unverified domain
    const { data: domains, error } = await supabaseAdmin
      .from('project_domains')
      .select('*')
      .eq('verified', false)
      .limit(1);

    if (error) {
      console.error('Error fetching domains:', error);
      return;
    }

    if (!domains || domains.length === 0) {
      console.log('No unverified domains found');
      return;
    }

    const domain = domains[0];
    console.log('Testing domain:', domain.domain);
    console.log('Domain ID:', domain.id);
    console.log('Initial state:', {
      verified: domain.verified,
      ssl_state: domain.ssl_state,
      verification_details: domain.verification_details
    });
    
    // Test the verify API
    console.log('\nCalling verify API...');
    const response = await fetch(`http://localhost:3001/api/domains/${domain.id}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    console.log('\nAPI Response:', JSON.stringify(result, null, 2));
    
    // Check updated domain state
    const { data: updatedDomain, error: fetchError } = await supabaseAdmin
      .from('project_domains')
      .select('*')
      .eq('id', domain.id)
      .single();
      
    if (fetchError) {
      console.error('Error fetching updated domain:', fetchError);
    } else {
      console.log('\nUpdated domain state:', {
        verified: updatedDomain.verified,
        verified_at: updatedDomain.verified_at,
        ssl_state: updatedDomain.ssl_state,
        verification_details: updatedDomain.verification_details
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testVerifyFlow();