-- Script to fix the phantom migration in Supabase
-- Run this in the Supabase SQL Editor

-- Step 1: Check current migration entries
SELECT * FROM supabase_migrations.schema_migrations 
WHERE version LIKE '20250810%'
ORDER BY version;

-- Step 2: Update the malformed entry to have proper timestamp
-- This changes "20250810" to "20250810000000"
UPDATE supabase_migrations.schema_migrations 
SET version = '20250810000000'
WHERE version = '20250810';

-- Step 3: Verify the update
SELECT * FROM supabase_migrations.schema_migrations 
WHERE version LIKE '20250810%'
ORDER BY version;

-- You should now see:
-- 20250810000000 (instead of just 20250810)
-- 20250810200000
-- 20250810201000
-- etc.