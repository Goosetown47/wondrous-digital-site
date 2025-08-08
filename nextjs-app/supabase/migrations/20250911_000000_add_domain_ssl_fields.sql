-- Add SSL state and verification details to project_domains table
ALTER TABLE project_domains 
ADD COLUMN IF NOT EXISTS ssl_state TEXT DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS verification_details JSONB;

-- Update any existing domains to have the default ssl_state
UPDATE project_domains 
SET ssl_state = 'PENDING' 
WHERE ssl_state IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN project_domains.ssl_state IS 'SSL certificate status: PENDING, INITIALIZING, ERROR, or READY';
COMMENT ON COLUMN project_domains.verification_details IS 'JSON object containing DNS verification details from Vercel';