-- Update avatar storage to use folder-based structure (production best practice)

-- Drop all existing avatar policies
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Create new folder-based policies
-- Each user can only manage files in their own folder (user_id/*)

-- Drop new policies if they exist (in case of re-run)
DROP POLICY IF EXISTS "Users can upload to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update files in their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete files in their own folder" ON storage.objects;

CREATE POLICY "Users can upload to their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update files in their own folder"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete files in their own folder"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Note: This creates a structure like:
-- avatars/
--   ├── {user_id}/
--   │   └── avatar.jpg (or .png, .gif, etc.)
-- 
-- Benefits:
-- - Each user owns their folder
-- - Clean URLs: /avatars/{user_id}/avatar.jpg
-- - Easy to delete all user content
-- - Can add more files per user later
-- - Standard folder-based permissions model