-- Add unique constraint to project slug to ensure preview domains are unique
ALTER TABLE projects 
ADD CONSTRAINT projects_slug_unique UNIQUE (slug);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT projects_slug_unique ON projects IS 'Ensures project slugs are unique for preview domain routing';