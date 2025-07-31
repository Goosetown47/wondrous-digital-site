/*
  # Fix Project Isolation
  
  This migration updates the RLS policies to properly isolate projects by user.
  Users should only see their own projects, not all projects.
*/

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view projects" ON projects;

-- Create a new policy that only allows users to see their own projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT 
  USING (auth.uid() = customer_id);

-- Keep the existing policies for create, update, and delete as they already check ownership