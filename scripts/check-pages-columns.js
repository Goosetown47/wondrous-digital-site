import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function checkPagesColumns() {
  console.log('Checking pages table columns...\n');
  
  const { data: pages, error } = await supabase
    .from('pages')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error:', error);
  } else if (pages && pages.length > 0) {
    console.log('Pages table columns:');
    console.log(Object.keys(pages[0]));
    console.log('\nSample page data:');
    console.log(JSON.stringify(pages[0], null, 2));
  }
}

checkPagesColumns();