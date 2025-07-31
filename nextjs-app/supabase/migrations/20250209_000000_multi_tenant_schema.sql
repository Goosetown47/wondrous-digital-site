/*
  # Multi-Tenant Database Schema
  
  This migration transforms the platform from single-user to multi-tenant architecture.
  
  Changes:
  1. Creates accounts table for organizations
  2. Creates account_users table for team members
  3. Creates roles and permissions tables for RBAC
  4. Creates audit_logs table for compliance
  5. Migrates existing users to default accounts
  6. Updates projects table to use account_id instead of customer_id
  7. Updates all RLS policies for account-based isolation
*/

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create account_users junction table
CREATE TABLE IF NOT EXISTS account_users (
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  invited_by UUID REFERENCES auth.users(id),
  PRIMARY KEY (account_id, user_id)
);

-- Create permissions table (defines all possible permissions)
CREATE TABLE IF NOT EXISTS permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  UNIQUE(resource, action)
);

-- Create roles table (both system and custom roles)
CREATE TABLE IF NOT EXISTS roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, account_id)
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_account_users_account ON account_users(account_id);
CREATE INDEX IF NOT EXISTS idx_account_users_user ON account_users(user_id);
CREATE INDEX IF NOT EXISTS idx_roles_account ON roles(account_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_account ON audit_logs(account_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_accounts_slug ON accounts(slug);

-- Insert default permissions
INSERT INTO permissions (resource, action, description) VALUES
  -- Project permissions
  ('projects', 'create', 'Create new projects'),
  ('projects', 'read', 'View projects'),
  ('projects', 'update', 'Edit projects'),
  ('projects', 'delete', 'Delete projects'),
  ('projects', 'publish', 'Publish projects to production'),
  
  -- Theme permissions
  ('themes', 'create', 'Create new themes'),
  ('themes', 'read', 'View themes'),
  ('themes', 'update', 'Edit themes'),
  ('themes', 'delete', 'Delete themes'),
  
  -- Library permissions
  ('library', 'create', 'Create library items'),
  ('library', 'read', 'View library items'),
  ('library', 'update', 'Edit library items'),
  ('library', 'delete', 'Delete library items'),
  ('library', 'publish', 'Publish library items'),
  
  -- Lab permissions
  ('lab', 'create', 'Create lab drafts'),
  ('lab', 'read', 'View lab drafts'),
  ('lab', 'update', 'Edit lab drafts'),
  ('lab', 'delete', 'Delete lab drafts'),
  
  -- Account permissions
  ('account', 'read', 'View account details'),
  ('account', 'update', 'Edit account settings'),
  ('account', 'delete', 'Delete account'),
  ('account', 'billing', 'Manage billing'),
  
  -- User permissions
  ('users', 'invite', 'Invite new users'),
  ('users', 'read', 'View team members'),
  ('users', 'update', 'Edit user roles'),
  ('users', 'remove', 'Remove team members')
ON CONFLICT (resource, action) DO NOTHING;

-- Create system roles with permissions
INSERT INTO roles (name, permissions, is_system, description) VALUES
  ('owner', ARRAY[
    'projects:create', 'projects:read', 'projects:update', 'projects:delete', 'projects:publish',
    'themes:create', 'themes:read', 'themes:update', 'themes:delete',
    'library:create', 'library:read', 'library:update', 'library:delete', 'library:publish',
    'lab:create', 'lab:read', 'lab:update', 'lab:delete',
    'account:read', 'account:update', 'account:delete', 'account:billing',
    'users:invite', 'users:read', 'users:update', 'users:remove'
  ], true, 'Full access to everything'),
  
  ('admin', ARRAY[
    'projects:create', 'projects:read', 'projects:update', 'projects:delete', 'projects:publish',
    'themes:create', 'themes:read', 'themes:update', 'themes:delete',
    'library:create', 'library:read', 'library:update', 'library:delete', 'library:publish',
    'lab:create', 'lab:read', 'lab:update', 'lab:delete',
    'account:read', 'account:update',
    'users:invite', 'users:read', 'users:update'
  ], true, 'Admin access without billing and account deletion'),
  
  ('member', ARRAY[
    'projects:create', 'projects:read', 'projects:update',
    'themes:create', 'themes:read', 'themes:update',
    'library:read',
    'lab:create', 'lab:read', 'lab:update',
    'account:read',
    'users:read'
  ], true, 'Standard team member access'),
  
  ('viewer', ARRAY[
    'projects:read',
    'themes:read',
    'library:read',
    'lab:read',
    'account:read',
    'users:read'
  ], true, 'Read-only access')
ON CONFLICT (name, account_id) DO NOTHING;

-- Add account_id to projects table (don't drop customer_id yet)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id) ON DELETE CASCADE;

-- Create function to generate slug from email
CREATE OR REPLACE FUNCTION generate_slug_from_email(email TEXT) 
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Extract username from email and convert to slug
  base_slug := LOWER(REGEXP_REPLACE(SPLIT_PART(email, '@', 1), '[^a-z0-9]+', '-', 'g'));
  final_slug := base_slug;
  
  -- Check if slug exists and append number if needed
  WHILE EXISTS (SELECT 1 FROM accounts WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Migrate existing users to accounts
DO $$
DECLARE
  user_record RECORD;
  new_account_id UUID;
  user_email TEXT;
  account_name TEXT;
  account_slug TEXT;
BEGIN
  -- Create an account for each existing user
  FOR user_record IN SELECT id, email FROM auth.users LOOP
    user_email := user_record.email;
    
    -- Generate account name from email
    account_name := SPLIT_PART(user_email, '@', 1);
    account_slug := generate_slug_from_email(user_email);
    
    -- Create the account
    INSERT INTO accounts (name, slug, plan)
    VALUES (account_name, account_slug, 'free')
    RETURNING id INTO new_account_id;
    
    -- Add user as owner of their account
    INSERT INTO account_users (account_id, user_id, role)
    VALUES (new_account_id, user_record.id, 'owner');
    
    -- Update projects to use the new account_id
    UPDATE projects 
    SET account_id = new_account_id 
    WHERE customer_id = user_record.id;
  END LOOP;
END $$;

-- Create updated_at triggers for new tables
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Drop old RLS policies
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can create projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can update own projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can delete own projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can update any project dev" ON projects;

-- Create new account-based RLS policies for projects
CREATE POLICY "Users can view projects in their accounts" ON projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.account_id = projects.account_id
      AND account_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects in their accounts" ON projects
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.account_id = projects.account_id
      AND account_users.user_id = auth.uid()
      AND account_users.role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "Users can update projects in their accounts" ON projects
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.account_id = projects.account_id
      AND account_users.user_id = auth.uid()
      AND account_users.role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "Users can delete projects in their accounts" ON projects
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.account_id = projects.account_id
      AND account_users.user_id = auth.uid()
      AND account_users.role IN ('owner', 'admin')
    )
  );

-- Create RLS policies for accounts table
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their accounts" ON accounts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.account_id = accounts.id
      AND account_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Account owners can update their accounts" ON accounts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.account_id = accounts.id
      AND account_users.user_id = auth.uid()
      AND account_users.role IN ('owner', 'admin')
    )
  );

-- Create RLS policies for account_users table
ALTER TABLE account_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view account members" ON account_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM account_users au
      WHERE au.account_id = account_users.account_id
      AND au.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage account members" ON account_users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM account_users au
      WHERE au.account_id = account_users.account_id
      AND au.user_id = auth.uid()
      AND au.role IN ('owner', 'admin')
    )
  );

-- Create RLS policies for audit_logs table
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit logs for their accounts" ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.account_id = audit_logs.account_id
      AND account_users.user_id = auth.uid()
      AND account_users.role IN ('owner', 'admin')
    )
  );

-- Create RLS policies for roles table
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view roles" ON roles
  FOR SELECT
  USING (
    -- System roles are visible to all
    is_system = true
    OR
    -- Custom roles are visible to account members
    EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.account_id = roles.account_id
      AND account_users.user_id = auth.uid()
    )
  );

-- Enable RLS on permissions table but allow all authenticated users to read
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view permissions" ON permissions
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Note: We're keeping customer_id for now to ensure backward compatibility
-- It will be removed in a future migration after all code is updated