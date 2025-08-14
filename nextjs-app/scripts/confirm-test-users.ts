import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Now import after env is loaded
import { createAdminClient } from '../src/lib/supabase/admin';

/**
 * Script to confirm test user emails for E2E testing
 * Run with: npx tsx scripts/confirm-test-users.ts
 */

const TEST_USER_EMAILS = [
  'admin@wondrousdigital.com',
  'staff@wondrousdigital.com',
  'owner@example.com',
  'test-user@example.com'
];

async function confirmTestUsers() {
  console.log('🔍 Confirming test user emails...');
  
  try {
    const adminClient = createAdminClient();
    
    // Get all test users
    const { data: users, error: listError } = await adminClient.auth.admin.listUsers();
    
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
      const { error: updateError } = await adminClient.auth.admin.updateUserById(
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
    const { data: verifyUsers } = await adminClient.auth.admin.listUsers();
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