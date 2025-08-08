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

async function testVerifyApi() {
  console.log('Testing domain verification API...\n');

  try {
    // First, get all domains
    const { data: domains, error } = await supabaseAdmin
      .from('project_domains')
      .select('*')
      .eq('verified', false)
      .limit(5);

    if (error) {
      console.error('Error fetching domains:', error);
      return;
    }

    if (!domains || domains.length === 0) {
      console.log('No unverified domains found');
      return;
    }

    console.log(`Found ${domains.length} unverified domains`);
    
    // Test verification for each domain
    for (const domain of domains) {
      console.log(`\n--- Testing domain: ${domain.domain} ---`);
      console.log(`Domain ID: ${domain.id}`);
      console.log(`Current verified status: ${domain.verified}`);
      
      try {
        // Call the verify API
        const response = await fetch(`http://localhost:3000/api/domains/${domain.id}/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();
        console.log('API Response:', result);
        
        // Check if domain was updated
        const { data: updatedDomain, error: fetchError } = await supabaseAdmin
          .from('project_domains')
          .select('verified, verified_at')
          .eq('id', domain.id)
          .single();
          
        if (fetchError) {
          console.error('Error fetching updated domain:', fetchError);
        } else {
          console.log('Updated domain status:', {
            verified: updatedDomain.verified,
            verified_at: updatedDomain.verified_at
          });
        }
      } catch (error) {
        console.error('Error calling verify API:', error);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testVerifyApi();