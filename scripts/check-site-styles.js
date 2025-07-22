import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function checkSiteStyles() {
  console.log('🔍 Checking dentist-1 project site styles...\n');
  
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
  
  // Get site styles
  const { data: siteStyles } = await supabase
    .from('site_styles')
    .select('*')
    .eq('project_id', project.id);
  
  if (siteStyles && siteStyles.length > 0) {
    const style = siteStyles[0];
    console.log('Site Styles:');
    console.log('  Primary Color:', style.primary_color);
    console.log('  Secondary Color:', style.secondary_color);
    console.log('  Tertiary Color:', style.tertiary_color);
    console.log('  Dark Color:', style.dark_color);
    console.log('  Light Color:', style.light_color);
    console.log('  White Color:', style.white_color);
    
    console.log('\nButton Colors:');
    console.log('  Primary Button BG:', style.primary_button_bg_color);
    console.log('  Primary Button Text:', style.primary_button_text_color);
    console.log('  Primary Button Border:', style.primary_button_border_color);
    console.log('  Primary Button Hover:', style.primary_button_hover_color);
    console.log('  Primary Button Shadow:', style.primary_button_shadow_color);
    
    console.log('  Secondary Button BG:', style.secondary_button_bg_color);
    console.log('  Secondary Button Text:', style.secondary_button_text_color);
    console.log('  Secondary Button Border:', style.secondary_button_border_color);
    
    console.log('\nButton Settings:');
    console.log('  Button Style:', style.button_style);
    console.log('  Primary Button Radius:', style.primary_button_radius);
    console.log('  Secondary Button Radius:', style.secondary_button_radius);
    
    console.log('\nFonts:');
    console.log('  Body Font:', style.body_font);
    console.log('  Heading Font:', style.heading_font);
  }
}

checkSiteStyles();