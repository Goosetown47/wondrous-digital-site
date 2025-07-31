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

async function setTestAdmin() {
  const testEmail = 'team@thinkgoose.com';
  
  // Find user by email
  const { data: users, error: userError } = await adminClient.auth.admin.listUsers();
  
  if (userError) {
    console.error('Error fetching users:', userError);
    return;
  }
  
  const testUser = users.users.find(u => u.email === testEmail);
  
  if (!testUser) {
    console.error(`User ${testEmail} not found`);
    return;
  }
  
  console.log(`Found user ${testEmail} with ID: ${testUser.id}`);
  
  // Check if already admin
  const { data: existingRole } = await adminClient
    .from('account_users')
    .select('*')
    .eq('user_id', testUser.id)
    .eq('account_id', '00000000-0000-0000-0000-000000000000')
    .single();
    
  if (existingRole?.role === 'admin') {
    console.log('User is already a platform admin');
    return;
  }
  
  // Set as admin
  const { data, error } = await adminClient
    .from('account_users')
    .upsert({
      user_id: testUser.id,
      account_id: '00000000-0000-0000-0000-000000000000',
      role: 'admin',
      joined_at: new Date().toISOString(),
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error setting admin role:', error);
  } else {
    console.log('Successfully set user as platform admin:', data);
  }
  
  // Clean up any legacy admin roles
  const { error: cleanupError } = await adminClient
    .from('account_users')
    .delete()
    .eq('user_id', testUser.id)
    .eq('role', 'admin')
    .neq('account_id', '00000000-0000-0000-0000-000000000000');
    
  if (cleanupError) {
    console.error('Error cleaning up legacy admin roles:', cleanupError);
  } else {
    console.log('Cleaned up legacy admin roles');
  }
}

setTestAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });