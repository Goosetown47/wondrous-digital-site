import { createClient } from '@supabase/supabase-js';
// import { SECTION_DEFAULTS } from '../src/utils/sectionDefaults.js';

// Initialize Supabase client with service role key for full access
const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function populateTemplateDefaults() {
  console.log('🚀 Starting to populate default content for section templates...\n');
  
  try {
    // 1. First, fetch all existing templates
    console.log('1. Fetching existing section templates...');
    const { data: templates, error: fetchError } = await supabase
      .from('section_templates')
      .select('id, section_type, template_name, default_content');
    
    if (fetchError) {
      console.error('❌ Error fetching templates:', fetchError);
      return;
    }
    
    console.log(`✅ Found ${templates?.length || 0} templates\n`);
    
    if (!templates || templates.length === 0) {
      console.log('No templates found to update.');
      return;
    }
    
    // 2. Update each template with default content based on its section type
    console.log('2. Updating templates with default content...\n');
    
    for (const template of templates) {
      // Skip if default_content already exists and is not empty
      if (template.default_content && Object.keys(template.default_content).length > 0) {
        console.log(`⏭️  Skipping "${template.template_name}" - already has default content`);
        continue;
      }
      
      // Get default content for this section type
      const defaultContent = SECTION_DEFAULTS_MANUAL[template.section_type];
      
      if (!defaultContent) {
        console.log(`⚠️  No default content defined for section type: ${template.section_type}`);
        continue;
      }
      
      // Update the template with default content
      const { error: updateError } = await supabase
        .from('section_templates')
        .update({ default_content: defaultContent })
        .eq('id', template.id);
      
      if (updateError) {
        console.error(`❌ Error updating template "${template.template_name}":`, updateError);
      } else {
        console.log(`✅ Updated "${template.template_name}" (${template.section_type})`);
      }
    }
    
    console.log('\n✨ Default content population complete!');
    
    // 3. Verify the updates
    console.log('\n3. Verifying updates...');
    const { data: updatedTemplates, error: verifyError } = await supabase
      .from('section_templates')
      .select('section_type, template_name, default_content')
      .not('default_content', 'is', null);
    
    if (verifyError) {
      console.error('❌ Error verifying updates:', verifyError);
    } else {
      console.log(`\n✅ ${updatedTemplates?.length || 0} templates now have default content`);
      
      // Show a sample
      if (updatedTemplates && updatedTemplates.length > 0) {
        console.log('\nSample template with defaults:');
        const sample = updatedTemplates[0];
        console.log(`- Template: ${sample.template_name}`);
        console.log(`- Type: ${sample.section_type}`);
        console.log(`- Default fields: ${Object.keys(sample.default_content).join(', ')}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Note: Since this references the SECTION_DEFAULTS from a TypeScript file,
// we'll need to either:
// 1. Convert this to TypeScript and compile it, or
// 2. Manually copy the SECTION_DEFAULTS object here

// For now, let's use a manual copy of the defaults
const SECTION_DEFAULTS_MANUAL = {
  hero: {
    headline: {
      text: "Medium length hero headline goes here",
      color: "#000000"
    },
    description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
      color: "#6B7280"
    },
    primaryButton: {
      text: "Button",
      href: "#",
      variant: "primary"
    },
    secondaryButton: {
      text: "Button",
      href: "#",
      variant: "tertiary"
    },
    heroImage: {
      src: "",
      alt: "Hero image"
    },
    backgroundColor: "#FFFFFF"
  },
  
  features: {
    tagline: {
      text: "Tagline",
      color: "#000000"
    },
    mainHeading: {
      text: "Medium length section heading goes here",
      color: "#000000"
    },
    description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
      color: "#6B7280"
    },
    feature1Icon: {
      icon: "Box",
      size: 40,
      color: "#000000"
    },
    feature1Heading: {
      text: "Medium length section heading goes here",
      color: "#000000"
    },
    feature1Description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      color: "#6B7280"
    },
    feature2Icon: {
      icon: "Box",
      size: 40,
      color: "#000000"
    },
    feature2Heading: {
      text: "Medium length section heading goes here",
      color: "#000000"
    },
    feature2Description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      color: "#6B7280"
    },
    feature3Icon: {
      icon: "Box",
      size: 40,
      color: "#000000"
    },
    feature3Heading: {
      text: "Medium length section heading goes here",
      color: "#000000"
    },
    feature3Description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      color: "#6B7280"
    },
    feature4Icon: {
      icon: "Box",
      size: 40,
      color: "#000000"
    },
    feature4Heading: {
      text: "Medium length section heading goes here",
      color: "#000000"
    },
    feature4Description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      color: "#6B7280"
    },
    primaryButton: {
      text: "Button",
      href: "#",
      variant: "primary"
    },
    secondaryButton: {
      text: "Button",
      href: "#",
      variant: "secondary"
    },
    backgroundColor: "#FFFFFF"
  },
  
  navigation: {
    backgroundColor: "#FFFFFF",
    logoPosition: "left"
  },
  
  'navigation-desktop': {
    backgroundColor: "#FFFFFF",
    logoPosition: "left"
  }
};

populateTemplateDefaults();