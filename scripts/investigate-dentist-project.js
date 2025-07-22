import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for full access
const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function investigateDentistProject() {
  console.log('🦷 Investigating Dentist Template Project...\n');
  
  try {
    // 1. Find the dentist template project
    console.log('1. Finding dentist template project...');
    const { data: dentistProjects, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .or('subdomain.eq.dentist-1,project_name.ilike.%dentist%')
      .order('created_at', { ascending: false });
    
    if (projectError) {
      console.error('Error finding dentist project:', projectError);
      return;
    }
    
    if (!dentistProjects || dentistProjects.length === 0) {
      console.log('❌ No dentist project found');
      return;
    }
    
    const dentistProject = dentistProjects[0];
    console.log('✅ Found dentist project:', {
      id: dentistProject.id,
      name: dentistProject.project_name,
      subdomain: dentistProject.subdomain,
      deployment_status: dentistProject.deployment_status,
      netlify_site_id: dentistProject.netlify_site_id,
      global_nav_section_id: dentistProject.global_nav_section_id,
      global_footer_section_id: dentistProject.global_footer_section_id
    });
    
    // 2. Get all pages for this project
    console.log('\n2. Getting pages for dentist project...');
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .eq('project_id', dentistProject.id)
      .order('page_order', { ascending: true });
    
    if (pagesError) {
      console.error('Error getting pages:', pagesError);
    } else {
      console.log(`✅ Found ${pages?.length || 0} pages:`);
      pages?.forEach(page => {
        console.log(`  - ${page.page_name} (${page.page_slug})`, {
          id: page.id,
          is_homepage: page.is_homepage,
          order: page.page_order
        });
      });
    }
    
    // 3. Get all sections for this project's pages
    console.log('\n3. Getting sections for all pages...');
    if (pages && pages.length > 0) {
      for (const page of pages) {
        console.log(`\n  Page: ${page.page_name} (${page.page_slug})`);
        
        const { data: sections, error: sectionsError } = await supabase
          .from('page_sections')
          .select(`
            *,
            section_templates (
              id,
              template_name,
              section_type,
              template_config,
              status
            )
          `)
          .eq('page_id', page.id)
          .order('section_order', { ascending: true });
        
        if (sectionsError) {
          console.error(`    Error getting sections for page ${page.page_name}:`, sectionsError);
        } else {
          console.log(`    Found ${sections?.length || 0} sections:`);
          sections?.forEach(section => {
            console.log(`    - Section ${section.section_order}:`, {
              id: section.id,
              template: section.section_templates?.template_name,
              type: section.section_templates?.section_type,
              content_preview: section.content ? 
                JSON.stringify(section.content).substring(0, 100) + '...' : 
                'No content'
            });
          });
        }
      }
    }
    
    // 4. Check global navigation and footer sections
    console.log('\n4. Checking global navigation and footer sections...');
    
    if (dentistProject.global_nav_section_id) {
      const { data: navSection, error: navError } = await supabase
        .from('page_sections')
        .select(`
          *,
          section_templates (
            id,
            template_name,
            section_type,
            template_config
          )
        `)
        .eq('id', dentistProject.global_nav_section_id)
        .single();
      
      if (navError) {
        console.error('Error getting nav section:', navError);
      } else {
        console.log('✅ Global navigation section:', {
          id: navSection.id,
          template: navSection.section_templates?.template_name,
          content_preview: navSection.content ? 
            JSON.stringify(navSection.content).substring(0, 200) + '...' : 
            'No content'
        });
      }
    } else {
      console.log('❌ No global navigation section set');
    }
    
    if (dentistProject.global_footer_section_id) {
      const { data: footerSection, error: footerError } = await supabase
        .from('page_sections')
        .select(`
          *,
          section_templates (
            id,
            template_name,
            section_type,
            template_config
          )
        `)
        .eq('id', dentistProject.global_footer_section_id)
        .single();
      
      if (footerError) {
        console.error('Error getting footer section:', footerError);
      } else {
        console.log('✅ Global footer section:', {
          id: footerSection.id,
          template: footerSection.section_templates?.template_name,
          content_preview: footerSection.content ? 
            JSON.stringify(footerSection.content).substring(0, 200) + '...' : 
            'No content'
        });
      }
    } else {
      console.log('❌ No global footer section set');
    }
    
    // 5. Get site styles for this project
    console.log('\n5. Getting site styles...');
    const { data: siteStyles, error: stylesError } = await supabase
      .from('site_styles')
      .select('*')
      .eq('project_id', dentistProject.id)
      .single();
    
    if (stylesError) {
      console.error('Error getting site styles:', stylesError);
    } else {
      console.log('✅ Site styles found:', {
        font_primary: siteStyles.font_primary,
        font_secondary: siteStyles.font_secondary,
        color_primary: siteStyles.color_primary,
        color_secondary: siteStyles.color_secondary,
        color_accent: siteStyles.color_accent
      });
    }
    
    // 6. Sample some actual section content
    console.log('\n6. Sampling actual section content...');
    const { data: sampleSections, error: sampleError } = await supabase
      .from('page_sections')
      .select('*')
      .eq('project_id', dentistProject.id)
      .limit(3);
    
    if (sampleError) {
      console.error('Error getting sample sections:', sampleError);
    } else {
      console.log('Sample section content:');
      sampleSections?.forEach((section, index) => {
        console.log(`\n  Section ${index + 1} content:`);
        console.log(JSON.stringify(section.content, null, 2));
      });
    }
    
    // 7. Check deployment queue status
    console.log('\n7. Checking deployment queue for this project...');
    const { data: deploymentQueue, error: queueError } = await supabase
      .from('deployment_queue')
      .select('*')
      .eq('project_id', dentistProject.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (queueError) {
      console.error('Error checking deployment queue:', queueError);
    } else {
      console.log(`✅ Found ${deploymentQueue?.length || 0} deployment records:`);
      deploymentQueue?.forEach(deployment => {
        console.log(`  - ${deployment.created_at}: ${deployment.status}`, {
          id: deployment.id,
          netlify_deploy_id: deployment.netlify_deploy_id,
          error_message: deployment.error_message,
          live_url: deployment.live_url
        });
      });
    }
    
  } catch (error) {
    console.error('Investigation script error:', error);
  }
}

investigateDentistProject();