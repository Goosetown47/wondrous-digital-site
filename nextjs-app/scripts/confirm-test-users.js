const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌');
  process.exit(1);
}

const TEST_USER_EMAILS = [
  'admin@wondrousdigital.com',
  'staff@wondrousdigital.com',
  'owner@example.com',
  'test-user@example.com'
];

async function confirmTestUsers() {
  console.log('🔍 Confirming test user emails...');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Get all test users
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError);
      return;
    }
    
    // Filter to our test users
    const testUsers = users.users.filter(user => 
      TEST_USER_EMAILS.includes(user.email || '')
    );
    
    console.log(`📧 Found ${testUsers.length} test users to confirm`);
    
    // Update each user
    for (const user of testUsers) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        {
          email_confirm: true
        }
      );
      
      if (updateError) {
        console.error(`❌ Error confirming ${user.email}:`, updateError);
      } else {
        console.log(`✅ Confirmed email for ${user.email}`);
      }
    }
    
    console.log('✨ Done!');
    
    // Verify the updates
    console.log('\n📊 Verification:');
    const { data: verifyUsers } = await supabase.auth.admin.listUsers();
    const confirmedUsers = verifyUsers?.users.filter(user => 
      TEST_USER_EMAILS.includes(user.email || '')
    );
    
    confirmedUsers?.forEach(user => {
      console.log(`${user.email}: ${user.email_confirmed_at ? '✅ Confirmed' : '❌ Not confirmed'}`);
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
confirmTestUsers();