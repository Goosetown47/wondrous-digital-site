import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function cleanupAndTest() {
  console.log('🧹 Cleaning up old deployments and creating new test...\n');
  
  // Delete all existing deployments for dentist project
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('subdomain', 'dentist-1')
    .single();
  
  if (project) {
    const { error: deleteError } = await supabase
      .from('deployment_queue')
      .delete()
      .eq('project_id', project.id);
    
    if (!deleteError) {
      console.log('✅ Cleaned up existing deployments');
    }
  }
  
  // Now run the test deployment
  console.log('\nStarting fresh deployment test...\n');
  
  // Import and run the test deployment
  await import('./test-deployment.js');
}

cleanupAndTest();