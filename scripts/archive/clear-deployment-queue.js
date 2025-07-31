import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for full access
const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function clearDeploymentQueue() {
  console.log('🧹 Clearing deployment queue...\n');
  
  try {
    // 1. First, check what we're about to delete
    console.log('1. Checking queued deployments to delete:');
    const { data: queuedDeployments, error: checkError } = await supabase
      .from('deployment_queue')
      .select('id, project_id, status, created_at')
      .eq('status', 'queued');
    
    if (checkError) {
      console.error('Error checking deployments:', checkError);
      return;
    }
    
    console.log(`Found ${queuedDeployments?.length || 0} queued deployments to delete`);
    
    if (queuedDeployments && queuedDeployments.length > 0) {
      queuedDeployments.forEach((deployment, index) => {
        console.log(`  ${index + 1}. ID: ${deployment.id}, Created: ${new Date(deployment.created_at).toLocaleString()}`);
      });
      
      // 2. Delete all queued deployments
      console.log('\n2. Deleting queued deployments...');
      const { error: deleteError } = await supabase
        .from('deployment_queue')
        .delete()
        .eq('status', 'queued');
      
      if (deleteError) {
        console.error('Error deleting deployments:', deleteError);
      } else {
        console.log('✅ Successfully deleted all queued deployments');
      }
      
      // 3. Verify the queue is now empty
      console.log('\n3. Verifying queue status:');
      const { data: remainingDeployments } = await supabase
        .from('deployment_queue')
        .select('status');
      
      if (remainingDeployments) {
        const statusCounts = remainingDeployments.reduce((acc, d) => {
          acc[d.status] = (acc[d.status] || 0) + 1;
          return acc;
        }, {});
        
        if (Object.keys(statusCounts).length === 0) {
          console.log('✅ Deployment queue is now empty');
        } else {
          console.log('Remaining deployments:', statusCounts);
        }
      }
    } else {
      console.log('No queued deployments to delete');
    }
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

clearDeploymentQueue();