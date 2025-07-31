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

async function testAdminProjectVisibility() {
  const PLATFORM_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';
  
  // Get all projects directly
  const { data: allProjects, error: projectError } = await adminClient
    .from('projects')
    .select('*, accounts!inner(name)')
    .order('created_at', { ascending: false });
    
  if (projectError) {
    console.error('Error fetching projects:', projectError);
    return;
  }
  
  console.log(`Total projects in database: ${allProjects?.length || 0}`);
  if (allProjects?.length) {
    allProjects.forEach(project => {
      console.log(`- ${project.name} (Account: ${project.accounts.name})`);
    });
  }
  
  // Get platform admins
  const { data: admins } = await adminClient
    .from('account_users')
    .select('user_id')
    .eq('account_id', PLATFORM_ACCOUNT_ID)
    .eq('role', 'admin');
    
  console.log(`\nPlatform admins: ${admins?.length || 0}`);
  
  if (admins?.length) {
    // Test with first admin's perspective
    const adminUserId = admins[0].user_id;
    console.log(`\nTesting visibility for admin: ${adminUserId}`);
    
    // Simulate admin access using RLS
    const { data: adminProjects, error: adminError } = await adminClient
      .rpc('auth.uid', { uid: adminUserId })
      .from('projects')
      .select('*, accounts!inner(name)');
      
    if (adminError) {
      console.error('Error testing admin visibility:', adminError);
    } else {
      console.log(`Admin can see ${adminProjects?.length || 0} projects`);
    }
  }
}

testAdminProjectVisibility()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });