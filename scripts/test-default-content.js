import { createClient } from '@supabase/supabase-js';
// import { SECTION_DEFAULTS_MANUAL } from './populate-section-template-defaults.js';

// Initialize Supabase client with service role key for full access
const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function testDefaultContent() {
  console.log('🧪 Testing default content functionality...\n');
  
  try {
    // 1. Fetch a template to test with
    const { data: template, error: fetchError } = await supabase
      .from('section_templates')
      .select('*')
      .eq('section_type', 'hero')
      .eq('status', 'active')
      .limit(1)
      .maybeSingle();
    
    if (fetchError) {
      console.error('❌ Error fetching template:', fetchError);
      return;
    }
    
    if (!template) {
      console.log('❌ No active hero template found');
      return;
    }
    
    console.log('✅ Found template:', template.template_name);
    console.log('Current customizable_fields:', template.customizable_fields);
    
    // 2. Show what the default content would be
    const defaultContent = SECTION_DEFAULTS_MANUAL[template.section_type];
    console.log('\n📄 Default content for this section type:');
    console.log(JSON.stringify(defaultContent, null, 2));
    
    // 3. Simulate what handleDrop would do
    console.log('\n🔧 Simulating handleDrop behavior:');
    const newSection = {
      id: Math.random().toString(36).substr(2, 9),
      type: template.section_type,
      // This is what the new code does - use default_content if available
      content: template.default_content || template.customizable_fields || {}
    };
    
    console.log('Created section:', newSection);
    console.log('\n✨ Once the migration is applied and default_content is populated,');
    console.log('   new sections will have all the default text and styling!');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Copy the defaults here for testing
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
  }
};

testDefaultContent();