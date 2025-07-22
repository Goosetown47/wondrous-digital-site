import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function checkTemplates() {
  console.log('🔍 Checking section templates...\n');
  
  try {
    // 1. Get all section templates
    const { data: templates, error } = await supabase
      .from('section_templates')
      .select('id, section_type, template_name, html_template, status')
      .order('section_type');
    
    if (error) {
      console.error('Error fetching templates:', error);
      return;
    }
    
    console.log(`Total templates found: ${templates.length}\n`);
    
    // 2. Group by section type
    const templatesByType = {};
    templates.forEach(template => {
      if (!templatesByType[template.section_type]) {
        templatesByType[template.section_type] = [];
      }
      templatesByType[template.section_type].push(template);
    });
    
    // 3. Display templates by type
    Object.keys(templatesByType).sort().forEach(sectionType => {
      console.log(`\n${sectionType.toUpperCase()} Section Templates:`);
      console.log('=' + '='.repeat(sectionType.length + 18));
      
      templatesByType[sectionType].forEach(template => {
        const hasHtml = template.html_template && template.html_template.trim().length > 0;
        const htmlStatus = hasHtml ? '✅ Has HTML' : '❌ No HTML';
        const activeStatus = template.status === 'active' ? '🟢 Active' : '🔴 Inactive';
        
        console.log(`  - ${template.template_name} | ${htmlStatus} | ${activeStatus}`);
        
        if (hasHtml) {
          // Show first 100 chars of HTML
          const preview = template.html_template.substring(0, 100).replace(/\n/g, ' ');
          console.log(`    Preview: ${preview}...`);
        }
      });
    });
    
    // 4. Summary statistics
    const templatesWithHtml = templates.filter(t => t.html_template && t.html_template.trim().length > 0);
    const activeTemplates = templates.filter(t => t.status === 'active');
    const activeWithHtml = templates.filter(t => t.status === 'active' && t.html_template && t.html_template.trim().length > 0);
    
    console.log('\n\nSUMMARY:');
    console.log('=========');
    console.log(`Total templates: ${templates.length}`);
    console.log(`Templates with HTML: ${templatesWithHtml.length} (${Math.round(templatesWithHtml.length / templates.length * 100)}%)`);
    console.log(`Active templates: ${activeTemplates.length}`);
    console.log(`Active templates with HTML: ${activeWithHtml.length}`);
    
    // 5. Check specific hero and features templates used in PageBuilder
    console.log('\n\nCHECKING SPECIFIC TEMPLATES USED IN PAGEBUILDER:');
    console.log('================================================');
    
    const heroTemplates = templates.filter(t => t.section_type === 'hero' && t.status === 'active');
    const featuresTemplates = templates.filter(t => t.section_type === 'features' && t.status === 'active');
    
    console.log('\nHero templates (active):');
    heroTemplates.forEach(t => {
      console.log(`  - ${t.template_name}: ${t.html_template ? 'Has HTML' : 'NO HTML'}`);
    });
    
    console.log('\nFeatures templates (active):');
    featuresTemplates.forEach(t => {
      console.log(`  - ${t.template_name}: ${t.html_template ? 'Has HTML' : 'NO HTML'}`);
    });
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

checkTemplates();