-- Add include_www field to project_domains table
-- This field determines whether the www subdomain should be automatically included

ALTER TABLE project_domains 
ADD COLUMN IF NOT EXISTS include_www BOOLEAN DEFAULT true;

-- Set existing apex domains to include www
UPDATE project_domains 
SET include_www = true 
WHERE domain NOT LIKE 'www.%';

-- Set existing www domains to false (they're companions, not primary)
UPDATE project_domains 
SET include_www = false 
WHERE domain LIKE 'www.%';

-- Add comment for documentation
COMMENT ON COLUMN project_domains.include_www IS 'Whether to include www subdomain for apex domains (ignored for subdomains)';