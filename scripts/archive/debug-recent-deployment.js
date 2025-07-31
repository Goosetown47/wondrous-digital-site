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
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugRecentDeployment() {
  console.log('🔍 Debugging most recent dentist project deployment...\n');

  try {
    // Step 1: Find the dentist project
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (projectError) {
      console.error('Error fetching projects:', projectError);
      return;
    }

    if (!projects || projects.length === 0) {
      console.log('❌ No projects found');
      return;
    }

    console.log(`Found ${projects.length} projects:`);
    projects.forEach(p => {
      console.log(`  - ${p.project_name} (ID: ${p.id})`);
    });
    console.log('');

    // Find the dentist project
    const dentistProject = projects.find(p => 
      p.project_name && p.project_name.toLowerCase().includes('dentist')
    );
    
    if (!dentistProject) {
      console.log('❌ No dentist project found');
      return;
    }
    console.log('📋 Dentist Project Details:');
    console.log('  - ID:', dentistProject.id);
    console.log('  - Name:', dentistProject.project_name);
    console.log('  - Subdomain:', dentistProject.subdomain);
    console.log('  - Deploy Status:', dentistProject.deployment_status);
    console.log('  - Deploy URL:', dentistProject.deployment_url);
    console.log('  - Site ID:', dentistProject.netlify_site_id);
    console.log('');

    // Step 2: Get the most recent deployment from deployment_queue
    const { data: deployments, error: deployError } = await supabase
      .from('deployment_queue')
      .select('*')
      .eq('project_id', dentistProject.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (deployError) {
      console.error('Error fetching deployments:', deployError);
      return;
    }

    if (!deployments || deployments.length === 0) {
      console.log('❌ No deployments found in deployment_queue for this project');
      return;
    }

    const recentDeployment = deployments[0];
    console.log('🚀 Most Recent Deployment:');
    console.log('  - ID:', recentDeployment.id);
    console.log('  - Status:', recentDeployment.status);
    console.log('  - Created:', new Date(recentDeployment.created_at).toLocaleString());
    console.log('  - Updated:', new Date(recentDeployment.updated_at).toLocaleString());
    console.log('  - Attempts:', recentDeployment.attempt_count);
    console.log('  - Live URL:', recentDeployment.live_url);
    console.log('');

    // Step 3: Examine the deployment payload
    console.log('📦 Deployment Payload Analysis:');
    const payload = recentDeployment.payload;
    
    if (!payload) {
      console.log('❌ No payload found in deployment');
      return;
    }

    console.log('  - Payload Type:', typeof payload);
    console.log('  - Payload Keys:', Object.keys(payload).join(', '));
    
    if (payload.pages) {
      console.log('\n📄 Pages in Payload:', payload.pages.length);
      
      payload.pages.forEach((page, index) => {
        console.log(`\n  Page ${index + 1}: ${page.name || 'Unnamed'}`);
        console.log(`    - Path: ${page.path}`);
        console.log(`    - Status: ${page.status}`);
        console.log(`    - Is Homepage: ${page.is_homepage}`);
        console.log(`    - Page Order: ${page.page_order}`);
        
        // Check if sections are embedded
        if (page.sections) {
          console.log(`    - Sections: ${page.sections.length} sections embedded`);
          
          // List section types
          const sectionTypes = page.sections.map(s => s.type || 'unknown');
          console.log(`    - Section Types: ${sectionTypes.join(', ')}`);
          
          // Check first section for structure
          if (page.sections.length > 0) {
            const firstSection = page.sections[0];
            console.log('\n    🔍 First Section Details:');
            console.log(`      - Type: ${firstSection.type}`);
            console.log(`      - Template ID: ${firstSection.template_id}`);
            console.log(`      - Has Content: ${firstSection.content ? 'Yes' : 'No'}`);
            if (firstSection.content) {
              console.log(`      - Content Keys: ${Object.keys(firstSection.content).join(', ')}`);
            }
          }
        } else {
          console.log('    - ❌ No sections embedded in page');
        }
      });
    } else {
      console.log('❌ No pages found in payload');
    }

    // Check site styles
    if (payload.site_styles) {
      console.log('\n🎨 Site Styles in Payload: Yes');
      console.log('  - Style Keys:', Object.keys(payload.site_styles).length);
    } else {
      console.log('\n❌ No site_styles in payload');
    }

    // Check global navigation
    if (payload.global_navigation) {
      console.log('\n🧭 Global Navigation in Payload: Yes');
      console.log('  - Links:', payload.global_navigation.length);
    } else {
      console.log('\n❌ No global_navigation in payload');
    }

    // Step 4: Check for deployment errors
    if (recentDeployment.error) {
      console.log('\n❌ Deployment Error:');
      console.log(JSON.stringify(recentDeployment.error, null, 2));
    }

    // Let's see the full payload first
    console.log('\n📋 Full Payload Content:');
    console.log(JSON.stringify(recentDeployment.payload, null, 2));
    
    // Step 5: Fetch pages directly from database to compare
    console.log('\n📊 Comparing with Database Pages:');
    const { data: dbPages, error: pagesError } = await supabase
      .from('pages')
      .select(`
        *,
        page_sections (
          *,
          section:sections (
            *,
            template:section_templates (*)
          )
        )
      `)
      .eq('project_id', dentistProject.id)
      .order('page_order', { ascending: true });

    if (pagesError) {
      console.error('Error fetching pages:', pagesError);
    } else if (dbPages) {
      console.log(`  - Database has ${dbPages.length} pages`);
      dbPages.forEach((page, index) => {
        console.log(`\n  DB Page ${index + 1}: ${page.page_name}`);
        console.log(`    - Page Status: ${page.page_status}`);
        console.log(`    - Page Path: ${page.page_path}`);
        console.log(`    - Sections: ${page.page_sections ? page.page_sections.length : 0}`);
        if (page.page_sections && page.page_sections.length > 0) {
          const sectionTypes = page.page_sections.map(ps => ps.section?.type || 'unknown');
          console.log(`    - Section Types: ${sectionTypes.join(', ')}`);
        }
      });
    }

    // Step 6: Check if there's a mismatch
    if (payload.pages && dbPages) {
      console.log('\n🔄 Payload vs Database Comparison:');
      console.log(`  - Payload pages: ${payload.pages.length}`);
      console.log(`  - Database pages: ${dbPages.length}`);
      
      // Check section counts
      const payloadSectionCount = payload.pages.reduce((sum, page) => 
        sum + (page.sections ? page.sections.length : 0), 0);
      const dbSectionCount = dbPages.reduce((sum, page) => 
        sum + (page.page_sections ? page.page_sections.length : 0), 0);
      
      console.log(`  - Payload total sections: ${payloadSectionCount}`);
      console.log(`  - Database total sections: ${dbSectionCount}`);
      
      if (payloadSectionCount === 0 && dbSectionCount > 0) {
        console.log('\n⚠️  WARNING: Database has sections but payload doesn\'t!');
        console.log('This explains why the deployed site shows no content.');
      }
    }

  } catch (error) {
    console.error('Error during debug:', error);
  }
}

// Run the debug
debugRecentDeployment();