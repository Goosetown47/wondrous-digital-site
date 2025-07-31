-- Fix projects.theme_id foreign key to reference library_items instead of themes table

-- First, drop the existing foreign key constraint
ALTER TABLE projects 
DROP CONSTRAINT IF EXISTS projects_theme_id_fkey;

-- Add new foreign key constraint to library_items table
ALTER TABLE projects
ADD CONSTRAINT projects_theme_id_fkey 
FOREIGN KEY (theme_id) 
REFERENCES library_items(id) 
ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_projects_theme_id ON projects(theme_id);

-- Add check to ensure only theme type library items can be referenced
CREATE OR REPLACE FUNCTION check_theme_type()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.theme_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM library_items 
      WHERE id = NEW.theme_id 
      AND type = 'theme'
    ) THEN
      RAISE EXCEPTION 'Referenced library_item must be of type theme';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate theme references
DROP TRIGGER IF EXISTS validate_project_theme ON projects;
CREATE TRIGGER validate_project_theme
  BEFORE INSERT OR UPDATE OF theme_id ON projects
  FOR EACH ROW
  EXECUTE FUNCTION check_theme_type();