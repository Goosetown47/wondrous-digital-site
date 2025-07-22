#!/usr/bin/env node

/**
 * Test if sections now have complete default content when created
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function testSectionContent() {
  console.log('🧪 Testing section template content...\n');
  
  // Fetch templates to see what content they have
  const { data: templates, error } = await supabase
    .from('section_templates')
    .select('section_type, template_name, customizable_fields')
    .eq('status', 'active')
    .order('section_type');
    
  if (error) {
    console.error('Error fetching templates:', error);
    return;
  }
  
  console.log(`Found ${templates?.length || 0} active templates:\n`);
  
  templates?.forEach(template => {
    console.log(`📋 ${template.section_type} - ${template.template_name}`);
    
    const fields = template.customizable_fields;
    if (!fields || Object.keys(fields).length === 0) {
      console.log('   ❌ No customizable_fields\n');
    } else {
      console.log('   ✅ Has customizable_fields:');
      
      // Show a summary of the content
      const fieldKeys = Object.keys(fields);
      console.log(`   - Total fields: ${fieldKeys.length}`);
      console.log(`   - Field names: ${fieldKeys.slice(0, 5).join(', ')}${fieldKeys.length > 5 ? '...' : ''}`);
      
      // Check for key content
      if (fields.mainHeading || fields.headline) {
        const heading = fields.mainHeading || fields.headline;
        console.log(`   - Main heading: "${heading.text?.substring(0, 50)}..."`);
      }
      
      if (fields.primaryButton) {
        console.log(`   - Primary button: "${fields.primaryButton.text}" (${fields.primaryButton.variant})`);
      }
      
      console.log('');
    }
  });
  
  // Test with dentist project
  console.log('\n📊 Checking dentist project pages:\n');
  
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('subdomain', 'dentist-1')
    .single();
    
  if (project) {
    const { data: pages } = await supabase
      .from('pages')
      .select('page_name, sections')
      .eq('project_id', project.id)
      .order('order_index');
      
    pages?.forEach(page => {
      console.log(`📄 ${page.page_name}:`);
      
      if (page.sections && page.sections.length > 0) {
        page.sections.forEach((section, idx) => {
          console.log(`   ${idx + 1}. ${section.type}:`);
          
          const content = section.content;
          const contentKeys = Object.keys(content || {});
          
          if (contentKeys.length === 0) {
            console.log('      ❌ Empty content');
          } else {
            console.log(`      ✅ Has ${contentKeys.length} content fields`);
            
            // Check if it has the expected content structure
            if (section.type === 'features') {
              const hasFullContent = content.mainHeading && 
                                   content.tagline && 
                                   content.feature1Heading && 
                                   content.feature1Description;
              console.log(`      ${hasFullContent ? '✅' : '⚠️'} ${hasFullContent ? 'Full' : 'Partial'} features content`);
            }
          }
        });
      } else {
        console.log('   No sections');
      }
      console.log('');
    });
  }
  
  console.log('💡 Next step: Test dragging a new section in the page builder to see if it gets full default content.\n');
}

testSectionContent().catch(console.error);