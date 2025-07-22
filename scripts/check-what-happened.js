import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function checkWhatHappened() {
  console.log('🔍 Checking what happened to wondrousdigital.com...\n');
  
  // Check the dentist project
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('subdomain', 'dentist-1')
    .single();
  
  console.log('Dentist Project:');
  console.log('  ID:', project.id);
  console.log('  Subdomain:', project.subdomain);
  console.log('  Deployment URL:', project.deployment_url);
  console.log('  Netlify Site ID:', project.netlify_site_id);
  console.log('  Custom Domain:', project.custom_domain);
  
  // Check the deployment
  const { data: deployment } = await supabase
    .from('deployment_queue')
    .select('*')
    .eq('id', 'e4ee73bd-79e8-4bde-95dd-5c522f408015')
    .single();
  
  console.log('\nDeployment Details:');
  console.log('  Status:', deployment.status);
  console.log('  Live URL:', deployment.live_url);
  console.log('  Payload subdomain:', deployment.payload?.subdomain);
  console.log('  Payload deployment_domain:', deployment.payload?.deployment_domain);
  
  if (deployment.payload?.deploymentResult) {
    console.log('\nDeployment Result:');
    console.log('  Netlify Site ID:', deployment.payload.deploymentResult.netlify_site_id);
    console.log('  SSL URL:', deployment.payload.deploymentResult.ssl_url);
    console.log('  Deployment URL:', deployment.payload.deploymentResult.deployment_url);
  }
  
  // Check if there's a main wondrous digital project
  const { data: mainProject } = await supabase
    .from('projects')
    .select('*')
    .or('subdomain.is.null,subdomain.eq.www,subdomain.eq.""')
    .eq('deployment_domain', 'wondrousdigital.com')
    .single();
  
  if (mainProject) {
    console.log('\nMain Wondrous Digital Project:');
    console.log('  ID:', mainProject.id);
    console.log('  Name:', mainProject.project_name);
    console.log('  Subdomain:', mainProject.subdomain);
    console.log('  Netlify Site ID:', mainProject.netlify_site_id);
  }
  
  console.log('\n⚠️  The issue: The dentist project was deployed to the root domain instead of dentist-1.wondrousdigital.com');
  console.log('This needs to be fixed immediately by updating the Netlify site\'s custom domain settings.');
}

checkWhatHappened();
