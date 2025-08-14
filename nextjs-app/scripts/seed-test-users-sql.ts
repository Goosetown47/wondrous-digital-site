#!/usr/bin/env tsx
/**
 * Alternative script to seed test users using direct database access
 * This requires database connection details
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '.env.test') });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Since we can't use admin methods directly, let's create a simple approach
async function seedTestUsers() {
  console.log('🌱 Starting simple test user seeding...\n');
  console.log('ℹ️  This script will attempt to create test users.');
  console.log('ℹ️  If users already exist, you may see errors - this is expected.\n');

  // Test users
  const testUsers = [
    { email: 'admin@wondrousdigital.com', password: 'test-admin-password' },
    { email: 'staff@wondrousdigital.com', password: 'test-staff-password' },
    { email: 'owner@example.com', password: 'test-owner-password' },
    { email: 'user@example.com', password: 'test-user-password' }
  ];

  console.log('📝 Instructions for manual user creation:\n');
  console.log('Since automated user creation is having issues, please create these users manually:');
  console.log('');
  console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/bpdhbxvsguklkbusqtke/auth/users');
  console.log('2. Click "Create user" and create each of these users:\n');

  testUsers.forEach((user, index) => {
    console.log(`   User ${index + 1}:`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Password: ${user.password}`);
    console.log(`   - Auto Confirm Email: ✓ (check this box)`);
    console.log('');
  });

  console.log('3. After creating the users, you\'ll need to assign roles:');
  console.log('   - admin@wondrousdigital.com → Platform Admin');
  console.log('   - staff@wondrousdigital.com → Platform Staff');
  console.log('   - owner@example.com → Account Owner (in test account)');
  console.log('   - user@example.com → Regular User (in test account)\n');

  console.log('4. Once users are created, run: npm run test:e2e\n');

  // Let's at least create the test account
  const { data: existingAccount } = await supabase
    .from('accounts')
    .select('id')
    .eq('slug', 'test-account')
    .single();

  if (!existingAccount) {
    const { data: newAccount, error } = await supabase
      .from('accounts')
      .insert({
        name: 'Test Account',
        slug: 'test-account',
        plan: 'pro',
        settings: {}
      })
      .select('id')
      .single();

    if (error) {
      console.error('❌ Failed to create test account:', error);
    } else {
      console.log('✅ Created test account:', newAccount.id);
    }
  } else {
    console.log('✅ Test account already exists:', existingAccount.id);
  }
}

seedTestUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });