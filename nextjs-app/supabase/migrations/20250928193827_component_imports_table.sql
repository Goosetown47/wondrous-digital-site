-- Component import tracking table for dependency manager
-- This table stores metadata about imported UI components

CREATE TABLE IF NOT EXISTS component_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('shadcn', 'aceternity', 'skiper', 'tweakcn', 'custom')),
  source_url TEXT,
  dependencies JSONB DEFAULT '[]'::jsonb,
  transformations JSONB DEFAULT '[]'::jsonb,
  import_date TIMESTAMPTZ DEFAULT NOW(),
  imported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Indexes for performance
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_component_imports_source ON component_imports(source);
CREATE INDEX IF NOT EXISTS idx_component_imports_name ON component_imports(name);
CREATE INDEX IF NOT EXISTS idx_component_imports_import_date ON component_imports(import_date DESC);
CREATE INDEX IF NOT EXISTS idx_component_imports_imported_by ON component_imports(imported_by);

-- RLS policies for multi-tenant access
ALTER TABLE component_imports ENABLE ROW LEVEL SECURITY;

-- Admin users can see all component imports
CREATE POLICY "Admin users can view all component imports"
  ON component_imports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

-- Admin users can insert component imports
CREATE POLICY "Admin users can insert component imports"
  ON component_imports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

-- Admin users can update component imports
CREATE POLICY "Admin users can update component imports"
  ON component_imports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

-- Admin users can delete component imports
CREATE POLICY "Admin users can delete component imports"
  ON component_imports
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_component_imports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function on update
CREATE TRIGGER component_imports_updated_at_trigger
  BEFORE UPDATE ON component_imports
  FOR EACH ROW
  EXECUTE FUNCTION update_component_imports_updated_at();

-- Add helpful comments
COMMENT ON TABLE component_imports IS 'Tracks imported UI components and their metadata';
COMMENT ON COLUMN component_imports.name IS 'Component name (e.g., button, sparkles)';
COMMENT ON COLUMN component_imports.source IS 'Source library (shadcn, aceternity, etc.)';
COMMENT ON COLUMN component_imports.source_url IS 'Original registry URL';
COMMENT ON COLUMN component_imports.dependencies IS 'Array of npm dependencies required';
COMMENT ON COLUMN component_imports.transformations IS 'Array of import path transformations applied';
COMMENT ON COLUMN component_imports.metadata IS 'Additional metadata (autoFix, installDeps, etc.)';