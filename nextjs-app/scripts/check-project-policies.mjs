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

async function checkProjectPolicies() {
  console.log('=== Checking Projects Table RLS Policies ===\n');
  
  // Use raw SQL to check policies
  const { data: policies, error } = await adminClient
    .rpc('sql', {
      query: `
        SELECT 
          policyname,
          cmd,
          permissive,
          roles,
          qual as using_expression,
          with_check
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'projects'
      `
    })
    .single();
    
  if (error) {
    console.log('RPC sql not available, trying direct query...\n');
    
    // Try a simpler approach - just check if we can query projects
    const { data: projects, error: projectError } = await adminClient
      .from('projects')
      .select('*');
      
    if (projectError) {
      console.error('Error querying projects:', projectError);
    } else {
      console.log(`Service role can see ${projects?.length || 0} projects.`);
    }
  } else if (policies?.result) {
    const policyList = policies.result;
    console.log(`Found ${policyList.length} policies:\n`);
    policyList.forEach((policy, index) => {
      console.log(`${index + 1}. Policy: ${policy.policyname}`);
      console.log(`   Command: ${policy.cmd}`);
      console.log(`   Permissive: ${policy.permissive}`);
      console.log(`   Using: ${policy.using_expression?.substring(0, 100)}...`);
      console.log('');
    });
  }
  
  // Test platform admin access
  console.log('\n=== Testing Platform Admin Access ===');
  
  // Get platform admins
  const { data: admins } = await adminClient
    .from('account_users')
    .select('user_id')
    .eq('account_id', '00000000-0000-0000-0000-000000000000')
    .eq('role', 'admin');
    
  console.log(`Found ${admins?.length || 0} platform admins`);
  
  if (admins?.length) {
    const adminId = admins[0].user_id;
    console.log(`\nChecking if admin ${adminId} should see projects...`);
    
    // Check what the policy would return
    const { data: policyCheck, error: policyError } = await adminClient
      .rpc('sql', {
        query: `
          SELECT EXISTS (
            SELECT 1 FROM account_users
            WHERE user_id = '${adminId}'
            AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
            AND role = 'admin'
          ) as is_platform_admin
        `
      })
      .single();
      
    if (!policyError && policyCheck?.result) {
      console.log(`Platform admin check: ${policyCheck.result[0].is_platform_admin}`);
    }
  }
  
  // Check all projects
  console.log('\n=== All Projects in Database ===');
  const { data: allProjects } = await adminClient
    .from('projects')
    .select('id, name, account_id, accounts!inner(name)');
    
  if (allProjects?.length) {
    allProjects.forEach(p => {
      console.log(`- ${p.name} (Account: ${p.accounts.name}, ID: ${p.account_id})`);
    });
  } else {
    console.log('No projects found');
  }
}

checkProjectPolicies()
  .then(() => {
    console.log('\n=== Check Complete ===');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script error:', error);
    process.exit(1);
  });