-- Add description field to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add comment for documentation
COMMENT ON COLUMN projects.description IS 'Optional description or notes about the project';