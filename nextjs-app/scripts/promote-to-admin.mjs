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

async function promoteToAdmin() {
  const targetEmail = 'tyler.lahaie@hey.com';
  const PLATFORM_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';
  
  // Find user by email
  const { data: users, error: userError } = await adminClient.auth.admin.listUsers();
  
  if (userError) {
    console.error('Error fetching users:', userError);
    return;
  }
  
  const targetUser = users.users.find(u => u.email === targetEmail);
  
  if (!targetUser) {
    console.error(`User ${targetEmail} not found`);
    return;
  }
  
  console.log(`Found user ${targetEmail} with ID: ${targetUser.id}`);
  
  // Check current role
  const { data: currentRole } = await adminClient
    .from('account_users')
    .select('*')
    .eq('user_id', targetUser.id)
    .eq('account_id', PLATFORM_ACCOUNT_ID)
    .single();
    
  console.log('Current platform role:', currentRole?.role || 'None');
  
  // Promote to admin
  const { data, error } = await adminClient
    .from('account_users')
    .upsert({
      user_id: targetUser.id,
      account_id: PLATFORM_ACCOUNT_ID,
      role: 'admin',
      joined_at: currentRole?.joined_at || new Date().toISOString(),
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error promoting to admin:', error);
  } else {
    console.log('Successfully promoted to admin:', data);
  }
  
  // Verify the promotion
  const { data: admins } = await adminClient
    .from('account_users')
    .select('user_id, role')
    .eq('account_id', PLATFORM_ACCOUNT_ID)
    .eq('role', 'admin');
    
  console.log(`\nTotal platform admins: ${admins?.length || 0}`);
  if (admins?.length) {
    for (const admin of admins) {
      const user = users.users.find(u => u.id === admin.user_id);
      console.log(`- ${user?.email || 'Unknown'} (ID: ${admin.user_id})`);
    }
  }
}

promoteToAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });