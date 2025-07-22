import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function applyMigration() {
  console.log('🔧 Applying netlify_site_name migration...\n');
  
  try {
    // Add netlify_site_name column
    const { error: addColumnError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.projects
        ADD COLUMN IF NOT EXISTS netlify_site_name VARCHAR(255);
      `
    });
    
    if (addColumnError) {
      console.error('Error adding column:', addColumnError);
    } else {
      console.log('✅ Added netlify_site_name column');
    }
    
    // Drop netlify_primary_domain column
    const { error: dropColumnError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.projects
        DROP COLUMN IF EXISTS netlify_primary_domain;
      `
    });
    
    if (dropColumnError) {
      console.error('Error dropping column:', dropColumnError);
    } else {
      console.log('✅ Dropped netlify_primary_domain column');
    }
    
    // Create unique index
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_netlify_site_id_unique 
        ON public.projects(netlify_site_id) 
        WHERE netlify_site_id IS NOT NULL;
      `
    });
    
    if (indexError) {
      console.error('Error creating index:', indexError);
    } else {
      console.log('✅ Created unique index on netlify_site_id');
    }
    
    // Clear netlify_site_cache
    const { error: truncateError } = await supabase
      .from('netlify_site_cache')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (truncateError) {
      console.error('Error clearing cache:', truncateError);
    } else {
      console.log('✅ Cleared netlify_site_cache table');
    }
    
    console.log('\n✅ Migration completed successfully\!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

applyMigration().catch(console.error);
