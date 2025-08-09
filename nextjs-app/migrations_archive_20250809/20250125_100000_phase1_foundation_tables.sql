/*
  # Phase 1 Foundation Tables
  
  This migration creates the core tables needed for the PageBuilder system:
  - core_components: Repository of reusable components from shadcn/ui and other libraries
  - lab_drafts: Workspace for creating new templates
  - library_items: Published templates (sections, pages, sites)
  - themes: CSS variable-based theme definitions
  - library_versions: Version history for library items
  
  Also updates the projects table to support theme selection.
*/

-- Create core_components table
CREATE TABLE IF NOT EXISTS core_components (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('component', 'section')),
  source TEXT NOT NULL CHECK (source IN ('shadcn', 'aceternity', 'expansions', 'custom')),
  code TEXT NOT NULL,
  dependencies JSONB DEFAULT '[]'::jsonb,
  imports JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, source)
);

-- Create lab_drafts table
CREATE TABLE IF NOT EXISTS lab_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('section', 'page', 'site', 'theme')),
  content JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'testing', 'ready')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create themes table
CREATE TABLE IF NOT EXISTS themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  variables JSONB NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create library_items table
CREATE TABLE IF NOT EXISTS library_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('section', 'page', 'site', 'theme')),
  category TEXT,
  content JSONB NOT NULL,
  published BOOLEAN DEFAULT FALSE,
  version INTEGER DEFAULT 1,
  source_draft_id UUID REFERENCES lab_drafts(id),
  theme_id UUID REFERENCES themes(id),
  usage_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create library_versions table for version history
CREATE TABLE IF NOT EXISTS library_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  library_item_id UUID REFERENCES library_items(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content JSONB NOT NULL,
  change_notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(library_item_id, version)
);

-- Update projects table to add theme support
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS theme_id UUID REFERENCES themes(id),
ADD COLUMN IF NOT EXISTS theme_overrides JSONB DEFAULT '{}'::jsonb;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_core_components_type ON core_components(type);
CREATE INDEX IF NOT EXISTS idx_core_components_source ON core_components(source);
CREATE INDEX IF NOT EXISTS idx_lab_drafts_type ON lab_drafts(type);
CREATE INDEX IF NOT EXISTS idx_lab_drafts_status ON lab_drafts(status);
CREATE INDEX IF NOT EXISTS idx_library_items_type ON library_items(type);
CREATE INDEX IF NOT EXISTS idx_library_items_published ON library_items(published);
CREATE INDEX IF NOT EXISTS idx_library_items_category ON library_items(category);
CREATE INDEX IF NOT EXISTS idx_library_versions_item ON library_versions(library_item_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_core_components_updated_at BEFORE UPDATE ON core_components
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lab_drafts_updated_at BEFORE UPDATE ON lab_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON themes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_library_items_updated_at BEFORE UPDATE ON library_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE core_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_versions ENABLE ROW LEVEL SECURITY;

-- Core Components policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view core components" ON core_components
  FOR SELECT TO authenticated
  USING (true);

-- Lab Drafts policies (users can manage their own drafts)
CREATE POLICY "Users can view their own lab drafts" ON lab_drafts
  FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR auth.jwt()->>'role' = 'admin');

CREATE POLICY "Users can create lab drafts" ON lab_drafts
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own lab drafts" ON lab_drafts
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR auth.jwt()->>'role' = 'admin')
  WITH CHECK (created_by = auth.uid() OR auth.jwt()->>'role' = 'admin');

CREATE POLICY "Users can delete their own lab drafts" ON lab_drafts
  FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR auth.jwt()->>'role' = 'admin');

-- Themes policies (everyone can view, only admins can modify)
CREATE POLICY "Everyone can view published themes" ON themes
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage themes" ON themes
  FOR ALL TO authenticated
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Library Items policies
CREATE POLICY "View published library items" ON library_items
  FOR SELECT TO authenticated
  USING (published = true OR created_by = auth.uid() OR auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admins can manage library items" ON library_items
  FOR ALL TO authenticated
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Library Versions policies (same as library items)
CREATE POLICY "View library versions" ON library_versions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM library_items 
      WHERE library_items.id = library_versions.library_item_id 
      AND (library_items.published = true OR library_items.created_by = auth.uid() OR auth.jwt()->>'role' = 'admin')
    )
  );

CREATE POLICY "Admins can manage library versions" ON library_versions
  FOR ALL TO authenticated
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');