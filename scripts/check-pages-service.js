import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPages() {
  console.log('🔍 Checking pages table with service role...\n');

  try {
    // Get all pages
    const { data: pages, error } = await supabase
      .from('pages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pages:', error);
      return;
    }

    console.log(`Total pages: ${pages.length}\n`);

    pages.forEach((page, index) => {
      console.log(`\n========== Page ${index + 1} ==========`);
      console.log(`Name: ${page.page_name}`);
      console.log(`ID: ${page.id}`);
      console.log(`Project ID: ${page.project_id}`);
      console.log(`Status: ${page.status}`);
      console.log(`Created: ${page.created_at}`);
      console.log(`Updated: ${page.updated_at}`);
      
      console.log(`\nSections data:`);
      console.log(`- Type: ${typeof page.sections}`);
      console.log(`- Is Array: ${Array.isArray(page.sections)}`);
      console.log(`- Length: ${page.sections ? page.sections.length : 'null/undefined'}`);
      
      if (page.sections && page.sections.length > 0) {
        console.log(`\nSection details:`);
        page.sections.forEach((section, sIdx) => {
          console.log(`  [${sIdx}] Type: ${section.type}, ID: ${section.id}`);
          console.log(`      Content structure:`, JSON.stringify(section.content, null, 2).slice(0, 500) + '...');
        });
      }
    });

  } catch (err) {
    console.error('Error:', err);
  }
}

checkPages();