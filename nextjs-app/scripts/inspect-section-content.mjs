import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectSectionContent() {
  console.log('=== Inspecting Section Content Structure ===\n');

  const projectSlug = 'veterinary-template-1';
  
  // Get project
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('slug', projectSlug)
    .single();
    
  if (!project) {
    console.error('Project not found');
    return;
  }
  
  // Get homepage
  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('project_id', project.id)
    .eq('path', '/')
    .single();
    
  if (!page) {
    console.error('Homepage not found');
    return;
  }
  
  console.log('Homepage sections:');
  console.log(`  Draft sections: ${page.sections?.length || 0}`);
  console.log(`  Published sections: ${page.published_sections?.length || 0}`);
  
  if (page.published_sections && page.published_sections.length > 0) {
    console.log('\nPublished section details:');
    page.published_sections.forEach((section, idx) => {
      console.log(`\n${idx + 1}. Section ${section.id}:`);
      console.log(`   Component: ${section.component_name}`);
      console.log(`   Type: ${section.type}`);
      console.log(`   Content structure:`);
      console.log(JSON.stringify(section.content, null, 2));
    });
  }
}

inspectSectionContent().catch(console.error);