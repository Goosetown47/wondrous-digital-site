/*
  # Create Blog Posts Table

  1. New Tables
    - `posts`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `slug` (text, unique, not null)
      - `content` (text, markdown content)
      - `excerpt` (text, short description)
      - `author_name` (text, not null)
      - `author_avatar` (text, optional URL)
      - `published_at` (timestamptz, not null)
      - `featured_image` (text, optional URL)
      - `read_time` (integer, estimated minutes)
      - `tags` (text array, for categorization)
      - `created_at` (timestamptz, auto-generated)
      - `updated_at` (timestamptz, auto-generated)

  2. Security
    - Enable RLS on `posts` table
    - Add policy for public read access to published posts
    - Add policy for authenticated users to manage posts (if needed later)

  3. Indexes
    - Index on slug for fast lookups
    - Index on published_at for ordering
    - Index on tags for filtering
*/

-- Create the posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text,
  excerpt text,
  author_name text NOT NULL,
  author_avatar text,
  published_at timestamptz NOT NULL DEFAULT now(),
  featured_image text,
  read_time integer,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (anyone can read published posts)
CREATE POLICY "Public can read published posts"
  ON posts
  FOR SELECT
  TO public
  USING (published_at <= now());

-- Create policy for authenticated users to insert posts (optional - for admin access)
CREATE POLICY "Authenticated users can insert posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy for authenticated users to update posts (optional - for admin access)
CREATE POLICY "Authenticated users can update posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for authenticated users to delete posts (optional - for admin access)
CREATE POLICY "Authenticated users can delete posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS posts_slug_idx ON posts(slug);
CREATE INDEX IF NOT EXISTS posts_published_at_idx ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS posts_tags_idx ON posts USING GIN(tags);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();