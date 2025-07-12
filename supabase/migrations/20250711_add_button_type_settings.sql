-- Add per-button-type configuration fields
ALTER TABLE site_styles
-- Radius fields for each button type
ADD COLUMN IF NOT EXISTS primary_button_radius text DEFAULT 'slightly-rounded',
ADD COLUMN IF NOT EXISTS secondary_button_radius text DEFAULT 'slightly-rounded',
ADD COLUMN IF NOT EXISTS tertiary_button_radius text DEFAULT 'slightly-rounded',

-- Size fields for each button type
ADD COLUMN IF NOT EXISTS primary_button_size text DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS secondary_button_size text DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS tertiary_button_size text DEFAULT 'medium',

-- Icon settings for each button type
ADD COLUMN IF NOT EXISTS primary_button_icon_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS primary_button_icon_position text DEFAULT 'right',
ADD COLUMN IF NOT EXISTS secondary_button_icon_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS secondary_button_icon_position text DEFAULT 'right',
ADD COLUMN IF NOT EXISTS tertiary_button_icon_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS tertiary_button_icon_position text DEFAULT 'right',
ADD COLUMN IF NOT EXISTS textlink_button_icon_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS textlink_button_icon_position text DEFAULT 'right',

-- Typography settings for each button type
ADD COLUMN IF NOT EXISTS primary_button_font text DEFAULT 'primary',
ADD COLUMN IF NOT EXISTS primary_button_weight text DEFAULT '500',
ADD COLUMN IF NOT EXISTS secondary_button_font text DEFAULT 'primary',
ADD COLUMN IF NOT EXISTS secondary_button_weight text DEFAULT '500',
ADD COLUMN IF NOT EXISTS tertiary_button_font text DEFAULT 'primary',
ADD COLUMN IF NOT EXISTS tertiary_button_weight text DEFAULT '500',
ADD COLUMN IF NOT EXISTS textlink_button_font text DEFAULT 'primary',
ADD COLUMN IF NOT EXISTS textlink_button_weight text DEFAULT '500',

-- Additional color fields for buttons
ADD COLUMN IF NOT EXISTS primary_button_background_color text,
ADD COLUMN IF NOT EXISTS secondary_button_background_color text,
ADD COLUMN IF NOT EXISTS primary_button_text_color text,
ADD COLUMN IF NOT EXISTS secondary_button_text_color text,
ADD COLUMN IF NOT EXISTS primary_button_border_color text,
ADD COLUMN IF NOT EXISTS secondary_button_border_color text,
ADD COLUMN IF NOT EXISTS primary_button_shadow_color text,
ADD COLUMN IF NOT EXISTS secondary_button_shadow_color text,
ADD COLUMN IF NOT EXISTS outline_text_color text,
ADD COLUMN IF NOT EXISTS outline_border_color text,
ADD COLUMN IF NOT EXISTS outline_hover_bg text,
ADD COLUMN IF NOT EXISTS outline_background_color text,
ADD COLUMN IF NOT EXISTS outline_shadow_color text,
ADD COLUMN IF NOT EXISTS text_link_color text,
ADD COLUMN IF NOT EXISTS text_link_hover_color text;

-- Add check constraints for valid values
ALTER TABLE site_styles
ADD CONSTRAINT IF NOT EXISTS check_primary_button_radius CHECK (primary_button_radius IN ('squared', 'slightly-rounded', 'fully-rounded')),
ADD CONSTRAINT IF NOT EXISTS check_secondary_button_radius CHECK (secondary_button_radius IN ('squared', 'slightly-rounded', 'fully-rounded')),
ADD CONSTRAINT IF NOT EXISTS check_tertiary_button_radius CHECK (tertiary_button_radius IN ('squared', 'slightly-rounded', 'fully-rounded')),
ADD CONSTRAINT IF NOT EXISTS check_primary_button_size CHECK (primary_button_size IN ('small', 'medium', 'large')),
ADD CONSTRAINT IF NOT EXISTS check_secondary_button_size CHECK (secondary_button_size IN ('small', 'medium', 'large')),
ADD CONSTRAINT IF NOT EXISTS check_tertiary_button_size CHECK (tertiary_button_size IN ('small', 'medium', 'large')),
ADD CONSTRAINT IF NOT EXISTS check_primary_button_icon_position CHECK (primary_button_icon_position IN ('left', 'right')),
ADD CONSTRAINT IF NOT EXISTS check_secondary_button_icon_position CHECK (secondary_button_icon_position IN ('left', 'right')),
ADD CONSTRAINT IF NOT EXISTS check_tertiary_button_icon_position CHECK (tertiary_button_icon_position IN ('left', 'right')),
ADD CONSTRAINT IF NOT EXISTS check_textlink_button_icon_position CHECK (textlink_button_icon_position IN ('left', 'right'));