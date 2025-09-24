-- Storage Policies for Three-Bucket Architecture
-- IMPORTANT: Create these buckets manually in Supabase Dashboard first:
-- 1. lab-assets (PRIVATE - admin only)
-- 2. library-assets (PUBLIC - published templates)  
-- 3. project-assets (PUBLIC - user uploads)

-- =========================================
-- LAB-ASSETS BUCKET (Admin Only)
-- =========================================

-- Policy: Only admins and staff can access lab assets
CREATE POLICY "Admins can manage lab assets"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'lab-assets' AND 
  EXISTS (
    SELECT 1 FROM account_users au
    WHERE au.user_id = auth.uid() 
    AND au.role IN ('admin', 'staff')
  )
)
WITH CHECK (
  bucket_id = 'lab-assets' AND 
  EXISTS (
    SELECT 1 FROM account_users au
    WHERE au.user_id = auth.uid() 
    AND au.role IN ('admin', 'staff')
  )
);

-- =========================================
-- LIBRARY-ASSETS BUCKET (Public Read, Admin Write)
-- =========================================

-- Policy: Anyone can view library assets (for templates)
CREATE POLICY "Anyone can view library assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'library-assets');

-- Policy: Only admins can upload to library
CREATE POLICY "Admins can upload library assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'library-assets' AND
  EXISTS (
    SELECT 1 FROM account_users au
    WHERE au.user_id = auth.uid() 
    AND au.role IN ('admin', 'staff')
  )
);

-- Policy: Only admins can update library assets
CREATE POLICY "Admins can update library assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'library-assets' AND
  EXISTS (
    SELECT 1 FROM account_users au
    WHERE au.user_id = auth.uid() 
    AND au.role IN ('admin', 'staff')
  )
)
WITH CHECK (
  bucket_id = 'library-assets' AND
  EXISTS (
    SELECT 1 FROM account_users au
    WHERE au.user_id = auth.uid() 
    AND au.role IN ('admin', 'staff')
  )
);

-- Policy: Only admins can delete library assets
CREATE POLICY "Admins can delete library assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'library-assets' AND
  EXISTS (
    SELECT 1 FROM account_users au
    WHERE au.user_id = auth.uid() 
    AND au.role IN ('admin', 'staff')
  )
);

-- =========================================
-- PROJECT-ASSETS BUCKET (User Project Uploads)
-- =========================================

-- Policy: Users can upload to their own project folders
CREATE POLICY "Users can upload project assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-assets' AND
  -- Check if the user has access to this project
  EXISTS (
    SELECT 1 FROM projects p
    JOIN account_users au ON au.account_id = p.account_id
    WHERE au.user_id = auth.uid()
    AND p.id::text = (storage.foldername(name))[1]
  )
);

-- Policy: Anyone can view project assets (for public websites)
CREATE POLICY "Project assets are publicly viewable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-assets');

-- Policy: Users can update their own project assets
CREATE POLICY "Users can update project assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-assets' AND
  EXISTS (
    SELECT 1 FROM projects p
    JOIN account_users au ON au.account_id = p.account_id
    WHERE au.user_id = auth.uid()
    AND p.id::text = (storage.foldername(name))[1]
  )
)
WITH CHECK (
  bucket_id = 'project-assets' AND
  EXISTS (
    SELECT 1 FROM projects p
    JOIN account_users au ON au.account_id = p.account_id
    WHERE au.user_id = auth.uid()
    AND p.id::text = (storage.foldername(name))[1]
  )
);

-- Policy: Users can delete their own project assets
CREATE POLICY "Users can delete project assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-assets' AND
  EXISTS (
    SELECT 1 FROM projects p
    JOIN account_users au ON au.account_id = p.account_id
    WHERE au.user_id = auth.uid()
    AND p.id::text = (storage.foldername(name))[1]
  )
);

-- =========================================
-- File Size Limits (Optional - Add if needed)
-- =========================================

-- Add a function to check file size (10MB limit)
CREATE OR REPLACE FUNCTION check_file_size()
RETURNS trigger AS $$
BEGIN
  -- 10MB = 10 * 1024 * 1024 = 10485760 bytes
  IF (NEW.metadata->>'size')::bigint > 10485760 THEN
    RAISE EXCEPTION 'File size exceeds 10MB limit';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply file size check to all buckets (optional)
-- CREATE TRIGGER check_lab_assets_size
-- BEFORE INSERT ON storage.objects
-- FOR EACH ROW
-- WHEN (NEW.bucket_id = 'lab-assets')
-- EXECUTE FUNCTION check_file_size();

-- CREATE TRIGGER check_library_assets_size
-- BEFORE INSERT ON storage.objects
-- FOR EACH ROW
-- WHEN (NEW.bucket_id = 'library-assets')
-- EXECUTE FUNCTION check_file_size();

-- CREATE TRIGGER check_project_assets_size
-- BEFORE INSERT ON storage.objects
-- FOR EACH ROW
-- WHEN (NEW.bucket_id = 'project-assets')
-- EXECUTE FUNCTION check_file_size();