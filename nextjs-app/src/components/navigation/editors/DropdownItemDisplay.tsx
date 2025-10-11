/**
 * DropdownItemDisplay Component
 *
 * Display component for dropdown menu item (production rendering)
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ItemDisplayProps } from '@/lib/structural-editor/types';
import { DropdownItem } from '../nav-types';

interface DropdownItemDisplayProps extends ItemDisplayProps<DropdownItem> {
  projectId?: string;
}

export function DropdownItemDisplay({ item, projectId }: DropdownItemDisplayProps) {
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

  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded-md hover:bg-muted transition-colors"
      target={item.openInNewTab ? '_blank' : undefined}
      rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
    >
      <div className="font-medium text-sm text-foreground">{item.label}</div>
      {item.description && (
        <div className="text-xs text-muted-foreground mt-0.5">{item.description}</div>
      )}
    </Link>
  );
}
