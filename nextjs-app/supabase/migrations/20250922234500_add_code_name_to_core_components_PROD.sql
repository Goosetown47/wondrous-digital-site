-- PRODUCTION VERSION - Structure only, no content updates
-- This migration adds the code_name column to core_components table
-- without updating any existing content (PROD has different components than DEV)

ALTER TABLE core_components
ADD COLUMN IF NOT EXISTS code_name TEXT;

CREATE INDEX IF NOT EXISTS idx_core_components_code_name
ON core_components(code_name);

COMMENT ON COLUMN core_components.code_name IS 'The actual code/registry name of the component (e.g., Navbar2) used for consistent matching across the system';