#!/usr/bin/env node

/**
 * Test the final deployment with all fixes applied
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function testFinalDeployment() {
  console.log('🚀 Testing final deployment with all fixes...\n');
  console.log('✅ Fixed issues:');
  console.log('   - Page status updated to "published"');
  console.log('   - Bright Smiles footer deleted');
  console.log('   - Hardcoded nav/footer removed from deployment engine');
  console.log('   - Field name mapping fixed (headline/description)');
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Find the dentist project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('project_name', 'Dentist Template')
    .single();
  
  if (projectError || !project) {
    console.error('❌ Error finding project:', projectError);
    return;
  }
  
  console.log('📋 Project status:');
  console.log('   Name:', project.project_name);
  console.log('   Subdomain:', project.subdomain);
  console.log('   Deployment status:', project.deployment_status);
  console.log('   Last deployed:', project.last_deployed_at);
  
  // Check pages
  const { data: pages } = await supabase
    .from('pages')
    .select('*')
    .eq('project_id', project.id);
  
  console.log(`\n📄 Pages (${pages?.length || 0} total):`);
  pages?.forEach(page => {
    console.log(`   - ${page.page_name}: status=${page.status}, sections=${page.sections?.length || 0}`);
  });
  
  // Queue deployment
  console.log('\n📤 Queueing new deployment...');
  const { data: deployment, error: deployError } = await supabase
    .from('deployment_queue')
    .insert({
      project_id: project.id,
      status: 'queued',
      payload: {
        subdomain: project.subdomain,
        deployment_domain: project.deployment_domain || `${project.subdomain}.wondrousdigital.com`
      }
    })
    .select()
    .single();
  
  if (deployError) {
    console.error('❌ Error queueing deployment:', deployError);
    return;
  }
  
  console.log('✅ Deployment queued!');
  console.log('   ID:', deployment.id);
  
  // Monitor deployment
  console.log('\n⏳ Monitoring deployment (checking every 10 seconds)...');
  console.log('   The edge function runs every 2 minutes via cron.');
  
  let attempts = 0;
  const maxAttempts = 30;
  
  const checkStatus = setInterval(async () => {
    attempts++;
    
    const { data: status } = await supabase
      .from('deployment_queue')
      .select('status, error, live_url')
      .eq('id', deployment.id)
      .single();
    
    if (status?.status === 'completed') {
      console.log(`\n✅ Deployment completed! (Attempt ${attempts})`);
      console.log('   Live URL:', status.live_url);
      
      console.log('\n🌐 Please check these URLs:');
      console.log(`   1. Subdomain: https://${project.subdomain}.wondrousdigital.com`);
      console.log('   2. Main site: https://wondrousdigital.com');
      
      console.log('\n📝 Expected content:');
      console.log('   - Navigation with "Logo" text');
      console.log('   - Hero: "Medium length hero headline goes here"');
      console.log('   - Lorem ipsum description text');
      console.log('   - Features section with 4 boxes');
      console.log('   - NO Bright Smiles footer');
      console.log('   - NO duplicate navigation');
      
      clearInterval(checkStatus);
    } else if (status?.status === 'failed') {
      console.log(`\n❌ Deployment failed! (Attempt ${attempts})`);
      console.log('   Error:', status.error);
      clearInterval(checkStatus);
    } else if (attempts >= maxAttempts) {
      console.log('\n⏱️ Timeout after 5 minutes');
      clearInterval(checkStatus);
    } else {
      console.log(`   Attempt ${attempts}: ${status?.status || 'checking...'}`);
    }
  }, 10000);
}

// Run the test
testFinalDeployment().catch(console.error);