import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function triggerDeployment() {
  const projectId = '923eb256-26eb-4cf3-8e64-ddd1297863c0';
  
  console.log('🚀 Triggering deployment for Dentist Template...\n');
  
  // Queue the deployment
  const { data, error } = await supabase
    .from('deployment_queue')
    .insert({
      project_id: projectId,
      customer_id: null,
      payload: {
        subdomain: 'dentist-1',
        deployment_domain: 'wondrousdigital.com',
        netlify_site_id: '92cb4d4c-989e-4989-b268-873567005ec9'
      },
      priority: 10, // High priority for testing
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
  console.log(`   Status: ${data.status}`);
  console.log(`   Priority: ${data.priority}`);
  console.log('');
  console.log('The deployment should be processed within 2 minutes by the cron job.');
  console.log('Expected deployment URL: https://dentist-1.wondrousdigital.com');
  
  // Also log the deployment URL that will be computed
  const computedUrl = data.payload.subdomain 
    ? `https://${data.payload.subdomain}.${data.payload.deployment_domain}`
    : `https://${data.payload.deployment_domain}`;
    
  console.log(`Computed deployment URL: ${computedUrl}`);
}

triggerDeployment().catch(console.error);