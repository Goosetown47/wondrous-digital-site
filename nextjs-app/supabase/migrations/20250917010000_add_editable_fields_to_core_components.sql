-- Add editable_fields column to core_components table
-- This stores the configuration for automatic field detection and editing

ALTER TABLE core_components
ADD COLUMN IF NOT EXISTS editable_fields JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN core_components.editable_fields IS 'Configuration for editable fields enabling automatic content editing. Each field defines path, type, label, and constraints.';

-- Example structure:
-- [
--   {
--     "path": "heading",
--     "type": "text",
--     "label": "Main Heading",
--     "maxLength": 100,
--     "required": true
--   },
--   {
--     "path": "image.src",
--     "type": "image",
--     "label": "Hero Image",
--     "allowedFormats": ["jpg", "png", "webp"]
--   }
-- ]