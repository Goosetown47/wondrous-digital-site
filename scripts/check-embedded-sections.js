import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function checkEmbeddedSections() {
  console.log('🔍 Checking embedded sections content...\n');
  
  // Get the dentist project
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('subdomain', 'dentist-1')
    .single();
  
  if (!project) {
    console.error('Project not found');
    return;
  }
  
  // Get pages with embedded sections
  const { data: pages } = await supabase
    .from('pages')
    .select('*')
    .eq('project_id', project.id)
    .eq('status', 'published')
    .order('order_index');
    
  console.log(`Found ${pages?.length || 0} published pages\n`);
  
  if (pages && pages.length > 0) {
    for (const page of pages) {
      console.log(`\n📄 ${page.page_name} (${page.slug}):`);
      console.log(`   Is Homepage: ${page.is_homepage}`);
      
      if (page.sections && page.sections.length > 0) {
        console.log(`\n   Embedded Sections (${page.sections.length}):`);
        
        page.sections.forEach((section, idx) => {
          console.log(`\n   ${idx + 1}. ${section.type}:`);
          console.log(`      ID: ${section.id}`);
          
          if (section.content) {
            console.log('\n      Content:');
            console.log(JSON.stringify(section.content, null, 2).split('\n').map(line => '      ' + line).join('\n'));
          }
          
          if (section.settings) {
            console.log('\n      Settings:');
            console.log(JSON.stringify(section.settings, null, 2).split('\n').map(line => '      ' + line).join('\n'));
          }
        });
      } else {
        console.log('   No embedded sections');
      }
      
      console.log('\n' + '='.repeat(80));
    }
  }
}

checkEmbeddedSections();