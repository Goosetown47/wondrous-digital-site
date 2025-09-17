-- Add registration tracking to core_components table
ALTER TABLE core_components
ADD COLUMN IF NOT EXISTS is_registered BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS registered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS registered_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS default_content JSONB,
ADD COLUMN IF NOT EXISTS type_id UUID REFERENCES types(id);

-- Create index for faster queries on registration status
CREATE INDEX IF NOT EXISTS idx_core_components_is_registered ON core_components(is_registered);

-- Update existing components to be registered since they're already in use
-- This ensures backward compatibility
UPDATE core_components
SET is_registered = TRUE,
    registered_at = COALESCE(updated_at, created_at, NOW())
WHERE is_registered IS NULL OR is_registered = FALSE;

-- Add comment to explain the column
COMMENT ON COLUMN core_components.is_registered IS 'Indicates if component has been configured with defaults and is ready for use in LAB';
COMMENT ON COLUMN core_components.registered_at IS 'Timestamp when component was registered';
COMMENT ON COLUMN core_components.registered_by IS 'User who registered the component';
COMMENT ON COLUMN core_components.default_content IS 'Default content/props for the component';
COMMENT ON COLUMN core_components.type_id IS 'Reference to types table for categorization';