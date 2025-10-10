/**
 * FooterLinkDisplay Component
 *
 * Display component for footer link (production rendering)
 */

'use client';

import Link from 'next/link';
import { ItemDisplayProps } from '@/lib/structural-editor/types';
import { FooterLink } from '../footer-types';

export function FooterLinkDisplay({ item }: ItemDisplayProps<FooterLink>) {
  const href =
    item.linkType === 'page' && item.pageId
      ? `/page/${item.pageId}` // TODO: Replace with actual page path lookup
      : item.externalUrl || '#';

  return (
    <li>
      <Link
        href={href}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        target={item.linkType === 'external' ? '_blank' : undefined}
        rel={item.linkType === 'external' ? 'noopener noreferrer' : undefined}
      >
        {item.label}
      </Link>
    </li>
  );
}
