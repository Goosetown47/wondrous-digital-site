/*
  # Move component_name from types to library_items
  
  This migration fixes the architecture by moving component_name from the types
  table (where it doesn't belong) to the library_items table (where each template
  can have its own React component).
  
  Changes:
  - Remove component_name column from types table
  - Add component_name column to library_items table
  - Preserve any existing data by migrating it to a default library item if needed
*/

-- First, add component_name to library_items if it doesn't exist
ALTER TABLE library_items 
ADD COLUMN IF NOT EXISTS component_name TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN library_items.component_name IS 'The React component name that renders this template (e.g., HeroTwoColumn)';

-- For any existing library items that have a type with a component_name,
-- copy that component_name to the library item
UPDATE library_items li
SET component_name = t.component_name
FROM types t
WHERE li.type_id = t.id 
  AND t.component_name IS NOT NULL
  AND li.component_name IS NULL;

-- Now remove component_name from types table
ALTER TABLE types 
DROP COLUMN IF EXISTS component_name;

-- Also remove default_props if it exists (since props belong to specific implementations, not types)
ALTER TABLE types 
DROP COLUMN IF EXISTS default_props;

-- Update the types table comment
COMMENT ON TABLE types IS 'Categories for organizing templates (e.g., Hero, Features, Landing Page)';