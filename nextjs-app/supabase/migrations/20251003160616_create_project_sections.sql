-- =====================================================
-- Migration: Create project_sections table
-- Purpose: Store global sections that appear on all pages in a project
-- Date: 2025-10-03
-- =====================================================

-- Create project_sections table for global sections
CREATE TABLE IF NOT EXISTS project_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  component_name TEXT NOT NULL,
  content JSONB DEFAULT '{}'::jsonb,

  -- Position: where this appears relative to page content
  section_placement TEXT NOT NULL CHECK (
    section_placement IN ('global_header', 'global_footer', 'above_content', 'below_content')
  ),

  -- Order within its placement group (lower numbers appear first)
  display_order INTEGER NOT NULL DEFAULT 0,

  -- Draft/published workflow (matches page_sections pattern)
  is_published BOOLEAN DEFAULT false,

  -- Library tracking (matches page_sections pattern)
  library_item_id UUID REFERENCES library_items(id),
  library_version INTEGER,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_project_sections_project_id ON project_sections(project_id);
CREATE INDEX idx_project_sections_placement ON project_sections(section_placement);
CREATE INDEX idx_project_sections_published ON project_sections(is_published);
CREATE INDEX idx_project_sections_order ON project_sections(project_id, section_placement, display_order);

-- Create updated_at trigger
CREATE TRIGGER update_project_sections_updated_at
  BEFORE UPDATE ON project_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies (match page_sections security model)
ALTER TABLE project_sections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view published sections for projects they have access to
CREATE POLICY "Users can view published project sections"
  ON project_sections
  FOR SELECT
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM projects
      INNER JOIN accounts ON accounts.id = projects.account_id
      INNER JOIN account_users ON account_users.account_id = accounts.id
      WHERE projects.id = project_sections.project_id
      AND account_users.user_id = auth.uid()
    )
  );

-- Policy: Users can view draft sections for projects they have access to
CREATE POLICY "Users can view draft project sections"
  ON project_sections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      INNER JOIN accounts ON accounts.id = projects.account_id
      INNER JOIN account_users ON account_users.account_id = accounts.id
      WHERE projects.id = project_sections.project_id
      AND account_users.user_id = auth.uid()
    )
  );

-- Policy: Users can insert sections for projects they have access to
CREATE POLICY "Users can insert project sections"
  ON project_sections
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      INNER JOIN accounts ON accounts.id = projects.account_id
      INNER JOIN account_users ON account_users.account_id = accounts.id
      WHERE projects.id = project_sections.project_id
      AND account_users.user_id = auth.uid()
      AND account_users.role IN ('owner', 'admin')
    )
  );

-- Policy: Users can update sections for projects they have access to
CREATE POLICY "Users can update project sections"
  ON project_sections
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      INNER JOIN accounts ON accounts.id = projects.account_id
      INNER JOIN account_users ON account_users.account_id = accounts.id
      WHERE projects.id = project_sections.project_id
      AND account_users.user_id = auth.uid()
      AND account_users.role IN ('owner', 'admin')
    )
  );

-- Policy: Users can delete sections for projects they have access to
CREATE POLICY "Users can delete project sections"
  ON project_sections
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      INNER JOIN accounts ON accounts.id = projects.account_id
      INNER JOIN account_users ON account_users.account_id = accounts.id
      WHERE projects.id = project_sections.project_id
      AND account_users.user_id = auth.uid()
      AND account_users.role IN ('owner', 'admin')
    )
  );

-- Comment on table
COMMENT ON TABLE project_sections IS 'Global sections that appear on all pages in a project (navigation, footer, etc.)';
COMMENT ON COLUMN project_sections.section_placement IS 'Where the section appears: global_header, global_footer, above_content, below_content';
COMMENT ON COLUMN project_sections.display_order IS 'Order within placement group (lower = earlier)';
