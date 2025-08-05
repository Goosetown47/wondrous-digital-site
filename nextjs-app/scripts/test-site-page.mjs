import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSitePage() {
  console.log('=== Testing Site Page Data ===\n');

  // Test with veterinary-template-1
  const projectSlug = 'veterinary-template-1';
  
  // 1. Get project by slug
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', projectSlug)
    .single();
    
  if (projectError) {
    console.error('Error fetching project:', projectError);
    return;
  }
  
  console.log('Project found:');
  console.log(`  ID: ${project.id}`);
  console.log(`  Name: ${project.name}`);
  console.log(`  Slug: ${project.slug}`);
  console.log(`  Published: ${project.published_at ? 'Yes' : 'No'}`);
  
  // 2. Get pages for this project
  const { data: pages, error: pagesError } = await supabase
    .from('pages')
    .select('*')
    .eq('project_id', project.id);
    
  if (pagesError) {
    console.error('Error fetching pages:', pagesError);
    return;
  }
  
  console.log(`\nPages found: ${pages.length}`);
  pages.forEach(page => {
    console.log(`  - ${page.path} (${page.title})`);
    console.log(`    Sections: ${page.sections?.length || 0}`);
    console.log(`    Published sections: ${page.published_sections?.length || 0}`);
  });
  
  // 3. Test the homepage specifically
  const homepage = pages.find(p => p.path === '/');
  if (homepage) {
    console.log('\nHomepage details:');
    console.log(`  Has draft sections: ${homepage.sections?.length > 0}`);
    console.log(`  Has published sections: ${homepage.published_sections?.length > 0}`);
    
    if (homepage.published_sections?.length > 0) {
      console.log('\nPublished sections:');
      homepage.published_sections.forEach((section, idx) => {
        console.log(`  ${idx + 1}. ${section.component_name} (${section.type})`);
      });
    }
  }
  
  // 4. Check preview URL
  console.log('\nPreview URL:');
  console.log(`  http://${projectSlug}.sites.wondrousdigital.com`);
  console.log(`  Should route to: /sites/${project.id}`);
}

testSitePage().catch(console.error);