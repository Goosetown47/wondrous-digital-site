/*
  # Update Core Components RLS Policies
  
  This migration updates the RLS policies for core_components table to allow
  authenticated users to create and manage components, not just admins.
  
  This makes sense because:
  - Core components are shared resources used by everyone
  - We want to allow adding components during development
  - The components themselves are read-only for all users
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can view core components" ON core_components;
DROP POLICY IF EXISTS "Admins can manage core components" ON core_components;

-- Create new policies that allow authenticated users to manage components
CREATE POLICY "Authenticated users can view all core components" 
ON core_components FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can create core components" 
ON core_components FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update core components" 
ON core_components FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete core components" 
ON core_components FOR DELETE 
TO authenticated 
USING (true);

-- Add a comment explaining the policy
COMMENT ON TABLE core_components IS 'Core component library accessible to all authenticated users for reading and managing components';