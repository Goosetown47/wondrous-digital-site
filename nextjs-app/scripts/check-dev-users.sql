-- Check users in DEV database
-- Run this in Supabase Dashboard SQL Editor

-- ============================================================================
-- Check auth.users table
-- ============================================================================
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- ============================================================================
-- Check user_profiles table
-- ============================================================================
SELECT 
    up.user_id,
    up.display_name,
    up.created_at,
    au.email
FROM user_profiles up
LEFT JOIN auth.users au ON au.id = up.user_id
ORDER BY up.created_at DESC;

-- ============================================================================
-- Check account_users relationships
-- ============================================================================
SELECT 
    au.email,
    acu.role,
    a.name as account_name,
    a.slug as account_slug
FROM account_users acu
JOIN auth.users au ON au.id = acu.user_id
JOIN accounts a ON a.id = acu.account_id
ORDER BY a.name, acu.role;

-- ============================================================================
-- Check if tyler.lahaie@hey.com exists
-- ============================================================================
SELECT 
    id,
    email,
    created_at
FROM auth.users
WHERE email = 'tyler.lahaie@hey.com';

-- ============================================================================
-- Check if tyler.lahaie@wondrous.gg exists
-- ============================================================================
SELECT 
    id,
    email,
    created_at
FROM auth.users
WHERE email = 'tyler.lahaie@wondrous.gg';