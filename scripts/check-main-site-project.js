import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function checkMainSite() {
  console.log('🌐 Checking for main wondrousdigital.com project...\n');
  
  // Look for projects that should be at the root domain
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('deployment_domain', 'wondrousdigital.com')
    .or('subdomain.is.null,subdomain.eq.')
    .order('created_at', { ascending: false });
  
  if (projects && projects.length > 0) {
    console.log(`Found ${projects.length} project(s) that might be for the main domain:\n`);
    
    projects.forEach(project => {
      const isRootDomain = !project.subdomain || project.subdomain === '';
      console.log(`📋 ${project.project_name} (${project.id})`);
      console.log(`   Status: ${project.project_status}`);
      console.log(`   Subdomain: ${project.subdomain || '(root domain)'}`);
      console.log(`   Deployment Domain: ${project.deployment_domain}`);
      console.log(`   Is Root Domain: ${isRootDomain ? 'YES' : 'NO'}`);
      console.log(`   Netlify Site ID: ${project.netlify_site_id || 'none'}`);
      console.log('');
    });
  }
  
  // Also check Netlify site cache to understand the setup
  console.log('💾 Checking Netlify site cache...\n');
  
  const { data: sites } = await supabase
    .from('netlify_site_cache')
    .select('*');
  
  if (sites && sites.length > 0) {
    sites.forEach(site => {
      console.log(`Site: ${site.site_name}`);
      console.log(`   Primary Domain: ${site.primary_domain}`);
      console.log(`   Domain Aliases: ${JSON.stringify(site.domain_aliases)}`);
      console.log('');
    });
  }
}

checkMainSite().catch(console.error);