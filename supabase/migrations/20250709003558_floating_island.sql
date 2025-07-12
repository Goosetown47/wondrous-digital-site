/*
  # Add Status Field to Section Templates

  1. New Fields
    - `status` - Text field with values 'active', 'inactive', 'testing'
    
  2. Purpose
    - Allow filtering and organization of section templates by status
    - Help manage the lifecycle of section templates
    - Separate testing templates from production-ready ones
*/

-- Add status column to section_templates table with default 'testing'
ALTER TABLE section_templates 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'testing' 
CHECK (status IN ('active', 'inactive', 'testing'));

-- Update all existing templates to 'active' status (assuming they're already in use)
UPDATE section_templates 
SET status = 'active' 
WHERE status = 'testing';