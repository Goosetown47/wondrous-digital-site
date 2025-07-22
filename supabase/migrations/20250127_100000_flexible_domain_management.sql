-- Add flexible domain management fields

-- Update projects table for better domain handling
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS deployment_domain VARCHAR(255) DEFAULT 'wondrousdigital.com';

-- Update customers table to store custom domains
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS custom_domains TEXT[] DEFAULT '{}';

-- Create index for domain queries
CREATE INDEX IF NOT EXISTS idx_projects_deployment_domain 
ON public.projects(deployment_domain);

-- Update unique constraint to include domain
DROP INDEX IF EXISTS idx_projects_subdomain_unique;

-- Create composite unique index for subdomain + domain combination
CREATE UNIQUE INDEX idx_projects_subdomain_domain_unique 
ON public.projects(subdomain, deployment_domain) 
WHERE subdomain IS NOT NULL;

-- Function to get full deployment URL
CREATE OR REPLACE FUNCTION get_deployment_url(
    p_subdomain VARCHAR,
    p_domain VARCHAR,
    p_deployment_url TEXT
) RETURNS TEXT AS $$
BEGIN
    -- If deployment_url is already set, return it
    IF p_deployment_url IS NOT NULL THEN
        RETURN p_deployment_url;
    END IF;
    
    -- Otherwise, construct from subdomain and domain
    IF p_subdomain IS NOT NULL AND p_domain IS NOT NULL THEN
        IF p_subdomain = '' THEN
            -- Root domain (no subdomain)
            RETURN 'https://' || p_domain;
        ELSE
            -- With subdomain
            RETURN 'https://' || p_subdomain || '.' || p_domain;
        END IF;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update project_management_view to include new fields and computed URL
DROP VIEW IF EXISTS project_management_view CASCADE;
CREATE VIEW project_management_view AS
SELECT 
    p.id,
    p.project_name,
    p.project_type,
    p.project_status,
    p.domain,
    p.subdomain,
    p.deployment_domain,
    p.netlify_site_id,
    p.deployment_status,
    p.deployment_url,
    get_deployment_url(p.subdomain, p.deployment_domain, p.deployment_url) as computed_deployment_url,
    p.last_deployed_at,
    p.created_at,
    p.updated_at,
    p.customer_id,
    c.business_name,
    c.account_type,
    c.contact_email,
    c.custom_domains,
    -- Categorize projects into tabs based on status
    CASE 
        WHEN p.project_status = 'draft' THEN 'draft'
        WHEN p.project_status IN ('template-internal', 'template-public') THEN 'templates'
        WHEN p.project_status IN ('prospect-staging', 'live-customer') THEN 'active'
        WHEN p.project_status = 'paused-maintenance' THEN 'paused'
        WHEN p.project_status = 'archived' THEN 'archive'
        ELSE 'draft'
    END AS tab_category
FROM projects p
LEFT JOIN customers c ON p.customer_id = c.id;

-- Grant permissions
GRANT SELECT ON project_management_view TO authenticated;

-- Skip deployment_history table update as it doesn't exist yet

-- Function to validate domain format
CREATE OR REPLACE FUNCTION is_valid_domain(domain_name TEXT) RETURNS BOOLEAN AS $$
BEGIN
    -- Basic domain validation regex
    RETURN domain_name ~* '^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add check constraint for domain validation
ALTER TABLE public.projects
ADD CONSTRAINT check_deployment_domain_format 
CHECK (deployment_domain IS NULL OR is_valid_domain(deployment_domain));

-- Add comments for documentation
COMMENT ON COLUMN public.projects.deployment_domain IS 'The base domain for deployment (e.g., wondrousdigital.com or customer domain)';
COMMENT ON COLUMN public.customers.custom_domains IS 'Array of custom domains owned by the customer';
COMMENT ON FUNCTION get_deployment_url IS 'Computes the full deployment URL from subdomain and domain';