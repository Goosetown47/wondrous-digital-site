import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDuplicateSections() {
  console.log('=== Checking for Duplicate Sections ===\n');

  try {
    // First, find the dentist project
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .or('project_name.ilike.%dentist%,subdomain.ilike.%dentist%')
      .order('created_at', { ascending: false });

    if (projectError) {
      console.error('Error fetching projects:', projectError);
      return;
    }

    if (!projects || projects.length === 0) {
      console.log('No dentist projects found');
      return;
    }

    console.log(`Found ${projects.length} dentist project(s):\n`);
    
    for (const project of projects) {
      console.log(`\nProject: ${project.project_name} (ID: ${project.id})`);
      console.log(`Subdomain: ${project.subdomain}`);
      console.log(`Created: ${new Date(project.created_at).toLocaleString()}`);
      
      // Get all pages for this project
      const { data: pages, error: pagesError } = await supabase
        .from('pages')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: true });

      if (pagesError) {
        console.error('Error fetching pages:', pagesError);
        continue;
      }

      console.log(`\nPages for project ${project.project_name}:`);
      
      for (const page of pages) {
        console.log(`\n  Page: ${page.page_name || page.name} (ID: ${page.id})`);
        console.log(`  Slug: ${page.slug}`);
        console.log(`  Is Homepage: ${page.is_homepage}`);
        
        if (page.sections && Array.isArray(page.sections)) {
          console.log(`  Total sections: ${page.sections.length}`);
          
          // Count sections by type
          const sectionCounts = {};
          const sectionDetails = [];
          
          page.sections.forEach((section, index) => {
            const type = section.type || 'unknown';
            sectionCounts[type] = (sectionCounts[type] || 0) + 1;
            
            sectionDetails.push({
              index,
              id: section.id,
              type: type,
              template: section.template || 'default',
              content: section.content ? Object.keys(section.content).join(', ') : 'no content'
            });
          });
          
          console.log('\n  Section counts by type:');
          Object.entries(sectionCounts).forEach(([type, count]) => {
            console.log(`    ${type}: ${count} ${count > 1 ? '⚠️ DUPLICATE TYPE' : ''}`);
          });
          
          console.log('\n  Section details:');
          sectionDetails.forEach(detail => {
            console.log(`    [${detail.index}] Type: ${detail.type}, ID: ${detail.id}, Template: ${detail.template}`);
            if (detail.content) {
              console.log(`        Content keys: ${detail.content}`);
            }
          });
          
          // Check for duplicate IDs
          const idCounts = {};
          page.sections.forEach(section => {
            if (section.id) {
              idCounts[section.id] = (idCounts[section.id] || 0) + 1;
            }
          });
          
          const duplicateIds = Object.entries(idCounts).filter(([id, count]) => count > 1);
          if (duplicateIds.length > 0) {
            console.log('\n  ⚠️ DUPLICATE SECTION IDs FOUND:');
            duplicateIds.forEach(([id, count]) => {
              console.log(`    ID ${id} appears ${count} times`);
            });
          }
          
          // Check for consecutive duplicate types
          console.log('\n  Checking for consecutive duplicates:');
          for (let i = 1; i < page.sections.length; i++) {
            if (page.sections[i].type === page.sections[i-1].type) {
              console.log(`    ⚠️ Consecutive ${page.sections[i].type} sections at indices ${i-1} and ${i}`);
            }
          }
          
        } else {
          console.log('  No sections array found');
        }
      }
      
      // Check deployment status
      console.log(`\n\nDeployment Information for ${project.project_name}:`);
      const { data: deployments, error: deployError } = await supabase
        .from('deployment_queue')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!deployError && deployments && deployments.length > 0) {
        console.log('\nRecent deployments:');
        deployments.forEach(dep => {
          console.log(`  ${new Date(dep.created_at).toLocaleString()} - Status: ${dep.status}`);
          if (dep.live_url) {
            console.log(`  Live URL: ${dep.live_url}`);
          }
        });
      }
    }
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

// Run the check
checkDuplicateSections();