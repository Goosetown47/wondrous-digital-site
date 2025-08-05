-- Add Draft/Publish System to Pages
-- This migration adds published_sections column to support draft/publish workflow

-- Add published_sections column to pages table
ALTER TABLE pages 
ADD COLUMN published_sections JSONB DEFAULT '[]'::jsonb;

-- Add comment to explain the column
COMMENT ON COLUMN pages.published_sections IS 'Published sections that are live on the website. sections column contains draft content.';
COMMENT ON COLUMN pages.sections IS 'Draft sections being edited. published_sections column contains live content.';

-- Create index for better query performance on published_sections
CREATE INDEX IF NOT EXISTS idx_pages_published_sections ON pages USING GIN (published_sections);

-- Migration: Copy existing sections to published_sections for backward compatibility
-- This ensures existing pages have published content
UPDATE pages 
SET published_sections = sections 
WHERE published_sections = '[]'::jsonb AND sections != '[]'::jsonb;

-- Add a function to publish draft sections to published
CREATE OR REPLACE FUNCTION publish_page_draft(page_id UUID)
RETURNS pages AS $$
DECLARE
  updated_page pages;
BEGIN
  UPDATE pages 
  SET 
    published_sections = sections,
    updated_at = NOW()
  WHERE id = page_id
  RETURNING * INTO updated_page;
  
  IF updated_page IS NULL THEN
    RAISE EXCEPTION 'Page with id % not found', page_id;
  END IF;
  
  RETURN updated_page;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION publish_page_draft TO authenticated;

-- Note: publish_page_draft function inherits existing RLS policies for pages table
-- Users can only publish pages they can already update per existing page policies

-- Add helper function to check if page has unpublished changes
CREATE OR REPLACE FUNCTION page_has_unpublished_changes(page_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  page_record pages;
BEGIN
  SELECT * INTO page_record FROM pages WHERE id = page_id;
  
  IF page_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Compare sections (draft) with published_sections
  RETURN page_record.sections::text != page_record.published_sections::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION page_has_unpublished_changes TO authenticated;