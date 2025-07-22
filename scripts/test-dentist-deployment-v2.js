import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function testDeployment() {
  console.log('🚀 Testing dentist deployment with page builder content...\n');
  
  // Get the dentist project
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('subdomain', 'dentist-1')
    .single();
  
  if (error || !project) {
    console.error('Error fetching project:', error);
    return;
  }
  
  console.log('Found project:', project.project_name);
  console.log('Project ID:', project.id);
  console.log('Subdomain:', project.subdomain);
  
  // Check pages with embedded sections
  const { data: pages } = await supabase
    .from('pages')
    .select('*')
    .eq('project_id', project.id)
    .order('order_index');
    
  console.log('\nPages with embedded sections:');
  if (pages && pages.length > 0) {
    pages.forEach(page => {
      console.log(`\n  ${page.page_name} (${page.slug}):`, 
        page.sections && page.sections.length > 0 
          ? `${page.sections.length} embedded sections`
          : 'No embedded sections'
      );
      
      if (page.sections && page.sections.length > 0) {
        page.sections.forEach((section, idx) => {
          console.log(`    ${idx + 1}. ${section.type}`);
          // Check for page builder content format
          if (section.content.heroHeading || section.content.feature1Heading || section.content.primaryButton) {
            console.log('       ✅ Has page builder content format');
          }
        });
      }
    });
  }
  
  // Clear any existing deployments for this project
  console.log('\n\nClearing existing deployments...');
  await supabase
    .from('deployment_queue')
    .delete()
    .eq('project_id', project.id);
  
  // Create a new deployment
  console.log('Creating new deployment...');
  const { data: deployment, error: deployError } = await supabase
    .from('deployment_queue')
    .insert({
      project_id: project.id,
      status: 'queued',
      priority: 10,
      payload: {
        type: 'full_deploy',
        subdomain: project.subdomain,
        deployment_domain: `${project.subdomain}.wondrousdigital.com`,
        target_branch: 'main'
      }
    })
    .select()
    .single();
  
  if (deployError) {
    console.error('Error creating deployment:', deployError);
    return;
  }
  
  console.log('\n✅ Deployment created:', deployment.id);
  console.log('Status:', deployment.status);
  console.log('\nThe edge function should pick this up within 2 minutes.');
  console.log('Check deployment status with: node scripts/check-deployment-queue-status.js');
  console.log(`\nOnce deployed, visit: https://${project.subdomain}.wondrousdigital.com`);
  
  // Monitor deployment for 30 seconds
  console.log('\n\nMonitoring deployment status...');
  let attempts = 0;
  const maxAttempts = 10;
  
  const checkStatus = async () => {
    const { data: status } = await supabase
      .from('deployment_queue')
      .select('*')
      .eq('id', deployment.id)
      .single();
      
    if (status) {
      console.log(`[${new Date().toLocaleTimeString()}] Status: ${status.status}`);
      if (status.error_message) {
        console.log('  Error:', status.error_message);
      }
      if (status.deployment_data?.deploy_id) {
        console.log('  Netlify Deploy ID:', status.deployment_data.deploy_id);
      }
      if (status.deployment_data?.live_url) {
        console.log('  Live URL:', status.deployment_data.live_url);
      }
      
      if (status.status === 'deployed' || status.status === 'failed') {
        console.log('\n✅ Deployment complete!');
        return true;
      }
    }
    
    attempts++;
    if (attempts < maxAttempts) {
      setTimeout(checkStatus, 3000);
    } else {
      console.log('\n⏱️  Timeout waiting for deployment. Check status manually.');
    }
  };
  
  setTimeout(checkStatus, 3000);
}

testDeployment();