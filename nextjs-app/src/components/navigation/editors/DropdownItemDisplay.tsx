/**
 * DropdownItemDisplay Component
 *
 * Display component for dropdown menu item (production rendering)
 */

'use client';

import Link from 'next/link';
import { ItemDisplayProps } from '@/lib/structural-editor/types';
import { DropdownItem } from '../nav-types';

export function DropdownItemDisplay({ item }: ItemDisplayProps<DropdownItem>) {
  const href =
    item.linkType === 'page' && item.pageId
      ? `/page/${item.pageId}` // TODO: Replace with actual page path lookup
      : item.externalUrl || '#';

  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded-md hover:bg-muted transition-colors"
      target={item.linkType === 'external' ? '_blank' : undefined}
      rel={item.linkType === 'external' ? 'noopener noreferrer' : undefined}
    >
      <div className="font-medium text-sm text-foreground">{item.label}</div>
      {item.description && (
        <div className="text-xs text-muted-foreground mt-0.5">{item.description}</div>
      )}
    </Link>
  );
}
