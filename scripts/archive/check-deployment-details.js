import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function checkDeploymentDetails() {
  const deploymentId = '7af6602a-c0de-48bc-a047-4a9e74d1ce6c';
  
  console.log('🔍 Checking deployment details...\n');
  
  // Get deployment queue entry
  const { data: deployment } = await supabase
    .from('deployment_queue')
    .select('*')
    .eq('id', deploymentId)
    .single();
  
  if (deployment) {
    console.log('📋 Deployment Queue Entry:');
    console.log('   Payload:', JSON.stringify(deployment.payload, null, 2));
    console.log('');
  }
  
  // Get deployment logs
  const { data: logs } = await supabase
    .from('deployment_logs')
    .select('*')
    .eq('deployment_id', deploymentId)
    .order('created_at', { ascending: true });
  
  if (logs && logs.length > 0) {
    console.log('📝 Deployment Logs:');
    logs.forEach(log => {
      console.log(`   [${log.log_level}] ${log.message}`);
      if (log.metadata) {
        console.log(`   Metadata: ${JSON.stringify(log.metadata)}`);
      }
    });
    console.log('');
  }
  
  // Check Netlify site cache
  const { data: cache } = await supabase
    .from('netlify_site_cache')
    .select('*')
    .eq('primary_domain', 'wondrousdigital.com')
    .single();
  
  if (cache) {
    console.log('💾 Netlify Site Cache:');
    console.log('   Primary Domain:', cache.primary_domain);
    console.log('   Site ID:', cache.netlify_site_id);
    console.log('   Site Name:', cache.site_name);
    console.log('   Domain Aliases:', cache.domain_aliases);
    console.log('   SSL URL:', cache.ssl_url);
  }
}

checkDeploymentDetails().catch(console.error);