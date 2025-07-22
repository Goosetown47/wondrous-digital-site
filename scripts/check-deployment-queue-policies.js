import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function checkDeploymentQueuePolicies() {
  console.log('🔍 Checking deployment_queue table policies...\n');
  
  try {
    // Check if RLS is enabled
    const { data: tables } = await supabase
      .rpc('get_table_info', { table_name: 'deployment_queue' });
    
    console.log('Table info:', tables);
    
    // Get all policies for deployment_queue
    const { data: policies, error } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'deployment_queue');
    
    if (error) {
      console.error('Error fetching policies:', error);
      return;
    }
    
    console.log('\nPolicies found:', policies?.length || 0);
    
    if (policies && policies.length > 0) {
      policies.forEach((policy, index) => {
        console.log(`\n${index + 1}. Policy: ${policy.policyname}`);
        console.log(`   Command: ${policy.cmd}`);
        console.log(`   Permissive: ${policy.permissive}`);
        console.log(`   Roles: ${policy.roles}`);
        console.log(`   USING: ${policy.qual}`);
        console.log(`   WITH CHECK: ${policy.with_check}`);
      });
    } else {
      console.log('No policies found for deployment_queue table');
    }
    
    // Try to get some deployments to delete
    console.log('\n\nTesting deletion capability...');
    const { data: deployments } = await supabase
      .from('deployment_queue')
      .select('id, status, project_id')
      .in('status', ['completed', 'failed'])
      .limit(3);
    
    console.log('\nDeployments that could be deleted:', deployments?.length || 0);
    if (deployments && deployments.length > 0) {
      deployments.forEach(d => {
        console.log(`  - ${d.id} (${d.status})`);
      });
    }
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

checkDeploymentQueuePolicies();