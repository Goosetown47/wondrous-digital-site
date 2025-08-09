-- Add metadata column to lab_drafts table
ALTER TABLE lab_drafts 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;