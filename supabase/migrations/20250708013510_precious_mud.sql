/*
  # Add New Project Types

  1. Updates
    - Modify CHECK constraint on project_type to include new types
    - Add new project types: main_site, landing_page
    
  2. Purpose
    - Better categorize customer sites based on their purpose
    - "main_site" represents the primary website for a customer
    - "landing_page" represents specific marketing landing pages
*/

-- Modify project_type constraint to include new types
ALTER TABLE projects 
DROP CONSTRAINT IF EXISTS projects_project_type_check;

ALTER TABLE projects 
ADD CONSTRAINT projects_project_type_check 
CHECK (project_type IN ('template', 'customer_site', 'main_site', 'landing_page'));

-- Update existing customer_site records to more specific types
-- Set all current customer_site projects to main_site by default
UPDATE projects
SET project_type = 'main_site'
WHERE project_type = 'customer_site' 
AND project_name ILIKE '%Main%';

-- Update projects with "landing" in the name to landing_page type
UPDATE projects
SET project_type = 'landing_page'
WHERE project_type = 'customer_site'
AND project_name ILIKE '%Landing%';

-- Update any remaining customer_site projects to main_site
UPDATE projects
SET project_type = 'main_site'
WHERE project_type = 'customer_site';