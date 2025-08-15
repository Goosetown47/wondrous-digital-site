-- Create avatars storage bucket for user profile photos
INSERT INTO storage.buckets (id, name, public, avif_autodetection, allowed_mime_types, file_size_limit)
VALUES (
  'avatars',
  'avatars',
  true,  -- Public bucket for avatar images
  false,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  5242880  -- 5MB limit
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for avatars bucket
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = split_part(name, '-', 1)
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = split_part(name, '-', 1)
);

CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = split_part(name, '-', 1)
);