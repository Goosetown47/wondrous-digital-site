import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for full access
const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function investigateDentistProject() {
  console.log('🦷 Investigating Dentist Template Project - V2...\n');
  
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
    
    // 2. Get all pages for this project (fixed column name)
    console.log('\n2. Getting pages for dentist project...');
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .eq('project_id', dentistProject.id)
      .order('order_index', { ascending: true });
    
    if (pagesError) {
      console.error('Error getting pages:', pagesError);
    } else {
      console.log(`✅ Found ${pages ? pages.length : 0} pages:`);
      if (pages) pages.forEach(page => {
        console.log(`  - ${page.page_name} (${page.page_slug})`, {
          id: page.id,
          is_homepage: page.is_homepage,
          order: page.order_index
        });
      });
    }
    
    // 3. Get all sections for this project (without join first)
    console.log('\n3. Getting sections for project...');
    const { data: sections, error: sectionsError } = await supabase
      .from('page_sections')
      .select('*')
      .eq('project_id', dentistProject.id)
      .order('section_order', { ascending: true });
    
    if (sectionsError) {
      console.error('Error getting sections:', sectionsError);
    } else {
      console.log(`✅ Found ${sections?.length || 0} total sections for project`);
      
      // Group sections by page
      if (pages && sections) {
        for (const page of pages) {
          const pageSections = sections.filter(s => s.page_id === page.id);
          console.log(`\n  Page: ${page.page_name} has ${pageSections.length} sections:`);
          
          for (const section of pageSections) {
            console.log(`    - Section ${section.section_order}:`, {
              id: section.id,
              template_id: section.template_id,
              content_preview: section.content ? 
                JSON.stringify(section.content).substring(0, 100) + '...' : 
                'No content'
            });
          }
        }
      }
    }
    
    // 4. Get section templates separately
    console.log('\n4. Getting section templates...');
    const { data: templates, error: templatesError } = await supabase
      .from('section_templates')
      .select('*')
      .in('id', sections?.map(s => s.template_id).filter(Boolean) || []);
    
    if (templatesError) {
      console.error('Error getting templates:', templatesError);
    } else {
      console.log(`✅ Found ${templates?.length || 0} templates used`);
      templates?.forEach(template => {
        console.log(`  - ${template.template_name} (${template.section_type})`);
      });
    }
    
    // 5. Check global navigation section specifically
    console.log('\n5. Checking global navigation section in detail...');
    if (dentistProject.global_nav_section_id) {
      const { data: navSection, error: navError } = await supabase
        .from('page_sections')
        .select('*')
        .eq('id', dentistProject.global_nav_section_id)
        .single();
      
      if (navError) {
        console.error('Error getting nav section:', navError);
      } else {
        console.log('✅ Global navigation section full content:');
        console.log(JSON.stringify(navSection, null, 2));
        
        // Get its template if it has one
        if (navSection.template_id) {
          const { data: navTemplate, error: navTemplateError } = await supabase
            .from('section_templates')
            .select('*')
            .eq('id', navSection.template_id)
            .single();
          
          if (navTemplateError) {
            console.error('Error getting nav template:', navTemplateError);
          } else {
            console.log('\n  Navigation template:');
            console.log(JSON.stringify(navTemplate, null, 2));
          }
        }
      }
    }
    
    // 6. Check site styles
    console.log('\n6. Getting site styles...');
    const { data: siteStyles, error: stylesError } = await supabase
      .from('site_styles')
      .select('*')
      .eq('project_id', dentistProject.id)
      .single();
    
    if (stylesError) {
      console.error('Error getting site styles:', stylesError);
    } else {
      console.log('✅ Site styles found:');
      console.log(JSON.stringify(siteStyles, null, 2));
    }
    
    // 7. Check if there are any sections without page_id (project-level sections)
    console.log('\n7. Checking for project-level sections...');
    const { data: projectSections, error: projectSectionsError } = await supabase
      .from('page_sections')
      .select('*')
      .eq('project_id', dentistProject.id)
      .is('page_id', null);
    
    if (projectSectionsError) {
      console.error('Error getting project sections:', projectSectionsError);
    } else {
      console.log(`✅ Found ${projectSections?.length || 0} project-level sections (no page_id)`);
      projectSections?.forEach(section => {
        console.log(`  - Section:`, {
          id: section.id,
          content: section.content
        });
      });
    }
    
    // 8. Sample a few complete sections with content
    console.log('\n8. Getting sample sections with full content...');
    const { data: sampleSections, error: sampleError } = await supabase
      .from('page_sections')
      .select('*')
      .eq('project_id', dentistProject.id)
      .not('content', 'is', null)
      .limit(5);
    
    if (sampleError) {
      console.error('Error getting sample sections:', sampleError);
    } else {
      console.log(`✅ Sample sections with content:`);
      sampleSections?.forEach((section, index) => {
        console.log(`\n  Section ${index + 1} (id: ${section.id}):`);
        console.log(`  Page ID: ${section.page_id || 'PROJECT-LEVEL'}`);
        console.log(`  Template ID: ${section.template_id}`);
        console.log(`  Content:`);
        console.log(JSON.stringify(section.content, null, 2));
      });
    }
    
  } catch (error) {
    console.error('Investigation script error:', error);
  }
}

investigateDentistProject();