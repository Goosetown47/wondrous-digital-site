import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function checkDeploymentContent() {
  // Find the dentist project
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('subdomain', 'dentist-1')
    .single();
    
  console.log('Project:', project?.project_name, '(ID:', project?.id, ')');
  
  // Get pages for this project
  const { data: pages } = await supabase
    .from('pages')
    .select('*')
    .eq('project_id', project.id)
    .order('created_at');
    
  console.log('\n=== PAGES ===');
  pages?.forEach(page => {
    console.log(`\nPage: ${page.page_name} (${page.slug})`);
    console.log(`  Sections count: ${page.sections?.length || 0}`);
    if (page.sections && page.sections.length > 0) {
      page.sections.forEach((section, idx) => {
        console.log(`    ${idx + 1}. ${section.type} - Content fields: ${Object.keys(section.content || {}).length}`);
      });
    }
  });
  
  // Check latest deployment
  const { data: deployment } = await supabase
    .from('deployment_queue')
    .select('*')
    .eq('project_id', project.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
    
  console.log('\n=== LATEST DEPLOYMENT ===');
  console.log('ID:', deployment?.id);
  console.log('Created:', deployment?.created_at);
  console.log('Live URL:', deployment?.live_url);
  console.log('Payload:', JSON.stringify(deployment?.payload, null, 2));
}

checkDeploymentContent();