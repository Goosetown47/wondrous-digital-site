import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function checkLatest() {
  const { data } = await supabase
    .from('deployment_queue')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);
  
  console.log('Latest deployments:');
  data?.forEach(d => {
    console.log(`\n${d.id}:`);
    console.log(`  Status: ${d.status}`);
    console.log(`  Created: ${d.created_at}`);
    console.log(`  Completed: ${d.completed_at}`);
    console.log(`  Live URL: ${d.live_url}`);
    if (d.error) console.log(`  Error: ${d.error}`);
  });
}

checkLatest();