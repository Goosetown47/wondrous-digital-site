-- ============================================================================
-- COMPLETE DEV DATABASE SETUP SCRIPT
-- ============================================================================
-- This script applies all migrations to set up the DEV database
-- Run this in the Supabase SQL Editor for the DEV project
-- 
-- DEV Project: Wondrous-Digital-App-DEV (hlpvvwlxjzexpgitsjlw)
-- ============================================================================

-- First, let's check what tables already exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- If tables don't exist, run the migrations below:

-- ============================================================================
-- MIGRATION 1: Initial Baseline (20250809230000_initial_baseline_fixed.sql)
-- ============================================================================
-- This will be the first migration to run
-- Copy the contents of 20250809230000_initial_baseline_fixed.sql here

-- ============================================================================
-- MIGRATION 2: Add WWW Project Domain (20250809231000_add_www_project_domain.sql)
-- ============================================================================
-- Copy the contents of 20250809231000_add_www_project_domain.sql here

-- ============================================================================
-- MIGRATION 3: Create Audit Logs Table (20250810000000_create_audit_logs_table.sql)
-- ============================================================================
-- Copy the contents of 20250810000000_create_audit_logs_table.sql here

-- ============================================================================
-- MIGRATION 4: Fix Function Search Paths Security (20250810200000_fix_function_search_paths_security.sql)
-- ============================================================================
-- Copy the contents of 20250810200000_fix_function_search_paths_security.sql here

-- ============================================================================
-- MIGRATION 5: Move PG Net Extension (20250810201000_move_pg_net_extension.sql)
-- ============================================================================
-- Copy the contents of 20250810201000_move_pg_net_extension.sql here

-- ============================================================================
-- MIGRATION 6: Auth Security Settings (20250810202000_auth_security_settings.sql)
-- ============================================================================
-- Copy the contents of 20250810202000_auth_security_settings.sql here

-- ============================================================================
-- MIGRATION 7: Fix RLS Security Checks (20250810203000_fix_rls_security_checks.sql)
-- ============================================================================
-- Copy the contents of 20250810203000_fix_rls_security_checks.sql here

-- ============================================================================
-- MIGRATION 8: Force Fix Function Search Paths (20250810204000_force_fix_function_search_paths.sql)
-- ============================================================================
-- Copy the contents of 20250810204000_force_fix_function_search_paths.sql here

-- ============================================================================
-- MIGRATION 9: Recreate Functions with Search Path (20250810205000_recreate_functions_with_search_path.sql)
-- ============================================================================
-- Copy the contents of 20250810205000_recreate_functions_with_search_path.sql here

-- ============================================================================
-- MIGRATION 10: Clean Sweep Orphaned Functions (20250810210000_clean_sweep_orphaned_functions.sql)
-- ============================================================================
-- Copy the contents of 20250810210000_clean_sweep_orphaned_functions.sql here

-- ============================================================================
-- MIGRATION 11: Final Cleanup Orphaned Functions (20250810211000_final_cleanup_orphaned_functions.sql)
-- ============================================================================
-- Copy the contents of 20250810211000_final_cleanup_orphaned_functions.sql here

-- ============================================================================
-- MIGRATION 12: Drop Correct Function Signatures (20250810212000_drop_correct_function_signatures.sql)
-- ============================================================================
-- Copy the contents of 20250810212000_drop_correct_function_signatures.sql here

-- ============================================================================
-- MIGRATION 13: Placeholder Audit Logs Duplicate (20250810213000_placeholder_audit_logs_duplicate.sql)
-- ============================================================================
-- Copy the contents of 20250810213000_placeholder_audit_logs_duplicate.sql here

-- ============================================================================
-- MIGRATION 14: Fix Account Users Role Constraint (20250811000000_fix_account_users_role_constraint.sql)
-- ============================================================================
-- Copy the contents of 20250811000000_fix_account_users_role_constraint.sql here

-- ============================================================================
-- MIGRATION 15: Add Pages RLS Policies (20250811230000_add_pages_rls_policies.sql)
-- ============================================================================
-- Copy the contents of 20250811230000_add_pages_rls_policies.sql here

-- ============================================================================
-- MIGRATION 16: Add Projects RLS Policies (20250811231000_add_projects_rls_policies.sql)
-- ============================================================================
-- Copy the contents of 20250811231000_add_projects_rls_policies.sql here

-- ============================================================================
-- MIGRATION 17: Remove Broken Theme Check Function (20250812000000_remove_broken_theme_check_function.sql)
-- ============================================================================
-- Copy the contents of 20250812000000_remove_broken_theme_check_function.sql here

-- ============================================================================
-- MIGRATION 18: Add Foreign Key Constraints (20250112_add_foreign_key_constraints.sql)
-- ============================================================================
-- Copy the contents of 20250112_add_foreign_key_constraints.sql here

-- ============================================================================
-- MIGRATION 19: Add Missing Foreign Keys Safe (20250112_add_missing_foreign_keys_safe.sql)
-- ============================================================================
-- Copy the contents of 20250112_add_missing_foreign_keys_safe.sql here

-- ============================================================================
-- FINAL VERIFICATION
-- ============================================================================
-- After running all migrations, verify the database structure:

-- Check all tables were created
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS is enabled on key tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('accounts', 'projects', 'pages', 'account_users', 'audit_logs');

-- Check auth settings
SELECT * FROM auth.config WHERE key IN ('mfa_enabled', 'sms_provider', 'mailer_autoconfirm');