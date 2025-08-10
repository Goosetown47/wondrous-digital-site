-- Auth Security Configuration Documentation
-- 
-- IMPORTANT: These settings must be configured in the Supabase Dashboard
-- Navigate to: Authentication > Providers > Email
--
-- Required Changes:
-- 1. OTP Expiry: Change from current (>1 hour) to 30 minutes (1800 seconds)
-- 2. Leaked Password Protection: Enable this feature
--
-- This migration serves as documentation and validation only

-- Check current auth configuration (for documentation purposes)
DO $$
BEGIN
  RAISE NOTICE 'AUTH SECURITY CONFIGURATION REQUIRED:';
  RAISE NOTICE '=====================================';
  RAISE NOTICE '1. Go to Supabase Dashboard > Authentication > Providers > Email';
  RAISE NOTICE '2. Set OTP Expiry to 1800 seconds (30 minutes)';
  RAISE NOTICE '3. Enable "Leaked Password Protection"';
  RAISE NOTICE '';
  RAISE NOTICE 'These settings cannot be configured via SQL migration.';
  RAISE NOTICE 'Please update them manually in the Supabase Dashboard.';
END $$;

-- Add a configuration check table to track security settings
CREATE TABLE IF NOT EXISTS security_configuration_checks (
  id SERIAL PRIMARY KEY,
  check_name TEXT NOT NULL UNIQUE,
  expected_value TEXT NOT NULL,
  description TEXT,
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  is_compliant BOOLEAN DEFAULT FALSE
);

-- Insert expected security configurations
INSERT INTO security_configuration_checks (check_name, expected_value, description)
VALUES 
  ('auth_otp_expiry', '1800', 'OTP expiry should be set to 1800 seconds (30 minutes)'),
  ('auth_leaked_password_protection', 'enabled', 'Leaked password protection should be enabled')
ON CONFLICT (check_name) DO UPDATE
SET 
  expected_value = EXCLUDED.expected_value,
  description = EXCLUDED.description,
  checked_at = NOW();

-- Create a function to manually mark configurations as compliant after dashboard updates
CREATE OR REPLACE FUNCTION mark_security_check_compliant(p_check_name TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE security_configuration_checks
  SET 
    is_compliant = TRUE,
    checked_at = NOW()
  WHERE check_name = p_check_name;
  
  RAISE NOTICE 'Security check % marked as compliant', p_check_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Usage instructions
COMMENT ON TABLE security_configuration_checks IS 'Tracks required security configurations that must be set in Supabase Dashboard. After updating dashboard settings, mark as compliant using: SELECT mark_security_check_compliant(''auth_otp_expiry'');';

-- Final reminder
DO $$
BEGIN
  RAISE WARNING 'MANUAL ACTION REQUIRED: Update auth settings in Supabase Dashboard!';
END $$;