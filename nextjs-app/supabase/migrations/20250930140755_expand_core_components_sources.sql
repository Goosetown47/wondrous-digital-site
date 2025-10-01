-- Expand core_components source CHECK constraint to include all component library sources
-- This allows us to track the exact source URL where components came from

-- Drop the existing constraint if it exists
ALTER TABLE core_components
DROP CONSTRAINT IF EXISTS core_components_source_check;

-- Add the new expanded constraint
ALTER TABLE core_components
ADD CONSTRAINT core_components_source_check
CHECK (source IN (
  -- Original shadcn sources
  'shadcn',
  'ui.shadcn.com',
  'shadcnblocks.com',

  -- Aceternity sources
  'aceternity',
  'ui.aceternity.com',
  'pro.aceternity.com',

  -- Expansion sources
  'expansions',
  'shadcnui-expansions.typeart.cc',
  'reactbits.dev',
  'tweakcn.com',

  -- Other UI libraries
  'skiper-ui.com',
  '21st.dev',
  'ai-sdk.dev',
  'motion-primitives.com',

  -- Custom
  'custom'
));

-- Add a comment explaining the constraint
COMMENT ON CONSTRAINT core_components_source_check ON core_components IS
'Allows both generic category names (shadcn, aceternity, expansions) and specific source URLs for precise tracking of component origins';
