-- Add changelog field to lab_drafts table for version documentation
-- This allows users to document changes between draft versions

ALTER TABLE lab_drafts
ADD COLUMN IF NOT EXISTS changelog TEXT;

-- Add comment to document the purpose of this field
COMMENT ON COLUMN lab_drafts.changelog IS 'Changelog/release notes for this draft version, documenting changes from previous version';

-- Note: The library_version field will be conceptually repurposed as parent_library_id
-- to track which library item this draft originated from (if any).
-- We're keeping the column name for backward compatibility but changing its semantic meaning.
COMMENT ON COLUMN lab_drafts.library_version IS 'Tracks the parent library item ID this draft was created from (conceptually parent_library_id). NULL for new drafts not based on library items.';