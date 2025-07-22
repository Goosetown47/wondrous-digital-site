import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for full access
const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function applyMigration() {
  console.log('🚀 Applying default_content migration...\n');
  
  try {
    // Execute the migration SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add default_content column to section_templates table
        ALTER TABLE section_templates 
        ADD COLUMN IF NOT EXISTS default_content jsonb DEFAULT '{}';

        -- Add comment explaining the column
        COMMENT ON COLUMN section_templates.default_content IS 'Complete default content structure for this template, used when creating new sections';
      `
    });
    
    if (error) {
      // Try direct query if RPC doesn't work
      console.log('RPC failed, trying direct approach...');
      
      // First check if column exists
      const { data: checkData, error: checkError } = await supabase
        .from('section_templates')
        .select('*')
        .limit(1);
      
      if (checkError) {
        console.error('❌ Error checking table:', checkError);
      } else {
        console.log('✅ Table accessible, columns:', Object.keys(checkData[0] || {}));
      }
    } else {
      console.log('✅ Migration applied successfully!');
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  }
}

applyMigration();