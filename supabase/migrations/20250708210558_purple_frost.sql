/*
  # Visual Page Builder System Schema

  1. New Tables
    - `site_styles` - Project styling configuration (colors, fonts, logo)
    - `section_templates` - Reusable section templates (hero, features, etc)
    - `website_templates` - Complete website templates for different niches
    - `pages` - Individual pages with section configurations
    - `prospect_sites` - Demo sites for prospective customers

  2. Security
    - Enable RLS on all tables
    - Create policies for multi-tenant access
    - Secure templates access for admins
    - Allow appropriate access for customers to their own content

  3. Relationships
    - Projects have many pages and one site_style
    - Pages have many sections (stored as JSON)
    - Website templates can be used to create projects
    - Section templates are used within pages
*/

-- Create site_styles table for project-specific styling
CREATE TABLE IF NOT EXISTS site_styles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  logo_url text,
  primary_color text,
  secondary_color text,
  primary_font text,
  secondary_font text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on site_styles project_id
CREATE INDEX IF NOT EXISTS site_styles_project_id_idx ON site_styles(project_id);

-- Create section_templates table for reusable section components
CREATE TABLE IF NOT EXISTS section_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type text NOT NULL,
  template_name text NOT NULL,
  component_code text,
  preview_image_url text,
  customizable_fields jsonb DEFAULT '{}',
  category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create website_templates table for complete website templates
CREATE TABLE IF NOT EXISTS website_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text NOT NULL,
  niche text,
  preview_image_url text,
  sections_config jsonb DEFAULT '[]',
  styles_config jsonb DEFAULT '{}',
  sample_content jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create pages table for individual page layouts
CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  page_name text NOT NULL,
  slug text NOT NULL,
  sections jsonb DEFAULT '[]',
  page_type text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(project_id, slug)
);

-- Create index on pages project_id
CREATE INDEX IF NOT EXISTS pages_project_id_idx ON pages(project_id);
CREATE INDEX IF NOT EXISTS pages_slug_idx ON pages(slug);

-- Create prospect_sites table for demo sites
CREATE TABLE IF NOT EXISTS prospect_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_name text NOT NULL,
  prospect_email text NOT NULL,
  template_id uuid REFERENCES website_templates(id),
  staging_domain text,
  content_overrides jsonb DEFAULT '{}',
  status text DEFAULT 'active' CHECK (status IN ('active', 'converted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Create index on prospect_sites template_id
CREATE INDEX IF NOT EXISTS prospect_sites_template_id_idx ON prospect_sites(template_id);
CREATE INDEX IF NOT EXISTS prospect_sites_prospect_email_idx ON prospect_sites(prospect_email);

-- Create updated_at triggers for new tables
CREATE TRIGGER update_site_styles_updated_at
  BEFORE UPDATE ON site_styles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_section_templates_updated_at
  BEFORE UPDATE ON section_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_website_templates_updated_at
  BEFORE UPDATE ON website_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prospect_sites_updated_at
  BEFORE UPDATE ON prospect_sites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE site_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_sites ENABLE ROW LEVEL SECURITY;

-- RLS policies for site_styles
CREATE POLICY "Users can read site_styles for their projects"
  ON site_styles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN users ON users.customer_id = projects.customer_id
      WHERE projects.id = site_styles.project_id
      AND users.id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage site_styles"
  ON site_styles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS policies for section_templates (admin only)
CREATE POLICY "Everyone can read section_templates"
  ON section_templates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage section_templates"
  ON section_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS policies for website_templates
CREATE POLICY "Everyone can read active website_templates"
  ON website_templates
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage website_templates"
  ON website_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS policies for pages
CREATE POLICY "Users can read pages for their projects"
  ON pages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN users ON users.customer_id = projects.customer_id
      WHERE projects.id = pages.project_id
      AND users.id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage pages"
  ON pages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS policies for prospect_sites (admin only)
CREATE POLICY "Admins can read prospect_sites"
  ON prospect_sites
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage prospect_sites"
  ON prospect_sites
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Public policy for published pages
CREATE POLICY "Public can read published pages"
  ON pages
  FOR SELECT
  TO public
  USING (
    status = 'published' AND
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = pages.project_id
      AND projects.is_active = true
    )
  );