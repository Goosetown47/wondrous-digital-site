import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function checkNetlifyCache() {
  console.log('🔍 Checking Netlify site cache...\n');
  
  const { data: cacheEntry } = await supabase
    .from('netlify_site_cache')
    .select('*')
    .eq('netlify_site_id', '92cb4d4c-989e-4989-b268-873567005ec9')
    .single();
  
  if (cacheEntry) {
    console.log('Cache Entry Found:');
    console.log('  Site ID:', cacheEntry.netlify_site_id);
    console.log('  Subdomain:', cacheEntry.subdomain);
    console.log('  Deployment Domain:', cacheEntry.deployment_domain);
    console.log('  Primary Domain:', cacheEntry.primary_domain);
    console.log('  Custom Domain:', cacheEntry.custom_domain);
    console.log('  Domain Aliases:', cacheEntry.domain_aliases);
    console.log('  Site Created:', cacheEntry.site_created);
    console.log('  Last Updated:', cacheEntry.last_updated);
  }
}

checkNetlifyCache();
