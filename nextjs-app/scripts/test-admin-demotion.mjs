import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testAdminDemotion() {
  const PLATFORM_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';
  
  // Get a test admin user (not the current one)
  const { data: admins } = await adminClient
    .from('account_users')
    .select('*')
    .eq('account_id', PLATFORM_ACCOUNT_ID)
    .eq('role', 'admin');
    
  console.log(`Found ${admins?.length || 0} admins`);
  
  if (!admins || admins.length < 2) {
    console.log('Need at least 2 admins to test demotion');
    return;
  }
  
  // Pick the second admin for testing
  const testAdmin = admins[1];
  console.log('Testing demotion of admin:', testAdmin.user_id);
  
  // Test updating to staff role
  const { data, error } = await adminClient
    .from('account_users')
    .update({ role: 'staff' })
    .match({
      user_id: testAdmin.user_id,
      account_id: PLATFORM_ACCOUNT_ID,
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error demoting admin:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
  } else {
    console.log('Successfully demoted to staff:', data);
    
    // Restore back to admin
    const { data: restored, error: restoreError } = await adminClient
      .from('account_users')
      .update({ role: 'admin' })
      .match({
        user_id: testAdmin.user_id,
        account_id: PLATFORM_ACCOUNT_ID,
      })
      .select()
      .single();
      
    if (restoreError) {
      console.error('Error restoring admin:', restoreError);
    } else {
      console.log('Successfully restored to admin:', restored);
    }
  }
}

testAdminDemotion()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });