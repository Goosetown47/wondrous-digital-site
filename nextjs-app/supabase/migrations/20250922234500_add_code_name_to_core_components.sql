-- Add code_name column to core_components if it doesn't exist
-- This stores the actual registry/code name for consistent matching

-- Add the column if it doesn't exist
ALTER TABLE core_components
ADD COLUMN IF NOT EXISTS code_name TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_core_components_code_name
ON core_components(code_name);

-- Backfill existing components with their code names based on known mappings
-- This ensures existing components work with the new naming system
UPDATE core_components
SET code_name = CASE
    WHEN name = 'Nav Bar 1' THEN 'Navbar2'
    WHEN name = 'Footer 1' THEN 'Footer2'
    WHEN name = 'Footer 2' THEN 'Footer2'
    WHEN name = 'Hero Two Column' THEN 'HeroTwoColumn'
    WHEN name = 'Nav Bar 3' THEN 'NavBar3'
    WHEN name = 'Services1' THEN 'Services1'
    WHEN name = 'Services2' THEN 'Services2'
    WHEN name = 'Services3' THEN 'Services3'
    WHEN name = 'Services4' THEN 'Services4'
    WHEN name = 'Services5' THEN 'Services5'
    -- For any others, try to extract from metadata if available
    WHEN metadata->>'component_code' IS NOT NULL THEN metadata->>'component_code'
    -- Otherwise use the name itself as a fallback
    ELSE name
END
WHERE code_name IS NULL;

-- Add a comment explaining the column
COMMENT ON COLUMN core_components.code_name IS 'The actual code/registry name of the component (e.g., Navbar2) used for consistent matching across the system';