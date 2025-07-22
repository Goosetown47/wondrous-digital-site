import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function fixDentistSiteStyles() {
  console.log('🔧 Fixing dentist-1 project site styles...\n');
  
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
  
  // Update site styles to match the pink theme from the page builder
  const { data, error: updateError } = await supabase
    .from('site_styles')
    .update({
      // Fix missing button background colors
      primary_button_bg_color: '#ff6b9f',  // Pink for primary
      secondary_button_bg_color: '#FFFFFF', // White for secondary
      
      // Fix fonts
      body_font: 'Inter',
      heading_font: 'Inter',
      
      // Update primary color to match the pink theme
      primary_color: '#ff6b9f'
    })
    .eq('project_id', project.id);
  
  if (updateError) {
    console.error('Error updating site styles:', updateError);
  } else {
    console.log('✅ Site styles updated successfully!');
    console.log('   - Primary button background: #ff6b9f (pink)');
    console.log('   - Secondary button background: #FFFFFF (white)');
    console.log('   - Fonts: Inter');
    console.log('   - Primary color: #ff6b9f');
  }
}

fixDentistSiteStyles();