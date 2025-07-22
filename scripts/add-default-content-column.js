import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for full access
const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function checkAndAddColumn() {
  console.log('🔍 Checking section_templates table structure...\n');
  
  try {
    // 1. First, check if the table exists and what columns it has
    const { data: templates, error: fetchError } = await supabase
      .from('section_templates')
      .select('*')
      .limit(1);
    
    if (fetchError) {
      console.error('❌ Error fetching templates:', fetchError);
      return;
    }
    
    if (templates && templates.length > 0) {
      const columns = Object.keys(templates[0]);
      console.log('Current columns:', columns);
      
      if (columns.includes('default_content')) {
        console.log('✅ default_content column already exists!');
      } else {
        console.log('❌ default_content column not found');
        console.log('\nTo add the column, run this SQL in Supabase Dashboard:');
        console.log(`
ALTER TABLE section_templates 
ADD COLUMN IF NOT EXISTS default_content jsonb DEFAULT '{}';

COMMENT ON COLUMN section_templates.default_content IS 'Complete default content structure for this template, used when creating new sections';
        `);
      }
    } else {
      console.log('No templates found in table');
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

checkAndAddColumn();