#!/usr/bin/env node

/**
 * Clean up the Bright Smiles Dental footer from page_sections table
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function cleanupFooter() {
  console.log('🧹 Cleaning up unwanted footer from page_sections...\n');
  
  // Find the dentist project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('project_name', 'Dentist Template')
    .single();
  
  if (projectError || !project) {
    console.error('❌ Error finding project:', projectError);
    return;
  }
  
  console.log('✅ Found project:', project.project_name);
  console.log('   ID:', project.id);
  
  // Find footer sections for this project
  const { data: sections, error: sectionsError } = await supabase
    .from('page_sections')
    .select('*')
    .eq('project_id', project.id)
    .eq('section_type', 'footer');
  
  if (sectionsError) {
    console.error('❌ Error fetching sections:', sectionsError);
    return;
  }
  
  console.log(`\n📋 Found ${sections?.length || 0} footer sections:`);
  
  let deletedCount = 0;
  
  for (const section of sections || []) {
    console.log(`\n   Section ID: ${section.id}`);
    console.log('   - Type:', section.section_type);
    
    // Check if it contains Bright Smiles content
    const content = section.content;
    if (content && (
      content.companyName?.includes('Bright Smiles') ||
      content.email?.includes('brightsmiles') ||
      JSON.stringify(content).includes('Bright Smiles')
    )) {
      console.log('   - Contains Bright Smiles content: YES');
      console.log('   - Company:', content.companyName);
      console.log('   - Email:', content.email);
      
      // Delete this section
      const { error: deleteError } = await supabase
        .from('page_sections')
        .delete()
        .eq('id', section.id);
      
      if (deleteError) {
        console.error('   ❌ Error deleting section:', deleteError);
      } else {
        console.log('   ✅ Deleted successfully!');
        deletedCount++;
      }
    } else {
      console.log('   ℹ️  Not Bright Smiles content, keeping');
    }
  }
  
  // Also check for any orphaned sections (no page_id)
  console.log('\n🔍 Checking for orphaned sections...');
  const { data: orphanedSections } = await supabase
    .from('page_sections')
    .select('*')
    .eq('project_id', project.id)
    .is('page_id', null);
  
  if (orphanedSections && orphanedSections.length > 0) {
    console.log(`\n⚠️  Found ${orphanedSections.length} orphaned sections (no page_id):`);
    orphanedSections.forEach(section => {
      console.log(`   - ${section.section_type}: ${section.id}`);
      if (section.content?.companyName) {
        console.log(`     Company: ${section.content.companyName}`);
      }
    });
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  console.log(`   ✅ Deleted ${deletedCount} footer sections`);
  console.log(`   📋 Total footer sections found: ${sections?.length || 0}`);
  
  if (deletedCount > 0) {
    console.log('\n💡 Unwanted footer content has been removed!');
  }
}

// Run the cleanup
cleanupFooter().catch(console.error);