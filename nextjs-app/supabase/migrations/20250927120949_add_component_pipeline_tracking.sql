-- Migration: Add Component Pipeline Tracking Fields
-- Purpose: Enable GitHub API integration and status tracking for component lifecycle
-- Date: September 27, 2025

-- Add deployment_status field to track component deployment across environments
ALTER TABLE core_components
ADD COLUMN IF NOT EXISTS deployment_status JSONB DEFAULT '{
  "dev": false,
  "staging": false,
  "prod": false,
  "files_created": false,
  "registry_updated": false,
  "github_pr": null,
  "last_deployment": null
}'::jsonb;

-- Add pipeline_status field to track component lifecycle stage
ALTER TABLE core_components
ADD COLUMN IF NOT EXISTS pipeline_status TEXT DEFAULT 'created'
CHECK (pipeline_status IN ('created', 'registered', 'testing', 'published', 'deployed', 'disabled', 'error'));

-- Add auto_number field to track component number (e.g., 12 in Hero12)
ALTER TABLE core_components
ADD COLUMN IF NOT EXISTS auto_number INTEGER;

-- Add base_type field to track component base type (e.g., Hero, Footer, Navigation)
ALTER TABLE core_components
ADD COLUMN IF NOT EXISTS base_type VARCHAR(50);

-- Add source_component_id to library_items to track origin component
ALTER TABLE library_items
ADD COLUMN IF NOT EXISTS source_component_id UUID REFERENCES core_components(id);

-- Add index for faster queries on pipeline status
CREATE INDEX IF NOT EXISTS idx_core_components_pipeline_status
ON core_components(pipeline_status);

-- Add index for component type queries
CREATE INDEX IF NOT EXISTS idx_core_components_base_type
ON core_components(base_type);

-- Add index for deployment status queries
CREATE INDEX IF NOT EXISTS idx_core_components_deployment_status
ON core_components USING gin(deployment_status);

-- Add comment explaining the deployment_status structure
COMMENT ON COLUMN core_components.deployment_status IS 'JSON object tracking deployment status: {dev, staging, prod, files_created, registry_updated, github_pr, last_deployment}';

-- Add comment explaining pipeline_status values
COMMENT ON COLUMN core_components.pipeline_status IS 'Component lifecycle stage: created (initial), registered (files exist), testing (in LAB), published (in LIBRARY), deployed (in PROD), disabled (removed), error (failed)';

-- Add comment explaining auto_number
COMMENT ON COLUMN core_components.auto_number IS 'Auto-generated component number within its base_type (e.g., 12 for Hero12)';

-- Add comment explaining base_type
COMMENT ON COLUMN core_components.base_type IS 'Base component type extracted from name (e.g., Hero, Footer, Navigation, Feature, CTA)';