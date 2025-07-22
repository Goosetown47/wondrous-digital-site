import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function checkDeployment() {
  const deploymentId = process.argv[2] || '22e5405f-aa54-4a67-a8bb-f11c04f404ba';
  
  console.log(`🔍 Checking deployment: ${deploymentId}\n`);
  
  // Get deployment details
  const { data: deployment, error } = await supabase
    .from('deployment_queue')
    .select('*')
    .eq('id', deploymentId)
    .single();
  
  if (error) {
    console.error('Error fetching deployment:', error);
    return;
  }
  
  console.log('Deployment Details:');
  console.log('  Status:', deployment.status);
  console.log('  Attempt Count:', deployment.attempt_count);
  console.log('  Error Message:', deployment.error_message || 'None');
  console.log('  Created:', new Date(deployment.created_at).toLocaleString());
  console.log('  Started:', deployment.started_at ? new Date(deployment.started_at).toLocaleString() : 'Not started');
  console.log('  Completed:', deployment.completed_at ? new Date(deployment.completed_at).toLocaleString() : 'Not completed');
  
  if (deployment.payload) {
    console.log('\nPayload:');
    console.log('  Subdomain:', deployment.payload.subdomain);
    console.log('  Deployment Domain:', deployment.payload.deployment_domain);
    console.log('  Has sections:', !!deployment.payload.sections);
    console.log('  Has site_styles:', !!deployment.payload.site_styles);
  }
  
  // Check for logs
  const { data: logs, error: logsError } = await supabase
    .from('deployment_logs')
    .select('*')
    .eq('deployment_id', deploymentId)
    .order('created_at', { ascending: true });
  
  if (logs && logs.length > 0) {
    console.log(`\n📝 Deployment Logs (${logs.length} entries):`);
    logs.forEach((log, index) => {
      console.log(`\n  Log ${index + 1}:`);
      console.log(`    Level: ${log.level}`);
      console.log(`    Message: ${log.message}`);
      console.log(`    Time: ${new Date(log.created_at).toLocaleString()}`);
      if (log.details) {
        console.log(`    Details: ${JSON.stringify(log.details, null, 2)}`);
      }
    });
  } else {
    console.log('\n📝 No deployment logs found');
  }
}

checkDeployment();