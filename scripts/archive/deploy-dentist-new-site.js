import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function deployToNewSite() {
  const projectId = '923eb256-26eb-4cf3-8e64-ddd1297863c0';
  
  console.log('🚀 Deploying dentist template to NEW Netlify site...\n');
  
  // Queue the deployment without netlify_site_id so it creates new site
  const { data, error } = await supabase
    .from('deployment_queue')
    .insert({
      project_id: projectId,
      customer_id: null,
      payload: {
        subdomain: 'dentist-1',
        deployment_domain: 'wondrousdigital.com'
        // No netlify_site_id - will create new site
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
  console.log('This deployment will:');
  console.log('1. Create a NEW Netlify site (not use the marketing site)');
  console.log('2. Deploy to dentist-1.wondrousdigital.com');
  console.log('3. Keep your main site and dentist template completely separate');
  console.log('');
  console.log('Monitor progress with: node scripts/monitor-deployment-live.js');
  
  // Save deployment ID for monitoring
  console.log(`\nconst deploymentId = '${data.id}';`);
}

deployToNewSite().catch(console.error);