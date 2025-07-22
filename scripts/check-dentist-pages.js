import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🦷 Checking Dentist Template pages and sections...\n');

// Get the dentist project
const { data: project } = await supabase
  .from('projects')
  .select('*')
  .eq('project_name', 'Dentist Template')
  .single();

if (!project) {
  console.error('Dentist project not found');
  process.exit(1);
}

console.log('Project ID:', project.id);
console.log('');

// Get pages
const { data: pages, error: pagesError } = await supabase
  .from('pages')
  .select('*')
  .eq('project_id', project.id)
  .order('order_index');

if (pagesError) {
  console.error('Error fetching pages:', pagesError);
} else {
  console.log(`Found ${pages?.length || 0} pages:`);
  pages?.forEach(page => {
    console.log(`\n📄 Page: ${page.page_name}`);
    console.log(`   - ID: ${page.id}`);
    console.log(`   - Slug: ${page.slug}`);
    console.log(`   - Status: ${page.status}`);
    console.log(`   - Is Homepage: ${page.is_homepage}`);
    console.log(`   - Order: ${page.order_index}`);
  });
}

// Get page sections separately
console.log('\n\n🔗 Checking page sections...');
const { data: pageSections, error: sectionsError } = await supabase
  .from('page_sections')
  .select('*')
  .in('page_id', pages?.map(p => p.id) || [])
  .order('order_index');

if (sectionsError) {
  console.error('Error fetching page sections:', sectionsError);
} else {
  console.log(`\nFound ${pageSections?.length || 0} total page sections`);
  
  // Group by page
  pages?.forEach(page => {
    const sections = pageSections?.filter(ps => ps.page_id === page.id) || [];
    console.log(`\n📄 ${page.page_name}: ${sections.length} sections`);
    sections.forEach((ps, i) => {
      console.log(`   ${i + 1}. ${ps.section_type || 'Unknown'} (order: ${ps.order_index})`);
      if (ps.content) {
        console.log(`      Content keys: ${Object.keys(ps.content).join(', ')}`);
      }
    });
  });
}

// Check site styles
console.log('\n\n🎨 Checking site styles...');
const { data: siteStyles } = await supabase
  .from('site_styles')
  .select('*')
  .eq('project_id', project.id)
  .single();

console.log(siteStyles ? '✅ Site styles found' : '❌ No site styles');

// Check global navigation
console.log('\n\n🧭 Checking global navigation...');
const { data: globalNav } = await supabase
  .from('global_navigation')
  .select('*')
  .eq('project_id', project.id);

console.log(`Found ${globalNav?.length || 0} navigation links`);