import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPageContent() {
  console.log('🔍 Checking page content in database...\n');

  try {
    // Get all pages with their sections
    const { data: pages, error } = await supabase
      .from('pages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pages:', error);
      return;
    }

    console.log(`Found ${pages.length} pages\n`);

    pages.forEach((page, index) => {
      console.log(`Page ${index + 1}: ${page.page_name}`);
      console.log(`  ID: ${page.id}`);
      console.log(`  Project ID: ${page.project_id}`);
      console.log(`  Status: ${page.status}`);
      console.log(`  Sections data type: ${typeof page.sections}`);
      console.log(`  Sections count: ${page.sections ? page.sections.length : 0}`);
      
      if (page.sections && page.sections.length > 0) {
        console.log('  Section details:');
        page.sections.forEach((section, sIndex) => {
          console.log(`    Section ${sIndex + 1}:`);
          console.log(`      Type: ${section.type}`);
          console.log(`      ID: ${section.id}`);
          console.log(`      Content keys: ${Object.keys(section.content || {}).join(', ')}`);
          
          // Check if content has actual values
          if (section.content) {
            const contentSample = {};
            Object.keys(section.content).slice(0, 3).forEach(key => {
              const value = section.content[key];
              if (typeof value === 'object' && value !== null) {
                contentSample[key] = {
                  type: typeof value,
                  keys: Object.keys(value).join(', '),
                  sample: value.text || value.src || value.href || JSON.stringify(value).slice(0, 50)
                };
              } else {
                contentSample[key] = value;
              }
            });
            console.log('      Content sample:', JSON.stringify(contentSample, null, 8));
          }
        });
      } else {
        console.log('  No sections found');
      }
      console.log('');
    });

  } catch (err) {
    console.error('Error:', err);
  }
}

checkPageContent();