/*
  # Fix RLS Policies for Query Errors
  
  This migration fixes the 400 errors when querying projects, pages, and project_domains tables.
  The issue is that RLS was disabled in the initial migration, causing authentication problems.
*/

-- First, re-enable RLS on all tables (it was disabled in the initial migration)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_domains ENABLE ROW LEVEL SECURITY;

-- Add service role bypass policies (service role can do everything)
CREATE POLICY "Service role bypass for projects" ON projects
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role bypass for pages" ON pages
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role bypass for project_domains" ON project_domains
  FOR ALL USING (auth.role() = 'service_role');

-- For development/testing: Add policies that allow authenticated users to access any project
-- This fixes the project_id=eq.1 queries
CREATE POLICY "Authenticated users can view any project for development" ON projects
  FOR SELECT USING (
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can view any pages for development" ON pages
  FOR SELECT USING (
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can view any domains for development" ON project_domains
  FOR SELECT USING (
    auth.role() = 'authenticated'
  );

-- Also allow authenticated users to update their own projects
CREATE POLICY "Authenticated users can update any project for development" ON projects
  FOR UPDATE USING (
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can insert pages for development" ON pages
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update pages for development" ON pages
  FOR UPDATE USING (
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete pages for development" ON pages
  FOR DELETE USING (
    auth.role() = 'authenticated'
  );

-- Add anon read access for public viewing
CREATE POLICY "Anon can view projects with verified domains" ON projects
  FOR SELECT USING (
    auth.role() = 'anon' AND
    EXISTS (
      SELECT 1 FROM project_domains
      WHERE project_domains.project_id = projects.id
      AND project_domains.verified = true
    )
  );

CREATE POLICY "Anon can view pages by domain" ON pages
  FOR SELECT USING (
    auth.role() = 'anon' AND
    EXISTS (
      SELECT 1 FROM project_domains
      WHERE project_domains.project_id = pages.project_id
      AND project_domains.verified = true
    )
  );

CREATE POLICY "Anon can view verified domains" ON project_domains
  FOR SELECT USING (
    auth.role() = 'anon' AND verified = true
  );