#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../.env.local') });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
    },
  }
);

async function applySslMigration() {
  console.log('Applying SSL fields migration...');

  try {
    // Add ssl_state column
    const { error: sslStateError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        ALTER TABLE project_domains 
        ADD COLUMN IF NOT EXISTS ssl_state TEXT DEFAULT 'PENDING'
      `
    });

    if (sslStateError && !sslStateError.message.includes('already exists')) {
      console.error('Error adding ssl_state column:', sslStateError);
      throw sslStateError;
    }

    // Add verification_details column
    const { error: verificationDetailsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        ALTER TABLE project_domains 
        ADD COLUMN IF NOT EXISTS verification_details JSONB
      `
    });

    if (verificationDetailsError && !verificationDetailsError.message.includes('already exists')) {
      console.error('Error adding verification_details column:', verificationDetailsError);
      throw verificationDetailsError;
    }

    // Update existing domains to have the default ssl_state
    const { error: updateError } = await supabaseAdmin
      .from('project_domains')
      .update({ ssl_state: 'PENDING' })
      .is('ssl_state', null);

    if (updateError) {
      console.error('Error updating existing domains:', updateError);
    }

    console.log('SSL fields migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

applySslMigration();