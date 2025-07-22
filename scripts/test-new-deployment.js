import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function testDeployment() {
  const projectId = '923eb256-26eb-4cf3-8e64-ddd1297863c0';
  
  console.log('🚀 Testing new project-based deployment system...\n');
  console.log('This deployment should:');
  console.log('1. Create a NEW Netlify site specifically for the dentist project');
  console.log('2. Deploy to dentist-1.wondrousdigital.com');
  console.log('3. NOT affect the main wondrousdigital.com site');
  console.log('');
  
  // Queue the deployment
  const { data, error } = await supabase
    .from('deployment_queue')
    .insert({
      project_id: projectId,
      customer_id: null,
      payload: {
        subdomain: 'dentist-1',
        deployment_domain: 'wondrousdigital.com'
        // No netlify_site_id - will create new site with project-based approach
      },
      priority: 10,
      status: 'queued'
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error queuing deployment:', error);
    return;
  }
  
  console.log('✅ Deployment queued successfully!');
  console.log(`   Deployment ID: ${data.id}`);
  console.log('');
  console.log('Expected behavior:');
  console.log('- Edge function will use NetlifyProjectManager');
  console.log('- Creates site named: project-923eb256-dentist-template');
  console.log('- Sets custom domain: dentist-1.wondrousdigital.com');
  console.log('- Complete isolation from main marketing site');
  console.log('');
  console.log('Monitor with:');
  console.log(`const deploymentId = '${data.id}';`);
  console.log('node scripts/monitor-deployment-live.js');
}

testDeployment().catch(console.error);