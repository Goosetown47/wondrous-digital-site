-- Migration: Add RLS Policies for Pages
-- This migration adds Row Level Security policies for the pages table

-- Step 1: Enable RLS on pages table (if not already enabled)
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop any existing policies on pages
DO $$
DECLARE
  policy_rec RECORD;
BEGIN
  -- Loop through all policies on pages table and drop them
  FOR policy_rec IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'pages' 
    AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON pages', policy_rec.policyname);
  END LOOP;
END $$;

-- Step 3: Create new RLS policies

-- SELECT: Users can view pages in projects they have access to
CREATE POLICY "Users can view pages in their projects" ON pages
  FOR SELECT
  USING (
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN account_users au ON au.account_id = p.account_id
      WHERE au.user_id = auth.uid()
    )
  );

-- INSERT: Users with appropriate roles can create pages
CREATE POLICY "Users can create pages in their projects" ON pages
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN account_users au ON au.account_id = p.account_id
      WHERE au.user_id = auth.uid()
      AND au.role IN ('admin', 'staff', 'account_owner')
    )
  );

-- UPDATE: Users with appropriate roles can update pages
CREATE POLICY "Users can update pages in their projects" ON pages
  FOR UPDATE
  USING (
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN account_users au ON au.account_id = p.account_id
      WHERE au.user_id = auth.uid()
      AND au.role IN ('admin', 'staff', 'account_owner')
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN account_users au ON au.account_id = p.account_id
      WHERE au.user_id = auth.uid()
      AND au.role IN ('admin', 'staff', 'account_owner')
    )
  );

-- DELETE: Only admins can delete pages
CREATE POLICY "Only admins can delete pages" ON pages
  FOR DELETE
  USING (
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN account_users au ON au.account_id = p.account_id
      WHERE au.user_id = auth.uid()
      AND au.role = 'admin'
    )
  );

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pages_project_id ON pages(project_id);
CREATE INDEX IF NOT EXISTS idx_pages_project_path ON pages(project_id, path);

-- Step 5: Add updated_at trigger if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Check if trigger exists before creating
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_trigger 
        WHERE tgname = 'update_pages_updated_at'
    ) THEN
        CREATE TRIGGER update_pages_updated_at 
        BEFORE UPDATE ON pages 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Verify the migration
DO $$
BEGIN
  RAISE NOTICE 'Pages RLS policies created successfully';
END $$;