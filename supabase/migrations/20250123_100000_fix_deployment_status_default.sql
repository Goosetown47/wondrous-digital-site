-- Fix deployment_status default value and clear incorrect statuses

-- Add deployment_status column if it doesn't exist
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS deployment_status VARCHAR(50) DEFAULT 'none';

-- Add deployment_url column if it doesn't exist  
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS deployment_url TEXT;

-- Add last_deployed_at column if it doesn't exist
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS last_deployed_at TIMESTAMP WITH TIME ZONE;

-- Update any projects that show as 'deployed' but don't have a netlify_site_id
-- These are false positives from testing
UPDATE public.projects
SET deployment_status = 'none'
WHERE deployment_status = 'deployed' 
AND netlify_site_id IS NULL;

-- Update any projects that have a netlify_site_id but no deployment_url
-- These need to be re-verified
UPDATE public.projects
SET deployment_status = 'pending'
WHERE netlify_site_id IS NOT NULL 
AND deployment_url IS NULL
AND deployment_status = 'deployed';

-- Add comment for clarity
COMMENT ON COLUMN public.projects.deployment_status IS 'Deployment status: none, pending, deploying, deployed, failed';