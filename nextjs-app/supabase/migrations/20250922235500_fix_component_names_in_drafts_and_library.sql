-- Fix component_name values in lab_drafts and library_items
-- This ensures proper linking between Core components and their usage

-- Update lab_drafts metadata to have correct component_name values
-- Based on the draft name and type, set the appropriate component reference

-- Fix Hero drafts that should reference HeroTwoColumn
UPDATE lab_drafts
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{component_name}',
  '"HeroTwoColumn"'::jsonb
)
WHERE name ILIKE '%hero%'
  AND type = 'section'
  AND (metadata->>'component_name' IS NULL
    OR metadata->>'component_name' = 'Hero-Two-Col-Image'
    OR metadata->>'component_name' = '');

-- Fix Navigation drafts that should reference Navbar2
UPDATE lab_drafts
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{component_name}',
  '"Navbar2"'::jsonb
)
WHERE (name ILIKE '%nav%' OR name ILIKE '%navigation%')
  AND type = 'section'
  AND (metadata->>'component_name' IS NULL
    OR metadata->>'component_name' = '');

-- Fix Footer drafts that should reference Footer2
UPDATE lab_drafts
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{component_name}',
  '"Footer2"'::jsonb
)
WHERE name ILIKE '%footer%'
  AND type = 'section'
  AND (metadata->>'component_name' IS NULL
    OR metadata->>'component_name' = '');

-- Fix Service drafts that should reference Services1
UPDATE lab_drafts
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{component_name}',
  '"Services1"'::jsonb
)
WHERE name ILIKE '%service%'
  AND type = 'section'
  AND (metadata->>'component_name' IS NULL
    OR metadata->>'component_name' = '');

-- Update library_items component_name to match Core components
-- Fix Hero library items
UPDATE library_items
SET component_name = 'HeroTwoColumn'
WHERE name ILIKE '%hero%'
  AND type = 'section'
  AND (component_name IS NULL
    OR component_name = 'Hero-Two-Col-Image'
    OR component_name = '');

-- Fix Navigation library items
UPDATE library_items
SET component_name = 'Navbar2'
WHERE (name ILIKE '%nav%' OR name ILIKE '%navigation%')
  AND type = 'section'
  AND (component_name IS NULL
    OR component_name = '');

-- Fix Footer library items
UPDATE library_items
SET component_name = 'Footer2'
WHERE name ILIKE '%footer%'
  AND type = 'section'
  AND (component_name IS NULL
    OR component_name = '');

-- Fix Service library items
UPDATE library_items
SET component_name = 'Services1'
WHERE name ILIKE '%service%'
  AND type = 'section'
  AND (component_name IS NULL
    OR component_name = '');

-- Add comment explaining the fixes
COMMENT ON COLUMN lab_drafts.metadata IS 'JSON metadata including component_name which references the Core component code name';
COMMENT ON COLUMN library_items.component_name IS 'References the Core component code name (e.g., Navbar2, HeroTwoColumn) for proper component resolution';