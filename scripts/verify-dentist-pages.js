import { createClient } from '@supabase/supabase-js';

// Use service role key for full access
const supabaseUrl = 'https://bpdhbxvsguklkbusqtke.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDentistPages() {
  console.log('=== DENTIST PROJECT PAGES VERIFICATION ===\n');

  try {
    // 1. Find the dentist project
    console.log('1. Finding dentist project...');
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .ilike('project_name', '%dentist%');

    if (projectError) {
      console.error('Error finding project:', projectError);
      return;
    }

    if (!projects || projects.length === 0) {
      console.log('No dentist project found');
      return;
    }

    const dentistProject = projects[0];
    console.log(`Found project: ${dentistProject.project_name} (ID: ${dentistProject.id})`);
    console.log(`Subdomain: ${dentistProject.subdomain}`);
    console.log(`Domain: ${dentistProject.domain || 'None'}`);
    console.log(`Deployment status: ${dentistProject.deployment_status}`);
    console.log(`Netlify site ID: ${dentistProject.netlify_site_id || 'None'}`);

    // 2. List all pages for the project
    console.log('\n2. Fetching pages for the project...');
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .eq('project_id', dentistProject.id)
      .order('created_at', { ascending: true });

    if (pagesError) {
      console.error('Error fetching pages:', pagesError);
      return;
    }

    if (!pages || pages.length === 0) {
      console.log('No pages found for this project');
      return;
    }

    console.log(`Found ${pages.length} pages:\n`);

    // 3. Display each page with its sections
    for (const page of pages) {
      console.log(`\n=== PAGE: ${page.page_name} ===`);
      console.log(`ID: ${page.id}`);
      console.log(`Slug: ${page.slug}`);
      console.log(`Is Homepage: ${page.is_homepage}`);
      console.log(`Order: ${page.order_index}`);
      console.log(`Created: ${new Date(page.created_at).toLocaleString()}`);
      console.log(`Updated: ${new Date(page.updated_at).toLocaleString()}`);

      // Check sections array
      console.log('\nSections Array:');
      if (page.sections === null) {
        console.log('  ⚠️  Sections is NULL');
      } else if (!Array.isArray(page.sections)) {
        console.log('  ⚠️  Sections is not an array:', typeof page.sections);
        console.log('  Value:', JSON.stringify(page.sections, null, 2));
      } else if (page.sections.length === 0) {
        console.log('  ⚠️  Sections array is empty []');
      } else {
        console.log(`  ✓ Found ${page.sections.length} sections`);
        
        // Display each section
        page.sections.forEach((section, index) => {
          console.log(`\n  Section ${index + 1}:`);
          console.log(`    ID: ${section.id}`);
          console.log(`    Type: ${section.type}`);
          console.log(`    Template ID: ${section.template_id || 'None'}`);
          console.log(`    Order: ${section.order_index}`);
          
          // Show a preview of the content
          if (section.content) {
            console.log('    Content fields:');
            Object.keys(section.content).forEach(key => {
              const value = section.content[key];
              if (typeof value === 'string' && value.length > 100) {
                console.log(`      - ${key}: "${value.substring(0, 100)}..."`);
              } else if (typeof value === 'object') {
                console.log(`      - ${key}: [${typeof value}] ${JSON.stringify(value).substring(0, 100)}...`);
              } else {
                console.log(`      - ${key}: ${JSON.stringify(value)}`);
              }
            });
          } else {
            console.log('    Content: None');
          }
        });
      }
    }

    // 4. Check section_templates to verify they exist
    console.log('\n\n4. Verifying section templates...');
    const templateIds = new Set();
    pages.forEach(page => {
      if (Array.isArray(page.sections)) {
        page.sections.forEach(section => {
          if (section.template_id) {
            templateIds.add(section.template_id);
          }
        });
      }
    });

    if (templateIds.size > 0) {
      const { data: templates, error: templateError } = await supabase
        .from('section_templates')
        .select('id, name, type, status')
        .in('id', Array.from(templateIds));

      if (templateError) {
        console.error('Error fetching templates:', templateError);
      } else {
        console.log(`\nFound ${templates.length} templates used by sections:`);
        templates.forEach(template => {
          console.log(`  - ${template.name} (${template.type}) - Status: ${template.status}`);
        });
      }
    } else {
      console.log('No templates referenced in sections');
    }

    // 5. Summary
    console.log('\n\n=== SUMMARY ===');
    console.log(`Project: ${dentistProject.project_name}`);
    console.log(`Total pages: ${pages.length}`);
    
    let totalSections = 0;
    let pagesWithSections = 0;
    let pagesWithoutSections = 0;
    
    pages.forEach(page => {
      if (Array.isArray(page.sections) && page.sections.length > 0) {
        totalSections += page.sections.length;
        pagesWithSections++;
      } else {
        pagesWithoutSections++;
      }
    });

    console.log(`Pages with sections: ${pagesWithSections}`);
    console.log(`Pages without sections: ${pagesWithoutSections}`);
    console.log(`Total sections across all pages: ${totalSections}`);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the verification
verifyDentistPages().then(() => {
  console.log('\n✓ Verification complete');
  process.exit(0);
}).catch(error => {
  console.error('Failed to run verification:', error);
  process.exit(1);
});