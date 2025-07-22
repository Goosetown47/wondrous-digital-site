import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function testDeployment() {
  console.log('🚀 Testing deployment with pg_net enabled...\n');
  
  try {
    // Get the dentist project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('subdomain', 'dentist-1')
      .single();
    
    if (projectError || !project) {
      console.error('❌ Could not find dentist-1 project:', projectError);
      return;
    }
    
    console.log('✅ Found project:', project.project_name);
    console.log('   ID:', project.id);
    console.log('   Subdomain:', project.subdomain);
    
    // Get sections for this project
    const { data: sections } = await supabase
      .from('page_sections')
      .select('*')
      .eq('project_id', project.id)
      .order('order_index');
    
    // Get site styles for this project
    const { data: siteStyles } = await supabase
      .from('site_styles')
      .select('*')
      .eq('project_id', project.id);
    
    console.log('   Sections:', sections?.length || 0);
    console.log('   Site Styles:', siteStyles?.length || 0);
    
    // Queue a deployment
    const deploymentPayload = {
      project_id: project.id,
      customer_id: project.customer_id,
      status: 'queued',
      priority: 0,
      attempt_count: 0,
      max_attempts: 3,
      payload: {
        project_id: project.id,
        template_id: project.template_id,
        subdomain: project.subdomain,
        deployment_domain: 'wondrousdigital.com',
        sections: sections || [],
        site_styles: siteStyles?.[0] || {},
        global_navigation: project.global_navigation || { items: [] }
      }
    };
    
    console.log('\n📦 Queueing deployment...');
    const { data: deployment, error: deployError } = await supabase
      .from('deployment_queue')
      .insert(deploymentPayload)
      .select()
      .single();
    
    if (deployError) {
      console.error('❌ Failed to queue deployment:', deployError);
      return;
    }
    
    console.log('✅ Deployment queued successfully!');
    console.log('   ID:', deployment.id);
    console.log('   Status:', deployment.status);
    
    console.log('\n⏱️  The cron job runs every 2 minutes.');
    console.log('   Next run should be within 2 minutes.');
    console.log('   Monitor the deployment status with:');
    console.log('   node scripts/monitor-deployment.js ' + deployment.id);
    
    // Check cron job status
    console.log('\n🔍 Checking cron job status...');
    const { data: cronJob, error: cronError } = await supabase
      .from('pg_cron_job')
      .select('jobid, jobname, schedule, active')
      .eq('jobname', 'process-deployments')
      .single();
    
    if (cronJob) {
      console.log('✅ Cron job is configured:');
      console.log('   Active:', cronJob.active ? 'Yes' : 'No');
      console.log('   Schedule:', cronJob.schedule);
    } else {
      console.log('⚠️  Could not verify cron job status');
    }
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

testDeployment();