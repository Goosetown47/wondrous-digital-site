#!/usr/bin/env node

/**
 * Migrate existing pages to have complete content
 * This script fills in missing content fields with defaults from sectionDefaults
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

// Import section defaults
const sectionDefaults = {
  hero: {
    headline: {
      text: "Medium length hero headline goes here",
      color: "#000000",
      lineHeight: "1.2"
    },
    description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
      color: "#6B7280",
      lineHeight: "1.6"
    },
    primaryButton: {
      text: "Button",
      href: "#",
      variant: "primary",
      icon: ""
    },
    secondaryButton: {
      text: "Button",
      href: "#",
      variant: "tertiary",
      icon: ""
    },
    heroImage: {
      src: "",
      alt: "Hero image",
      imageScaling: "fill-height",
      containerMode: "section-height",
      containerAspectRatio: "16:9",
      containerSize: "large"
    },
    backgroundColor: "#FFFFFF"
  },
  features: {
    tagline: {
      text: "Tagline",
      color: "#000000",
      lineHeight: "1.5"
    },
    mainHeading: {
      text: "Medium length section heading goes here",
      color: "#000000",
      lineHeight: "1.2"
    },
    description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
      color: "#6B7280",
      lineHeight: "1.6"
    },
    feature1Icon: {
      icon: "Box",
      size: 40,
      color: "#000000"
    },
    feature1Heading: {
      text: "Medium length section heading goes here",
      color: "#000000",
      lineHeight: "1.2"
    },
    feature1Description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      color: "#6B7280",
      lineHeight: "1.6"
    },
    feature2Icon: {
      icon: "Box",
      size: 40,
      color: "#000000"
    },
    feature2Heading: {
      text: "Medium length section heading goes here",
      color: "#000000",
      lineHeight: "1.2"
    },
    feature2Description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      color: "#6B7280",
      lineHeight: "1.6"
    },
    feature3Icon: {
      icon: "Box",
      size: 40,
      color: "#000000"
    },
    feature3Heading: {
      text: "Medium length section heading goes here",
      color: "#000000",
      lineHeight: "1.2"
    },
    feature3Description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      color: "#6B7280",
      lineHeight: "1.6"
    },
    feature4Icon: {
      icon: "Box",
      size: 40,
      color: "#000000"
    },
    feature4Heading: {
      text: "Medium length section heading goes here",
      color: "#000000",
      lineHeight: "1.2"
    },
    feature4Description: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
      color: "#6B7280",
      lineHeight: "1.6"
    },
    backgroundColor: "#FFFFFF"
  }
};

/**
 * Deep merge objects - existing values take precedence
 */
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else if (!(key in result)) {
        result[key] = source[key];
      }
    }
  }
  
  return result;
}

async function migratePageContent() {
  console.log('🔄 Starting page content migration...\n');
  
  // Fetch all pages with sections
  const { data: pages, error: pagesError } = await supabase
    .from('pages')
    .select('*')
    .not('sections', 'is', null);
    
  if (pagesError) {
    console.error('Error fetching pages:', pagesError);
    return;
  }
  
  console.log(`Found ${pages?.length || 0} pages with sections\n`);
  
  let updatedCount = 0;
  let errorCount = 0;
  
  for (const page of pages || []) {
    console.log(`\n📄 Processing: ${page.page_name} (${page.slug})`);
    
    if (!page.sections || !Array.isArray(page.sections)) {
      console.log('   ⚠️  No sections array, skipping');
      continue;
    }
    
    let hasUpdates = false;
    const updatedSections = page.sections.map(section => {
      const sectionType = section.type;
      const defaults = sectionDefaults[sectionType];
      
      if (!defaults) {
        console.log(`   ⚠️  No defaults for section type: ${sectionType}`);
        return section;
      }
      
      // Check if content needs updating
      const currentContent = section.content || {};
      const mergedContent = deepMerge(currentContent, defaults);
      
      // Check if anything changed
      if (JSON.stringify(currentContent) !== JSON.stringify(mergedContent)) {
        hasUpdates = true;
        console.log(`   ✅ Updated ${sectionType} section with missing fields`);
        
        return {
          ...section,
          content: mergedContent
        };
      }
      
      return section;
    });
    
    if (hasUpdates) {
      // Update the page with new sections
      const { error: updateError } = await supabase
        .from('pages')
        .update({ 
          sections: updatedSections,
          updated_at: new Date().toISOString()
        })
        .eq('id', page.id);
        
      if (updateError) {
        console.error(`   ❌ Error updating page:`, updateError.message);
        errorCount++;
      } else {
        console.log(`   ✅ Page updated successfully`);
        updatedCount++;
      }
    } else {
      console.log('   ℹ️  No updates needed');
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Migration Summary:');
  console.log(`   ✅ Updated: ${updatedCount} pages`);
  console.log(`   ❌ Errors: ${errorCount} pages`);
  console.log(`   📋 Total pages processed: ${pages?.length || 0}`);
  
  console.log('\n✨ Migration complete!');
  console.log('💡 Next: Test deployment to see if content now appears correctly.');
}

// Run the migration
migratePageContent().catch(console.error);