/*
  # Mark Migrations as Applied
  
  Run this in Supabase SQL Editor to mark the placeholder migrations as applied.
  This prevents the CLI from trying to apply them.
*/

-- Insert migration records for the placeholder migrations
INSERT INTO supabase_migrations.schema_migrations (version, name, statements, executed_at)
VALUES 
  ('20250804000000', '20250804_000000_add_account_invitations.sql', ARRAY['-- Placeholder migration'], NOW()),
  ('20250804000001', '20250804_000000_email_system_and_staff_assignments.sql', ARRAY['-- Placeholder migration'], NOW()),
  ('20250805000000', '20250805_000000_update_staff_assignments_policies.sql', ARRAY['-- Placeholder migration'], NOW()),
  ('20250820000000', '20250820_000000_add_account_member_profile_visibility.sql', ARRAY['-- Placeholder migration'], NOW()),
  ('20250821000000', '20250821_000000_add_account_users_view.sql', ARRAY['-- Placeholder migration'], NOW())
ON CONFLICT (version) DO NOTHING;

-- Also mark our fix migrations if they partially applied
INSERT INTO supabase_migrations.schema_migrations (version, name, statements, executed_at)
VALUES 
  ('20250901000000', '20250901_000000_fix_user_signup_triggers.sql', ARRAY['-- Fix migration'], NOW()),
  ('20250902000000', '20250902_000000_fix_signup_triggers_properly.sql', ARRAY['-- Fix migration'], NOW()),
  ('20250903000000', '20250903_000000_cleanup_old_profiles_table.sql', ARRAY['-- Cleanup migration'], NOW())
ON CONFLICT (version) DO NOTHING;

-- Show what migrations are now marked as applied
SELECT version, name, executed_at 
FROM supabase_migrations.schema_migrations 
WHERE version >= '20250804000000'
ORDER BY version;