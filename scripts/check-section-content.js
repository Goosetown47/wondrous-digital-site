import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function checkSectionContent() {
  console.log('🔍 Checking dentist-1 project sections content...\n');
  
  // Get the dentist project
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('subdomain', 'dentist-1')
    .single();
  
  if (error || !project) {
    console.error('Error fetching project:', error);
    return;
  }
  
  // Get pages with embedded sections
  const { data: pages } = await supabase
    .from('pages')
    .select('*')
    .eq('project_id', project.id);
  
  console.log('Found pages:', pages?.length || 0);
  
  if (pages && pages.length > 0) {
    const page = pages[0];
    console.log('\nPage:', page.page_name);
    console.log('Sections in page:', page.sections?.length || 0);
    
    if (page.sections) {
      page.sections.forEach((section, index) => {
        console.log(`\n--- Section ${index + 1}: ${section.type} ---`);
        console.log('Content structure:');
        console.log(JSON.stringify(section.content, null, 2));
      });
    }
  }
}

checkSectionContent();