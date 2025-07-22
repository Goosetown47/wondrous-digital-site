-- Create netlify_site_cache table for efficient site lookups
CREATE TABLE IF NOT EXISTS public.netlify_site_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_domain VARCHAR(255) UNIQUE NOT NULL,
  netlify_site_id VARCHAR(255) NOT NULL,
  site_name VARCHAR(255),
  domain_aliases TEXT[] DEFAULT '{}',
  ssl_url VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_netlify_site_cache_primary_domain ON public.netlify_site_cache(primary_domain);
CREATE INDEX idx_netlify_site_cache_netlify_site_id ON public.netlify_site_cache(netlify_site_id);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_netlify_site_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_netlify_site_cache_updated_at
BEFORE UPDATE ON public.netlify_site_cache
FOR EACH ROW
EXECUTE FUNCTION update_netlify_site_cache_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.netlify_site_cache TO authenticated;

-- Add RLS policies
ALTER TABLE public.netlify_site_cache ENABLE ROW LEVEL SECURITY;

-- Admin users can manage site cache
CREATE POLICY "Admins can manage netlify site cache" ON public.netlify_site_cache
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add netlify_primary_domain to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS netlify_primary_domain VARCHAR(255);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_projects_netlify_primary_domain 
ON public.projects(netlify_primary_domain);

-- Add comment for documentation
COMMENT ON TABLE public.netlify_site_cache IS 'Caches Netlify site mappings to reduce API calls and track domain aliases';
COMMENT ON COLUMN public.netlify_site_cache.primary_domain IS 'The apex domain (e.g., raleigh-dentist.com) that identifies the Netlify site';
COMMENT ON COLUMN public.netlify_site_cache.domain_aliases IS 'Array of all domain aliases configured for this site';
COMMENT ON COLUMN public.projects.netlify_primary_domain IS 'The primary domain associated with the Netlify site for this project';