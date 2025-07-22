const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function investigateContentDiscrepancy() {
  console.log('🔍 Investigating Content Discrepancy for Dentist Project\n');

  try {
    // 1. Find all projects with "dentist" in the name
    console.log('1️⃣ SEARCHING FOR DENTIST PROJECTS:');
    console.log('─'.repeat(50));
    
    const { data: dentistProjects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .or('name.ilike.%dentist%,subdomain.ilike.%dentist%');

    if (projectsError) throw projectsError;

    console.log(`Found ${dentistProjects?.length || 0} dentist-related projects:\n`);
    
    dentistProjects?.forEach(project => {
      console.log(`Project: ${project.name}`);
      console.log(`  - ID: ${project.id}`);
      console.log(`  - Subdomain: ${project.subdomain}`);
      console.log(`  - Theme: ${project.theme_id}`);
      console.log(`  - User: ${project.user_id}`);
      console.log(`  - Created: ${new Date(project.created_at).toLocaleString()}`);
      console.log(`  - Updated: ${new Date(project.updated_at).toLocaleString()}`);
      console.log('');
    });

    // 2. Check pages for each project
    console.log('\n2️⃣ CHECKING PAGES FOR EACH PROJECT:');
    console.log('─'.repeat(50));

    for (const project of dentistProjects || []) {
      console.log(`\nProject: ${project.name} (${project.id})`);
      
      const { data: pages, error: pagesError } = await supabase
        .from('pages')
        .select('*')
        .eq('project_id', project.id);

      if (pagesError) {
        console.log(`  ❌ Error fetching pages: ${pagesError.message}`);
        continue;
      }

      console.log(`  Found ${pages?.length || 0} pages:`);
      
      for (const page of pages || []) {
        console.log(`\n  Page: ${page.name} (${page.id})`);
        console.log(`    - Path: ${page.path}`);
        console.log(`    - Is Homepage: ${page.is_homepage}`);
        console.log(`    - Order: ${page.order}`);
        console.log(`    - Created: ${new Date(page.created_at).toLocaleString()}`);
        console.log(`    - Updated: ${new Date(page.updated_at).toLocaleString()}`);
        
        // Check sections array
        if (page.sections) {
          console.log(`    - Sections array: ${page.sections.length} sections`);
          page.sections.forEach((section, idx) => {
            console.log(`      [${idx}] Type: ${section.type}, Template: ${section.template_id}`);
            // Check for "Bright Smiles" content
            const sectionStr = JSON.stringify(section);
            if (sectionStr.includes('Bright Smiles')) {
              console.log(`      ⚠️  CONTAINS "Bright Smiles" CONTENT!`);
            }
          });
        }
      }
    }

    // 3. Check page_sections table
    console.log('\n\n3️⃣ CHECKING PAGE_SECTIONS TABLE:');
    console.log('─'.repeat(50));

    for (const project of dentistProjects || []) {
      console.log(`\nProject: ${project.name} (${project.id})`);
      
      const { data: pageSections, error: sectionsError } = await supabase
        .from('page_sections')
        .select(`
          *,
          pages!inner(name, path, project_id),
          section_templates(name, type)
        `)
        .eq('pages.project_id', project.id)
        .order('order_index');

      if (sectionsError) {
        console.log(`  ❌ Error: ${sectionsError.message}`);
        continue;
      }

      console.log(`  Found ${pageSections?.length || 0} page sections:`);
      
      pageSections?.forEach(section => {
        console.log(`\n  Section: ${section.section_templates?.name || 'Unknown'}`);
        console.log(`    - Page: ${section.pages?.name} (${section.pages?.path})`);
        console.log(`    - Order: ${section.order_index}`);
        console.log(`    - Template: ${section.template_id}`);
        
        // Check content for "Bright Smiles"
        const contentStr = JSON.stringify(section.content);
        if (contentStr.includes('Bright Smiles')) {
          console.log(`    ⚠️  CONTAINS "Bright Smiles" CONTENT!`);
          console.log(`    Content preview: ${contentStr.substring(0, 200)}...`);
        }
      });
    }

    // 4. Check deployment queue
    console.log('\n\n4️⃣ CHECKING DEPLOYMENT QUEUE:');
    console.log('─'.repeat(50));

    for (const project of dentistProjects || []) {
      const { data: deployments, error: deployError } = await supabase
        .from('deployment_queue')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (deployError) {
        console.log(`  ❌ Error: ${deployError.message}`);
        continue;
      }

      console.log(`\nProject: ${project.name}`);
      console.log(`  Recent deployments: ${deployments?.length || 0}`);
      
      deployments?.forEach((deployment, idx) => {
        console.log(`\n  [${idx + 1}] Deployment ${deployment.id}`);
        console.log(`    - Status: ${deployment.status}`);
        console.log(`    - Created: ${new Date(deployment.created_at).toLocaleString()}`);
        console.log(`    - Domain: ${deployment.domain}`);
        console.log(`    - Live URL: ${deployment.live_url}`);
        
        if (deployment.payload) {
          const payloadStr = JSON.stringify(deployment.payload);
          console.log(`    - Payload size: ${payloadStr.length} chars`);
          
          // Check for "Bright Smiles" in payload
          if (payloadStr.includes('Bright Smiles')) {
            console.log(`    ⚠️  PAYLOAD CONTAINS "Bright Smiles" CONTENT!`);
            
            // Try to find specific occurrences
            const payload = deployment.payload;
            if (payload.pages) {
              payload.pages.forEach(page => {
                if (page.sections) {
                  page.sections.forEach((section, sIdx) => {
                    const sectionStr = JSON.stringify(section);
                    if (sectionStr.includes('Bright Smiles')) {
                      console.log(`      - Found in page "${page.name}", section ${sIdx} (${section.type})`);
                    }
                  });
                }
              });
            }
          }
        }
        
        if (deployment.error) {
          console.log(`    - Error: ${deployment.error}`);
        }
      });
    }

    // 5. Search for "Bright Smiles" across all relevant tables
    console.log('\n\n5️⃣ SEARCHING FOR "BRIGHT SMILES" CONTENT:');
    console.log('─'.repeat(50));

    // Search in pages.sections
    console.log('\nSearching in pages.sections column:');
    const { data: pagesWithBrightSmiles } = await supabase
      .from('pages')
      .select('id, name, path, project_id, sections')
      .not('sections', 'is', null);

    let brightSmilesCount = 0;
    pagesWithBrightSmiles?.forEach(page => {
      const sectionsStr = JSON.stringify(page.sections);
      if (sectionsStr.includes('Bright Smiles')) {
        brightSmilesCount++;
        console.log(`\n  ⚠️ Found in page: ${page.name} (${page.id})`);
        console.log(`     Project ID: ${page.project_id}`);
        
        // Find which section contains it
        page.sections.forEach((section, idx) => {
          const sectionStr = JSON.stringify(section);
          if (sectionStr.includes('Bright Smiles')) {
            console.log(`     - Section ${idx}: ${section.type}`);
            if (section.content?.title) {
              console.log(`       Title: ${section.content.title}`);
            }
            if (section.content?.subtitle) {
              console.log(`       Subtitle: ${section.content.subtitle}`);
            }
          }
        });
      }
    });
    
    console.log(`\nTotal pages with "Bright Smiles": ${brightSmilesCount}`);

    // Search in section_templates
    console.log('\nSearching in section_templates:');
    const { data: templatesWithBrightSmiles } = await supabase
      .from('section_templates')
      .select('id, name, type, default_content')
      .or('name.ilike.%bright%,default_content::text.ilike.%bright%');

    console.log(`Found ${templatesWithBrightSmiles?.length || 0} templates with "Bright" in name or content`);
    templatesWithBrightSmiles?.forEach(template => {
      console.log(`  - ${template.name} (${template.type})`);
    });

    // 6. Check site styles for any naming
    console.log('\n\n6️⃣ CHECKING SITE STYLES:');
    console.log('─'.repeat(50));

    for (const project of dentistProjects || []) {
      const { data: siteStyles } = await supabase
        .from('site_styles')
        .select('*')
        .eq('project_id', project.id)
        .single();

      if (siteStyles) {
        console.log(`\nProject: ${project.name}`);
        console.log(`  Site Name: ${siteStyles.site_name || 'Not set'}`);
        console.log(`  Logo Text: ${siteStyles.logo_text || 'Not set'}`);
        if (siteStyles.site_name?.includes('Bright') || siteStyles.logo_text?.includes('Bright')) {
          console.log(`  ⚠️  CONTAINS "Bright" IN SITE STYLES!`);
        }
      }
    }

  } catch (error) {
    console.error('\n❌ Investigation failed:', error);
  }
}

// Run the investigation
investigateContentDiscrepancy().then(() => {
  console.log('\n✅ Investigation complete');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});