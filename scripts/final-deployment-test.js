import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function finalTest() {
  const projectId = '923eb256-26eb-4cf3-8e64-ddd1297863c0';
  
  console.log('🎯 FINAL TEST: Project-based deployment with updated edge function\n');
  console.log('Edge function has been updated with:');
  console.log('- NetlifyProjectManager (replaces NetlifyDomainManager)');
  console.log('- Project-based site creation');
  console.log('- Domain validation to prevent main site overwrites');
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
  console.log('🔍 What to watch for:');
  console.log('1. Should create site: project-923eb256-dentist-template');
  console.log('2. Should deploy to: dentist-1.wondrousdigital.com');
  console.log('3. Should NOT use site ID: 92cb4d4c-989e-4989-b268-873567005ec9');
  console.log('4. Should create a NEW Netlify site');
  console.log('');
  console.log(`Monitor: node scripts/monitor-deployment-live.js`);
  
  // Save deployment ID for monitoring
  console.log(`\nconst deploymentId = '${data.id}';`);
}

finalTest().catch(console.error);