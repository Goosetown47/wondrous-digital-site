import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function checkSiteStyles() {
  // Get the dentist project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, project_name, subdomain')
    .eq('subdomain', 'dentist-1')
    .single();
    
  if (projectError) {
    console.error('Error fetching project:', projectError);
    return;
  }
  
  console.log('Project:', project.project_name);
  console.log('Project ID:', project.id);
  console.log('Subdomain:', project.subdomain);
  
  // Get site styles from the site_styles table
  const { data: siteStyles, error: stylesError } = await supabase
    .from('site_styles')
    .select('*')
    .eq('project_id', project.id)
    .single();
    
  if (stylesError) {
    console.error('Error fetching site styles:', stylesError);
    return;
  }
  
  console.log('\nSite Styles:');
  console.log(JSON.stringify(siteStyles, null, 2));
  
  // Check specific button styles
  if (siteStyles) {
    console.log('\n=== Button Styles ===');
    console.log('Primary Button BG:', siteStyles.primary_button_bg_color);
    console.log('Primary Button Text:', siteStyles.primary_button_text_color);
    console.log('Button Style:', siteStyles.button_style);
    
    console.log('\n=== Typography ===');
    console.log('Heading Font:', siteStyles.font_family_heading);
    console.log('Body Font:', siteStyles.font_family_body);
    
    console.log('\n=== Colors ===');
    console.log('Primary Color:', siteStyles.primary_color);
    console.log('Secondary Color:', siteStyles.secondary_color);
  }
}

checkSiteStyles();