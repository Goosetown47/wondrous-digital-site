import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function checkDeploymentPayload() {
  console.log('📦 Checking latest deployment payload...\n');
  
  const { data: deployment, error } = await supabase
    .from('deployment_queue')
    .select('*')
    .eq('id', '91295cd0-2fde-426b-a7f4-ce284a29032e')
    .single();
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  if (deployment) {
    console.log('Deployment ID:', deployment.id);
    console.log('Status:', deployment.status);
    console.log('Live URL:', deployment.live_url);
    
    if (deployment.payload) {
      console.log('\nPayload structure:');
      console.log('- subdomain:', deployment.payload.subdomain);
      console.log('- deployment_domain:', deployment.payload.deployment_domain);
      console.log('- netlify_site_id:', deployment.payload.netlify_site_id);
      console.log('- exportResult:', deployment.payload.exportResult ? 'Present' : 'Missing');
      
      if (deployment.payload.exportResult) {
        console.log('\nExport Result:');
        console.log('- Pages:', deployment.payload.exportResult.pages?.length || 0);
        console.log('- Assets:', deployment.payload.exportResult.assets?.length || 0);
        
        if (deployment.payload.exportResult.pages) {
          console.log('\nPages:');
          deployment.payload.exportResult.pages.forEach(page => {
            console.log(`  - ${page.filename} (${page.content.length} bytes)`);
          });
        }
      }
      
      if (deployment.payload.deploymentResult) {
        console.log('\nDeployment Result:');
        console.log('- netlify_site_id:', deployment.payload.deploymentResult.netlify_site_id);
        console.log('- deployment_url:', deployment.payload.deploymentResult.deployment_url);
        console.log('- ssl_url:', deployment.payload.deploymentResult.ssl_url);
      }
    }
  }
}

checkDeploymentPayload();