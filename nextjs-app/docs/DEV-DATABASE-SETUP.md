# DEV Database Setup Guide

## Overview

This guide explains how to set up the development database for Wondrous Digital Platform.

**DEV Database Details:**
- Project Name: Wondrous-Digital-App-DEV
- Project ID: hlpvvwlxjzexpgitsjlw
- Host: db.hlpvvwlxjzexpgitsjlw.supabase.co
- Password: anr3fyg.TCJ.czq!dka
- Region: us-east-2

## Step 1: Apply Migrations to DEV Database

Since the Supabase CLI connection isn't working directly, we'll apply migrations through the Supabase Dashboard.

### Method A: Using Combined Migration File (Recommended)

1. Go to your DEV Supabase project: https://supabase.com/dashboard/project/hlpvvwlxjzexpgitsjlw

2. Navigate to **SQL Editor** in the left sidebar

3. Create a new query

4. Copy the entire contents of `/scripts/combined-migrations-for-dev.sql`

5. Paste into the SQL Editor

6. Click **Run** to execute all migrations

7. Check for any errors in the output

### Method B: Apply Individual Migrations

If the combined file is too large or encounters errors, apply migrations one by one:

1. Go to SQL Editor in DEV Supabase Dashboard

2. Apply each migration in order:
   - First: `20250809230000_initial_baseline_fixed.sql` (creates all tables)
   - Then apply remaining migrations in chronological order

## Step 2: Create Platform Account

The platform account is required for admin users. Run this in SQL Editor:

```sql
-- Create Platform Account (required for admin users)
INSERT INTO accounts (id, name, slug, settings, created_at, updated_at)
VALUES (
  '19519371-1db4-44a1-ac70-3d5c5cfc32ee',
  'Wondrous Digital',
  'wondrous-digital',
  '{}',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;
```

## Step 3: Create Test Users

### Create Admin User

1. Go to **Authentication** > **Users** in Supabase Dashboard
2. Click **Add user** > **Create new user**
3. Enter:
   - Email: `admin@wondrousdigital.com`
   - Password: `atz_dek-nky2WBU_jav`
   - Auto Confirm Email: ✅ Check this

4. After user is created, get their user ID from the users list

5. Add them to the platform account with admin role:

```sql
-- Replace 'USER_ID_HERE' with the actual user ID from step 4
INSERT INTO account_users (account_id, user_id, role, created_at)
VALUES (
  '19519371-1db4-44a1-ac70-3d5c5cfc32ee',  -- Platform account
  'USER_ID_HERE',  -- Replace with actual user ID
  'admin',
  NOW()
) ON CONFLICT DO NOTHING;

-- Create user profile
INSERT INTO user_profiles (user_id, display_name, email, created_at, updated_at)
VALUES (
  'USER_ID_HERE',  -- Replace with actual user ID
  'Platform Admin',
  'admin@wondrousdigital.com',
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO NOTHING;
```

### Create Additional Test Users

Repeat the process for other test users:
- `staff@wondrousdigital.com` (Password: `tvt*gdy5aka-UTF2zfu`) - Role: staff
- `owner@example.com` (Password: `afq!HXC7pqk3fgv4rym`) - Role: account_owner
- `test-user@example.com` (Password: `ukc-zbr5DZT4pfb3yvf`) - Role: user

## Step 4: Create Test Accounts & Projects

```sql
-- Create test accounts
INSERT INTO accounts (name, slug, settings) VALUES
  ('Test Company 1', 'test-company-1', '{}'),
  ('Test Company 2', 'test-company-2', '{}'),
  ('Demo Agency', 'demo-agency', '{}')
ON CONFLICT DO NOTHING;

-- Add owner@example.com to Test Company 1
-- (First get the account ID and user ID, then insert into account_users)
```

## Step 5: Verify Setup

Run these queries to verify everything is set up correctly:

```sql
-- Check tables exist
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public';
-- Should return ~27 tables

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('accounts', 'projects', 'pages', 'account_users', 'audit_logs');
-- All should show rowsecurity = true

-- Check platform account exists
SELECT * FROM accounts WHERE id = '19519371-1db4-44a1-ac70-3d5c5cfc32ee';

-- Check admin user exists
SELECT au.*, up.* 
FROM account_users au
JOIN user_profiles up ON up.user_id = au.user_id
WHERE au.account_id = '19519371-1db4-44a1-ac70-3d5c5cfc32ee';
```

## Step 6: Test Local Connection

1. Ensure `.env.local` is using DEV database credentials
2. Start the development server:
   ```bash
   cd nextjs-app
   npm run dev
   ```
3. Visit http://localhost:3000
4. Try logging in with admin@wondrousdigital.com

## Troubleshooting

### Connection Issues

If you can't connect from the app:
1. Check `.env.local` has correct DEV database URLs and keys
2. Restart the dev server after changing environment variables
3. Check Supabase Dashboard > Settings > API for correct keys

### Migration Errors

If migrations fail:
1. Check if tables already exist (might need to drop and recreate)
2. Apply migrations one by one to identify the problematic migration
3. Check foreign key constraints are satisfied

### Authentication Issues

If users can't log in:
1. Ensure user is confirmed in Authentication > Users
2. Check user exists in user_profiles table
3. Verify account_users has correct role assignment

## Environment Variables Reference

Your `.env.local` should have:
```env
# DEV Database
NEXT_PUBLIC_SUPABASE_URL=https://hlpvvwlxjzexpgitsjlw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[DEV_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[DEV_SERVICE_KEY]
```

Get these keys from Supabase Dashboard > Settings > API

## Next Steps

After setup is complete:
1. Test all major features work with DEV database
2. Verify production is unaffected
3. Update Vercel environment variables if needed
4. Document any custom configurations