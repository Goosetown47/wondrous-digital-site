import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for full access
const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function checkDeploymentQueue() {
  console.log('🔍 Checking deployment queue status...\n');
  
  try {
    // 1. Check all failed deployments
    console.log('1. Failed deployments:');
    const { data: failedDeployments, error: failedError } = await supabase
      .from('deployment_queue')
      .select('id, project_id, status, error_message, attempt_count, created_at, payload')
      .eq('status', 'failed')
      .order('created_at', { ascending: false });
    
    if (failedError) {
      console.error('Error fetching failed deployments:', failedError);
    } else {
      console.log(`Found ${failedDeployments?.length || 0} failed deployments`);
      if (failedDeployments && failedDeployments.length > 0) {
        failedDeployments.forEach((deployment, index) => {
          console.log(`\n  Failed deployment ${index + 1}:`);
          console.log(`    ID: ${deployment.id}`);
          console.log(`    Project ID: ${deployment.project_id}`);
          console.log(`    Error: ${deployment.error_message}`);
          console.log(`    Attempts: ${deployment.attempt_count}`);
          console.log(`    Subdomain: ${deployment.payload?.subdomain}`);
          console.log(`    Created: ${new Date(deployment.created_at).toLocaleString()}`);
        });
      }
    }

    // 2. Check dentist project specifically
    console.log('\n2. Checking dentist project deployments:');
    const { data: dentistProject } = await supabase
      .from('projects')
      .select('id, project_name, subdomain')
      .eq('subdomain', 'dentist-1')
      .single();
    
    if (dentistProject) {
      console.log(`\n  Dentist project found:`);
      console.log(`    ID: ${dentistProject.id}`);
      console.log(`    Name: ${dentistProject.project_name}`);
      
      // Get all deployments for this project
      const { data: dentistDeployments } = await supabase
        .from('deployment_queue')
        .select('id, status, error_message, attempt_count, created_at')
        .eq('project_id', dentistProject.id)
        .order('created_at', { ascending: false });
      
      console.log(`\n  Total deployments for dentist project: ${dentistDeployments?.length || 0}`);
      if (dentistDeployments) {
        const statusCounts = dentistDeployments.reduce((acc, d) => {
          acc[d.status] = (acc[d.status] || 0) + 1;
          return acc;
        }, {});
        console.log('  Status breakdown:', statusCounts);
      }
    }

    // 3. Check all deployment statuses
    console.log('\n3. Overall deployment queue status:');
    const { data: allDeployments } = await supabase
      .from('deployment_queue')
      .select('status');
    
    if (allDeployments) {
      const statusCounts = allDeployments.reduce((acc, d) => {
        acc[d.status] = (acc[d.status] || 0) + 1;
        return acc;
      }, {});
      console.log('  Status breakdown:', statusCounts);
    }

    // 4. Recommendation
    console.log('\n4. Recommendation:');
    if (failedDeployments && failedDeployments.length > 0) {
      console.log('  ⚠️  You have failed deployments in the queue.');
      console.log('  These deployments have reached max attempts and won\'t retry automatically.');
      console.log('  To clear them, you can either:');
      console.log('  - Delete them from the deployment_queue table');
      console.log('  - Reset their status to "queued" and attempt_count to 0 to retry');
    } else {
      console.log('  ✅ No failed deployments found in the queue.');
    }

  } catch (error) {
    console.error('Script error:', error);
  }
}

checkDeploymentQueue();