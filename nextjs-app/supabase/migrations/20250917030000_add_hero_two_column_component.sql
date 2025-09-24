-- Add HeroTwoColumn to core_components for testing the EditableSectionWrapper
-- This component was built as our proof-of-concept for editable sections

INSERT INTO core_components (
  name,
  type,
  source,
  code,
  dependencies,
  imports,
  metadata,
  default_content,
  editable_fields,
  is_registered,
  registered_at,
  created_at,
  updated_at
) VALUES (
  'HeroTwoColumn',
  'section',
  'custom',
  E'// Component code is in /src/components/sections/hero-two-column.tsx\n// This is our custom proof-of-concept component',
  '[]'::jsonb,
  '["EditableText", "EditableImage", "Button", "cn"]'::jsonb,
  jsonb_build_object(
    'component_code', 'HeroTwoColumn',
    'description', 'Hero section with two column layout',
    'displayName', 'Hero Two Column'
  ),
  jsonb_build_object(
    'heading', 'Welcome to Your Site',
    'subtext', 'Build something amazing with our platform',
    'buttonText', 'Get Started',
    'buttonLink', '#',
    'secondaryButtonText', 'View on GitHub',
    'secondaryButtonLink', '#',
    'imageUrl', ''
  ),
  jsonb_build_array(
    jsonb_build_object(
      'path', 'heading',
      'type', 'text',
      'label', 'Main Heading',
      'maxLength', 100,
      'required', true
    ),
    jsonb_build_object(
      'path', 'subtext',
      'type', 'richText',
      'label', 'Subtitle Text',
      'description', 'Supporting text below the heading',
      'maxLength', 200
    ),
    jsonb_build_object(
      'path', 'buttonText',
      'type', 'text',
      'label', 'Button Label',
      'maxLength', 30
    ),
    jsonb_build_object(
      'path', 'secondaryButtonText',
      'type', 'text',
      'label', 'Secondary Button Label',
      'maxLength', 30
    ),
    jsonb_build_object(
      'path', 'imageUrl',
      'type', 'image',
      'label', 'Hero Image',
      'description', 'Featured image for the hero section',
      'allowedFormats', jsonb_build_array('jpg', 'jpeg', 'png', 'webp')
    )
  ),
  true,
  NOW(),
  NOW(),
  NOW()
);

-- Add a comment explaining this component
COMMENT ON COLUMN core_components.name IS 'Component name that matches the registry entry';