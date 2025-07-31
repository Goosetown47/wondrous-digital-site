#!/usr/bin/env node
/**
 * Add a test domain to see UI features
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addTestDomain() {
  console.log('🧪 Adding test domain...\n');

  // Get a project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, name, slug')
    .limit(1)
    .single();

  if (projectError || !project) {
    console.error('❌ No projects found');
    return;
  }

  console.log(`Using project: ${project.name} (${project.slug})`);

  // Add a test domain
  const testDomain = 'test-domain.example.com';
  
  const { data: domain, error: domainError } = await supabase
    .from('project_domains')
    .insert({
      project_id: project.id,
      domain: testDomain,
      is_primary: false,
      verified: false,
    })
    .select()
    .single();

  if (domainError) {
    console.error('❌ Error adding domain:', domainError.message);
    return;
  }

  console.log(`✅ Added test domain: ${testDomain}`);
  console.log('   Status: Pending Verification');
  console.log('\n🔍 Check the Domains tab in project settings to see:');
  console.log('   - Domain status with time estimation');
  console.log('   - Refresh button for verification');
  console.log('   - Troubleshooting guide at the bottom');
}

addTestDomain().catch(console.error);