/*
  # Add Font Source Selection to Site Styles

  1. Updates
    - Add new columns to site_styles table for font source selection
    - Add h1_font_source, h2_font_source, h3_font_source, h4_font_source, p_font_source
    
  2. Purpose
    - Enable users to choose whether headings use primary or secondary font
    - Default h1-h4 to use secondary font
    - Default paragraph to use primary font
*/

-- Add font source selection columns to site_styles
ALTER TABLE site_styles ADD COLUMN IF NOT EXISTS h1_font_source text DEFAULT 'secondary_font';
ALTER TABLE site_styles ADD COLUMN IF NOT EXISTS h2_font_source text DEFAULT 'secondary_font';
ALTER TABLE site_styles ADD COLUMN IF NOT EXISTS h3_font_source text DEFAULT 'secondary_font';
ALTER TABLE site_styles ADD COLUMN IF NOT EXISTS h4_font_source text DEFAULT 'secondary_font';
ALTER TABLE site_styles ADD COLUMN IF NOT EXISTS p_font_source text DEFAULT 'primary_font';

-- Update existing rows with default values
UPDATE site_styles
SET 
  h1_font_source = 'secondary_font',
  h2_font_source = 'secondary_font',
  h3_font_source = 'secondary_font',
  h4_font_source = 'secondary_font',
  p_font_source = 'primary_font'
WHERE h1_font_source IS NULL;