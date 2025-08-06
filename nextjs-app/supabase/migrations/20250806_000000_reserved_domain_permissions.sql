-- Create permissions table for reserved domains
CREATE TABLE reserved_domain_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  notes TEXT,
  UNIQUE(account_id, domain)
);

-- Add indexes for performance
CREATE INDEX idx_reserved_permissions_domain ON reserved_domain_permissions(domain);
CREATE INDEX idx_reserved_permissions_account ON reserved_domain_permissions(account_id);

-- Enable RLS
ALTER TABLE reserved_domain_permissions ENABLE ROW LEVEL SECURITY;

-- Only platform admins can view/modify permissions
CREATE POLICY "Platform admins can manage reserved domain permissions" ON reserved_domain_permissions
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM account_users 
      WHERE account_id = '00000000-0000-0000-0000-000000000000'  -- Platform account
      AND role IN ('admin', 'staff')
    )
  );

-- Grant initial permissions for Wondrous Digital account
-- Note: Using a system user ID since this is run during migration
INSERT INTO reserved_domain_permissions (account_id, domain, granted_by, notes)
VALUES 
  ('19519371-1db4-44a1-ac70-3d5c5cfc32ee', 'wondrousdigital.com', 
   (SELECT id FROM auth.users WHERE email = 'tyler.lahaie@wondrous.gg' LIMIT 1), 
   'Marketing website'),
  ('19519371-1db4-44a1-ac70-3d5c5cfc32ee', 'www.wondrousdigital.com', 
   (SELECT id FROM auth.users WHERE email = 'tyler.lahaie@wondrous.gg' LIMIT 1), 
   'Marketing website');

-- Add comment to explain the table
COMMENT ON TABLE reserved_domain_permissions IS 'Controls which accounts can use reserved domains like wondrousdigital.com';