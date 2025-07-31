/*
  # Fix RLS Policies with Correct Auth Functions
  
  This migration fixes the RLS policies to use correct Supabase auth functions.
  The previous migration used auth.role() which doesn't exist in Supabase.
*/

-- First, drop all the incorrect policies from the previous migration
DROP POLICY IF EXISTS "Service role bypass for projects" ON projects;
DROP POLICY IF EXISTS "Service role bypass for pages" ON pages;
DROP POLICY IF EXISTS "Service role bypass for project_domains" ON project_domains;
DROP POLICY IF EXISTS "Authenticated users can view any project for development" ON projects;
DROP POLICY IF EXISTS "Authenticated users can view any pages for development" ON pages;
DROP POLICY IF EXISTS "Authenticated users can view any domains for development" ON project_domains;
DROP POLICY IF EXISTS "Authenticated users can update any project for development" ON projects;
DROP POLICY IF EXISTS "Authenticated users can insert pages for development" ON pages;
DROP POLICY IF EXISTS "Authenticated users can update pages for development" ON pages;
DROP POLICY IF EXISTS "Authenticated users can delete pages for development" ON pages;
DROP POLICY IF EXISTS "Anon can view projects with verified domains" ON projects;
DROP POLICY IF EXISTS "Anon can view pages by domain" ON pages;
DROP POLICY IF EXISTS "Anon can view verified domains" ON project_domains;

-- Create correct policies for projects table
-- Allow authenticated users to view all projects (for development)
CREATE POLICY "Authenticated users can view projects" ON projects
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to create projects
CREATE POLICY "Authenticated users can create projects" ON projects
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to update their own projects
CREATE POLICY "Authenticated users can update own projects" ON projects
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL AND customer_id = auth.uid());

-- Allow authenticated users to delete their own projects
CREATE POLICY "Authenticated users can delete own projects" ON projects
  FOR DELETE 
  USING (auth.uid() IS NOT NULL AND customer_id = auth.uid());

-- For development: Allow authenticated users to update any project
CREATE POLICY "Authenticated users can update any project dev" ON projects
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

-- Create correct policies for pages table
-- Allow authenticated users to view all pages (for development)
CREATE POLICY "Authenticated users can view pages" ON pages
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to manage pages
CREATE POLICY "Authenticated users can insert pages" ON pages
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update pages" ON pages
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete pages" ON pages
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Create correct policies for project_domains table
-- Allow authenticated users to view all domains (for development)
CREATE POLICY "Authenticated users can view domains" ON project_domains
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to manage domains
CREATE POLICY "Authenticated users can insert domains" ON project_domains
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update domains" ON project_domains
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete domains" ON project_domains
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Public access policies for published sites
-- Allow anyone to view projects that have verified domains
CREATE POLICY "Public can view projects with verified domains" ON projects
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM project_domains
      WHERE project_domains.project_id = projects.id
      AND project_domains.verified = true
    )
  );

-- Allow anyone to view pages for projects with verified domains
CREATE POLICY "Public can view pages for verified domains" ON pages
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM project_domains
      WHERE project_domains.project_id = pages.project_id
      AND project_domains.verified = true
    )
  );

-- Allow anyone to view verified domains
CREATE POLICY "Public can view verified domains" ON project_domains
  FOR SELECT 
  USING (verified = true);