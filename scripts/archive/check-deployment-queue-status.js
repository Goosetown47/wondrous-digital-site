import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function checkDeploymentQueue() {
  console.log('🔍 Checking deployment queue...\n');
  
  try {
    // Check all deployments
    const { data: allDeployments, error: allError } = await supabase
      .from('deployment_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (allError) {
      console.error('Error fetching deployments:', allError);
      return;
    }
    
    console.log(`Total deployments in queue: ${allDeployments?.length || 0}`);
    
    if (allDeployments && allDeployments.length > 0) {
      allDeployments.forEach((d, i) => {
        console.log(`\n${i + 1}. Deployment ${d.id}:`);
        console.log(`   Status: ${d.status}`);
        console.log(`   Project ID: ${d.project_id}`);
        console.log(`   Created: ${new Date(d.created_at).toLocaleString()}`);
        console.log(`   Priority: ${d.priority}`);
        console.log(`   Attempts: ${d.attempt_count}/${d.max_attempts}`);
        if (d.error_message) {
          console.log(`   Error: ${d.error_message}`);
        }
        if (d.payload) {
          console.log(`   Payload: subdomain=${d.payload.subdomain}, domain=${d.payload.deployment_domain}`);
        }
      });
    }
    
    // Check specifically for queued deployments
    console.log('\n\nChecking specifically for queued deployments...');
    const now = new Date().toISOString();
    const { data: queuedDeployments, error: queuedError } = await supabase
      .from('deployment_queue')
      .select('*')
      .eq('status', 'queued')
      .lte('created_at', now)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(3);
    
    if (queuedError) {
      console.error('Error fetching queued deployments:', queuedError);
      return;
    }
    
    console.log(`\nQueued deployments ready to process: ${queuedDeployments?.length || 0}`);
    
    if (queuedDeployments && queuedDeployments.length > 0) {
      console.log('\nThese should be picked up by the Edge Function:');
      queuedDeployments.forEach(d => {
        console.log(`  - ${d.id} (created ${new Date(d.created_at).toLocaleString()})`);
      });
    }
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

checkDeploymentQueue();