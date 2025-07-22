-- Add netlify_site_name to projects table for better tracking
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS netlify_site_name VARCHAR(255);

-- Add comment for documentation
COMMENT ON COLUMN public.projects.netlify_site_name IS 'The Netlify site name (e.g., project-123-dentist) for this project';

-- Drop the netlify_primary_domain column as it causes confusion
ALTER TABLE public.projects
DROP COLUMN IF EXISTS netlify_primary_domain;

-- Update the unique constraint to be on netlify_site_id instead of domain
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_netlify_site_id_unique 
ON public.projects(netlify_site_id) 
WHERE netlify_site_id IS NOT NULL;

-- First clear any incorrect deployment URLs
UPDATE public.projects 
SET deployment_url = NULL 
WHERE deployment_url IN ('wondrousdigital.com', 'https://wondrousdigital.com', 'http://wondrousdigital.com');

-- Function to validate deployment URL
CREATE OR REPLACE FUNCTION validate_deployment_url(url TEXT) RETURNS BOOLEAN AS $$
BEGIN
    -- Prevent deploying to bare wondrousdigital.com
    IF url IN ('wondrousdigital.com', 'https://wondrousdigital.com', 'http://wondrousdigital.com') THEN
        RAISE EXCEPTION 'Cannot deploy project to main marketing domain. Use a subdomain instead.';
    END IF;
    
    -- Basic URL validation
    IF url IS NULL OR url = '' THEN
        RETURN TRUE; -- Allow NULL values
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add check constraint for deployment_url
ALTER TABLE public.projects
ADD CONSTRAINT check_deployment_url_valid 
CHECK (deployment_url IS NULL OR validate_deployment_url(deployment_url));

-- Clear the netlify_site_cache table as it's based on wrong assumptions
TRUNCATE TABLE public.netlify_site_cache;