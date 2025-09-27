-- Create navigation_menus table for storing navigation configurations
CREATE TABLE IF NOT EXISTS public.navigation_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('header', 'footer', 'sidebar')),
  library_item_id UUID REFERENCES public.library_items(id) ON DELETE SET NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create navigation_components registry table
CREATE TABLE IF NOT EXISTS public.navigation_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_item_id UUID NOT NULL REFERENCES public.library_items(id) ON DELETE CASCADE,
  capabilities JSONB NOT NULL DEFAULT '{
    "maxDepth": 2,
    "supportsIcons": true,
    "supportsImages": false,
    "supportsMegaMenu": false,
    "supportsBadges": true,
    "supportsDescriptions": false,
    "supportsDividers": true
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_navigation_menus_project_id ON public.navigation_menus(project_id);
CREATE INDEX IF NOT EXISTS idx_navigation_menus_type ON public.navigation_menus(type);
CREATE INDEX IF NOT EXISTS idx_navigation_menus_is_active ON public.navigation_menus(is_active);
CREATE INDEX IF NOT EXISTS idx_navigation_menus_library_item_id ON public.navigation_menus(library_item_id);
CREATE INDEX IF NOT EXISTS idx_navigation_components_library_item_id ON public.navigation_components(library_item_id);

-- Add unique constraint to ensure only one active menu per type per project
CREATE UNIQUE INDEX IF NOT EXISTS idx_navigation_menus_active_unique 
  ON public.navigation_menus(project_id, type) 
  WHERE is_active = true;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add updated_at trigger
DROP TRIGGER IF EXISTS navigation_menus_updated_at ON public.navigation_menus;
CREATE TRIGGER navigation_menus_updated_at
  BEFORE UPDATE ON public.navigation_menus
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add RLS policies
ALTER TABLE public.navigation_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_components ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view navigation menus for projects they have access to
CREATE POLICY "Users can view navigation menus for their projects"
  ON public.navigation_menus
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_users pu
      WHERE pu.project_id = navigation_menus.project_id
      AND pu.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.account_users au ON au.account_id = p.account_id
      WHERE p.id = navigation_menus.project_id
      AND au.user_id = auth.uid()
    )
  );

-- Policy: Users can create navigation menus for projects they have access to
CREATE POLICY "Users can create navigation menus for their projects"
  ON public.navigation_menus
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_users pu
      WHERE pu.project_id = navigation_menus.project_id
      AND pu.user_id = auth.uid()
      AND pu.access_level IN ('editor', 'admin')
    )
    OR
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.account_users au ON au.account_id = p.account_id
      WHERE p.id = navigation_menus.project_id
      AND au.user_id = auth.uid()
      AND au.role IN ('account_owner', 'admin')
    )
  );

-- Policy: Users can update navigation menus for projects they have access to
CREATE POLICY "Users can update navigation menus for their projects"
  ON public.navigation_menus
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.project_users pu
      WHERE pu.project_id = navigation_menus.project_id
      AND pu.user_id = auth.uid()
      AND pu.access_level IN ('editor', 'admin')
    )
    OR
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.account_users au ON au.account_id = p.account_id
      WHERE p.id = navigation_menus.project_id
      AND au.user_id = auth.uid()
      AND au.role IN ('account_owner', 'admin')
    )
  );

-- Policy: Users can delete navigation menus for projects they have access to
CREATE POLICY "Users can delete navigation menus for their projects"
  ON public.navigation_menus
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.project_users pu
      WHERE pu.project_id = navigation_menus.project_id
      AND pu.user_id = auth.uid()
      AND pu.access_level = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.account_users au ON au.account_id = p.account_id
      WHERE p.id = navigation_menus.project_id
      AND au.user_id = auth.uid()
      AND au.role IN ('account_owner', 'admin')
    )
  );

-- Policy: All authenticated users can view navigation components
CREATE POLICY "Authenticated users can view navigation components"
  ON public.navigation_components
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only platform admins can manage navigation components
CREATE POLICY "Platform admins can manage navigation components"
  ON public.navigation_components
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.account_users
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Add comment for documentation
COMMENT ON TABLE public.navigation_menus IS 'Stores navigation configurations for projects';
COMMENT ON TABLE public.navigation_components IS 'Registry of available navigation components from the Library';
COMMENT ON COLUMN public.navigation_menus.items IS 'JSON tree structure of navigation items';
COMMENT ON COLUMN public.navigation_menus.settings IS 'Component-specific settings like sticky, transparent, etc.';
COMMENT ON COLUMN public.navigation_components.capabilities IS 'Component capabilities like max depth, icon support, etc.';