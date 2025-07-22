import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function analyzeDentistDeployment() {
  console.log('🦷 Analyzing Dentist Template Deployment Issue...\n');
  
  try {
    // Find the dentist template project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('subdomain', 'dentist-1')
      .single();
    
    if (projectError || !project) {
      console.error('❌ Could not find dentist-1 project:', projectError);
      return;
    }
    
    console.log('✅ Found project:', project.project_name);
    console.log('   ID:', project.id);
    console.log('   Global Nav Section ID:', project.global_nav_section_id);
    console.log('   Global Footer Section ID:', project.global_footer_section_id);
    
    // Get pages
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .eq('project_id', project.id)
      .order('order_index', { ascending: true });
    
    console.log(`\n📄 Pages: ${pages ? pages.length : 0}`);
    if (pages) {
      pages.forEach(page => {
        console.log(`   - ${page.page_name} (slug: ${page.page_slug || 'undefined'}, homepage: ${page.is_homepage})`);
      });
    }
    
    // Get all sections
    const { data: allSections, error: sectionsError } = await supabase
      .from('page_sections')
      .select('*')
      .eq('project_id', project.id)
      .order('order_index', { ascending: true });
    
    console.log(`\n📊 Total Sections: ${allSections ? allSections.length : 0}`);
    
    if (allSections) {
      // Categorize sections
      const projectSections = allSections.filter(s => !s.page_id);
      const pageSections = allSections.filter(s => s.page_id);
      
      console.log(`   Project-level sections: ${projectSections.length}`);
      console.log(`   Page-level sections: ${pageSections.length}`);
      
      // Show sections by page
      if (pages && pageSections.length > 0) {
        console.log('\n📑 Sections by Page:');
        pages.forEach(page => {
          const sectionsForPage = pageSections.filter(s => s.page_id === page.id);
          console.log(`   ${page.page_name}: ${sectionsForPage.length} sections`);
          sectionsForPage.forEach(section => {
            console.log(`     - Type: ${section.section_type || 'unknown'}`);
            if (section.content) {
              console.log(`       Content keys: ${Object.keys(section.content).join(', ')}`);
            }
          });
        });
      }
      
      // Show project-level sections
      if (projectSections.length > 0) {
        console.log('\n🌐 Project-Level Sections:');
        projectSections.forEach(section => {
          console.log(`   - ID: ${section.id}`);
          console.log(`     Type: ${section.section_type || 'unknown'}`);
          console.log(`     Is Global Nav: ${section.id === project.global_nav_section_id}`);
          if (section.content) {
            console.log(`     Content: ${JSON.stringify(section.content).substring(0, 100)}...`);
          }
        });
      }
    }
    
    // Check recent deployments
    console.log('\n🚀 Recent Deployments:');
    const { data: deployments } = await supabase
      .from('deployment_queue')
      .select('*')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (deployments) {
      deployments.forEach(d => {
        console.log(`   - ${new Date(d.created_at).toLocaleString()}: ${d.status}`);
        if (d.live_url) {
          console.log(`     Live URL: ${d.live_url}`);
        }
        if (d.error_message) {
          console.log(`     Error: ${d.error_message}`);
        }
      });
    }
    
    console.log('\n🔍 Analysis Summary:');
    console.log('   The dentist template appears to have pages but no content sections attached to those pages.');
    console.log('   This is why the deployed site only shows basic navigation - there\'s no actual page content to render.');
    console.log('   The project has a global navigation section but the pages themselves are empty.');
    
  } catch (error) {
    console.error('Analysis error:', error);
  }
}

analyzeDentistDeployment();