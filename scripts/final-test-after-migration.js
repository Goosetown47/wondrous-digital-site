import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function finalTestAfterMigration() {
  const projectId = '923eb256-26eb-4cf3-8e64-ddd1297863c0';
  
  console.log('🎯 FINAL TEST: With migration applied\n');
  console.log('Migration has:');
  console.log('✅ Added netlify_site_name column');
  console.log('✅ Added domain validation');
  console.log('✅ Cleared deployment_url for projects using bare wondrousdigital.com');
  console.log('✅ Cleared netlify_site_cache');
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
  console.log('🔍 Expected results:');
  console.log('1. Creates NEW Netlify site: project-923eb256-dentist-template');
  console.log('2. Deploys to: https://dentist-1.wondrousdigital.com');
  console.log('3. Project gets its own isolated Netlify site');
  console.log('4. Main wondrousdigital.com remains protected');
  console.log('');
  console.log(`const deploymentId = '${data.id}';`);
}

finalTestAfterMigration().catch(console.error);