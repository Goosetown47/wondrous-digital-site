import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function checkSchema() {
  // Fetch one row to see all columns
  const { data, error } = await supabase
    .from('site_styles')
    .select('*')
    .limit(1);
  
  if (data && data.length > 0) {
    console.log('Available columns in site_styles:');
    console.log(Object.keys(data[0]).sort().join('\n'));
  }
}

checkSchema();