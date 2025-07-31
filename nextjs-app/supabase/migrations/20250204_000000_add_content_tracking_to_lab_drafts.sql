/*
  # Add Content Tracking to Lab Drafts
  
  This migration adds content hash tracking to lab_drafts table to enable
  reliable change detection independent of metadata updates.
  
  Changes:
  - Add content_hash column to track actual content changes
  - Add library_version column to track the version number when promoted
  - Add index for performance on content_hash lookups
*/

-- Add new columns to lab_drafts
ALTER TABLE lab_drafts 
ADD COLUMN IF NOT EXISTS content_hash TEXT,
ADD COLUMN IF NOT EXISTS library_version INTEGER;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_lab_drafts_content_hash ON lab_drafts(content_hash);

-- Add comment for documentation
COMMENT ON COLUMN lab_drafts.content_hash IS 'SHA-256 hash of the content field to detect actual content changes';
COMMENT ON COLUMN lab_drafts.library_version IS 'The version number of the linked library item at the time of last sync';