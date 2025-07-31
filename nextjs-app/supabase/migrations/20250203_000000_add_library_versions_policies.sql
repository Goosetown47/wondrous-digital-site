/*
  # Add RLS policies for library_versions table
  
  This migration adds the missing Row Level Security policies for the library_versions table
  to allow proper version snapshot creation and viewing.
*/

-- Enable RLS on library_versions if not already enabled
ALTER TABLE library_versions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Staff and admins can manage library versions" ON library_versions;
DROP POLICY IF EXISTS "Users can view versions of published items" ON library_versions;
DROP POLICY IF EXISTS "Creators can view their own versions" ON library_versions;

-- Policy for staff and admins to manage version history
CREATE POLICY "Staff and admins can manage library versions" ON library_versions
  FOR ALL TO authenticated
  USING (public.has_role(ARRAY['staff', 'admin']))
  WITH CHECK (public.has_role(ARRAY['staff', 'admin']));

-- Policy for users to view version history of published items
CREATE POLICY "Users can view versions of published items" ON library_versions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM library_items 
      WHERE library_items.id = library_versions.library_item_id 
      AND library_items.published = true
    )
  );

-- Policy for creators to view their own version history
CREATE POLICY "Creators can view their own versions" ON library_versions
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM library_items 
      WHERE library_items.id = library_versions.library_item_id 
      AND library_items.created_by = auth.uid()
    )
  );