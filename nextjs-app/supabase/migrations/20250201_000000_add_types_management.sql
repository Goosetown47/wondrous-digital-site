-- Add dynamic types management system
-- This replaces hardcoded type constraints with a flexible types table

-- 1. Create types table
CREATE TABLE types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- e.g., 'hero', 'navbar', 'footer'
  display_name TEXT NOT NULL, -- e.g., 'Hero Section', 'Navigation Bar'
  category TEXT NOT NULL CHECK (category IN ('section', 'page', 'site', 'theme')),
  description TEXT,
  icon TEXT, -- optional icon identifier (e.g., 'lucide:layout-dashboard')
  component_name TEXT, -- e.g., 'HeroSection' for mapping to React components
  default_props JSONB DEFAULT '{}', -- default properties for this type
  schema JSONB, -- optional JSON schema for validation
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add RLS policies for types table
ALTER TABLE types ENABLE ROW LEVEL SECURITY;

-- Everyone can view types (needed for builder and lab)
CREATE POLICY "Everyone can view types" ON types
  FOR SELECT TO authenticated
  USING (true);

-- Only staff and admins can manage types
CREATE POLICY "Staff and admins can insert types" ON types
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(ARRAY['staff', 'admin']));

CREATE POLICY "Staff and admins can update types" ON types
  FOR UPDATE TO authenticated
  USING (public.has_role(ARRAY['staff', 'admin']))
  WITH CHECK (public.has_role(ARRAY['staff', 'admin']));

CREATE POLICY "Staff and admins can delete types" ON types
  FOR DELETE TO authenticated
  USING (public.has_role(ARRAY['staff', 'admin']));

-- 3. Add type_id columns to existing tables
ALTER TABLE lab_drafts ADD COLUMN type_id UUID REFERENCES types(id);
ALTER TABLE library_items ADD COLUMN type_id UUID REFERENCES types(id);

-- 4. Create indexes for performance
CREATE INDEX idx_types_category ON types(category);
CREATE INDEX idx_types_name ON types(name);
CREATE INDEX idx_lab_drafts_type_id ON lab_drafts(type_id);
CREATE INDEX idx_library_items_type_id ON library_items(type_id);

-- 5. Add trigger for updated_at
CREATE TRIGGER update_types_updated_at BEFORE UPDATE ON types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Create a few essential types to get started
-- Note: User will add more through the UI as needed
INSERT INTO types (name, display_name, category, description, component_name) VALUES
  ('section', 'Generic Section', 'section', 'A generic section type', 'GenericSection'),
  ('page', 'Generic Page', 'page', 'A generic page type', 'GenericPage'),
  ('site', 'Generic Site', 'site', 'A generic site type', 'GenericSite'),
  ('theme', 'Theme', 'theme', 'A theme type', 'Theme');

-- 7. Update existing data to use the new generic types
UPDATE lab_drafts 
SET type_id = (SELECT id FROM types WHERE name = lab_drafts.type AND category = lab_drafts.type)
WHERE type_id IS NULL;

UPDATE library_items 
SET type_id = (SELECT id FROM types WHERE name = library_items.type AND category = library_items.type)
WHERE type_id IS NULL;

-- 8. Make type_id required after migration
-- We'll do this in a separate migration after confirming all data is migrated
-- ALTER TABLE lab_drafts ALTER COLUMN type_id SET NOT NULL;
-- ALTER TABLE library_items ALTER COLUMN type_id SET NOT NULL;

-- 9. We'll remove the old type columns and constraints in a future migration
-- after confirming the new system works properly