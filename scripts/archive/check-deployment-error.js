import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function checkError() {
  const { data, error } = await supabase
    .from('deployment_queue')
    .select('*')
    .eq('id', '5193fa3e-a10a-4d8a-a43e-f3c055e18f80')
    .single();
  
  console.log('Deployment status:', data?.status);
  console.log('Error:', data?.error);
  console.log('Last error:', data?.last_error);
  
  // Check deployment logs
  const { data: logs } = await supabase
    .from('deployment_logs')
    .select('*')
    .eq('deployment_id', '5193fa3e-a10a-4d8a-a43e-f3c055e18f80')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (logs && logs.length > 0) {
    console.log('\nRecent logs:');
    logs.forEach(log => {
      console.log(`[${log.created_at}] ${log.log_type}: ${log.message}`);
    });
  }
}

checkError();