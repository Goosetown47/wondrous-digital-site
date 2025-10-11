/**
 * NavItemDisplay Component
 *
 * Display component for navigation item (production rendering)
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ItemDisplayProps } from '@/lib/structural-editor/types';
import { NavItem } from '../nav-types';
import { ChevronDown } from 'lucide-react';
import { DropdownItemDisplay } from './DropdownItemDisplay';

interface NavItemDisplayProps extends ItemDisplayProps<NavItem> {
  projectId?: string;
}

export function NavItemDisplay({ item, projectId }: NavItemDisplayProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const isPreview = pathname?.startsWith('/preview/');
  const isPlatform = pathname?.startsWith('/sites/');

  const href =
    item.linkType === 'page' && item.pagePath
      ? isPreview
        ? `/preview/${projectId}/path${item.pagePath}`
        : isPlatform
        ? `/sites/${projectId}${item.pagePath}`
        : item.pagePath
      : item.linkType === 'external' && item.externalUrl
      ? item.externalUrl
      : '#';

  const hasDropdownItems = item.hasDropdown && item.dropdownItems && item.dropdownItems.length > 0;

  if (!hasDropdownItems) {
    // Simple link (no dropdown)
    return (
      <Link
        href={href}
        className="text-sm text-foreground hover:text-primary hover:bg-muted rounded-md px-3 py-2 transition-colors inline-block"
        target={item.openInNewTab ? '_blank' : undefined}
        rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
      >
        {item.label}
      </Link>
    );
  }

  // Link with dropdown
  // If mainItemClickable is true, make the nav item itself a clickable link
  const NavTrigger = item.mainItemClickable ? (
    <Link
      href={href}
      className="flex items-center gap-1 text-sm text-foreground hover:text-primary hover:bg-muted rounded-md px-3 py-2 transition-colors"
      target={item.openInNewTab ? '_blank' : undefined}
      rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
    >
      {item.label}
      <ChevronDown className="h-4 w-4" />
    </Link>
  ) : (
    <button
      className="flex items-center gap-1 text-sm text-foreground hover:text-primary hover:bg-muted rounded-md px-3 py-2 transition-colors"
      type="button"
    >
      {item.label}
      <ChevronDown className="h-4 w-4" />
    </button>
  );

  return (
    <div
      className="relative"
      onMouseEnter={() => setDropdownOpen(true)}
      onMouseLeave={() => setDropdownOpen(false)}
    >
      {NavTrigger}

      {dropdownOpen && (
        <div className="absolute left-0 top-full pt-2 z-50 min-w-[240px]">
          <div className="bg-background rounded-lg shadow-lg border border-border p-2">
            {item.dropdownItems?.map((dropdownItem) => (
              <DropdownItemDisplay key={dropdownItem.id} item={dropdownItem} projectId={projectId} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
