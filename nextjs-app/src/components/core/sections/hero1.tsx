// Component: Hero - Two Column
// Created: 2025-10-09T17:33:11.435Z
// Edit in Core UI: /core
//
// This is a custom component with manual config.
// Config is defined in the source code below.

'use client';

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

