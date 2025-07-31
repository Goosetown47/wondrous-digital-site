/*
  # Database State Assessment Script
  
  Run this in Supabase SQL Editor to understand current state.
  This will help us identify what needs to be fixed.
*/

-- 1. Check what migrations Supabase thinks are applied
SELECT name, executed_at 
FROM supabase_migrations.schema_migrations 
ORDER BY executed_at DESC
LIMIT 20;

-- 2. Check all triggers on auth.users table
SELECT 
  tgname as trigger_name,
  proname as function_name,
  tgenabled as enabled
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'auth.users'::regclass
AND NOT tgisinternal;

-- 3. Check if old profiles table exists
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
) as old_profiles_exists;

-- 4. Check if user_profiles table exists
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
) as user_profiles_exists;

-- 5. List all functions that might be trigger functions
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc
WHERE proname IN ('handle_new_user', 'create_user_profile', 'create_user_profile_on_signup')
AND pronamespace = 'public'::regnamespace;

-- 6. Check for any errors in recent signups (if audit_logs exists)
SELECT 
  created_at,
  action,
  metadata
FROM audit_logs
WHERE action LIKE '%user%' OR action LIKE '%signup%'
ORDER BY created_at DESC
LIMIT 10;