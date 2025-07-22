-- Drop the single-column unique index on subdomain that's preventing updates
-- This index conflicts with subdomain updates when deployment_domain is also involved

DROP INDEX IF EXISTS public.idx_projects_subdomain_unique;

-- Note: The composite index idx_projects_subdomain_domain_unique should remain
-- if it exists, allowing subdomain uniqueness per deployment domain