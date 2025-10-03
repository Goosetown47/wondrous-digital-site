// Component: Navbar 1
// Created: 2025-10-03T01:52:53.285Z
// Edit in Core UI: /core
//
// This is a custom component with manual config.
// Config is defined in the source code below.

'use client';

/**
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
import { EditableButton } from '@/components/shared/content-editor/EditableButton';
import type { ButtonData } from '@/components/shared/content-editor';
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
  signInVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  signInSize?: 'default' | 'sm' | 'lg' | 'icon';
  ctaButtonText?: string;
  ctaButtonHref?: string;
  ctaButtonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  ctaButtonSize?: 'default' | 'sm' | 'lg' | 'icon';

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
  signInVariant = 'ghost',
  signInSize = 'sm',
  ctaButtonText = 'Get Started',
  ctaButtonHref = '#',
  ctaButtonVariant = 'default',
  ctaButtonSize = 'sm',
  editable = false,
  onUpdate,
  projectId,
}: Nav1Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-background">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link
            href="/"
            className="flex items-center gap-2 flex-shrink-0"
            onClick={(e) => editable && e.preventDefault()}
          >
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
                projectId={projectId}
                compact={true}
              />
            ) : navItems.length > 0 ? (
              navItems.map((item) => <NavItemDisplay key={item.id} item={item} />)
            ) : null}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <EditableButton
              buttonData={{
                text: signInText,
                url: signInHref,
                variant: signInVariant,
                size: signInSize,
              }}
              onUpdate={(data: ButtonData) => {
                onUpdate?.('signInText', data.text);
                onUpdate?.('signInHref', data.url);
                if (data.variant) onUpdate?.('signInVariant', data.variant);
                if (data.size) onUpdate?.('signInSize', data.size);
              }}
              editable={editable}
            >
              <Button variant={signInVariant} size={signInSize} asChild>
                <Link href={signInHref} onClick={(e) => editable && e.preventDefault()}>
                  {signInText}
                </Link>
              </Button>
            </EditableButton>

            <EditableButton
              buttonData={{
                text: ctaButtonText,
                url: ctaButtonHref,
                variant: ctaButtonVariant,
                size: ctaButtonSize,
              }}
              onUpdate={(data: ButtonData) => {
                onUpdate?.('ctaButtonText', data.text);
                onUpdate?.('ctaButtonHref', data.url);
                if (data.variant) onUpdate?.('ctaButtonVariant', data.variant);
                if (data.size) onUpdate?.('ctaButtonSize', data.size);
              }}
              editable={editable}
            >
              <Button variant={ctaButtonVariant} size={ctaButtonSize} asChild>
                <Link href={ctaButtonHref} onClick={(e) => editable && e.preventDefault()}>
                  {ctaButtonText}
                </Link>
              </Button>
            </EditableButton>
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
    { path: 'signInVariant', type: 'text', label: 'Sign In Button Variant', required: false },
    { path: 'signInSize', type: 'text', label: 'Sign In Button Size', required: false },
    { path: 'ctaButtonText', type: 'text', label: 'CTA Button Text', required: false },
    { path: 'ctaButtonHref', type: 'text', label: 'CTA Button Link', required: false },
    { path: 'ctaButtonVariant', type: 'text', label: 'CTA Button Variant', required: false },
    { path: 'ctaButtonSize', type: 'text', label: 'CTA Button Size', required: false },
  ] as EditableFieldConfig[],
  defaultContent: {
    logoSrc: '/images/Branding/Wondrous_W_100x100.png',
    logoAlt: 'Logo',
    businessName: 'Business Name',
    navItems: [], // START EMPTY
    signInText: 'Sign in',
    signInHref: '#',
    signInVariant: 'ghost',
    signInSize: 'sm',
    ctaButtonText: 'Get Started',
    ctaButtonHref: '#',
    ctaButtonVariant: 'default',
    ctaButtonSize: 'sm',
  },
};

