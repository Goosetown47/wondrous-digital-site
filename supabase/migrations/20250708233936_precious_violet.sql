/*
  # Add Font Size and Weight Options

  1. New Columns
    - Add font size columns for all typography elements (h1-h6, paragraph)
    - Add font weight columns for all typography elements
    - Add font source columns for H5 and H6 headings
    
  2. Defaults
    - Set sensible defaults for all new columns
    - Populate existing records with default values
    
  3. Purpose
    - Give users complete control over typography styling
    - Allow for more flexible and customizable design systems
*/

-- Add font size columns to site_styles
ALTER TABLE site_styles ADD COLUMN IF NOT EXISTS h1_font_size text DEFAULT '2.5rem';
ALTER TABLE site_styles ADD COLUMN IF NOT EXISTS h2_font_size text DEFAULT '2rem';
ALTER TABLE site_styles ADD COLUMN IF NOT EXISTS h3_font_size text DEFAULT '1.75rem';
ALTER TABLE site_styles ADD COLUMN IF NOT EXISTS h4_font_size text DEFAULT '1.5rem';
ALTER TABLE site_styles ADD COLUMN IF NOT EXISTS h5_font_size text DEFAULT '1.25rem';
ALTER TABLE site_styles ADD COLUMN IF NOT EXISTS h6_font_size text DEFAULT '1rem';
ALTER TABLE site_styles ADD COLUMN IF NOT EXISTS p_font_size text DEFAULT '1rem';

-- Add font weight columns to site_styles
ALTER TABLE site_styles ADD COLUMN IF NOT EXISTS h1_font_weight text DEFAULT '700';
ALTER TABLE site_styles ADD COLUMN IF NOT EXISTS h2_font_weight text DEFAULT '700';
ALTER TABLE site_styles ADD COLUMN IF NOT EXISTS h3_font_weight text DEFAULT '600';
ALTER TABLE site_styles ADD COLUMN IF NOT EXISTS h4_font_weight text DEFAULT '600';
ALTER TABLE site_styles ADD COLUMN IF NOT EXISTS h5_font_weight text DEFAULT '600';
ALTER TABLE site_styles ADD COLUMN IF NOT EXISTS h6_font_weight text DEFAULT '600';
ALTER TABLE site_styles ADD COLUMN IF NOT EXISTS p_font_weight text DEFAULT '400';

-- Add font source selection for H5 and H6
ALTER TABLE site_styles ADD COLUMN IF NOT EXISTS h5_font_source text DEFAULT 'secondary_font';
ALTER TABLE site_styles ADD COLUMN IF NOT EXISTS h6_font_source text DEFAULT 'secondary_font';

-- Update existing rows with default values
UPDATE site_styles
SET 
  h1_font_size = '2.5rem',
  h2_font_size = '2rem',
  h3_font_size = '1.75rem',
  h4_font_size = '1.5rem',
  h5_font_size = '1.25rem',
  h6_font_size = '1rem',
  p_font_size = '1rem',
  h1_font_weight = '700',
  h2_font_weight = '700',
  h3_font_weight = '600',
  h4_font_weight = '600',
  h5_font_weight = '600',
  h6_font_weight = '600',
  p_font_weight = '400',
  h5_font_source = 'secondary_font',
  h6_font_source = 'secondary_font'
WHERE h1_font_size IS NULL;