/*
  # Update Site Styles Table Structure

  1. Updates
    - Add new columns to site_styles table for comprehensive color system
      - tertiary_color
      - dark_color
      - light_color
      - white_color
      - soft_shade_1
      - soft_shade_2
      - soft_shade_3
      - gradient_1
      - gradient_2
    
  2. Purpose
    - Support a complete design system for project styling
    - Store gradient information
    - Provide expanded color palette options
*/

-- Add new color columns to site_styles
ALTER TABLE site_styles ADD COLUMN IF NOT EXISTS tertiary_color text;
ALTER TABLE site_styles ADD COLUMN IF NOT EXISTS dark_color text;
ALTER TABLE site_styles ADD COLUMN IF NOT EXISTS light_color text;
ALTER TABLE site_styles ADD COLUMN IF NOT EXISTS white_color text;
ALTER TABLE site_styles ADD COLUMN IF NOT EXISTS soft_shade_1 text;
ALTER TABLE site_styles ADD COLUMN IF NOT EXISTS soft_shade_2 text;
ALTER TABLE site_styles ADD COLUMN IF NOT EXISTS soft_shade_3 text;
ALTER TABLE site_styles ADD COLUMN IF NOT EXISTS gradient_1 text;
ALTER TABLE site_styles ADD COLUMN IF NOT EXISTS gradient_2 text;

-- Add default values to existing rows
UPDATE site_styles
SET 
  tertiary_color = '#302940',
  dark_color = '#1F0943',
  light_color = '#EFD0F2',
  white_color = '#FFFFFF',
  soft_shade_1 = '#F5F5F5',
  soft_shade_2 = '#E5E5E5',
  soft_shade_3 = '#D4D4D4',
  gradient_1 = 'linear-gradient(135deg, #F867AC 0%, #3C33C0 100%)',
  gradient_2 = 'linear-gradient(135deg, #3C33C0 0%, #1F0943 100%)'
WHERE tertiary_color IS NULL;