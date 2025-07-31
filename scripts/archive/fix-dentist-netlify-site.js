import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function fixDentistSite() {
  console.log('🔧 Fixing dentist project Netlify configuration...\n');
  
  // Clear the netlify_site_id so it creates a new site on next deployment
  const { error } = await supabase
    .from('projects')
    .update({ 
      netlify_site_id: null,
      deployment_status: 'pending',
      deployment_url: null 
    })
    .eq('id', '923eb256-26eb-4cf3-8e64-ddd1297863c0');
  
  if (error) {
    console.error('Error updating project:', error);
    return;
  }
  
  console.log('✅ Cleared Netlify site ID from dentist project');
  console.log('   The next deployment will create a new, separate Netlify site');
  
  // Also clear the cache entry that's causing confusion
  const { error: cacheError } = await supabase
    .from('netlify_site_cache')
    .delete()
    .eq('primary_domain', 'wondrousdigital.com');
  
  if (!cacheError) {
    console.log('✅ Cleared incorrect cache entry');
  }
  
  console.log('\n📋 Next steps:');
  console.log('1. Queue a new deployment for the dentist project');
  console.log('2. It will create a new Netlify site specifically for dentist-1.wondrousdigital.com');
  console.log('3. This will keep it separate from your main marketing site');
}

fixDentistSite().catch(console.error);