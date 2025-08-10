-- Enable RLS on security_configuration_checks table
-- This table was created in the auth security settings migration but needs RLS enabled

-- Enable Row Level Security
ALTER TABLE public.security_configuration_checks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read security checks
CREATE POLICY "Anyone can view security configuration checks" 
ON public.security_configuration_checks
FOR SELECT
TO authenticated, anon
USING (true);

-- Create policy to allow only system admins to update security checks
CREATE POLICY "Only system admins can update security checks" 
ON public.security_configuration_checks
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role IN ('admin', 'staff')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role IN ('admin', 'staff')
  )
);

-- Create policy to prevent insertions (only migration should insert)
CREATE POLICY "No one can insert security checks" 
ON public.security_configuration_checks
FOR INSERT
TO authenticated, anon
WITH CHECK (false);

-- Create policy to prevent deletions
CREATE POLICY "No one can delete security checks" 
ON public.security_configuration_checks
FOR DELETE
TO authenticated, anon
USING (false);

-- Add comment explaining the security model
COMMENT ON TABLE public.security_configuration_checks IS 
'Tracks required security configurations that must be set in Supabase Dashboard. 
RLS enabled: Anyone can read, only system admins can update, no one can insert/delete.
After updating dashboard settings, admins mark as compliant using: 
SELECT mark_security_check_compliant(''auth_otp_expiry'');';