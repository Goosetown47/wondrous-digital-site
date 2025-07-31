import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function checkDeployedContent() {
  console.log('🔍 Checking what content was deployed...\n');
  
  // Get the dentist project
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('subdomain', 'dentist-1')
    .single();
  
  if (error || !project) {
    console.error('Error fetching project:', error);
    return;
  }
  
  console.log('Project:', project.project_name);
  console.log('Project Type:', project.project_type);
  console.log('Global Nav Section ID:', project.global_nav_section_id);
  console.log('Global Footer Section ID:', project.global_footer_section_id);
  
  // Check if it's a template project without pages
  if (project.project_type === 'template') {
    console.log('\n⚠️  This is a template project');
    console.log('Checking for project-level sections...');
    
    const { data: projectSections } = await supabase
      .from('page_sections')
      .select('*')
      .eq('project_id', project.id)
      .order('order_index');
      
    console.log(`\nFound ${projectSections?.length || 0} project-level sections`);
    if (projectSections && projectSections.length > 0) {
      projectSections.forEach((section, idx) => {
        console.log(`  ${idx + 1}. ${section.section_type} (order: ${section.order_index})`);
        if (section.content) {
          console.log(`     Has content: ${JSON.stringify(section.content).substring(0, 100)}...`);
        }
      });
    }
  }
  
  // Check pages and their embedded sections
  const { data: pages } = await supabase
    .from('pages')
    .select('*')
    .eq('project_id', project.id)
    .eq('status', 'published')
    .order('order_index');
    
  console.log(`\n\nPublished Pages: ${pages?.length || 0}`);
  
  if (pages && pages.length > 0) {
    for (const page of pages) {
      console.log(`\n📄 ${page.page_name} (${page.slug}):`);
      console.log(`   Homepage: ${page.is_homepage}`);
      console.log(`   Has embedded sections: ${page.sections && page.sections.length > 0}`);
      
      if (page.sections && page.sections.length > 0) {
        console.log(`   Embedded sections (${page.sections.length}):`);
        page.sections.forEach((section, idx) => {
          console.log(`     ${idx + 1}. ${section.type}`);
          
          // Check content format
          if (section.content) {
            const content = section.content;
            if (content.heroHeading || content.primaryButton || content.feature1Heading) {
              console.log('        ✅ Page builder format detected');
              if (content.heroHeading) console.log(`        - Hero heading: "${content.heroHeading.text}"`);
              if (content.primaryButton) console.log(`        - Primary button: "${content.primaryButton.text}"`);
            } else if (content.heading || content.buttonText) {
              console.log('        ⚠️  Old format detected');
            }
          }
        });
      }
      
      // Also check page_sections table
      const { data: pageSections } = await supabase
        .from('page_sections')
        .select('*')
        .eq('page_id', page.id)
        .order('order_index');
        
      if (pageSections && pageSections.length > 0) {
        console.log(`   Page_sections table (${pageSections.length}):`);
        pageSections.forEach((section, idx) => {
          console.log(`     ${idx + 1}. ${section.section_type}`);
        });
      }
    }
  }
  
  // Check the live URL
  console.log('\n\n🌐 Live URL: https://dentist-1.wondrousdigital.com');
  console.log('Check this URL to see what was actually deployed.');
  
  // Fetch the deployed content
  console.log('\nFetching deployed content...');
  try {
    const response = await fetch('https://dentist-1.wondrousdigital.com');
    const html = await response.text();
    
    // Check for key indicators
    const hasContent = html.includes('section-hero') || html.includes('section-features');
    const hasPinkButton = html.includes('rgb(236, 72, 153)') || html.includes('#ec4899');
    const hasLoremIpsum = html.includes('Lorem ipsum');
    
    console.log('\nDeployed content analysis:');
    console.log(`  Has section content: ${hasContent}`);
    console.log(`  Has pink styling: ${hasPinkButton}`);
    console.log(`  Has Lorem ipsum: ${hasLoremIpsum}`);
    console.log(`  HTML length: ${html.length} characters`);
    
    // Extract a sample of the HTML
    const bodyStart = html.indexOf('<body');
    const bodyEnd = html.indexOf('</body>') + 7;
    if (bodyStart !== -1 && bodyEnd !== -1) {
      const bodyContent = html.substring(bodyStart, Math.min(bodyStart + 500, bodyEnd));
      console.log('\n  First 500 chars of body:');
      console.log(bodyContent);
    }
    
  } catch (fetchError) {
    console.error('Error fetching deployed site:', fetchError.message);
  }
}

checkDeployedContent();