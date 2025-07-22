#!/usr/bin/env node

/**
 * Update the dentist project's page status from draft to published
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function updatePageStatus() {
  console.log('📝 Updating page status for Dentist Template project...\n');
  
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
  
  // Find pages for this project
  const { data: pages, error: pagesError } = await supabase
    .from('pages')
    .select('*')
    .eq('project_id', project.id);
  
  if (pagesError) {
    console.error('❌ Error fetching pages:', pagesError);
    return;
  }
  
  console.log(`\n📄 Found ${pages?.length || 0} pages:`);
  
  let updatedCount = 0;
  
  for (const page of pages || []) {
    console.log(`\n   Page: ${page.page_name}`);
    console.log('   - Current status:', page.status);
    console.log('   - Is homepage:', page.is_homepage);
    console.log('   - Sections count:', page.sections?.length || 0);
    
    if (page.status === 'draft') {
      // Update to published
      const { error: updateError } = await supabase
        .from('pages')
        .update({ 
          status: 'published',
          updated_at: new Date().toISOString()
        })
        .eq('id', page.id);
      
      if (updateError) {
        console.error('   ❌ Error updating page:', updateError);
      } else {
        console.log('   ✅ Updated to published!');
        updatedCount++;
      }
    } else {
      console.log('   ℹ️  Already published');
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  console.log(`   ✅ Updated ${updatedCount} pages to published`);
  console.log(`   📋 Total pages: ${pages?.length || 0}`);
  
  if (updatedCount > 0) {
    console.log('\n💡 Pages are now published and ready for deployment!');
  }
}

// Run the update
updatePageStatus().catch(console.error);