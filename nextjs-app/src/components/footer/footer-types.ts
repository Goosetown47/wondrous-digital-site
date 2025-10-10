/**
 * Footer Types
 *
 * Type definitions for footer columns and links
 */

import { EditableItem } from '@/lib/structural-editor/types';

/**
 * Footer column containing links
 */
export interface FooterColumn extends EditableItem {
  /** Column title */
  title: string;
  /** Links in this column */
  links: FooterLink[];
}

/**
 * Individual link within a footer column
 */
export interface FooterLink extends EditableItem {
  /** Link text */
  label: string;
  /** Type of link */
  linkType: 'page' | 'external';
  /** Page ID (if linkType is 'page') */
  pageId?: string | null;
  /** External URL (if linkType is 'external') */
  externalUrl?: string;
}

/**
 * Helper: Create empty FooterColumn
 */
export function createEmptyFooterColumn(id: string): FooterColumn {
  return {
    id,
    title: '',
    links: [],
  };
}

/**
 * Helper: Create empty FooterLink
 */
export function createEmptyFooterLink(id: string): FooterLink {
  return {
    id,
    label: '',
    linkType: 'page',
    pageId: null,
    externalUrl: '',
  };
}
