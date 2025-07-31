#!/usr/bin/env node
/**
 * Test script for domain verification system
 * Tests the entire flow from adding a domain to verification
 */

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PORT = process.env.PORT || 3003;
const API_BASE_URL = `http://localhost:${PORT}/api`;

async function testDomainSystem() {
  console.log('🧪 Testing Domain Verification System\n');

  // 1. Check if Vercel credentials are configured
  console.log('1️⃣ Checking Vercel configuration...');
  if (!process.env.VERCEL_API_TOKEN || !process.env.VERCEL_PROJECT_ID) {
    console.log('⚠️  Vercel credentials not configured');
    console.log('   Add the following to your .env.local:');
    console.log('   - VERCEL_API_TOKEN');
    console.log('   - VERCEL_PROJECT_ID');
    console.log('   - VERCEL_TEAM_ID (optional)');
    console.log('\n   Running in mock mode...\n');
  } else {
    console.log('✅ Vercel credentials found\n');
  }

  // 2. Get a test project
  console.log('2️⃣ Finding test project...');
  const { data: projects, error: projectError } = await supabase
    .from('projects')
    .select('id, name, slug')
    .limit(1)
    .single();

  if (projectError || !projects) {
    console.error('❌ No projects found. Please create a project first.');
    return;
  }

  console.log(`✅ Using project: ${projects.name} (${projects.slug})\n`);

  // 3. List existing domains
  console.log('3️⃣ Checking existing domains...');
  const { data: domains, error: domainError } = await supabase
    .from('project_domains')
    .select('*')
    .eq('project_id', projects.id);

  if (domains && domains.length > 0) {
    console.log(`✅ Found ${domains.length} domain(s):`);
    domains.forEach(d => {
      console.log(`   - ${d.domain} (${d.verified ? '✅ Verified' : '⏳ Pending'})`);
    });
    console.log('');
  } else {
    console.log('ℹ️  No domains configured yet\n');
  }

  // 4. Test domain verification API
  if (domains && domains.length > 0) {
    const unverifiedDomain = domains.find(d => !d.verified);
    if (unverifiedDomain) {
      console.log('4️⃣ Testing domain verification...');
      console.log(`   Checking: ${unverifiedDomain.domain}`);

      try {
        const response = await fetch(`${API_BASE_URL}/domains/${unverifiedDomain.id}/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();
        
        if (result.verified) {
          console.log('✅ Domain verified successfully!');
          console.log(`   SSL Status: ${result.ssl?.state || 'Unknown'}`);
        } else {
          console.log('⏳ Domain not verified yet');
          console.log(`   Reason: ${result.error || 'DNS propagation pending'}`);
          console.log('\n   📌 Make sure to add this CNAME record:');
          console.log(`      ${unverifiedDomain.domain} → sites.wondrousdigital.com`);
        }
      } catch (error) {
        console.error('❌ Error checking verification:', error.message);
      }
    } else {
      console.log('ℹ️  All domains are already verified\n');
    }
  }

  // 5. Test adding a new domain to Vercel
  if (process.env.VERCEL_API_TOKEN && domains && domains.length > 0) {
    console.log('\n5️⃣ Testing Vercel integration...');
    const testDomain = domains[0];
    
    try {
      const response = await fetch(`${API_BASE_URL}/domains/${testDomain.id}/add-to-vercel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Domain successfully added to Vercel');
      } else if (result.error?.includes('already exists')) {
        console.log('ℹ️  Domain already exists in Vercel');
      } else {
        console.log('❌ Error adding to Vercel:', result.error);
      }
    } catch (error) {
      console.error('❌ Error calling Vercel API:', error.message);
    }
  }

  console.log('\n✨ Domain system test complete!\n');
}

// Run the test
testDomainSystem().catch(console.error);