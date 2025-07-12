/*
  # Add Button Hover Colors to Site Styles

  1. New Columns
    - `primary_button_hover_color` - Custom hover color for primary buttons
    - `secondary_button_hover_color` - Custom hover color for secondary buttons

  2. Purpose
    - Enable customization of button hover states
    - Improve button styling flexibility
*/

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