import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function checkProjectData() {
  console.log('🔍 Checking dentist project data...\n');
  
  // Get the dentist project
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('subdomain', 'dentist-2')
    .single();
  
  if (error || !project) {
    console.error('Error fetching project:', error);
    return;
  }
  
  // Get sections for this project
  const { data: sections } = await supabase
    .from('page_sections')
    .select('*')
    .eq('project_id', project.id)
    .order('order_index');
  
  // Get site styles for this project
  const { data: siteStyles } = await supabase
    .from('site_styles')
    .select('*')
    .eq('project_id', project.id);
  
  // Assign to project object
  project.sections = sections || [];
  project.site_styles = siteStyles || [];
  
  console.log('Project Details:');
  console.log('  ID:', project.id);
  console.log('  Name:', project.project_name);
  console.log('  Subdomain:', project.subdomain);
  console.log('  Template ID:', project.template_id);
  console.log('  Customer ID:', project.customer_id);
  console.log('  Global Navigation:', project.global_navigation ? 'Present' : 'Not set');
  
  console.log('\nSections:');
  if (project.sections && project.sections.length > 0) {
    console.log(`  Found ${project.sections.length} sections`);
    project.sections.forEach((section, index) => {
      console.log(`\n  Section ${index + 1}:`);
      console.log(`    Type: ${section.section_type}`);
      console.log(`    Template ID: ${section.template_id}`);
      console.log(`    Order: ${section.order_index}`);
      console.log(`    Active: ${section.is_active}`);
      console.log(`    Has content: ${!!section.content}`);
    });
  } else {
    console.log('  ❌ No sections found - this is why deployment failed!');
  }
  
  console.log('\nSite Styles:');
  if (project.site_styles && project.site_styles.length > 0) {
    console.log(`  Found ${project.site_styles.length} site styles`);
    const style = project.site_styles[0];
    console.log('  Primary Color:', style.primary_color);
    console.log('  Has button styles:', !!(style.primary_button_text_color));
  } else {
    console.log('  ❌ No site styles found - this is also required for deployment!');
  }
  
  // Check if this is a template project that needs sections
  if (project.project_type === 'template') {
    console.log('\n⚠️  This is a template project');
    console.log('  Template projects should have default sections');
  }
}

checkProjectData();