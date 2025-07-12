/*
  # Add Button Design System to site_styles

  1. New Columns
    - `button_radius` (text) - Controls button border radius (squared, slightly-rounded, fully-rounded)
    - `button_style` (text) - Controls button style (default, bubble, brick, gradient, sleek)
    
  2. Purpose
    - Enable per-project customization of button appearance
    - Create a consistent button design system across all sections
    - Provide styling options that maintain brand consistency
*/

-- Add button styling columns to site_styles table
ALTER TABLE site_styles 
ADD COLUMN IF NOT EXISTS button_radius text DEFAULT 'slightly-rounded';

ALTER TABLE site_styles 
ADD COLUMN IF NOT EXISTS button_style text DEFAULT 'default';

-- Update existing rows with default values
UPDATE site_styles
SET 
  button_radius = 'slightly-rounded',
  button_style = 'default'
WHERE button_radius IS NULL;

-- Add check constraint to ensure valid values
ALTER TABLE site_styles
ADD CONSTRAINT site_styles_button_radius_check
CHECK (button_radius IN ('squared', 'slightly-rounded', 'fully-rounded'));

ALTER TABLE site_styles
ADD CONSTRAINT site_styles_button_style_check
CHECK (button_style IN ('default', 'bubble', 'brick', 'gradient', 'sleek'));

-- Add button hover colors for better design options
ALTER TABLE site_styles
ADD COLUMN IF NOT EXISTS primary_button_hover_color text;

ALTER TABLE site_styles
ADD COLUMN IF NOT EXISTS secondary_button_hover_color text;

-- Set default hover colors based on existing colors
UPDATE site_styles
SET 
  primary_button_hover_color = dark_color,
  secondary_button_hover_color = secondary_color
WHERE primary_button_hover_color IS NULL;