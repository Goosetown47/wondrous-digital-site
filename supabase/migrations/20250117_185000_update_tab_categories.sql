-- Update project_management_view to support new tab categories
-- This adds Templates and Paused/Maintenance tabs

DROP VIEW IF EXISTS project_management_view;

CREATE VIEW project_management_view AS
SELECT 
  p.id,
  p.project_name,
  p.project_status,
  p.project_type,
  p.domain,
  p.subdomain,
  p.deployment_status,
  p.deployment_url,
  p.last_deployed_at,
  p.created_at,
  p.updated_at,
  c.id as customer_id,
  c.business_name,
  c.account_type,
  c.contact_email,
  CASE 
    WHEN p.project_status = 'draft' THEN 'draft'
    WHEN p.project_status IN ('template-internal', 'template-public') THEN 'templates'
    WHEN p.project_status IN ('prospect-staging', 'live-customer') THEN 'active'
    WHEN p.project_status = 'paused-maintenance' THEN 'paused'
    WHEN p.project_status = 'archived' THEN 'archive'
    ELSE 'draft' -- fallback
  END as tab_category
FROM projects p
LEFT JOIN customers c ON p.customer_id = c.id;

-- Add comment to document the change
COMMENT ON VIEW project_management_view IS 'Admin view for project management with enhanced tab categories including Templates and Paused/Maintenance tabs';