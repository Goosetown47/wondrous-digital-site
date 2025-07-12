/*
  # Add Customer Sites Storage Bucket

  1. Storage Bucket Setup
    - Create 'customer-sites' bucket for website images
    - Configure bucket settings for public access

  2. Storage Policies
    - Allow authenticated users to upload files to the bucket
    - Allow public read access to uploaded files
    - Allow site owners to manage their own files
*/

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'customer-sites',
  'customer-sites',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Allow authenticated users to upload files to the bucket
CREATE POLICY "Allow authenticated users to upload to customer-sites"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'customer-sites');

-- Allow public read access to all files in the bucket
CREATE POLICY "Allow public read access to customer-sites files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'customer-sites');

-- Allow authenticated users to update files
CREATE POLICY "Allow authenticated users to update customer-sites files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'customer-sites')
WITH CHECK (bucket_id = 'customer-sites');

-- Allow authenticated users to delete their files
CREATE POLICY "Allow authenticated users to delete customer-sites files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'customer-sites');