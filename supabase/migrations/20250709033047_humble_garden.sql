/*
  # Add SEO Fields to Pages Table

  1. New Columns
    - `meta_title` (text) - SEO title for page
    - `meta_description` (text) - SEO meta description

  2. Purpose
    - Support page-level SEO optimization
    - Allow customization of title and description for search engines
    - Improve site discoverability and SEO performance
*/

-- Add SEO fields to pages table
ALTER TABLE pages 
ADD COLUMN IF NOT EXISTS meta_title text;

ALTER TABLE pages 
ADD COLUMN IF NOT EXISTS meta_description text;

-- Update existing pages to have default SEO metadata based on page_name
UPDATE pages
SET 
  meta_title = page_name,
  meta_description = 'Page description for ' || page_name
WHERE meta_title IS NULL;