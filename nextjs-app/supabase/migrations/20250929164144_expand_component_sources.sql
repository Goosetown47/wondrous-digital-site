-- Expand component_imports source CHECK constraint to include new UI libraries
-- Adds: shadcnblocks, reactbits, shadcnui-expansions

-- Drop existing constraint
ALTER TABLE component_imports
DROP CONSTRAINT IF EXISTS component_imports_source_check;

-- Add new constraint with expanded source list
ALTER TABLE component_imports
ADD CONSTRAINT component_imports_source_check
CHECK (source IN (
  'shadcn',
  'aceternity',
  'skiper',
  'tweakcn',
  'shadcnblocks',
  'reactbits',
  'shadcnui-expansions',
  'custom'
));

-- Add helpful comment
COMMENT ON CONSTRAINT component_imports_source_check ON component_imports IS
  'Validates component source against supported UI libraries: shadcn, aceternity, skiper, tweakcn, shadcnblocks, reactbits, shadcnui-expansions, or custom';