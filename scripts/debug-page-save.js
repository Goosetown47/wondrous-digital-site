import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugPageSave() {
  console.log('🔍 Debugging page save issue...\n');

  try {
    // First, check section templates to understand structure
    console.log('1. Checking section template structure:');
    const { data: templates, error: templateError } = await supabase
      .from('section_templates')
      .select('*')
      .eq('section_type', 'hero')
      .eq('status', 'active')
      .limit(1);

    if (templateError) {
      console.error('Template error:', templateError);
    } else if (templates && templates.length > 0) {
      const template = templates[0];
      console.log('Template name:', template.template_name);
      console.log('Customizable fields structure:');
      console.log(JSON.stringify(template.customizable_fields, null, 2));
    }

    // Now check if we have any pages with sections
    console.log('\n2. Looking for pages with sections:');
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .select('id, project_name')
      .limit(5);

    if (projectError) {
      console.error('Project error:', projectError);
      return;
    }

    // For each project, check pages
    for (const project of projects || []) {
      console.log(`\nChecking project: ${project.project_name}`);
      
      const { data: pages, error: pageError } = await supabase
        .from('pages')
        .select('*')
        .eq('project_id', project.id)
        .limit(3);

      if (pageError) {
        console.error('Page error:', pageError);
        continue;
      }

      if (!pages || pages.length === 0) {
        console.log('  No pages found');
        continue;
      }

      pages.forEach(page => {
        console.log(`  Page: ${page.page_name}`);
        console.log(`    ID: ${page.id}`);
        console.log(`    Sections: ${page.sections ? page.sections.length : 'null'}`);
        
        if (page.sections && page.sections.length > 0) {
          page.sections.forEach((section, idx) => {
            console.log(`    Section ${idx}: Type=${section.type}`);
            console.log(`      Content keys: ${Object.keys(section.content || {}).join(', ')}`);
            
            // Check a few specific fields
            if (section.content?.headline) {
              console.log(`      Headline: ${JSON.stringify(section.content.headline)}`);
            }
            if (section.content?.description) {
              console.log(`      Description: ${JSON.stringify(section.content.description).slice(0, 100)}...`);
            }
          });
        }
      });
    }

  } catch (err) {
    console.error('Error:', err);
  }
}

debugPageSave();