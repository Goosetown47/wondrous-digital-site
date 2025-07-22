import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function checkTemplate() {
  const { data: template, error } = await supabase
    .from('section_templates')
    .select('html_template, template_name, section_type')
    .eq('section_type', 'features')
    .limit(1)
    .single();
    
  if (error) {
    console.error('Error fetching template:', error);
    return;
  }
    
  if (template && template.html_template) {
    // Find icon sections
    const iconRegex = /<div class="feature-icon"[^>]*>[\s\S]*?<\/div>/g;
    const iconMatches = template.html_template.match(iconRegex);
    
    console.log('Features template icon sections:');
    if (iconMatches) {
      iconMatches.forEach((match, index) => {
        console.log(`\nIcon ${index + 1}:`);
        console.log(match);
      });
    }
    
    // Look for button-related classes
    const buttonMatches = template.html_template.match(/class="[^"]*btn[^"]*"/g);
    if (buttonMatches) {
      console.log('\n\nButton classes found:');
      buttonMatches.forEach(match => console.log(match));
    }
    
    // Look for button variables
    const varMatches = template.html_template.match(/\{\{[^}]*button[^}]*\}\}/gi);
    if (varMatches) {
      console.log('\n\nButton variables found:');
      varMatches.forEach(match => console.log(match));
    }
  }
}

checkTemplate();