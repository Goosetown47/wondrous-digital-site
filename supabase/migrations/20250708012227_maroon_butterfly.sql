/*
  # Multi-Project System Database Restructure

  1. New Tables
    - `projects` - Store information about website deployments
      - id (uuid, primary key)
      - customer_id (uuid, foreign key to customers, nullable for templates)
      - project_name (text) - descriptive name for the project
      - domain (text) - domain where project is deployed
      - project_type (text) - "template" or "customer_site"
      - template_id (uuid, self-reference to projects.id for cloned sites)
      - niche (text) - industry/category of the project
      - is_active (boolean)
      - created_at, updated_at (timestamptz)

  2. Table Updates
    - Add project_id to posts table and migrate data
    - Add project_id to external_links table and migrate data
    - Eventually remove customer_id columns after migration

  3. Security
    - Add RLS policies for projects table
    - Update RLS policies for affected tables

  4. Sample Data
    - Create template projects for different niches
    - Create customer projects based on templates
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id),
  project_name text NOT NULL,
  domain text,
  project_type text NOT NULL CHECK (project_type IN ('template', 'customer_site')),
  template_id uuid REFERENCES projects(id),
  niche text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes on projects table
CREATE INDEX IF NOT EXISTS projects_customer_id_idx ON projects(customer_id);
CREATE INDEX IF NOT EXISTS projects_domain_idx ON projects(domain);
CREATE INDEX IF NOT EXISTS projects_template_id_idx ON projects(template_id);
CREATE INDEX IF NOT EXISTS projects_niche_idx ON projects(niche);

-- Create trigger for updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Add project_id to posts table (without dropping customer_id yet)
ALTER TABLE posts ADD COLUMN project_id uuid REFERENCES projects(id);
CREATE INDEX IF NOT EXISTS posts_project_id_idx ON posts(project_id);

-- Add project_id to external_links table (without dropping customer_id yet)
ALTER TABLE external_links ADD COLUMN project_id uuid REFERENCES projects(id);
CREATE INDEX IF NOT EXISTS external_links_project_id_idx ON external_links(project_id);

-- Create RLS policies for projects
CREATE POLICY "Authenticated users can read projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    customer_id = (
      SELECT users.customer_id
      FROM users
      WHERE users.id = auth.uid()
    )
    OR 
    project_type = 'template'
    OR 
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create sample data for templates and customer projects
DO $$
DECLARE
    wondrous_id uuid;
    test_customer_id uuid;
    restaurant_template_id uuid;
    lawyer_template_id uuid;
    dentist_template_id uuid;
    test_project_id uuid;
BEGIN
    -- Get Wondrous Digital customer ID
    SELECT id INTO wondrous_id FROM customers WHERE business_name = 'Wondrous Digital' LIMIT 1;
    
    -- Get Test Business customer ID
    SELECT id INTO test_customer_id FROM customers WHERE business_name = 'Test Business' LIMIT 1;
    
    -- Only proceed if we found the customers
    IF wondrous_id IS NOT NULL AND test_customer_id IS NOT NULL THEN
        -- Create template projects
        INSERT INTO projects (customer_id, project_name, domain, project_type, niche, is_active)
        VALUES (wondrous_id, 'Restaurant Template', 'restaurant-template.wondrousdigital.com', 'template', 'restaurant', true)
        RETURNING id INTO restaurant_template_id;
        
        INSERT INTO projects (customer_id, project_name, domain, project_type, niche, is_active)
        VALUES (wondrous_id, 'Lawyer Template', 'lawyer-template.wondrousdigital.com', 'template', 'legal', true)
        RETURNING id INTO lawyer_template_id;
        
        INSERT INTO projects (customer_id, project_name, domain, project_type, niche, is_active)
        VALUES (wondrous_id, 'Dentist Template', 'dentist-template.wondrousdigital.com', 'template', 'healthcare', true)
        RETURNING id INTO dentist_template_id;
        
        -- Create customer project based on template
        INSERT INTO projects (customer_id, project_name, domain, project_type, template_id, niche, is_active)
        VALUES (test_customer_id, 'Main Website', 'testbusiness.com', 'customer_site', restaurant_template_id, 'restaurant', true)
        RETURNING id INTO test_project_id;
        
        -- Create landing page project for test customer
        INSERT INTO projects (customer_id, project_name, domain, project_type, niche, is_active)
        VALUES (test_customer_id, 'Holiday Special Landing Page', 'holiday.testbusiness.com', 'customer_site', 'restaurant', true);
        
        -- Assign existing posts to the test project
        UPDATE posts 
        SET project_id = test_project_id
        WHERE customer_id = test_customer_id;
        
        -- Create sample external links for test project
        INSERT INTO external_links (customer_id, project_id, gohighlevel_url, searchatlas_url, stripe_portal_url)
        VALUES (test_customer_id, test_project_id, 
                'https://example.gohighlevel.com/testbusiness',
                'https://example.searchatlas.com/testbusiness',
                'https://dashboard.stripe.com/test/customers/testbusiness');
    END IF;
END
$$;

-- Modify RLS policy for posts to use project_id
DROP POLICY IF EXISTS "Public can read published posts with no customer_id" ON posts;
DROP POLICY IF EXISTS "Users can read posts for their customer" ON posts;

CREATE POLICY "Public can read public project posts"
  ON posts
  FOR SELECT
  TO public
  USING (
    published_at <= now() 
    AND EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = posts.project_id
      AND (
        projects.customer_id IS NULL
        OR projects.project_type = 'template'
      )
    )
  );

CREATE POLICY "Users can read posts for their projects"
  ON posts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN users ON users.customer_id = projects.customer_id
      WHERE projects.id = posts.project_id
      AND users.id = auth.uid()
    )
    OR 
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Modify RLS policy for external_links to use project_id
DROP POLICY IF EXISTS "Users can read external links for their customer" ON external_links;

CREATE POLICY "Users can read external links for their projects"
  ON external_links
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN users ON users.customer_id = projects.customer_id
      WHERE projects.id = external_links.project_id
      AND users.id = auth.uid()
    )
    OR 
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- After confirming data migration is successful, remove customer_id columns
-- These statements are commented out for safety - uncomment after verifying data
-- ALTER TABLE posts DROP COLUMN customer_id;
-- ALTER TABLE external_links DROP COLUMN customer_id;