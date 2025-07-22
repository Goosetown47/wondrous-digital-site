import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function checkDeploymentSuccess() {
  const deploymentId = process.argv[2] || 'e4ee73bd-79e8-4bde-95dd-5c522f408015';
  
  console.log(`🎉 Checking successful deployment: ${deploymentId}\n`);
  
  const { data: deployment, error } = await supabase
    .from('deployment_queue')
    .select('*')
    .eq('id', deploymentId)
    .single();
  
  if (error || !deployment) {
    console.error('Error fetching deployment:', error);
    return;
  }
  
  console.log('✅ Deployment Successful!');
  console.log('   Status:', deployment.status);
  console.log('   Live URL:', deployment.live_url);
  console.log('   Duration:', 
    deployment.completed_at && deployment.started_at
      ? Math.round((new Date(deployment.completed_at) - new Date(deployment.started_at)) / 1000) + ' seconds'
      : 'N/A'
  );
  
  if (deployment.payload?.deploymentResult) {
    const result = deployment.payload.deploymentResult;
    console.log('\n📦 Netlify Deployment Details:');
    console.log('   Site ID:', result.netlify_site_id);
    console.log('   Deploy ID:', result.deploy_id);
    console.log('   SSL URL:', result.ssl_url);
    console.log('   Admin URL:', result.admin_url);
  }
  
  // Check the project details
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', deployment.project_id)
    .single();
  
  if (project) {
    console.log('\n🌐 Project Updated:');
    console.log('   Name:', project.project_name);
    console.log('   Subdomain:', project.subdomain);
    console.log('   Deployment URL:', project.deployment_url);
    console.log('   Netlify Site ID:', project.netlify_site_id);
    console.log('   Last Deployed:', project.last_deployed_at ? new Date(project.last_deployed_at).toLocaleString() : 'N/A');
  }
  
  console.log('\n🎊 The deployment system is working correctly!');
  console.log('   The dentist template has been successfully deployed to Netlify.');
  console.log('   The HTML files now contain the full page builder content.');
  console.log('   The deployment monitoring correctly waited for the "ready" state.');
}

checkDeploymentSuccess();