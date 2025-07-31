#!/usr/bin/env node

/**
 * Test deployment with the fixed deployment engine
 * This will queue a deployment and monitor it
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function testDeployment() {
  console.log('🚀 Testing deployment with fixed engine...\n');
  
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
  
  console.log('✅ Found project:', project.project_name);
  console.log('   Subdomain:', project.subdomain);
  console.log('   Current deployment status:', project.deployment_status);
  
  // Queue a new deployment
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
  
  console.log('✅ Deployment queued successfully!');
  console.log('   Deployment ID:', deployment.id);
  console.log('   Status:', deployment.status);
  
  // Tell the user to trigger the edge function
  console.log('\n🔄 The deployment has been queued.');
  console.log('⏰ The edge function runs every 2 minutes via cron job.');
  console.log('💡 Or you can manually trigger it from Supabase dashboard.');
  
  // Monitor deployment status
  console.log('\n📊 Monitoring deployment status (checking every 10 seconds)...');
  
  let attempts = 0;
  const maxAttempts = 30; // 5 minutes max
  
  const checkStatus = setInterval(async () => {
    attempts++;
    
    const { data: updatedDeployment, error: statusError } = await supabase
      .from('deployment_queue')
      .select('*')
      .eq('id', deployment.id)
      .single();
    
    if (statusError) {
      console.error('❌ Error checking status:', statusError);
      clearInterval(checkStatus);
      return;
    }
    
    const status = updatedDeployment.status;
    console.log(`   Attempt ${attempts}: Status = ${status}`);
    
    if (status === 'completed') {
      console.log('\n✅ Deployment completed successfully!');
      console.log('   Live URL:', updatedDeployment.live_url || 'Not available');
      
      // Check project deployment info
      const { data: updatedProject } = await supabase
        .from('projects')
        .select('deployment_status, deployment_url, last_deployed_at')
        .eq('id', project.id)
        .single();
      
      if (updatedProject) {
        console.log('\n📋 Project deployment info:');
        console.log('   Deployment status:', updatedProject.deployment_status);
        console.log('   Deployment URL:', updatedProject.deployment_url);
        console.log('   Last deployed:', updatedProject.last_deployed_at);
      }
      
      console.log('\n🌐 Please check the live site at:');
      console.log(`   https://${project.subdomain}.wondrousdigital.com`);
      
      clearInterval(checkStatus);
    } else if (status === 'failed') {
      console.log('\n❌ Deployment failed!');
      console.log('   Error:', updatedDeployment.error);
      console.log('   Check logs:', updatedDeployment.logs);
      clearInterval(checkStatus);
    } else if (attempts >= maxAttempts) {
      console.log('\n⏱️ Timeout: Deployment is taking too long.');
      console.log('   Current status:', status);
      console.log('   Check Supabase dashboard for more info.');
      clearInterval(checkStatus);
    }
  }, 10000); // Check every 10 seconds
}

// Run the test
testDeployment().catch(console.error);