import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function debugHomepage() {
  console.log('🔍 Debugging homepage sections...\n');
  
  // Get the dentist project first
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('subdomain', 'dentist-1')
    .single();
    
  if (!project) {
    console.error('Project not found');
    return;
  }
  
  // Get the homepage directly
  const { data: homepage } = await supabase
    .from('pages')
    .select('*')
    .eq('project_id', project.id)
    .eq('is_homepage', true)
    .single();
  
  if (!homepage) {
    console.error('Homepage not found');
    return;
  }
  
  console.log('Homepage details:');
  console.log('- ID:', homepage.id);
  console.log('- Name:', homepage.page_name);
  console.log('- Project ID:', homepage.project_id);
  console.log('- Has sections:', !!homepage.sections);
  console.log('- Sections count:', homepage.sections?.length || 0);
  
  // Check the actual sections structure
  if (homepage.sections) {
    console.log('\nFull sections data:');
    console.log(JSON.stringify(homepage.sections, null, 2));
  }
  
  // Also check what's in page_sections table for comparison
  console.log('\n\nChecking page_sections table for this page:');
  const { data: pageSections } = await supabase
    .from('page_sections')
    .select('*')
    .eq('page_id', homepage.id)
    .order('order_index');
    
  if (pageSections && pageSections.length > 0) {
    console.log(`Found ${pageSections.length} sections in page_sections table`);
    pageSections.forEach((section, idx) => {
      console.log(`\n${idx + 1}. ${section.section_type}:`);
      console.log('   Content:', JSON.stringify(section.content).substring(0, 200));
    });
  }
  
  // Check section templates to understand the expected format
  console.log('\n\nChecking section templates:');
  const { data: templates } = await supabase
    .from('section_templates')
    .select('*')
    .in('section_type', ['hero', 'features'])
    .eq('status', 'active')
    .limit(5);
    
  if (templates && templates.length > 0) {
    console.log(`Found ${templates.length} active templates`);
    templates.forEach(template => {
      console.log(`\n- ${template.template_name} (${template.section_type}):`);
      if (template.fields) {
        console.log('  Fields:', Object.keys(template.fields).join(', '));
      }
    });
  }
}

debugHomepage();