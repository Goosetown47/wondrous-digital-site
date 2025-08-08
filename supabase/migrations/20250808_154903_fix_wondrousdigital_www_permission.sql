-- Fix missing www.wondrousdigital.com permission
-- This ensures both apex and www domains have proper permissions

-- Insert www.wondrousdigital.com permission if it doesn't exist
INSERT INTO reserved_domain_permissions (account_id, domain, notes)
VALUES (
  '19519371-1db4-44a1-ac70-3d5c5cfc32ee', -- Wondrous Digital account
  'www.wondrousdigital.com', 
  'Marketing website - www subdomain'
)
ON CONFLICT (account_id, domain) DO NOTHING;

-- Also ensure the apex domain permission exists
INSERT INTO reserved_domain_permissions (account_id, domain, notes)
VALUES (
  '19519371-1db4-44a1-ac70-3d5c5cfc32ee', -- Wondrous Digital account
  'wondrousdigital.com', 
  'Marketing website - apex domain'
)
ON CONFLICT (account_id, domain) DO NOTHING;

-- Verify both permissions exist
DO $$
DECLARE
  apex_exists BOOLEAN;
  www_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM reserved_domain_permissions 
    WHERE account_id = '19519371-1db4-44a1-ac70-3d5c5cfc32ee' 
    AND domain = 'wondrousdigital.com'
  ) INTO apex_exists;
  
  SELECT EXISTS(
    SELECT 1 FROM reserved_domain_permissions 
    WHERE account_id = '19519371-1db4-44a1-ac70-3d5c5cfc32ee' 
    AND domain = 'www.wondrousdigital.com'
  ) INTO www_exists;
  
  IF NOT apex_exists THEN
    RAISE EXCEPTION 'Failed to create permission for wondrousdigital.com';
  END IF;
  
  IF NOT www_exists THEN
    RAISE EXCEPTION 'Failed to create permission for www.wondrousdigital.com';
  END IF;
  
  RAISE NOTICE 'Both wondrousdigital.com permissions successfully verified';
END $$;