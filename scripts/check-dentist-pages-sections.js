import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env
dotenv.config();

// Also load .env.local if it exists
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDentistPagesAndSections() {
  console.log('=== Checking Dentist Project Pages and Sections ===');
  
  try {
    const projectId = '923eb256-26eb-4cf3-8e64-ddd1297863c0';
    
    // Get all pages without any filters first
    const { data: allPages, error: allPagesError } = await supabase
      .from('pages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    console.log('\n=== All Recent Pages in Database ===');
    if (allPages && allPages.length > 0) {
      allPages.forEach(page => {
        console.log(`- ${page.title} (Project: ${page.project_id})`);
        console.log(`  ID: ${page.id}`);
        console.log(`  Slug: ${page.slug}`);
        console.log(`  Status: ${page.status}`);
        console.log(`  Created: ${new Date(page.created_at).toLocaleString()}`);
        if (page.project_id === projectId) {
          console.log('  ⚠️  THIS IS A DENTIST PROJECT PAGE!');
        }
        console.log('');
      });
    } else {
      console.log('No pages found in database');
    }

    // Now specifically check pages for dentist project
    console.log(`\n=== Pages for Dentist Project (${projectId}) ===`);
    const { data: dentistPages, error: dentistPagesError } = await supabase
      .from('pages')
      .select('*')
      .eq('project_id', projectId);

    if (dentistPagesError) {
      console.error('Error fetching dentist pages:', dentistPagesError);
    } else if (dentistPages && dentistPages.length > 0) {
      console.log(`Found ${dentistPages.length} pages:`);
      
      for (const page of dentistPages) {
        console.log(`\n- Page: ${page.title}`);
        console.log(`  ID: ${page.id}`);
        console.log(`  Slug: ${page.slug}`);
        console.log(`  Status: ${page.status}`);
        console.log(`  Is Homepage: ${page.is_homepage}`);
        console.log(`  Order: ${page.order}`);
        
        // Get sections for this page
        const { data: sections, error: sectionsError } = await supabase
          .from('sections')
          .select('*')
          .eq('page_id', page.id)
          .order('order');
        
        if (sections && sections.length > 0) {
          console.log(`  Sections (${sections.length}):`);
          sections.forEach(section => {
            console.log(`    - ${section.type} (Order: ${section.order})`);
            console.log(`      Template: ${section.template_id}`);
            console.log(`      Settings: ${JSON.stringify(section.settings).substring(0, 50)}...`);
          });
        } else {
          console.log('  No sections found for this page');
        }
      }
    } else {
      console.log('No pages found for dentist project');
    }

    // Check if there are any sections referencing pages that might belong to dentist project
    console.log('\n=== Checking for Orphaned Sections ===');
    const { data: allSections, error: allSectionsError } = await supabase
      .from('sections')
      .select('*, pages!inner(project_id, title)')
      .eq('pages.project_id', projectId);

    if (allSections && allSections.length > 0) {
      console.log(`Found ${allSections.length} sections linked to dentist project through pages table`);
    } else {
      console.log('No sections found linked to dentist project');
    }

  } catch (error) {
    console.error('Script error:', error);
  }
}

checkDentistPagesAndSections();