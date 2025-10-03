/**
 * NavItemDisplay Component
 *
 * Display component for navigation item (production rendering)
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ItemDisplayProps } from '@/lib/structural-editor/types';
import { NavItem } from '../nav-types';
import { ChevronDown } from 'lucide-react';
import { DropdownItemDisplay } from './DropdownItemDisplay';

export function NavItemDisplay({ item }: ItemDisplayProps<NavItem>) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const href =
    item.linkType === 'page' && item.pageId
      ? `/page/${item.pageId}` // TODO: Replace with actual page path lookup
      : item.externalUrl || '#';

  const hasDropdownItems = item.hasDropdown && item.dropdownItems && item.dropdownItems.length > 0;

  if (!hasDropdownItems) {
    // Simple link (no dropdown)
    return (
      <Link
        href={href}
        className="text-sm text-foreground hover:text-primary hover:bg-muted rounded-md px-3 py-2 transition-colors inline-block"
        target={item.linkType === 'external' ? '_blank' : undefined}
        rel={item.linkType === 'external' ? 'noopener noreferrer' : undefined}
      >
        {item.label}
      </Link>
    );
  }

  // Link with dropdown
  return (
    <div
      className="relative"
      onMouseEnter={() => setDropdownOpen(true)}
      onMouseLeave={() => setDropdownOpen(false)}
    >
      <button
        className="flex items-center gap-1 text-sm text-foreground hover:text-primary hover:bg-muted rounded-md px-3 py-2 transition-colors"
        type="button"
      >
        {item.label}
        <ChevronDown className="h-4 w-4" />
      </button>

      {dropdownOpen && (
        <div className="absolute left-0 top-full pt-2 z-50 min-w-[240px]">
          <div className="bg-background rounded-lg shadow-lg border border-border p-2">
            {item.dropdownItems?.map((dropdownItem) => (
              <DropdownItemDisplay key={dropdownItem.id} item={dropdownItem} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
