import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function clearAssociations() {
  console.log('🧹 Clearing incorrect Netlify site associations...\n');
  
  // Clear the dentist project's Netlify site ID so it creates a new one
  const { error: updateError } = await supabase
    .from('projects')
    .update({ 
      netlify_site_id: null,
      deployment_status: 'pending'
    })
    .eq('project_name', 'Dentist Template');
  
  if (updateError) {
    console.error('Error updating project:', updateError);
  } else {
    console.log('✅ Cleared Netlify site ID from Dentist Template project');
  }
  
  // Clear the cache table
  const { error: cacheError } = await supabase
    .from('netlify_site_cache')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
  
  if (cacheError) {
    console.error('Error clearing cache:', cacheError);
  } else {
    console.log('✅ Cleared netlify_site_cache table');
  }
  
  console.log('\n📋 Next steps:');
  console.log('1. Deploy your main marketing site back to wondrousdigital.com');
  console.log('2. Deploy the dentist template - it will create its own Netlify site');
  console.log('3. Each project will have complete isolation');
}

clearAssociations().catch(console.error);