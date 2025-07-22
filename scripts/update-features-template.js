import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function updateTemplate() {
  // First get the current template
  const { data: template, error: fetchError } = await supabase
    .from('section_templates')
    .select('html_template')
    .eq('section_type', 'features')
    .single();
    
  if (fetchError || !template) {
    console.error('Error fetching template:', fetchError);
    return;
  }
  
  // Update the icon HTML to support both icon fonts and emoji
  let updatedTemplate = template.html_template;
  
  // Replace each icon section to support emoji fallback
  for (let i = 1; i <= 4; i++) {
    const oldPattern = new RegExp(
      `<div class="feature-icon"[^>]*>\\s*<i class="icon-\\{\\{feature${i}Icon\\.icon\\}\\}"></i>\\s*</div>`,
      'g'
    );
    
    const newIcon = `<div class="feature-icon" style="color: {{feature${i}Icon.color}}">
          {{#if feature${i}Icon.emoji}}
            {{feature${i}Icon.emoji}}
          {{else}}
            <i class="icon-{{feature${i}Icon.icon}}"></i>
          {{/if}}
        </div>`;
    
    updatedTemplate = updatedTemplate.replace(oldPattern, newIcon);
  }
  
  // Update the template in the database
  const { error: updateError } = await supabase
    .from('section_templates')
    .update({ html_template: updatedTemplate })
    .eq('section_type', 'features');
    
  if (updateError) {
    console.error('Error updating template:', updateError);
  } else {
    console.log('Successfully updated features template to support emoji icons');
  }
}

updateTemplate();