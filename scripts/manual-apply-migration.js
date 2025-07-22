import { createClient } from '@supabase/supabase-js';
import pkg from 'pg';
const { Client } = pkg;

async function applyMigration() {
  console.log('🚀 Manually applying default_content migration...\n');
  
  // PostgreSQL connection
  const client = new Client({
    host: 'db.bpdhbxvsguklkbusqtke.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'aTR9dv8Q7J2emyMD',
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Apply the migration
    const migrationSQL = `
      -- Add default_content column to section_templates table
      ALTER TABLE section_templates 
      ADD COLUMN IF NOT EXISTS default_content jsonb DEFAULT '{}';

      -- Add comment explaining the column
      COMMENT ON COLUMN section_templates.default_content IS 'Complete default content structure for this template, used when creating new sections';
    `;
    
    await client.query(migrationSQL);
    console.log('✅ Migration applied successfully!');
    
    // Verify the column was added
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'section_templates' 
      AND column_name = 'default_content'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Verified: default_content column exists');
      console.log('Column details:', result.rows[0]);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
    console.log('🔒 Database connection closed');
  }
}

applyMigration();