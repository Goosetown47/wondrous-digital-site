import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for full access
const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function cleanupPageSections() {
  try {
    console.log('🔍 Checking page_sections for dentist project...\n');

    // First, find the dentist project
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .or('subdomain.eq.dentist-template,subdomain.eq.dentist,subdomain.eq.dentist-1,id.eq.923eb256-26eb-4cf3-8e64-ddd1297863c0');

    if (projectError) {
      console.error('Error fetching projects:', projectError);
      return;
    }

    if (!projects || projects.length === 0) {
      console.log('No dentist project found');
      return;
    }

    const dentistProject = projects[0];
    console.log(`Found project: ${dentistProject.subdomain || 'Unknown'} (ID: ${dentistProject.id})\n`);

    // Get all page_sections for this project
    const { data: sections, error: sectionsError } = await supabase
      .from('page_sections')
      .select('*')
      .eq('project_id', dentistProject.id)
      .order('page_id', { ascending: true })
      .order('order_index', { ascending: true });

    if (sectionsError) {
      console.error('Error fetching sections:', sectionsError);
      return;
    }

    console.log(`Found ${sections.length} total sections\n`);

    // Identify test content
    const testContentPatterns = [
      'Bright Smiles Dental',
      'Test content',
      'Lorem ipsum',
      'placeholder'
    ];

    const sectionsToDelete = [];
    const sectionsToKeep = [];

    for (const section of sections) {
      const contentString = JSON.stringify(section.content).toLowerCase();
      let isTestContent = false;

      // Check if this is test content
      for (const pattern of testContentPatterns) {
        if (contentString.includes(pattern.toLowerCase())) {
          isTestContent = true;
          break;
        }
      }

      // Also check if it's likely legitimate global content
      const isGlobalSection = section.is_global || 
        section.section_type === 'navigation' || 
        section.section_type === 'navigation-desktop' ||
        section.section_type === 'footer' ||
        (section.page_id === null && (section.section_type === 'navigation' || section.section_type === 'navigation-desktop' || section.section_type === 'footer'));

      if (isTestContent && !isGlobalSection) {
        sectionsToDelete.push(section);
      } else {
        sectionsToKeep.push(section);
      }
    }

    // Display what we found
    console.log('📋 Summary:');
    console.log(`- Total sections: ${sections.length}`);
    console.log(`- Sections to keep: ${sectionsToKeep.length}`);
    console.log(`- Sections to delete: ${sectionsToDelete.length}\n`);

    if (sectionsToDelete.length > 0) {
      console.log('🗑️  Sections marked for deletion:');
      for (const section of sectionsToDelete) {
        const preview = section.content?.title || 
                      section.content?.heading || 
                      section.content?.text?.substring(0, 50) || 
                      'No preview available';
        console.log(`  - ${section.section_type} (ID: ${section.id}): "${preview}..."`);
      }
      console.log('');

      // Ask for confirmation
      console.log('⚠️  This will permanently delete these sections.');
      console.log('Proceeding with deletion...\n');

      // Delete the test content
      const sectionIds = sectionsToDelete.map(s => s.id);
      const { error: deleteError } = await supabase
        .from('page_sections')
        .delete()
        .in('id', sectionIds);

      if (deleteError) {
        console.error('Error deleting sections:', deleteError);
        return;
      }

      console.log(`✅ Successfully deleted ${sectionsToDelete.length} test sections\n`);
    } else {
      console.log('✅ No test content found to delete\n');
    }

    // Show what's remaining
    console.log('📌 Remaining sections:');
    for (const section of sectionsToKeep) {
      const preview = section.content?.title || 
                    section.content?.heading || 
                    section.content?.text?.substring(0, 50) || 
                    'No preview available';
      const globalTag = section.is_global ? ' [GLOBAL]' : '';
      console.log(`  - ${section.section_type}${globalTag}: "${preview}..."`);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the cleanup
cleanupPageSections();