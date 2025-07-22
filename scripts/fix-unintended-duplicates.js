#!/usr/bin/env node

/**
 * Fix unintended duplicate sections that were created by our script
 * This preserves user's ability to have multiple sections of the same type
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function fixUnintendedDuplicates() {
  console.log('🔍 Examining sections for unintended duplicates...\n');
  
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
  
  // Get the home page
  const { data: page, error: pageError } = await supabase
    .from('pages')
    .select('*')
    .eq('project_id', project.id)
    .eq('is_homepage', true)
    .single();
  
  if (pageError || !page) {
    console.error('❌ Error finding page:', pageError);
    return;
  }
  
  console.log('📄 Found page:', page.page_name);
  console.log('   Total sections:', page.sections?.length || 0);
  
  if (!page.sections || !Array.isArray(page.sections)) {
    console.log('   No sections array found');
    return;
  }
  
  // Analyze sections
  console.log('\n📊 Section Analysis:');
  page.sections.forEach((section, index) => {
    console.log(`\n   ${index + 1}. Type: ${section.type}`);
    console.log(`      ID: ${section.id || 'undefined'}`);
    console.log(`      Has template_id: ${!!section.template_id}`);
    console.log(`      Has order_index: ${section.order_index !== undefined}`);
    console.log(`      Content keys: ${Object.keys(section.content || {}).length}`);
  });
  
  // Check if we have the specific pattern we created:
  // 3 sections with IDs followed by 2 without IDs
  const hasThreeWithIds = page.sections.slice(0, 3).every(s => s.id);
  const lastTwoNoIds = page.sections.slice(3).every(s => !s.id);
  const lastTwoAreDuplicates = 
    page.sections.length === 5 &&
    page.sections[3]?.type === 'hero' &&
    page.sections[4]?.type === 'features';
  
  if (hasThreeWithIds && lastTwoNoIds && lastTwoAreDuplicates) {
    console.log('\n⚠️  Found unintended duplicates pattern!');
    console.log('   The last 2 sections appear to be duplicates created by our script.');
    console.log('   They have no IDs and match the types of earlier sections.');
    
    // Remove only the last 2 sections
    const cleanedSections = page.sections.slice(0, 3);
    
    console.log('\n🔧 Fixing by removing only the last 2 sections...');
    
    const { error: updateError } = await supabase
      .from('pages')
      .update({ 
        sections: cleanedSections,
        updated_at: new Date().toISOString()
      })
      .eq('id', page.id);
    
    if (updateError) {
      console.error('❌ Error updating page:', updateError);
    } else {
      console.log('✅ Successfully removed unintended duplicates!');
      console.log('   Sections now: ' + cleanedSections.length);
      console.log('   - ' + cleanedSections.map(s => s.type).join(', '));
    }
  } else {
    console.log('\n✅ No unintended duplicate pattern found.');
    console.log('   This page structure appears to be intentional.');
    console.log('   Users can have multiple sections of the same type if desired.');
  }
}

// Run the fix
fixUnintendedDuplicates().catch(console.error);