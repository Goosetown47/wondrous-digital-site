-- Update HeroTwoColumn component to include secondary button fields
UPDATE core_components
SET
  default_content = jsonb_build_object(
    'heading', 'Welcome to Your Site',
    'subtext', 'Build something amazing with our platform',
    'buttonText', 'Get Started',
    'buttonLink', '#',
    'secondaryButtonText', 'View on GitHub',
    'secondaryButtonLink', '#',
    'imageUrl', ''
  ),
  editable_fields = jsonb_build_array(
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
  updated_at = NOW()
WHERE name = 'HeroTwoColumn';