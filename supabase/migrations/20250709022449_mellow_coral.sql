/*
  # Fix storage RLS policies for section preview image uploads

  1. Storage Bucket Setup
    - Ensure the 'wondrous-admin' bucket exists
    - Configure bucket settings for public access

  2. Storage Policies
    - Allow authenticated users to upload files to section-previews folder
    - Allow public read access to uploaded files
    - Allow authenticated users to delete their own uploads
*/

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wondrous-admin',
  'wondrous-admin',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Allow authenticated users to upload files to the section-previews folder
CREATE POLICY "Allow authenticated users to upload section previews"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'wondrous-admin' 
  AND (storage.foldername(name))[1] = 'section-previews'
);

-- Allow public read access to all files in the bucket
CREATE POLICY "Allow public read access to wondrous-admin files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'wondrous-admin');

-- Allow authenticated users to delete files they uploaded
CREATE POLICY "Allow authenticated users to delete their uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'wondrous-admin');

-- Allow authenticated users to update/overwrite files
CREATE POLICY "Allow authenticated users to update files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'wondrous-admin')
WITH CHECK (bucket_id = 'wondrous-admin');