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

async function fixProjectPolicies() {
  console.log('=== Fixing Project RLS Policies ===\n');
  
  // Execute SQL to drop old policies and create new ones
  const policySql = `
    -- Drop any existing SELECT policies on projects
    DROP POLICY IF EXISTS "simple_select_projects" ON projects;
    DROP POLICY IF EXISTS "users_can_view_projects" ON projects;
    DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
    DROP POLICY IF EXISTS "Users can view projects in their accounts" ON projects;
    
    -- Create comprehensive SELECT policy
    CREATE POLICY "users_can_view_projects" ON projects
      FOR SELECT
      USING (
        -- Platform admins can see all projects
        EXISTS (
          SELECT 1 FROM account_users
          WHERE user_id = auth.uid()
          AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
          AND role = 'admin'
        )
        OR
        -- Platform staff can see projects in their assigned accounts
        EXISTS (
          SELECT 1 FROM account_users au
          WHERE au.user_id = auth.uid()
          AND au.account_id = '00000000-0000-0000-0000-000000000000'::uuid
          AND au.role = 'staff'
          AND projects.account_id IN (
            SELECT account_id 
            FROM staff_account_assignments 
            WHERE staff_user_id = auth.uid()
          )
        )
        OR
        -- Regular users can see projects in their accounts
        projects.account_id IN (
          SELECT account_id 
          FROM account_users 
          WHERE user_id = auth.uid()
          AND account_id != '00000000-0000-0000-0000-000000000000'::uuid
        )
      );
    
    -- Ensure RLS is enabled
    ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
  `;
  
  try {
    const { error } = await adminClient.rpc('sql', { query: policySql }).single();
    
    if (error) {
      console.error('Failed to execute policy SQL via RPC:', error);
      console.log('\nTrying alternative approach...\n');
      
      // If RPC doesn't work, we'll need to apply via migration
      console.log('Please run the following SQL in your Supabase dashboard:\n');
      console.log(policySql);
    } else {
      console.log('✓ Successfully updated project RLS policies');
    }
  } catch (err) {
    console.error('Error:', err);
    console.log('\nPlease apply the following SQL manually in Supabase:\n');
    console.log(policySql);
  }
  
  // Test the policy
  console.log('\n=== Testing Policy ===');
  
  // Get a platform admin
  const { data: admins } = await adminClient
    .from('account_users')
    .select('user_id')
    .eq('account_id', '00000000-0000-0000-0000-000000000000')
    .eq('role', 'admin')
    .limit(1);
    
  if (admins?.length) {
    const adminId = admins[0].user_id;
    console.log(`\nTesting with admin user: ${adminId}`);
    
    // Test if the policy would allow access
    const testQuery = `
      SELECT 
        p.name,
        p.account_id,
        EXISTS (
          SELECT 1 FROM account_users
          WHERE user_id = '${adminId}'
          AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
          AND role = 'admin'
        ) as is_admin,
        EXISTS (
          SELECT 1 FROM account_users
          WHERE user_id = '${adminId}'
          AND account_id = p.account_id
        ) as is_in_account
      FROM projects p
      LIMIT 1;
    `;
    
    const { data: testResult, error: testError } = await adminClient
      .rpc('sql', { query: testQuery })
      .single();
      
    if (!testError && testResult?.result) {
      const result = testResult.result[0];
      console.log('\nTest results:');
      console.log(`- Project: ${result.name}`);
      console.log(`- User is platform admin: ${result.is_admin}`);
      console.log(`- User is in project's account: ${result.is_in_account}`);
      console.log(`- Should have access: ${result.is_admin || result.is_in_account}`);
    }
  }
}

fixProjectPolicies()
  .then(() => {
    console.log('\n=== Complete ===');
    console.log('\nPlease refresh your browser and check if projects are now visible.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script error:', error);
    process.exit(1);
  });