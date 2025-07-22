import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function testCleanDeployment() {
  const projectId = '923eb256-26eb-4cf3-8e64-ddd1297863c0';
  
  console.log('🧪 CLEAN DEPLOYMENT TEST\n');
  console.log('Prerequisites cleared:');
  console.log('✅ Removed old Netlify site using dentist-1.wondrousdigital.com');
  console.log('✅ Cleared project Netlify associations');
  console.log('✅ No domain conflicts should exist');
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
  console.log('🔍 Expected behavior:');
  console.log('1. Creates NEW Netlify site: project-923eb256-dentist-template');
  console.log('2. Sets custom domain: dentist-1.wondrousdigital.com');
  console.log('3. Domain configuration SUCCEEDS (no conflict)');
  console.log('4. Site accessible at: https://dentist-1.wondrousdigital.com');
  console.log('');
  console.log('Monitor logs for "Setting custom domain" message');
  console.log(`\nconst deploymentId = '${data.id}';`);
}

testCleanDeployment().catch(console.error);