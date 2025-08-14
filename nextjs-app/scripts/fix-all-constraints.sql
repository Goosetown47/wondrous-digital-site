-- Fix ALL missing unique constraints that are causing ON CONFLICT errors
-- Run this in Supabase SQL Editor for the DEV database

-- ============================================================================
-- 1. PROJECT_DOMAINS - Add unique constraint on domain
-- ============================================================================

-- Check for duplicates first
SELECT domain, COUNT(*) 
FROM project_domains 
GROUP BY domain 
HAVING COUNT(*) > 1;

-- If no duplicates, add the constraint
ALTER TABLE project_domains 
ADD CONSTRAINT project_domains_domain_unique 
UNIQUE (domain);

-- ============================================================================
-- 2. SECURITY_CONFIGURATION_CHECKS - Add unique constraint on check_name
-- ============================================================================

-- Check for duplicates first
SELECT check_name, COUNT(*) 
FROM security_configuration_checks 
GROUP BY check_name 
HAVING COUNT(*) > 1;

-- If no duplicates, add the constraint
ALTER TABLE security_configuration_checks 
ADD CONSTRAINT security_configuration_checks_check_name_unique 
UNIQUE (check_name);

-- ============================================================================
-- 3. VERIFY ALL CONSTRAINTS ARE NOW IN PLACE
-- ============================================================================

-- Check reserved_domain_permissions constraints
SELECT 'reserved_domain_permissions' as table_name,
       tc.constraint_name,
       tc.constraint_type,
       STRING_AGG(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'reserved_domain_permissions'
    AND tc.constraint_type = 'UNIQUE'
GROUP BY tc.constraint_name, tc.constraint_type

UNION ALL

-- Check project_domains constraints
SELECT 'project_domains' as table_name,
       tc.constraint_name,
       tc.constraint_type,
       STRING_AGG(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'project_domains'
    AND tc.constraint_type = 'UNIQUE'
GROUP BY tc.constraint_name, tc.constraint_type

UNION ALL

-- Check security_configuration_checks constraints
SELECT 'security_configuration_checks' as table_name,
       tc.constraint_name,
       tc.constraint_type,
       STRING_AGG(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'security_configuration_checks'
    AND tc.constraint_type = 'UNIQUE'
GROUP BY tc.constraint_name, tc.constraint_type

ORDER BY table_name;

-- ============================================================================
-- 4. TEST THE ON CONFLICT CLAUSES
-- ============================================================================

-- Test reserved_domain_permissions
INSERT INTO reserved_domain_permissions (account_id, domain, notes)
VALUES ('19519371-1db4-44a1-ac70-3d5c5cfc32ee', 'wondrousdigital.com', 'Test ON CONFLICT')
ON CONFLICT (account_id, domain) DO NOTHING;

-- Test project_domains (will need a valid project_id first)
-- INSERT INTO project_domains (project_id, domain, is_primary)
-- VALUES ('YOUR-PROJECT-ID', 'test-domain.com', false)
-- ON CONFLICT (domain) DO NOTHING;

-- Test security_configuration_checks
INSERT INTO security_configuration_checks (check_name, expected_value, description)
VALUES ('auth_otp_expiry', '1800', 'Test ON CONFLICT')
ON CONFLICT (check_name) DO UPDATE
SET expected_value = EXCLUDED.expected_value,
    description = EXCLUDED.description;

-- If all tests pass, you should see success messages or no errors!