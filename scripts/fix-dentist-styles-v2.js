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
      primary_button_background_color: '#ff6b9f',  // Pink for primary
      secondary_button_background_color: '#FFFFFF', // White for secondary
      secondary_button_hover_color: '#F9FAFB',     // Light gray hover
      
      // Fix fonts
      primary_font: 'Inter',
      secondary_font: 'Inter',
      
      // Update colors to match the pink theme
      primary_color: '#ff6b9f',
      
      // Fix heading font settings
      h1_font_source: 'Inter',
      h1_font_weight: '700',
      h1_font_size: 48,
      h1_line_height: 1.2,
      
      h2_font_source: 'Inter', 
      h2_font_weight: '600',
      h2_font_size: 36,
      h2_line_height: 1.3,
      
      p_font_source: 'Inter',
      p_font_weight: '400',
      p_font_size: 16,
      p_line_height: 1.6
    })
    .eq('project_id', project.id);
  
  if (updateError) {
    console.error('Error updating site styles:', updateError);
  } else {
    console.log('✅ Site styles updated successfully!');
    console.log('   - Primary button background: #ff6b9f (pink)');
    console.log('   - Secondary button background: #FFFFFF (white)');
    console.log('   - Fonts: Inter with proper weights');
    console.log('   - Primary color: #ff6b9f');
    console.log('   - Heading sizes and weights fixed');
  }
}

fixDentistSiteStyles();