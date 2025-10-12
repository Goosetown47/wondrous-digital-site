-- =====================================================
-- Seed Hero1 Component for v0.1.7
-- =====================================================

-- Insert Hero1 (Hero - Two Column)
INSERT INTO core_components (
  id, name, type, source, code, dependencies, imports, metadata,
  created_at, updated_at, is_registered, registered_at, registered_by,
  default_content, type_id, editable_fields, code_name,
  deployment_status, pipeline_status, auto_number, base_type
)
SELECT
  '61d676ee-08e6-44fa-ac61-84b8e84e161f'::uuid,
  'Hero - Two Column',
  'section',
  'custom',
  -- Code stored in file: /nextjs-app/src/components/core/sections/hero1.tsx
  -- Due to size (10k+ lines), using placeholder - component file already deployed via git
  $CODE$'use client';

// Component code exists in: src/components/core/sections/hero1.tsx
// This database entry is for LAB management only
// The actual component code is deployed via Git and will be available after code deployment

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

// Full component implementation exists in codebase
export default function Hero1(props: any) {
  return <div>Hero1 - Component deployed via Git</div>;
}

export const hero1Config = {
  editableFields: [],
  defaultContent: {}
};
$CODE$,
  '[]'::jsonb,
  '[]'::jsonb,
  '{}'::jsonb,
  '2025-10-09 17:33:11.234+00'::timestamptz,
  '2025-10-09 17:33:11.354046+00'::timestamptz,
  false,
  NULL,
  NULL,
  '{"heading": "Blocks Built With Shadcn & Tailwind", "imageAlt": "", "imageUrl": "/images/placeholders/hero-placeholder.svg", "badgeIcon": "✨", "badgeText": "Your Website Builder", "subheading": "Finely crafted components built with React, Tailwind and Shadcn UI.", "imageObjectFit": "cover", "primaryButtonHref": "#", "primaryButtonSize": "lg", "primaryButtonText": "Discover all components", "imageObjectPosition": "center", "secondaryButtonHref": "#", "secondaryButtonSize": "lg", "secondaryButtonText": "View on GitHub", "primaryButtonVariant": "default", "secondaryButtonVariant": "outline"}'::jsonb,
  '2b5c3dfa-44b0-4082-871a-3e464d1b01a8'::uuid,
  '[{"path": "badgeIcon", "type": "text", "label": "Badge Icon"}, {"path": "badgeText", "type": "text", "label": "Badge Text"}, {"path": "heading", "type": "text", "label": "Heading"}, {"path": "subheading", "type": "richText", "label": "Subheading"}, {"path": "primaryButtonText", "type": "text", "label": "Primary Button Text"}, {"path": "primaryButtonHref", "type": "text", "label": "Primary Button Link"}, {"path": "secondaryButtonText", "type": "text", "label": "Secondary Button Text"}, {"path": "secondaryButtonHref", "type": "text", "label": "Secondary Button Link"}, {"path": "imageUrl", "type": "image", "label": "Hero Image"}]'::jsonb,
  'Hero1',
  '{"dev": false, "prod": false, "staging": false, "github_pr": null, "files_created": false, "last_deployment": null, "registry_updated": false}'::jsonb,
  'created',
  NULL,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM core_components WHERE id = '61d676ee-08e6-44fa-ac61-84b8e84e161f'::uuid
);

RAISE NOTICE 'Hero1 component database entry created. Actual code deployed via Git.';
