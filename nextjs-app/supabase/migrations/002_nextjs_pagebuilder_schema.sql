-- Drop existing tables if they exist (careful in production!)
DROP TABLE IF EXISTS project_domains CASCADE;
DROP TABLE IF EXISTS pages CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- Create new schema for Next.js multi-tenant PageBuilder

-- Projects table for multi-tenant support
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pages table with path-based routing
CREATE TABLE pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  path TEXT NOT NULL DEFAULT '/',
  title TEXT,
  sections JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, path)
);

-- Project domains for custom domain support
CREATE TABLE project_domains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  is_primary BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(domain)
);

-- Create indexes for performance
CREATE INDEX idx_projects_customer_id ON projects(customer_id);
CREATE INDEX idx_pages_project_id ON pages(project_id);
CREATE INDEX idx_pages_project_path ON pages(project_id, path);
CREATE INDEX idx_project_domains_project_id ON project_domains(project_id);
CREATE INDEX idx_project_domains_domain ON project_domains(domain);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_domains ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Users can create their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = customer_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = customer_id);

-- RLS Policies for pages (inherit from project ownership)
CREATE POLICY "Users can view pages of their projects" ON pages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = pages.project_id 
      AND projects.customer_id = auth.uid()
    )
  );

CREATE POLICY "Users can create pages in their projects" ON pages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = pages.project_id 
      AND projects.customer_id = auth.uid()
    )
  );

CREATE POLICY "Users can update pages in their projects" ON pages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = pages.project_id 
      AND projects.customer_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete pages from their projects" ON pages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = pages.project_id 
      AND projects.customer_id = auth.uid()
    )
  );

-- RLS Policies for project_domains (inherit from project ownership)
CREATE POLICY "Users can view domains of their projects" ON project_domains
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_domains.project_id 
      AND projects.customer_id = auth.uid()
    )
  );

CREATE POLICY "Users can add domains to their projects" ON project_domains
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_domains.project_id 
      AND projects.customer_id = auth.uid()
    )
  );

CREATE POLICY "Users can update domains of their projects" ON project_domains
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_domains.project_id 
      AND projects.customer_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove domains from their projects" ON project_domains
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_domains.project_id 
      AND projects.customer_id = auth.uid()
    )
  );

-- Public access for viewing published sites (no auth required)
CREATE POLICY "Public can view pages by domain" ON pages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_domains
      WHERE project_domains.project_id = pages.project_id
      AND project_domains.verified = true
    )
  );

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Temporarily disable RLS for testing (remove in production!)
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_domains DISABLE ROW LEVEL SECURITY;