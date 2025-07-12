/*
  # Add source_file_name to section_templates

  1. New Columns
    - `source_file_name` (text, nullable) - Stores the original file name from the file system

  2. Purpose
    - Track the original component name regardless of template name changes
    - Fix issue where changing template name during publishing keeps section in staging area
*/

-- Add source_file_name column to section_templates table
ALTER TABLE section_templates ADD COLUMN IF NOT EXISTS source_file_name text;

-- For any existing records where source_file_name is null,
-- set it to a normalized version of the template_name as a fallback
UPDATE section_templates
SET source_file_name = REGEXP_REPLACE(template_name, '[^a-zA-Z0-9]', '', 'g')
WHERE source_file_name IS NULL;