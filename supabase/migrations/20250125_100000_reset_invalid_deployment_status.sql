-- Reset invalid deployment statuses
-- A project should only show as 'deployed' if it has both netlify_site_id AND deployment_url

-- Reset deployment status for projects that claim to be deployed but have no Netlify site
UPDATE public.projects
SET 
  deployment_status = 'none',
  updated_at = NOW()
WHERE 
  deployment_status = 'deployed' 
  AND (netlify_site_id IS NULL OR deployment_url IS NULL);

-- Also reset status for projects that have other invalid deployment statuses
UPDATE public.projects
SET 
  deployment_status = 'none',
  updated_at = NOW()
WHERE 
  deployment_status NOT IN ('none', 'pending', 'deploying', 'deployed', 'failed')
  OR deployment_status IS NULL;

-- Add a check constraint to ensure deployment_status is valid
ALTER TABLE public.projects
DROP CONSTRAINT IF EXISTS check_deployment_status_valid;

ALTER TABLE public.projects
ADD CONSTRAINT check_deployment_status_valid 
CHECK (deployment_status IN ('none', 'pending', 'deploying', 'deployed', 'failed'));