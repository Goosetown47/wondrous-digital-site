-- Update lab_drafts status constraint to include 'promoted'
ALTER TABLE lab_drafts 
DROP CONSTRAINT IF EXISTS lab_drafts_status_check;

ALTER TABLE lab_drafts 
ADD CONSTRAINT lab_drafts_status_check 
CHECK (status IN ('draft', 'testing', 'ready', 'promoted'));