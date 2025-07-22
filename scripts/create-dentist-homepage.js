import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Section defaults for hero and features
const sectionDefaults = {
  hero: {
    headline: {
      text: "Medium length hero headline goes here",
      color: "#000000",
      lineHeight: "1.2"
    },
    description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
      color: "#6B7280",
      lineHeight: "1.6"
    },
    primaryButton: {
      text: "Button",
      href: "#",
      variant: "primary",
      icon: ""
    },
    secondaryButton: {
      text: "Button",
      href: "#",
      variant: "tertiary",
      icon: ""
    },
    heroImage: {
      src: "",
      alt: "Hero image",
      imageScaling: "fill-height",
      containerMode: "section-height",
      containerAspectRatio: "16:9",
      containerSize: "large"
    },
    backgroundColor: "#FFFFFF",
    backgroundImage: "",
    backgroundGradient: "",
    backgroundBlur: 0,
    backgroundType: "color"
  },
  features: {
    tagline: {
      text: "Tagline",
      color: "#000000",
      lineHeight: "1.5"
    },
    mainHeading: {
      text: "Medium length section heading goes here",
      color: "#000000",
      lineHeight: "1.2"
    },
    description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
      color: "#6B7280",
      lineHeight: "1.6"
    },
    feature1Icon: {
      icon: "Box",
      size: 40,
      color: "#000000"
    },
    feature1Heading: {
      text: "Medium length section heading goes here",
      color: "#000000",
      lineHeight: "1.2"
    },
    feature1Description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      color: "#6B7280",
      lineHeight: "1.6"
    },
    feature2Icon: {
      icon: "Box",
      size: 40,
      color: "#000000"
    },
    feature2Heading: {
      text: "Medium length section heading goes here",
      color: "#000000",
      lineHeight: "1.2"
    },
    feature2Description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      color: "#6B7280",
      lineHeight: "1.6"
    },
    feature3Icon: {
      icon: "Box",
      size: 40,
      color: "#000000"
    },
    feature3Heading: {
      text: "Medium length section heading goes here",
      color: "#000000",
      lineHeight: "1.2"
    },
    feature3Description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      color: "#6B7280",
      lineHeight: "1.6"
    },
    feature4Icon: {
      icon: "Box",
      size: 40,
      color: "#000000"
    },
    feature4Heading: {
      text: "Medium length section heading goes here",
      color: "#000000",
      lineHeight: "1.2"
    },
    feature4Description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      color: "#6B7280",
      lineHeight: "1.6"
    },
    primaryButton: {
      text: "Button",
      href: "#",
      variant: "primary",
      icon: ""
    },
    secondaryButton: {
      text: "Button",
      href: "#",
      variant: "secondary",
      icon: ""
    },
    backgroundColor: "#FFFFFF",
    backgroundImage: "",
    backgroundGradient: "",
    backgroundBlur: 0,
    backgroundType: "color"
  }
};

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createDentistHomepage() {
  try {
    console.log('Finding dentist project...');
    
    // Find the dentist project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('project_name', 'Dentist Template')
      .single();
    
    if (projectError) {
      console.error('Error finding project:', projectError);
      return;
    }
    
    if (!project) {
      console.error('Dentist project not found');
      return;
    }
    
    console.log('Found dentist project:', {
      id: project.id,
      name: project.project_name,
      account_id: project.account_id
    });
    
    // First, delete any existing homepage for this project
    console.log('Removing any existing homepage...');
    const { error: deleteError } = await supabase
      .from('pages')
      .delete()
      .eq('project_id', project.id)
      .eq('is_homepage', true);
    
    if (deleteError) {
      console.error('Error deleting existing homepage:', deleteError);
      return;
    }
    
    // Create the sections array with hero and features sections
    const sections = [
      {
        type: 'hero',
        template_id: 'hero-centered-image-right',
        content: sectionDefaults.hero,
        order_index: 0
      },
      {
        type: 'features',
        template_id: 'features-2x2-grid',
        content: sectionDefaults.features,
        order_index: 1
      }
    ];
    
    // Create the new homepage
    console.log('Creating new homepage with sections...');
    const { data: newPage, error: pageError } = await supabase
      .from('pages')
      .insert({
        project_id: project.id,
        page_name: 'Home',
        slug: 'home',
        is_homepage: true,
        sections: sections
      })
      .select()
      .single();
    
    if (pageError) {
      console.error('Error creating page:', pageError);
      return;
    }
    
    console.log('Successfully created homepage!');
    console.log('\nPage details:');
    console.log('- ID:', newPage.id);
    console.log('- Name:', newPage.page_name);
    console.log('- Slug:', newPage.slug);
    console.log('- Is Homepage:', newPage.is_homepage);
    console.log('- Number of sections:', newPage.sections.length);
    console.log('\nSections:');
    newPage.sections.forEach((section, index) => {
      console.log(`  ${index + 1}. Type: ${section.type}, Template: ${section.template_id}`);
      console.log(`     Content keys:`, Object.keys(section.content).slice(0, 5).join(', ') + '...');
    });
    
    // Also update any other pages to not be homepage
    console.log('\nEnsuring no other pages are marked as homepage...');
    const { error: updateError } = await supabase
      .from('pages')
      .update({ is_homepage: false })
      .eq('project_id', project.id)
      .neq('id', newPage.id);
    
    if (updateError) {
      console.error('Error updating other pages:', updateError);
    } else {
      console.log('Homepage setup complete!');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
createDentistHomepage();