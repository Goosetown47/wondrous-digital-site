-- Populate roles table with system roles
-- Run this in DEV Supabase Dashboard SQL Editor

-- ============================================================================
-- Insert System Roles (matching production)
-- ============================================================================

-- User Role - Standard team member access
INSERT INTO "public"."roles" ("id", "name", "permissions", "account_id", "description", "is_system", "created_at", "updated_at") 
VALUES (
  '303f1cd0-f7ec-4511-8b97-0d152307a1e2', 
  'user', 
  '{"projects:create","projects:read","projects:update","themes:create","themes:read","themes:update","library:read","lab:create","lab:read","lab:update","account:read","users:read"}', 
  null, 
  'Standard team member access', 
  true, 
  NOW(), 
  NOW()
) ON CONFLICT (id) DO UPDATE SET 
  permissions = EXCLUDED.permissions,
  updated_at = NOW();

-- Account Owner Role - Full access to everything in their account
INSERT INTO "public"."roles" ("id", "name", "permissions", "account_id", "description", "is_system", "created_at", "updated_at") 
VALUES (
  '44ef41f7-dec0-47a9-ad5f-a8f3ff409a29', 
  'account_owner', 
  '{"projects:create","projects:read","projects:update","projects:delete","projects:publish","themes:create","themes:read","themes:update","themes:delete","library:create","library:read","library:update","library:delete","library:publish","lab:create","lab:read","lab:update","lab:delete","account:read","account:update","account:delete","account:billing","users:invite","users:read","users:update","users:remove"}', 
  null, 
  'Full access to everything', 
  true, 
  NOW(), 
  NOW()
) ON CONFLICT (id) DO UPDATE SET 
  permissions = EXCLUDED.permissions,
  updated_at = NOW();

-- Admin Role - Platform administrator with full access
INSERT INTO "public"."roles" ("id", "name", "permissions", "account_id", "description", "is_system", "created_at", "updated_at") 
VALUES (
  '7d39905d-3426-4c35-8dad-116d0a13aa4a', 
  'admin', 
  '{"projects:create","projects:read","projects:update","projects:delete","projects:publish","themes:create","themes:read","themes:update","themes:delete","library:create","library:read","library:update","library:delete","library:publish","lab:create","lab:read","lab:update","lab:delete","account:read","account:update","account:delete","account:billing","users:invite","users:read","users:update","users:remove","core:create","core:read","core:update","core:delete","tools:access","tools:manage"}', 
  null, 
  'Platform administrator with full access', 
  true, 
  NOW(), 
  NOW()
) ON CONFLICT (id) DO UPDATE SET 
  permissions = EXCLUDED.permissions,
  updated_at = NOW();

-- Staff Role - Platform staff with limited access
INSERT INTO "public"."roles" ("id", "name", "permissions", "account_id", "description", "is_system", "created_at", "updated_at") 
VALUES (
  'e5313cbd-5991-4a49-8171-83ebff587f2a', 
  'staff', 
  '{"projects:read","themes:create","themes:read","themes:update","themes:delete","library:create","library:read","library:update","library:delete","library:publish","lab:create","lab:read","lab:update","lab:delete","users:read","core:create","core:read","core:update","core:delete","tools:access"}', 
  null, 
  'Platform staff with limited access', 
  true, 
  NOW(), 
  NOW()
) ON CONFLICT (id) DO UPDATE SET 
  permissions = EXCLUDED.permissions,
  updated_at = NOW();

-- ============================================================================
-- Verify roles were created
-- ============================================================================
SELECT 
  name,
  array_length(permissions, 1) as permission_count,
  description,
  is_system
FROM roles
ORDER BY 
  CASE name
    WHEN 'admin' THEN 1
    WHEN 'staff' THEN 2
    WHEN 'account_owner' THEN 3
    WHEN 'user' THEN 4
    ELSE 5
  END;