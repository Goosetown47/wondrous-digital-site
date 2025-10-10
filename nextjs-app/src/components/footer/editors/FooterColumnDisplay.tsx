/**
 * FooterColumnDisplay Component
 *
 * Display component for footer column (production rendering)
 */

'use client';

import { ItemDisplayProps } from '@/lib/structural-editor/types';
import { FooterColumn } from '../footer-types';
import { FooterLinkDisplay } from './FooterLinkDisplay';

export function FooterColumnDisplay({ item }: ItemDisplayProps<FooterColumn>) {
  return (
    <div>
      <h3 className="font-semibold text-sm text-foreground mb-4">{item.title}</h3>
      <ul className="space-y-2">
        {item.links.map((link) => (
          <FooterLinkDisplay key={link.id} item={link} />
        ))}
      </ul>
    </div>
  );
}
