-- Manual migration steps to apply via Supabase SQL Editor
-- Run these commands in the SQL editor at https://supabase.com/dashboard/project/bpdhbxvsguklkbusqtke/sql/new

-- 1. Add netlify_site_name column
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS netlify_site_name VARCHAR(255);

-- 2. Add comment for documentation
COMMENT ON COLUMN public.projects.netlify_site_name IS 'The Netlify site name (e.g., project-123-dentist) for this project';

-- 3. Drop netlify_primary_domain column if it exists
ALTER TABLE public.projects
DROP COLUMN IF EXISTS netlify_primary_domain;

-- 4. Create unique index on netlify_site_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_netlify_site_id_unique 
ON public.projects(netlify_site_id) 
WHERE netlify_site_id IS NOT NULL;

-- 5. Clear netlify_site_cache table
TRUNCATE TABLE public.netlify_site_cache;

-- 6. Verify changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND column_name IN ('netlify_site_name', 'netlify_site_id', 'netlify_primary_domain')
ORDER BY column_name;