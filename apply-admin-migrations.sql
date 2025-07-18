-- Apply Admin Management Migrations
-- Run this script in your Supabase SQL Editor

-- ============================================
-- MIGRATION 1: Admin Management Schema
-- ============================================

/*
  Admin Management System Schema Updates
  
  This migration adds the necessary database schema changes to support:
  - 8 project status types as defined in the PRD
  - Account management fields for customers
  - Deployment tracking for Netlify integration
  - Project versioning support
  - Audit trail capabilities
*/

-- 1. Add project_status column with proper enum type
DO $$ 
BEGIN
  -- Create enum type for project statuses if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status_type') THEN
    CREATE TYPE project_status_type AS ENUM (
      'draft',
      'template-internal', 
      'template-public',
      'prospect-staging',
      'live-customer',
      'paused-maintenance',
      'archived'
    );
  END IF;
END $$;

-- Add project_status column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS project_status project_status_type DEFAULT 'draft';

-- Migrate existing project_type values to new status system
UPDATE projects 
SET project_status = CASE 
  WHEN project_type = 'template' AND is_active = true THEN 'template-internal'::project_status_type
  WHEN project_type = 'template' AND is_active = false THEN 'archived'::project_status_type
  WHEN project_type = 'customer_site' AND is_active = true THEN 'live-customer'::project_status_type
  WHEN project_type = 'customer_site' AND is_active = false THEN 'archived'::project_status_type
  WHEN project_type = 'main_site' AND is_active = true THEN 'live-customer'::project_status_type
  WHEN project_type = 'main_site' AND is_active = false THEN 'archived'::project_status_type
  WHEN project_type = 'landing_page' AND is_active = true THEN 'live-customer'::project_status_type
  WHEN project_type = 'landing_page' AND is_active = false THEN 'archived'::project_status_type
  ELSE 'draft'::project_status_type
END
WHERE project_status IS NULL;

-- 2. Add deployment tracking fields to projects
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS subdomain text,
ADD COLUMN IF NOT EXISTS netlify_site_id text,
ADD COLUMN IF NOT EXISTS deployment_status text CHECK (deployment_status IN ('pending', 'deploying', 'deployed', 'failed', 'none')) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS last_deployed_at timestamptz,
ADD COLUMN IF NOT EXISTS deployment_url text;

-- Create index for subdomain lookups
CREATE INDEX IF NOT EXISTS projects_subdomain_idx ON projects(subdomain) WHERE subdomain IS NOT NULL;

-- 3. Add account management fields to customers
DO $$ 
BEGIN
  -- Create enum type for account types if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_type') THEN
    CREATE TYPE account_type AS ENUM ('prospect', 'customer', 'inactive');
  END IF;
END $$;

ALTER TABLE customers
ADD COLUMN IF NOT EXISTS account_type account_type DEFAULT 'prospect',
ADD COLUMN IF NOT EXISTS subscription_status text CHECK (subscription_status IN ('active', 'paused', 'cancelled', 'none')) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS converted_at timestamptz,
ADD COLUMN IF NOT EXISTS notes text;

-- Update existing customers based on their current state
UPDATE customers
SET account_type = CASE
  WHEN is_active = true AND EXISTS (
    SELECT 1 FROM projects 
    WHERE customer_id = customers.id 
    AND project_status IN ('live-customer', 'paused-maintenance')
  ) THEN 'customer'::account_type
  WHEN is_active = false THEN 'inactive'::account_type
  ELSE 'prospect'::account_type
END
WHERE account_type IS NULL;

-- 4. Create project_versions table for versioning support
CREATE TABLE IF NOT EXISTS project_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  version_name text,
  snapshot_data jsonb NOT NULL, -- Stores complete project state
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  is_current boolean DEFAULT false,
  notes text,
  UNIQUE(project_id, version_number)
);

-- Create indexes for project versions
CREATE INDEX IF NOT EXISTS project_versions_project_id_idx ON project_versions(project_id);
CREATE INDEX IF NOT EXISTS project_versions_created_at_idx ON project_versions(created_at DESC);

-- 5. Create audit_logs table for tracking admin actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  action_type text NOT NULL,
  entity_type text NOT NULL, -- 'project', 'customer', 'template', etc.
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for audit logs
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_entity_idx ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at DESC);

-- 6. Add status transition tracking
CREATE TABLE IF NOT EXISTS project_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  old_status project_status_type,
  new_status project_status_type NOT NULL,
  changed_by uuid REFERENCES users(id),
  changed_at timestamptz DEFAULT now(),
  reason text
);

CREATE INDEX IF NOT EXISTS project_status_history_project_id_idx ON project_status_history(project_id);
CREATE INDEX IF NOT EXISTS project_status_history_changed_at_idx ON project_status_history(changed_at DESC);

-- 7. Create maintenance_pages table for pause/maintenance mode
CREATE TABLE IF NOT EXISTS maintenance_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
  business_name text,
  phone_number text,
  email text,
  custom_message text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 8. Add performance indexes
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(project_status);
CREATE INDEX IF NOT EXISTS projects_customer_status_idx ON projects(customer_id, project_status);
CREATE INDEX IF NOT EXISTS customers_account_type_idx ON customers(account_type);

-- 9. Create views for easier querying
CREATE OR REPLACE VIEW project_management_view AS
SELECT 
  p.id,
  p.project_name,
  p.project_status,
  p.project_type,
  p.domain,
  p.subdomain,
  p.deployment_status,
  p.deployment_url,
  p.last_deployed_at,
  p.created_at,
  p.updated_at,
  c.id as customer_id,
  c.business_name,
  c.account_type,
  c.contact_email,
  CASE 
    WHEN p.project_status IN ('draft', 'template-internal', 'template-public') THEN 'draft'
    WHEN p.project_status IN ('prospect-staging', 'live-customer', 'paused-maintenance') THEN 'active'
    WHEN p.project_status = 'archived' THEN 'archive'
  END as tab_category
FROM projects p
LEFT JOIN customers c ON p.customer_id = c.id;

-- 10. RLS Policies for new tables
-- Enable RLS on new tables
ALTER TABLE project_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_pages ENABLE ROW LEVEL SECURITY;

-- Admin users can access all project versions
CREATE POLICY "Admin users can manage project versions" ON project_versions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Admin users can view all audit logs
CREATE POLICY "Admin users can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Admin users can manage status history
CREATE POLICY "Admin users can manage status history" ON project_status_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Admin users can manage maintenance pages
CREATE POLICY "Admin users can manage maintenance pages" ON maintenance_pages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- 11. Create function to safely transition project status
CREATE OR REPLACE FUNCTION transition_project_status(
  p_project_id uuid,
  p_new_status project_status_type,
  p_user_id uuid,
  p_reason text DEFAULT NULL
) RETURNS boolean AS $$
DECLARE
  v_old_status project_status_type;
  v_is_valid_transition boolean;
BEGIN
  -- Get current status
  SELECT project_status INTO v_old_status
  FROM projects
  WHERE id = p_project_id;
  
  -- Validate transition rules based on PRD
  v_is_valid_transition := CASE
    -- From draft
    WHEN v_old_status = 'draft' THEN 
      p_new_status IN ('template-internal', 'prospect-staging', 'archived')
    
    -- From template-internal
    WHEN v_old_status = 'template-internal' THEN 
      p_new_status IN ('template-public', 'draft', 'archived')
    
    -- From template-public
    WHEN v_old_status = 'template-public' THEN 
      p_new_status IN ('template-internal', 'archived')
    
    -- From prospect-staging
    WHEN v_old_status = 'prospect-staging' THEN 
      p_new_status IN ('live-customer', 'archived')
    
    -- From live-customer
    WHEN v_old_status = 'live-customer' THEN 
      p_new_status IN ('paused-maintenance', 'archived')
    
    -- From paused-maintenance
    WHEN v_old_status = 'paused-maintenance' THEN 
      p_new_status IN ('live-customer', 'archived')
    
    -- From archived
    WHEN v_old_status = 'archived' THEN 
      p_new_status IN ('draft', 'template-internal', 'prospect-staging', 'live-customer')
    
    ELSE false
  END;
  
  IF NOT v_is_valid_transition THEN
    RAISE EXCEPTION 'Invalid status transition from % to %', v_old_status, p_new_status;
  END IF;
  
  -- Update the status
  UPDATE projects
  SET project_status = p_new_status,
      updated_at = now()
  WHERE id = p_project_id;
  
  -- Record the transition
  INSERT INTO project_status_history (
    project_id, old_status, new_status, changed_by, reason
  ) VALUES (
    p_project_id, v_old_status, p_new_status, p_user_id, p_reason
  );
  
  -- Log the action
  INSERT INTO audit_logs (
    user_id, action_type, entity_type, entity_id, old_data, new_data
  ) VALUES (
    p_user_id, 
    'status_change', 
    'project', 
    p_project_id,
    jsonb_build_object('status', v_old_status),
    jsonb_build_object('status', p_new_status)
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment explaining the migration
COMMENT ON TABLE project_versions IS 'Stores versioned snapshots of projects for rollback and history';
COMMENT ON TABLE audit_logs IS 'Tracks all administrative actions for compliance and debugging';
COMMENT ON TABLE project_status_history IS 'Records all project status transitions with timestamps and reasons';
COMMENT ON TABLE maintenance_pages IS 'Stores maintenance page configuration for paused projects';
COMMENT ON COLUMN projects.project_status IS 'Current status in the project lifecycle as defined in the Admin Management PRD';
COMMENT ON COLUMN customers.account_type IS 'Customer account classification: prospect, customer, or inactive';

-- ============================================
-- MIGRATION 2: Fix Tab Categorization
-- ============================================

-- This migration is already included in the view creation above
-- The tab_category logic has been corrected to properly map:
-- - draft, template-internal, template-public → 'draft' tab
-- - prospect-staging, live-customer, paused-maintenance → 'active' tab  
-- - archived → 'archive' tab

-- ============================================
-- Verification Queries
-- ============================================

-- Verify all tables were created
SELECT 
    'Tables created' as check_type,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('project_versions', 'audit_logs', 'project_status_history', 'maintenance_pages');

-- Verify enum types were created
SELECT 
    'Enum types created' as check_type,
    COUNT(*) as count
FROM pg_type 
WHERE typname IN ('project_status_type', 'account_type');

-- Verify the view was created/updated
SELECT 
    'View created' as check_type,
    COUNT(*) as count
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name = 'project_management_view';

-- Check project status migration
SELECT 
    'Projects with status' as check_type,
    COUNT(*) as count
FROM projects 
WHERE project_status IS NOT NULL;