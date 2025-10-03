/**
 * Footer1 Component
 *
 * Footer with logo, link columns, and copyright
 * Uses structural editing system for direct in-place column/link management
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { EditableText } from '@/components/shared/content-editor/EditableText';
import { EditableImage } from '@/components/shared/content-editor/EditableImage';
import { EditableArray } from '@/components/shared/structural-editor';
import { FooterColumn } from '@/components/footer/footer-types';
import { FooterColumnEditor, FooterColumnDisplay } from '@/components/footer/editors';
import type { EditableFieldConfig } from '@/lib/component-registry';

interface Footer1Props {
  // Brand
  logoSrc?: string;
  logoAlt?: string;
  businessName?: string;
  tagline?: string;

  // Footer columns
  footerColumns?: FooterColumn[];

  // Copyright
  copyrightText?: string;

  // Legal links
  termsText?: string;
  termsHref?: string;
  privacyText?: string;
  privacyHref?: string;

  // Required for editing
  editable?: boolean;
  onUpdate?: (fieldPath: string, value: unknown) => void;

  // Project context
  projectId?: string;
}

export default function Footer1({
  logoSrc = '/images/Branding/Wondrous_W_100x100.png',
  logoAlt = 'Logo',
  businessName = 'Business Name',
  tagline = 'Components made easy.',
  footerColumns = [],
  copyrightText = '© 2024 Business Name. All rights reserved.',
  termsText = 'Terms and Conditions',
  termsHref = '#',
  privacyText = 'Privacy Policy',
  privacyHref = '#',
  editable = false,
  onUpdate,
  projectId,
}: Footer1Props) {
  return (
    <footer className="w-full bg-background border-t border-border">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
          {/* Logo and Tagline */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
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

            <EditableText
              value={tagline}
              onUpdate={(val) => onUpdate?.('tagline', val)}
              editable={editable}
              type="paragraph"
            >
              <p className="text-sm text-foreground font-medium">{tagline}</p>
            </EditableText>
          </div>

          {/* Link Columns */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-16">
            {editable ? (
              <EditableArray
                items={footerColumns}
                onUpdate={(items) => onUpdate?.('footerColumns', items)}
                itemEditor={FooterColumnEditor}
                itemDisplay={FooterColumnDisplay}
                editable={editable}
                addButtonText="Add Column"
                emptyMessage="No footer columns. Click + to add your first column."
                projectId={projectId}
              />
            ) : footerColumns.length > 0 ? (
              footerColumns.map((column) => (
                <FooterColumnDisplay key={column.id} item={column} />
              ))
            ) : null}
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <EditableText
              value={copyrightText}
              onUpdate={(val) => onUpdate?.('copyrightText', val)}
              editable={editable}
              type="paragraph"
            >
              <p className="text-sm text-muted-foreground">{copyrightText}</p>
            </EditableText>

            <div className="flex items-center gap-6">
              <Link
                href={termsHref}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <EditableText
                  value={termsText}
                  onUpdate={(val) => onUpdate?.('termsText', val)}
                  editable={editable}
                  type="paragraph"
                >
                  <span>{termsText}</span>
                </EditableText>
              </Link>

              <Link
                href={privacyHref}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <EditableText
                  value={privacyText}
                  onUpdate={(val) => onUpdate?.('privacyText', val)}
                  editable={editable}
                  type="paragraph"
                >
                  <span>{privacyText}</span>
                </EditableText>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Export configuration for CORE registry
export const footer1Config = {
  editableFields: [
    { path: 'logoSrc', type: 'image', label: 'Logo Image', required: false },
    { path: 'logoAlt', type: 'text', label: 'Logo Alt Text', required: false },
    { path: 'businessName', type: 'text', label: 'Business Name', required: false },
    { path: 'tagline', type: 'text', label: 'Tagline', required: false },
    { path: 'footerColumns', type: 'array', label: 'Footer Columns', required: false },
    { path: 'copyrightText', type: 'text', label: 'Copyright Text', required: false },
    { path: 'termsText', type: 'text', label: 'Terms Link Text', required: false },
    { path: 'termsHref', type: 'text', label: 'Terms Link URL', required: false },
    { path: 'privacyText', type: 'text', label: 'Privacy Link Text', required: false },
    { path: 'privacyHref', type: 'text', label: 'Privacy Link URL', required: false },
  ] as EditableFieldConfig[],
  defaultContent: {
    logoSrc: '/images/Branding/Wondrous_W_100x100.png',
    logoAlt: 'Logo',
    businessName: 'Business Name',
    tagline: 'Components made easy.',
    footerColumns: [], // START EMPTY
    copyrightText: '© 2024 Business Name. All rights reserved.',
    termsText: 'Terms and Conditions',
    termsHref: '#',
    privacyText: 'Privacy Policy',
    privacyHref: '#',
  },
};
