-- Migration: Add Project Management Fields
-- Adds fields needed for enhanced project management

-- Step 1: Add new columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES projects(id),
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Step 2: Generate slugs for existing projects
UPDATE projects 
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- Step 3: Make slug required and unique within an account
ALTER TABLE projects 
ALTER COLUMN slug SET NOT NULL;

-- Add unique constraint on account_id + slug
ALTER TABLE projects 
ADD CONSTRAINT projects_account_slug_unique UNIQUE (account_id, slug);

-- Step 4: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_archived_at ON projects(archived_at);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_template_id ON projects(template_id);

-- Step 5: Add trigger to auto-generate slug from name if not provided
CREATE OR REPLACE FUNCTION generate_project_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_generate_slug
  BEFORE INSERT OR UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION generate_project_slug();

-- Step 6: Add RLS policy for created_by field
-- Users can see who created projects in their accounts
CREATE POLICY "Users can view project creator" ON projects
  FOR SELECT
  USING (
    id IN (
      SELECT p.id FROM projects p
      JOIN account_users au ON au.account_id = p.account_id
      WHERE au.user_id = auth.uid()
    )
  );

-- Step 7: Add comment for documentation
COMMENT ON COLUMN projects.archived_at IS 'Timestamp when project was archived (soft delete)';
COMMENT ON COLUMN projects.created_by IS 'User ID who created this project';
COMMENT ON COLUMN projects.template_id IS 'Reference to project used as template for this project';
COMMENT ON COLUMN projects.slug IS 'URL-friendly identifier unique within account';

-- Verify the migration
DO $$
BEGIN
  RAISE NOTICE 'Project management fields added successfully';
END $$;