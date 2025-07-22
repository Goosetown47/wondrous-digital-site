-- Ensure deployment_domain column exists in projects table
-- This column is needed for flexible domain management

-- Add deployment_domain column if it doesn't exist
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS deployment_domain VARCHAR(255) DEFAULT 'wondrousdigital.com';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_projects_deployment_domain 
ON public.projects(deployment_domain);

-- Update any NULL values to default
UPDATE public.projects
SET deployment_domain = 'wondrousdigital.com'
WHERE deployment_domain IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.projects.deployment_domain IS 'The base domain for deployment (e.g., wondrousdigital.com or customer domain)';