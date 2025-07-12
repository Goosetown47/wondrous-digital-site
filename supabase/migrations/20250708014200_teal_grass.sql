/*
  # Create Views for Project Context

  1. New Views
    - `project_details_view` - Combines project info with customer details
    - `project_stats_view` - Provides metrics and statistics for each project

  2. Purpose
    - Simplify queries for the dashboard
    - Provide joined data from multiple tables
    - Enable more efficient project context displays
*/

-- Create a view that joins projects with customers for easier querying
CREATE OR REPLACE VIEW project_details_view AS
SELECT
  p.id,
  p.project_name,
  p.domain,
  p.project_type,
  p.niche,
  p.customer_id,
  p.template_id,
  p.is_active,
  c.business_name AS customer_business_name,
  c.contact_email AS customer_email,
  c.is_active AS customer_is_active,
  t.project_name AS template_name,
  t.niche AS template_niche
FROM
  projects p
LEFT JOIN
  customers c ON p.customer_id = c.id
LEFT JOIN
  projects t ON p.template_id = t.id;

-- Create a view for project statistics
CREATE OR REPLACE VIEW project_stats_view AS
SELECT
  p.id AS project_id,
  p.project_name,
  p.customer_id,
  COUNT(DISTINCT posts.id) AS post_count,
  MAX(posts.published_at) AS latest_post_date,
  COUNT(DISTINCT el.id) AS external_links_count
FROM
  projects p
LEFT JOIN
  posts ON p.id = posts.project_id
LEFT JOIN
  external_links el ON p.id = el.project_id
GROUP BY
  p.id, p.project_name, p.customer_id;