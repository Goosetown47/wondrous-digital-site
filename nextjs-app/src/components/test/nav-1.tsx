'use client';

import { Button } from '@/components/ui/button';
import { ChevronDown, Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

// Props interface for Nav1 component
interface Nav1Props {
  // Logo section
  logoSrc?: string;
  logoAlt?: string;
  businessName?: string;

  // Dropdown menu
  dropdownLabel?: string;
  dropdownItems?: Array<{
    title: string;
    description: string;
    href: string;
  }>;

  // Main menu items
  menuItems?: Array<{
    label: string;
    href: string;
  }>;

  // Action buttons
  signInText?: string;
  signInHref?: string;
  ctaButtonText?: string;
  ctaButtonHref?: string;
}

export default function Nav1(props: Nav1Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Default values with prop overrides
  const {
    logoSrc = '/images/Branding/Wondrous_W_100x100.png',
    logoAlt = 'Logo',
    businessName = 'Business Name',
    dropdownLabel = 'Features',
    dropdownItems = [
      {
        title: 'Dashboard',
        description: 'Overview of your activity',
        href: '#',
      },
      {
        title: 'Analytics',
        description: 'Track your performance',
        href: '#',
      },
      {
        title: 'Settings',
        description: 'Configure your preferences',
        href: '#',
      },
      {
        title: 'Integrations',
        description: 'Connect with other tools',
        href: '#',
      },
      {
        title: 'Storage',
        description: 'Manage your files',
        href: '#',
      },
      {
        title: 'Support',
        description: 'Get help when needed',
        href: '#',
      },
    ],
    menuItems = [
      { label: 'Products', href: '#' },
      { label: 'Resources', href: '#' },
      { label: 'Contact', href: '#' },
    ],
    signInText = 'Sign in',
    signInHref = '#',
    ctaButtonText = 'Start for free',
    ctaButtonHref = '#',
  } = props;

  return (
    <nav className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image
              src={logoSrc}
              alt={logoAlt}
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-lg font-semibold text-gray-900">
              {businessName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {/* Features Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md px-3 py-2 transition-colors">
                {dropdownLabel}
                <ChevronDown className="h-4 w-4" />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 top-full pt-2 z-50">
                  <div className="w-[600px] bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                    <div className="grid grid-cols-2 gap-2">
                      {dropdownItems.map((item) => (
                        <Link
                          key={item.title}
                          href={item.href}
                          className="group block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-semibold text-sm text-gray-900 mb-1">
                            {item.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.description}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Other Menu Items */}
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md px-3 py-2 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href={signInHref}>{signInText}</Link>
            </Button>
            <Button size="sm" asChild className="bg-gray-900 hover:bg-gray-800">
              <Link href={ctaButtonHref}>{ctaButtonText}</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-4 py-4 space-y-3">
            {/* Mobile Features */}
            <div className="space-y-2">
              <div className="font-semibold text-sm text-gray-900">
                {dropdownLabel}
              </div>
              <div className="pl-4 space-y-2">
                {dropdownItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="block py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="font-medium text-sm text-gray-900">
                      {item.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.description}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Other Links */}
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block py-2 text-sm text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* Mobile Actions */}
            <div className="pt-4 space-y-2 border-t border-gray-200">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href={signInHref} onClick={() => setMobileMenuOpen(false)}>
                  {signInText}
                </Link>
              </Button>
              <Button
                className="w-full bg-gray-900 hover:bg-gray-800"
                asChild
              >
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
    {
      path: "logoSrc",
      type: "image",
      label: "Logo Image",
      required: false
    },
    {
      path: "logoAlt",
      type: "text",
      label: "Logo Alt Text",
      required: false
    },
    {
      path: "businessName",
      type: "text",
      label: "Business Name",
      required: false
    },
    {
      path: "dropdownLabel",
      type: "text",
      label: "Dropdown Label",
      required: false
    },
    {
      path: "dropdownItems",
      type: "array",
      label: "Dropdown Items",
      required: false
    },
    {
      path: "menuItems",
      type: "array",
      label: "Menu Items",
      required: false
    },
    {
      path: "signInText",
      type: "text",
      label: "Sign In Button Text",
      required: false
    },
    {
      path: "signInHref",
      type: "text",
      label: "Sign In Link",
      required: false
    },
    {
      path: "ctaButtonText",
      type: "text",
      label: "CTA Button Text",
      required: false
    },
    {
      path: "ctaButtonHref",
      type: "text",
      label: "CTA Button Link",
      required: false
    }
  ],
  defaultContent: {
    logoSrc: "/images/Branding/Wondrous_W_100x100.png",
    logoAlt: "Logo",
    businessName: "Business Name",
    dropdownLabel: "Features",
    dropdownItems: [
      {
        title: 'Dashboard',
        description: 'Overview of your activity',
        href: '#',
      },
      {
        title: 'Analytics',
        description: 'Track your performance',
        href: '#',
      },
      {
        title: 'Settings',
        description: 'Configure your preferences',
        href: '#',
      },
      {
        title: 'Integrations',
        description: 'Connect with other tools',
        href: '#',
      },
      {
        title: 'Storage',
        description: 'Manage your files',
        href: '#',
      },
      {
        title: 'Support',
        description: 'Get help when needed',
        href: '#',
      },
    ],
    menuItems: [
      { label: 'Products', href: '#' },
      { label: 'Resources', href: '#' },
      { label: 'Contact', href: '#' },
    ],
    signInText: "Sign in",
    signInHref: "#",
    ctaButtonText: "Start for free",
    ctaButtonHref: "#"
  }
};
