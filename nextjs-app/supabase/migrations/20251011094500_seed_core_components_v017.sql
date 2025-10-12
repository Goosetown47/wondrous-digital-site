-- =====================================================
-- Seed Core Components for v0.1.7
-- Components: Features1, Hero1, Navigation1, Services1
-- =====================================================



-- Insert Features - 6 Grid (Features1)
INSERT INTO core_components (
  id, name, type, source, code, dependencies, imports, metadata,
  created_at, updated_at, is_registered, registered_at, registered_by,
  default_content, type_id, editable_fields, code_name,
  deployment_status, pipeline_status, auto_number, base_type
)
SELECT
  '6367882a-4755-4002-8e2f-d85e510ffc0b'::uuid,
  'Features - 6 Grid',
  'section',
  'custom',
  $CODE$'use client';

import { EditableText } from '@/components/shared/content-editor/EditableText';
import { EditableArray } from '@/components/shared/structural-editor';
import type { EditableFieldConfig } from '@/lib/component-registry';
import { FeatureItem } from '@/components/features/feature-types';
import { FeatureItemEditor, FeatureItemDisplay } from '@/components/features/editors';
import { generateId } from '@/lib/structural-editor/utils';

interface Features1Props {
  heading?: string;
  features?: FeatureItem[];
  editable?: boolean;
  onUpdate?: (fieldPath: string, value: unknown) => void;
  projectId?: string;
}

export default function Features1({
  heading = 'Our Features',
  features = [],
  editable = false,
  onUpdate,
  projectId,
}: Features1Props) {
  return (
    <section
      className="py-12 px-4 md:py-16 lg:py-20 bg-background"
      aria-labelledby="features-heading"
    >
      <div className="container max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-12 md:mb-16">
          <EditableText
            value={heading}
            onUpdate={(val) => onUpdate?.('heading', val)}
            editable={editable}
            type="heading"
          >
            <h2
              id="features-heading"
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground"
            >
              {heading}
            </h2>
          </EditableText>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
          {editable ? (
            <EditableArray
              items={features}
              onUpdate={(items) => onUpdate?.('features', items)}
              itemEditor={FeatureItemEditor}
              itemDisplay={FeatureItemDisplay}
              editable={editable}
              addButtonText="Add Feature"
              emptyMessage="No features yet. Click 'Add Feature' to get started."
              projectId={projectId}
            />
          ) : (
            <>
              {features.map((feature) => (
                <FeatureItemDisplay key={feature.id} item={feature} />
              ))}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export const features1Config = {
  editableFields: [
    { path: 'heading', type: 'text', label: 'Section Heading', required: false },
    { path: 'features', type: 'array', label: 'Features', required: false },
  ] as EditableFieldConfig[],
  defaultContent: {
    heading: 'Our Features',
    features: [
      {
        id: 'feature-1',
        icon: 'zap',
        title: 'Lightning Fast',
        description: 'Experience blazing fast performance with our optimized infrastructure and cutting-edge technology.',
      },
      {
        id: 'feature-2',
        icon: 'shield',
        title: 'Secure & Safe',
        description: 'Your data is protected with enterprise-grade security and encryption at every level.',
      },
      {
        id: 'feature-3',
        icon: 'users',
        title: 'Team Collaboration',
        description: 'Work together seamlessly with powerful collaboration tools built for modern teams.',
      },
      {
        id: 'feature-4',
        icon: 'globe',
        title: 'Global Reach',
        description: 'Deploy worldwide with our global CDN and multi-region infrastructure.',
      },
      {
        id: 'feature-5',
        icon: 'trendingUp',
        title: 'Analytics & Insights',
        description: 'Make data-driven decisions with comprehensive analytics and real-time reporting.',
      },
      {
        id: 'feature-6',
        icon: 'settings',
        title: 'Customizable',
        description: 'Tailor every aspect to your needs with extensive customization options.',
      },
    ],
  },
};
$CODE$,
  '[]'::jsonb,
  '[]'::jsonb,
  '{}'::jsonb,
  '2025-10-09 23:32:22.819+00'::timestamptz,
  '2025-10-09 23:32:22.874032+00'::timestamptz,
  false,
  NULL,
  NULL,
  '{"heading": "Our Features", "features": [{"id": "feature-1", "icon": "zap", "title": "Lightning Fast", "description": "Experience blazing fast performance with our optimized infrastructure and cutting-edge technology."}, {"id": "feature-2", "icon": "shield", "title": "Secure & Safe", "description": "Your data is protected with enterprise-grade security and encryption at every level."}, {"id": "feature-3", "icon": "users", "title": "Team Collaboration", "description": "Work together seamlessly with powerful collaboration tools built for modern teams."}, {"id": "feature-4", "icon": "globe", "title": "Global Reach", "description": "Deploy worldwide with our global CDN and multi-region infrastructure."}, {"id": "feature-5", "icon": "trendingUp", "title": "Analytics & Insights", "description": "Make data-driven decisions with comprehensive analytics and real-time reporting."}, {"id": "feature-6", "icon": "settings", "title": "Customizable", "description": "Tailor every aspect to your needs with extensive customization options."}]}'::jsonb,
  '8ab27ec0-c368-4452-8026-8380420859a3'::uuid,
  '[{"path": "heading", "type": "text", "label": "Section Heading", "required": false}, {"path": "features", "type": "array", "label": "Features", "required": false}]'::jsonb,
  'Features1',
  '{"dev": false, "prod": false, "staging": false, "github_pr": null, "files_created": false, "last_deployment": null, "registry_updated": false}'::jsonb,
  'created',
  NULL,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM core_components WHERE id = '6367882a-4755-4002-8e2f-d85e510ffc0b'::uuid
);


-- Insert Hero - Two Column (Hero1)
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
  $CODE$'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EditableText } from '@/components/shared/content-editor/EditableText';
import { EditableImage } from '@/components/shared/content-editor/EditableImage';
import { EditableButton } from '@/components/shared/content-editor/EditableButton';
import { useButtonUpdate } from '@/hooks/useButtonUpdate';
import type { EditableFieldConfig } from '@/lib/component-registry';

interface HeroSixBadgeProps {
  // Badge fields
  badgeIcon?: string;
  badgeText?: string;

  // Content fields
  heading?: string;
  subheading?: string;

  // Primary button fields
  primaryButtonText?: string;
  primaryButtonHref?: string;
  primaryButtonVariant?: 'default' | 'outline' | 'ghost' | 'secondary';
  primaryButtonSize?: 'default' | 'sm' | 'lg';

  // Secondary button fields
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  secondaryButtonVariant?: 'default' | 'outline' | 'ghost' | 'secondary';
  secondaryButtonSize?: 'default' | 'sm' | 'lg';

  // Image field
  imageUrl?: string;
  imageObjectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  imageObjectPosition?: string;
  imageAlt?: string;

  // Required for LAB editing
  editable?: boolean;
  onUpdate?: (fieldPath: string, value: unknown) => void;
  onBatchUpdate?: (updates: Record<string, unknown>) => void;
}

export default function HeroSixBadge({
  badgeIcon = '✨',
  badgeText = 'Your Website Builder',
  heading = 'Blocks Built With Shadcn & Tailwind',
  subheading = 'Finely crafted components built with React, Tailwind and Shadcn UI. Developers can copy and paste these blocks directly into their project.',
  primaryButtonText = 'Discover all components',
  primaryButtonHref = '#',
  primaryButtonVariant = 'default',
  primaryButtonSize = 'lg',
  secondaryButtonText = 'View on GitHub',
  secondaryButtonHref = '#',
  secondaryButtonVariant = 'outline',
  secondaryButtonSize = 'lg',
  imageUrl = '/images/placeholders/hero-placeholder.svg',
  imageObjectFit = 'cover',
  imageObjectPosition = 'center',
  imageAlt,
  editable = false,
  onUpdate,
  onBatchUpdate
}: HeroSixBadgeProps) {
  // Create standardized button update handlers to prevent race conditions
  const handlePrimaryButtonUpdate = useButtonUpdate(onUpdate, onBatchUpdate, 'primaryButton');
  const handleSecondaryButtonUpdate = useButtonUpdate(onUpdate, onBatchUpdate, 'secondaryButton');

  // Handle image settings updates (includes URL, fit, position, alt)
  const handleImageSettingsUpdate = (settings: { imageUrl: string | null; objectFit?: string; objectPosition?: string; alt?: string }) => {
    if (onBatchUpdate) {
      onBatchUpdate({
        imageUrl: settings.imageUrl,
        imageObjectFit: settings.objectFit,
        imageObjectPosition: settings.objectPosition,
        imageAlt: settings.alt,
      });
    }
  };

  return (
    <section
      className="py-12 px-4 md:py-16 lg:py-24 bg-background"
      aria-labelledby="hero-heading"
    >
      <div className="container max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-6 md:space-y-8">
            {/* Badge */}
            <div>
              <Badge
                variant="secondary"
                className="px-3 py-1.5 text-sm font-medium bg-muted hover:bg-muted/80 transition-colors duration-200"
              >
                <EditableText
                  value={badgeIcon}
                  onUpdate={(val) => onUpdate?.('badgeIcon', val)}
                  editable={editable}
                  type="button"
                >
                  <span className="mr-2">{badgeIcon}</span>
                </EditableText>
                <EditableText
                  value={badgeText}
                  onUpdate={(val) => onUpdate?.('badgeText', val)}
                  editable={editable}
                  type="button"
                >
                  <span>{badgeText}</span>
                </EditableText>
              </Badge>
            </div>

            {/* Heading */}
            <EditableText
              value={heading}
              onUpdate={(val) => onUpdate?.('heading', val)}
              editable={editable}
              type="heading"
            >
              <h1
                id="hero-heading"
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight"
              >
                {heading}
              </h1>
            </EditableText>

            {/* Subheading */}
            <EditableText
              value={subheading}
              onUpdate={(val) => onUpdate?.('subheading', val)}
              editable={editable}
              type="paragraph"
              richText={true}
            >
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                {subheading}
              </p>
            </EditableText>

            {/* Button Group */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Primary Button */}
              <EditableButton
                buttonData={{
                  text: primaryButtonText,
                  url: primaryButtonHref,
                  variant: primaryButtonVariant,
                  size: primaryButtonSize
                }}
                onUpdate={handlePrimaryButtonUpdate}
                editable={editable}
              >
                <Button
                  variant={primaryButtonVariant}
                  size={primaryButtonSize}
                  className="transition-all duration-300 hover:scale-105 active:scale-95 w-full sm:w-auto"
                  asChild
                >
                  <Link
                    href={primaryButtonHref}
                    aria-label={`${primaryButtonText} - Primary action`}
                  >
                    {primaryButtonText}
                  </Link>
                </Button>
              </EditableButton>

              {/* Secondary Button */}
              <EditableButton
                buttonData={{
                  text: secondaryButtonText,
                  url: secondaryButtonHref,
                  variant: secondaryButtonVariant,
                  size: secondaryButtonSize
                }}
                onUpdate={handleSecondaryButtonUpdate}
                editable={editable}
              >
                <Button
                  variant={secondaryButtonVariant}
                  size={secondaryButtonSize}
                  className="transition-all duration-300 hover:scale-105 active:scale-95 w-full sm:w-auto"
                  asChild
                >
                  <Link
                    href={secondaryButtonHref}
                    aria-label={`${secondaryButtonText} - Secondary action`}
                  >
                    {secondaryButtonText}
                  </Link>
                </Button>
              </EditableButton>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative aspect-[16/10] md:aspect-[4/3] bg-muted rounded-lg border border-border overflow-hidden">
            {editable ? (
              <EditableImage
                src={imageUrl}
                alt={imageAlt || heading}
                objectFit={imageObjectFit}
                objectPosition={imageObjectPosition}
                onUpdate={(val) => onUpdate?.('imageUrl', val)}
                onUpdateSettings={handleImageSettingsUpdate}
                editable={editable}
              />
            ) : (
              <Image
                src={imageUrl}
                alt={imageAlt || heading}
                fill
                className="transition-all duration-200"
                style={{
                  objectFit: imageObjectFit,
                  objectPosition: imageObjectPosition,
                }}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Config export - required for component registry
export const herosixbadgeConfig = {
  editableFields: [
    // Badge fields
    { path: 'badgeIcon', type: 'text', label: 'Badge Icon', required: false },
    { path: 'badgeText', type: 'text', label: 'Badge Text', required: false },

    // Content fields
    { path: 'heading', type: 'text', label: 'Heading', required: false },
    { path: 'subheading', type: 'richText', label: 'Subheading', required: false },

    // Primary button fields
    { path: 'primaryButtonText', type: 'text', label: 'Primary Button Text', required: false },
    { path: 'primaryButtonHref', type: 'text', label: 'Primary Button Link', required: false },
    { path: 'primaryButtonVariant', type: 'text', label: 'Primary Button Variant', required: false },
    { path: 'primaryButtonSize', type: 'text', label: 'Primary Button Size', required: false },

    // Secondary button fields
    { path: 'secondaryButtonText', type: 'text', label: 'Secondary Button Text', required: false },
    { path: 'secondaryButtonHref', type: 'text', label: 'Secondary Button Link', required: false },
    { path: 'secondaryButtonVariant', type: 'text', label: 'Secondary Button Variant', required: false },
    { path: 'secondaryButtonSize', type: 'text', label: 'Secondary Button Size', required: false },

    // Image fields
    { path: 'imageUrl', type: 'image', label: 'Hero Image', required: false },
    { path: 'imageObjectFit', type: 'text', label: 'Image Fit', required: false },
    { path: 'imageObjectPosition', type: 'text', label: 'Image Position', required: false },
    { path: 'imageAlt', type: 'text', label: 'Image Alt Text', required: false }
  ] as EditableFieldConfig[],
  defaultContent: {
    badgeIcon: '✨',
    badgeText: 'Your Website Builder',
    heading: 'Blocks Built With Shadcn & Tailwind',
    subheading: 'Finely crafted components built with React, Tailwind and Shadcn UI. Developers can copy and paste these blocks directly into their project.',
    primaryButtonText: 'Discover all components',
    primaryButtonHref: '#',
    primaryButtonVariant: 'default',
    primaryButtonSize: 'lg',
    secondaryButtonText: 'View on GitHub',
    secondaryButtonHref: '#',
    secondaryButtonVariant: 'outline',
    secondaryButtonSize: 'lg',
    imageUrl: '/images/placeholders/hero-placeholder.svg',
    imageObjectFit: 'cover',
    imageObjectPosition: 'center',
    imageAlt: ''
  }
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
  '{"heading": "Blocks Built With Shadcn & Tailwind", "imageAlt": "", "imageUrl": "/images/placeholders/hero-placeholder.svg", "badgeIcon": "\u2728", "badgeText": "Your Website Builder", "subheading": "Finely crafted components built with React, Tailwind and Shadcn UI. Developers can copy and paste these blocks directly into their project.", "imageObjectFit": "cover", "primaryButtonHref": "#", "primaryButtonSize": "lg", "primaryButtonText": "Discover all components", "imageObjectPosition": "center", "secondaryButtonHref": "#", "secondaryButtonSize": "lg", "secondaryButtonText": "View on GitHub", "primaryButtonVariant": "default", "secondaryButtonVariant": "outline"}'::jsonb,
  '2b5c3dfa-44b0-4082-871a-3e464d1b01a8'::uuid,
  '[{"path": "badgeIcon", "type": "text", "label": "Badge Icon", "required": false}, {"path": "badgeText", "type": "text", "label": "Badge Text", "required": false}, {"path": "heading", "type": "text", "label": "Heading", "required": false}, {"path": "subheading", "type": "richText", "label": "Subheading", "required": false}, {"path": "primaryButtonText", "type": "text", "label": "Primary Button Text", "required": false}, {"path": "primaryButtonHref", "type": "text", "label": "Primary Button Link", "required": false}, {"path": "primaryButtonVariant", "type": "text", "label": "Primary Button Variant", "required": false}, {"path": "primaryButtonSize", "type": "text", "label": "Primary Button Size", "required": false}, {"path": "secondaryButtonText", "type": "text", "label": "Secondary Button Text", "required": false}, {"path": "secondaryButtonHref", "type": "text", "label": "Secondary Button Link", "required": false}, {"path": "secondaryButtonVariant", "type": "text", "label": "Secondary Button Variant", "required": false}, {"path": "secondaryButtonSize", "type": "text", "label": "Secondary Button Size", "required": false}, {"path": "imageUrl", "type": "image", "label": "Hero Image", "required": false}, {"path": "imageObjectFit", "type": "text", "label": "Image Fit", "required": false}, {"path": "imageObjectPosition", "type": "text", "label": "Image Position", "required": false}, {"path": "imageAlt", "type": "text", "label": "Image Alt Text", "required": false}]'::jsonb,
  'Hero1',
  '{"dev": false, "prod": false, "staging": false, "github_pr": null, "files_created": false, "last_deployment": null, "registry_updated": false}'::jsonb,
  'created',
  NULL,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM core_components WHERE id = '61d676ee-08e6-44fa-ac61-84b8e84e161f'::uuid
);


-- Insert Navbar 1 (Navigation1)
INSERT INTO core_components (
  id, name, type, source, code, dependencies, imports, metadata,
  created_at, updated_at, is_registered, registered_at, registered_by,
  default_content, type_id, editable_fields, code_name,
  deployment_status, pipeline_status, auto_number, base_type
)
SELECT
  '567bb396-772b-46f6-8eb6-43cf1364037e'::uuid,
  'Navbar 1',
  'section',
  'custom',
  $CODE$/**
 * Nav1 Component
 *
 * Navigation bar with logo, menu items (with dropdowns), and action buttons
 * Uses structural editing system for direct in-place nav item management
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { EditableText } from '@/components/shared/content-editor/EditableText';
import { EditableImage } from '@/components/shared/content-editor/EditableImage';
import { EditableArray } from '@/components/shared/structural-editor';
import { NavItem } from '@/components/navigation/nav-types';
import { NavItemEditor, NavItemDisplay } from '@/components/navigation/editors';
import type { EditableFieldConfig } from '@/lib/component-registry';

interface Nav1Props {
  // Brand
  logoSrc?: string;
  logoAlt?: string;
  businessName?: string;

  // Navigation structure
  navItems?: NavItem[];

  // Actions
  signInText?: string;
  signInHref?: string;
  ctaButtonText?: string;
  ctaButtonHref?: string;

  // Required for editing
  editable?: boolean;
  onUpdate?: (fieldPath: string, value: unknown) => void;

  // Project context
  projectId?: string;
}

export default function Nav1({
  logoSrc = '/images/Branding/Wondrous_W_100x100.png',
  logoAlt = 'Logo',
  businessName = 'Business Name',
  navItems = [],
  signInText = 'Sign in',
  signInHref = '#',
  ctaButtonText = 'Get Started',
  ctaButtonHref = '#',
  editable = false,
  onUpdate,
  projectId,
}: Nav1Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-background border-b border-border">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            {editable ? (
              <EditableImage
                src={logoSrc}
                alt={logoAlt}
                onUpdate={(val) => onUpdate?.('logoSrc', val)}
                editable={editable}
                className="w-8 h-8"
              />
            ) : (
              <Image src={logoSrc} alt={logoAlt} width={32} height={32} className="w-8 h-8" />
            )}

            <EditableText
              value={businessName}
              onUpdate={(val) => onUpdate?.('businessName', val)}
              editable={editable}
              type="heading"
            >
              <span className="text-lg font-semibold text-foreground">{businessName}</span>
            </EditableText>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {editable ? (
              <EditableArray
                items={navItems}
                onUpdate={(items) => onUpdate?.('navItems', items)}
                itemEditor={NavItemEditor}
                itemDisplay={NavItemDisplay}
                editable={editable}
                addButtonText="Add Nav Item"
                emptyMessage="No navigation items. Click + to add your first link."
                projectId={projectId}
              />
            ) : navItems.length > 0 ? (
              navItems.map((item) => <NavItemDisplay key={item.id} item={item} />)
            ) : null}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href={signInHref}>
                <EditableText
                  value={signInText}
                  onUpdate={(val) => onUpdate?.('signInText', val)}
                  editable={editable}
                  type="button"
                >
                  <span>{signInText}</span>
                </EditableText>
              </Link>
            </Button>

            <Button size="sm" asChild>
              <Link href={ctaButtonHref}>
                <EditableText
                  value={ctaButtonText}
                  onUpdate={(val) => onUpdate?.('ctaButtonText', val)}
                  editable={editable}
                  type="button"
                >
                  <span>{ctaButtonText}</span>
                </EditableText>
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-4 space-y-3">
            {/* Mobile Navigation Items */}
            {navItems.length > 0 && (
              <div className="space-y-2">
                {navItems.map((item) => {
                  const href =
                    item.linkType === 'page' && item.pageId
                      ? `/page/${item.pageId}`
                      : item.externalUrl || '#';

                  return (
                    <div key={item.id} className="space-y-2">
                      {/* Main Nav Item */}
                      <Link
                        href={href}
                        className="block py-2 text-sm font-medium text-foreground hover:text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                        target={item.linkType === 'external' ? '_blank' : undefined}
                        rel={item.linkType === 'external' ? 'noopener noreferrer' : undefined}
                      >
                        {item.label}
                      </Link>

                      {/* Dropdown Items (if any) */}
                      {item.hasDropdown && item.dropdownItems && item.dropdownItems.length > 0 && (
                        <div className="pl-4 space-y-2">
                          {item.dropdownItems.map((dropdownItem) => {
                            const dropdownHref =
                              dropdownItem.linkType === 'page' && dropdownItem.pageId
                                ? `/page/${dropdownItem.pageId}`
                                : dropdownItem.externalUrl || '#';

                            return (
                              <Link
                                key={dropdownItem.id}
                                href={dropdownHref}
                                className="block py-2"
                                onClick={() => setMobileMenuOpen(false)}
                                target={
                                  dropdownItem.linkType === 'external' ? '_blank' : undefined
                                }
                                rel={
                                  dropdownItem.linkType === 'external'
                                    ? 'noopener noreferrer'
                                    : undefined
                                }
                              >
                                <div className="font-medium text-sm text-foreground">
                                  {dropdownItem.label}
                                </div>
                                {dropdownItem.description && (
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    {dropdownItem.description}
                                  </div>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Mobile Actions */}
            <div className="pt-4 space-y-2 border-t border-border">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href={signInHref} onClick={() => setMobileMenuOpen(false)}>
                  {signInText}
                </Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href={ctaButtonHref} onClick={() => setMobileMenuOpen(false)}>
                  {ctaButtonText}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// Export configuration for CORE registry
export const nav1Config = {
  editableFields: [
    { path: 'logoSrc', type: 'image', label: 'Logo Image', required: false },
    { path: 'logoAlt', type: 'text', label: 'Logo Alt Text', required: false },
    { path: 'businessName', type: 'text', label: 'Business Name', required: false },
    { path: 'navItems', type: 'array', label: 'Navigation Items', required: false },
    { path: 'signInText', type: 'text', label: 'Sign In Text', required: false },
    { path: 'signInHref', type: 'text', label: 'Sign In Link', required: false },
    { path: 'ctaButtonText', type: 'text', label: 'CTA Button Text', required: false },
    { path: 'ctaButtonHref', type: 'text', label: 'CTA Button Link', required: false },
  ] as EditableFieldConfig[],
  defaultContent: {
    logoSrc: '/images/Branding/Wondrous_W_100x100.png',
    logoAlt: 'Logo',
    businessName: 'Business Name',
    navItems: [], // START EMPTY
    signInText: 'Sign in',
    signInHref: '#',
    ctaButtonText: 'Get Started',
    ctaButtonHref: '#',
  },
};
$CODE$,
  '[]'::jsonb,
  '[]'::jsonb,
  '{}'::jsonb,
  '2025-10-03 01:52:53.083+00'::timestamptz,
  '2025-10-03 01:52:53.269103+00'::timestamptz,
  false,
  NULL,
  NULL,
  '{"logoAlt": "Logo", "logoSrc": "/images/Branding/Wondrous_W_100x100.png", "navItems": [], "signInHref": "#", "signInText": "Sign in", "businessName": "Business Name", "ctaButtonHref": "#", "ctaButtonText": "Get Started"}'::jsonb,
  '38e45b38-8f3e-45d9-b824-0dbd4a234fd4'::uuid,
  '[{"path": "logoSrc", "type": "image", "label": "Logo Image", "required": false}, {"path": "logoAlt", "type": "text", "label": "Logo Alt Text", "required": false}, {"path": "businessName", "type": "text", "label": "Business Name", "required": false}, {"path": "navItems", "type": "array", "label": "Navigation Items", "required": false}, {"path": "signInText", "type": "text", "label": "Sign In Text", "required": false}, {"path": "signInHref", "type": "text", "label": "Sign In Link", "required": false}, {"path": "ctaButtonText", "type": "text", "label": "CTA Button Text", "required": false}, {"path": "ctaButtonHref", "type": "text", "label": "CTA Button Link", "required": false}]'::jsonb,
  'Navigation1',
  '{"dev": false, "prod": false, "staging": false, "github_pr": null, "files_created": false, "last_deployment": null, "registry_updated": false}'::jsonb,
  'created',
  NULL,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM core_components WHERE id = '567bb396-772b-46f6-8eb6-43cf1364037e'::uuid
);


-- Insert Services - Accordion (Services1)
INSERT INTO core_components (
  id, name, type, source, code, dependencies, imports, metadata,
  created_at, updated_at, is_registered, registered_at, registered_by,
  default_content, type_id, editable_fields, code_name,
  deployment_status, pipeline_status, auto_number, base_type
)
SELECT
  '5a34c72d-f72d-452a-bdd2-c4363ecb9a37'::uuid,
  'Services - Accordion',
  'section',
  'custom',
  $CODE$'use client';

import { EditableText } from '@/components/shared/content-editor/EditableText';
import { Accordion } from '@/components/ui/accordion';
import { ServiceItem } from '@/components/services/service-types';
import { ServiceItemEditor, ServiceItemDisplay } from '@/components/services/editors';
import { useArrayEditor, useItemConfig } from '@/lib/structural-editor/hooks';
import { ItemConfigModal } from '@/components/shared/structural-editor/ItemConfigModal';
import { AddButton } from '@/components/shared/structural-editor/AddButton';
import type { EditableFieldConfig } from '@/lib/component-registry';

interface ServicesAccordionProps {
  heading?: string;
  subtitle?: string;
  services?: ServiceItem[];
  editable?: boolean;
  onUpdate?: (fieldPath: string, value: unknown) => void;
  projectId?: string;
}

export default function ServicesAccordion({
  heading = 'Services',
  subtitle = 'Click to learn more about each service we offer.',
  services = [],
  editable = false,
  onUpdate,
  projectId,
}: ServicesAccordionProps) {
  // Wrap onUpdate to handle array updates
  const handleArrayUpdate = (items: ServiceItem[]) => {
    onUpdate?.('services', items);
  };

  const { handleAdd, handleEdit, handleDelete } = useArrayEditor(services, handleArrayUpdate);
  const { isOpen, item, operation, openForCreate, openForEdit, close } = useItemConfig<ServiceItem>();

  const handleSave = (configuredItem: ServiceItem) => {
    if (operation === 'add') {
      handleAdd(configuredItem);
    } else if (operation === 'edit') {
      handleEdit(configuredItem);
    }
    close();
  };

  return (
    <section
      className="py-12 px-4 md:py-16 lg:py-20 bg-background"
      aria-labelledby="services-heading"
    >
      <div className="container max-w-3xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-8 md:mb-12">
          <EditableText
            value={heading}
            onUpdate={(val) => onUpdate?.('heading', val)}
            editable={editable}
            type="heading"
          >
            <h2
              id="services-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4"
            >
              {heading}
            </h2>
          </EditableText>

          <EditableText
            value={subtitle}
            onUpdate={(val) => onUpdate?.('subtitle', val)}
            editable={editable}
            type="paragraph"
          >
            <p className="text-base md:text-lg text-muted-foreground">
              {subtitle}
            </p>
          </EditableText>
        </div>

        {/* Services Accordion */}
        <div className="space-y-4">
          {/* Empty State */}
          {services.length === 0 && (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
              {editable ? 'No items yet. Click "Add Item" to create your first one.' : 'No items available.'}
            </div>
          )}

          {/* Accordion with Items */}
          {services.length > 0 && (
            <Accordion type="single" collapsible className="space-y-4">
              {services.map((service) => (
                <ServiceItemDisplay
                  key={service.id}
                  item={service}
                  inAccordion={true}
                  showControls={editable}
                  onEdit={() => openForEdit(service)}
                  onDelete={() => handleDelete(service.id)}
                />
              ))}
            </Accordion>
          )}

          {/* Add Button (Edit Mode Only) */}
          {editable && (
            <div className="flex justify-start">
              <AddButton onClick={openForCreate} text="Add Item" />
            </div>
          )}
        </div>
      </div>

      {/* Config Modal (Edit Mode Only) */}
      {editable && (
        <ItemConfigModal
          isOpen={isOpen}
          onClose={close}
          onSave={handleSave}
          item={item}
          title={operation === 'add' ? 'Add Item' : 'Edit Item'}
        >
          <ServiceItemEditor
            item={item}
            onSave={handleSave}
            onCancel={close}
            projectId={projectId}
          />
        </ItemConfigModal>
      )}
    </section>
  );
}

export const servicesaccordionConfig = {
  editableFields: [
    { path: 'heading', type: 'text', label: 'Heading', required: false },
    { path: 'subtitle', type: 'text', label: 'Subtitle', required: false },
    { path: 'services', type: 'array', label: 'Services', required: false },
  ] as EditableFieldConfig[],
  defaultContent: {
    heading: 'Services',
    subtitle: 'Click to learn more about each service we offer.',
    services: [],
  },
};
$CODE$,
  '[]'::jsonb,
  '[]'::jsonb,
  '{}'::jsonb,
  '2025-10-09 22:19:38.37+00'::timestamptz,
  '2025-10-09 22:19:38.417173+00'::timestamptz,
  false,
  NULL,
  NULL,
  '{"heading": "Services", "services": [], "subtitle": "Click to learn more about each service we offer."}'::jsonb,
  '409bcd35-07fa-4a43-8608-cd30b9f431c6'::uuid,
  '[{"path": "heading", "type": "text", "label": "Heading", "required": false}, {"path": "subtitle", "type": "text", "label": "Subtitle", "required": false}, {"path": "services", "type": "array", "label": "Services", "required": false}]'::jsonb,
  'Services1',
  '{"dev": false, "prod": false, "staging": false, "github_pr": null, "files_created": false, "last_deployment": null, "registry_updated": false}'::jsonb,
  'created',
  NULL,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM core_components WHERE id = '5a34c72d-f72d-452a-bdd2-c4363ecb9a37'::uuid
);
