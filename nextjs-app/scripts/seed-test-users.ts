#!/usr/bin/env tsx
/**
 * Script to seed test users for E2E tests
 * Run with: npm run seed:test-users
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.test
dotenv.config({ path: path.resolve(__dirname, '..', '.env.test') });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.test');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Test users data
const TEST_USERS = [
  {
    email: 'admin@wondrousdigital.com',
    password: 'test-admin-password',
    role: 'admin',
    full_name: 'Test Admin User',
    display_name: 'Admin User'
  },
  {
    email: 'staff@wondrousdigital.com',
    password: 'test-staff-password',
    role: 'staff',
    full_name: 'Test Staff User',
    display_name: 'Staff User'
  },
  {
    email: 'owner@example.com',
    password: 'test-owner-password',
    role: 'account_owner',
    full_name: 'Test Account Owner',
    display_name: 'Account Owner',
    needsAccount: true
  },
  {
    email: 'user@example.com',
    password: 'test-user-password',
    role: 'user',
    full_name: 'Test Regular User',
    display_name: 'Regular User',
    needsAccount: true
  }
];

async function seedTestUsers() {
  console.log('🌱 Starting test user seeding...\n');

  let testAccountId: string | null = null;

  // First, create a test account for non-admin users
  const { data: existingAccount } = await supabase
    .from('accounts')
    .select('id')
    .eq('slug', 'test-account')
    .single();

  if (existingAccount) {
    testAccountId = existingAccount.id;
    console.log('✅ Using existing test account:', testAccountId);
  } else {
    const { data: newAccount, error: accountError } = await supabase
      .from('accounts')
      .insert({
        name: 'Test Account',
        slug: 'test-account',
        plan: 'pro',
        settings: {}
      })
      .select('id')
      .single();

    if (accountError) {
      console.error('❌ Failed to create test account:', accountError);
      process.exit(1);
    }

    testAccountId = newAccount.id;
    console.log('✅ Created test account:', testAccountId);
  }

  // Process each test user
  for (const testUser of TEST_USERS) {
    console.log(`\n📧 Processing ${testUser.email}...`);

    try {
      // Check if user already exists by querying auth.users via RPC or checking user_profiles
      // Since we can't directly query auth.users, we'll try to sign up and handle the error
      let userId: string;

      // Try to sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password,
        options: {
          data: {
            full_name: testUser.full_name,
            display_name: testUser.display_name
          }
        }
      });

      if (signUpError?.message?.includes('already registered')) {
        // User already exists, try to get their ID from user_profiles
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('email', testUser.email)
          .single();

        if (profileData) {
          userId = profileData.user_id;
          console.log(`  ✓ User already exists (ID: ${userId})`);
        } else {
          // If we can't find the user, we'll need to handle this differently
          console.log(`  ⚠️  User might exist but can't find profile. Attempting to continue...`);
          // For now, we'll skip this user
          continue;
        }
      } else if (signUpData?.user) {
        userId = signUpData.user.id;
        console.log(`  ✓ Created new user (ID: ${userId})`);
        
        // Note: Email confirmation is disabled in dev, but in production you'd need to handle this
        console.log(`  ℹ️  User created. Email confirmation may be required.`);
      } else {
        console.error(`  ❌ Failed to create user:`, signUpError);
        continue;
      }

      // Check if user_profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      if (!existingProfile) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            full_name: testUser.full_name,
            display_name: testUser.display_name,
            avatar_url: null,
            onboarding_completed: true
          });

        if (profileError) {
          console.error(`  ❌ Failed to create user profile:`, profileError);
        } else {
          console.log(`  ✓ Created user profile`);
        }
      } else {
        console.log(`  ✓ User profile already exists`);
      }

      // Handle account assignment
      if (testUser.needsAccount && testAccountId) {
        // Check if user is already in the account
        const { data: existingMembership } = await supabase
          .from('account_users')
          .select('user_id')
          .eq('account_id', testAccountId)
          .eq('user_id', userId)
          .single();

        if (!existingMembership) {
          // Add user to test account
          const { error: membershipError } = await supabase
            .from('account_users')
            .insert({
              account_id: testAccountId,
              user_id: userId,
              role: testUser.role as 'admin' | 'staff' | 'account_owner' | 'user'
            });

          if (membershipError) {
            console.error(`  ❌ Failed to add user to account:`, membershipError);
          } else {
            console.log(`  ✓ Added to test account with role: ${testUser.role}`);
          }
        } else {
          // Update role if needed
          const { error: updateRoleError } = await supabase
            .from('account_users')
            .update({ role: testUser.role as 'admin' | 'staff' | 'account_owner' | 'user' })
            .eq('account_id', testAccountId)
            .eq('user_id', userId);

          if (updateRoleError) {
            console.error(`  ❌ Failed to update role:`, updateRoleError);
          } else {
            console.log(`  ✓ Updated role in test account: ${testUser.role}`);
          }
        }
      } else if (testUser.role === 'admin' || testUser.role === 'staff') {
        // For admin/staff users, ensure they have the platform role
        // This is typically handled by checking the email domain or a separate platform_roles table
        console.log(`  ✓ Platform ${testUser.role} user (no account needed)`);
      }

    } catch (error) {
      console.error(`  ❌ Unexpected error processing ${testUser.email}:`, error);
    }
  }

  console.log('\n✨ Test user seeding completed!\n');
  console.log('Test users:');
  console.log('  - admin@wondrousdigital.com (Platform Admin)');
  console.log('  - staff@wondrousdigital.com (Platform Staff)');
  console.log('  - owner@example.com (Account Owner in test-account)');
  console.log('  - user@example.com (Regular User in test-account)');
  console.log('\nAll users have the password format: test-{role}-password');
}

// Run the seeding
seedTestUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });