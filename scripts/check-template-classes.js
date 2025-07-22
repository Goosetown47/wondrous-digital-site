import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for full access
const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function checkTemplateClasses() {
  console.log('🔍 Checking button classes in HTML templates...\n');
  
  try {
    // Get all active templates
    const { data: templates, error } = await supabase
      .from('section_templates')
      .select('id, section_type, template_name, html_template')
      .eq('status', 'active');
    
    if (error) {
      console.error('Error fetching templates:', error);
      return;
    }

    console.log(`Found ${templates?.length || 0} active templates\n`);

    const allButtonClasses = new Set();
    const templateButtonInfo = [];

    templates?.forEach((template) => {
      if (template.html_template) {
        // Extract all class attributes
        const classMatches = template.html_template.match(/class="([^"]*)"/g) || [];
        const buttonClasses = new Set();
        
        classMatches.forEach(match => {
          const classes = match.replace('class="', '').replace('"', '').split(' ');
          classes.forEach(cls => {
            if (cls.includes('btn')) {
              buttonClasses.add(cls);
              allButtonClasses.add(cls);
            }
          });
        });

        // Look for actual button/link elements with btn classes
        const buttonElements = template.html_template.match(/<(a|button)[^>]*class="[^"]*btn[^"]*"[^>]*>/g) || [];
        
        if (buttonClasses.size > 0 || buttonElements.length > 0) {
          templateButtonInfo.push({
            type: template.section_type,
            name: template.template_name,
            classes: Array.from(buttonClasses),
            buttonCount: buttonElements.length,
            sampleButtons: buttonElements.slice(0, 2)
          });
        }
      }
    });

    // Display results
    console.log('=== TEMPLATES WITH BUTTONS ===\n');
    templateButtonInfo.forEach(info => {
      console.log(`${info.type} - ${info.name}:`);
      console.log(`  Button classes found: ${info.classes.join(', ')}`);
      console.log(`  Button elements: ${info.buttonCount}`);
      if (info.sampleButtons.length > 0) {
        console.log('  Sample buttons:');
        info.sampleButtons.forEach(btn => {
          console.log(`    ${btn.substring(0, 100)}...`);
        });
      }
      console.log('');
    });

    console.log('\n=== ALL UNIQUE BUTTON CLASSES ===');
    console.log(Array.from(allButtonClasses).sort().join('\n'));

    // Check for inconsistencies
    console.log('\n=== ANALYSIS ===');
    
    // Expected button classes from CSS
    const expectedClasses = [
      'btn', 'btn-primary', 'btn-secondary', 'btn-tertiary', 'btn-text-link',
      'btn-small', 'btn-medium', 'btn-large',
      'btn-radius-squared', 'btn-radius-slightly-rounded', 'btn-radius-fully-rounded'
    ];
    
    const foundClasses = Array.from(allButtonClasses);
    const missingExpected = expectedClasses.filter(cls => !foundClasses.includes(cls));
    const unexpectedFound = foundClasses.filter(cls => !expectedClasses.includes(cls));
    
    if (missingExpected.length > 0) {
      console.log('\nExpected classes NOT found in templates:');
      console.log(missingExpected.join(', '));
    }
    
    if (unexpectedFound.length > 0) {
      console.log('\nUnexpected button classes found:');
      console.log(unexpectedFound.join(', '));
    }

    if (missingExpected.length === 0 && unexpectedFound.length === 0) {
      console.log('\n✅ All button classes match between CSS and templates!');
    } else {
      console.log('\n❌ Button class mismatch detected - this could be causing the styling issues!');
    }

  } catch (error) {
    console.error('Script error:', error);
  }
}

checkTemplateClasses();