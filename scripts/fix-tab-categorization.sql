-- Fix tab categorization to properly sort projects into tabs
-- This migration updates the project_management_view

CREATE OR REPLACE VIEW project_management_view AS
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
    WHEN p.project_status IN ('archived', 'paused-maintenance') THEN 'archive'
    WHEN p.project_status IN ('template-internal', 'template-public', 'prospect-staging', 'live-customer') THEN 'active'
    ELSE 'draft' -- fallback, shouldn't happen
  END as tab_category
FROM projects p
LEFT JOIN customers c ON p.customer_id = c.id;