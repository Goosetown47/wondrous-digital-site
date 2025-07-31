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

async function listUsers() {
  const { data: users, error: userError } = await adminClient.auth.admin.listUsers();
  
  if (userError) {
    console.error('Error fetching users:', userError);
    return;
  }
  
  console.log(`Found ${users.users.length} users:`);
  users.users.forEach(user => {
    console.log(`- ${user.email} (ID: ${user.id})`);
  });
  
  // Check platform admins
  const { data: admins } = await adminClient
    .from('account_users')
    .select('user_id, role')
    .eq('account_id', '00000000-0000-0000-0000-000000000000')
    .eq('role', 'admin');
    
  console.log('\nPlatform admins:');
  if (admins?.length) {
    for (const admin of admins) {
      const user = users.users.find(u => u.id === admin.user_id);
      console.log(`- ${user?.email || 'Unknown'} (ID: ${admin.user_id})`);
    }
  }
}

listUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });