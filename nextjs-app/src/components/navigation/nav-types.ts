/**
 * Navigation Types
 *
 * Type definitions for navigation menu items
 */

import { EditableItem } from '@/lib/structural-editor/types';

/**
 * Main navigation item
 */
export interface NavItem extends EditableItem {
  /** Display text */
  label: string;
  /** Type of link */
  linkType: 'page' | 'external';
  /** Page ID (if linkType is 'page') */
  pageId?: string | null;
  /** Page path/slug (if linkType is 'page') - e.g., '/', '/about', '/contact' */
  pagePath?: string | null;
  /** External URL (if linkType is 'external') */
  externalUrl?: string;
  /** Open link in new tab/window */
  openInNewTab?: boolean;
  /** Whether this item has a dropdown menu */
  hasDropdown: boolean;
  /** Dropdown items (if hasDropdown is true) */
  dropdownItems?: DropdownItem[];
  /** Whether the main nav item is clickable when it has a dropdown (default: false) */
  mainItemClickable?: boolean;
}

/**
 * Dropdown menu item (nested within NavItem)
 */
export interface DropdownItem extends EditableItem {
  /** Display text */
  label: string;
  /** Optional description */
  description?: string;
  /** Type of link */
  linkType: 'page' | 'external';
  /** Page ID (if linkType is 'page') */
  pageId?: string | null;
  /** Page path/slug (if linkType is 'page') - e.g., '/', '/about', '/contact' */
  pagePath?: string | null;
  /** External URL (if linkType is 'external') */
  externalUrl?: string;
  /** Open link in new tab/window */
  openInNewTab?: boolean;
}

/**
 * Helper: Create empty NavItem
 */
export function createEmptyNavItem(id: string): NavItem {
  return {
    id,
    label: '',
    linkType: 'page',
    pageId: null,
    pagePath: null,
    externalUrl: '',
    openInNewTab: false,
    hasDropdown: false,
    dropdownItems: [],
    mainItemClickable: false,
  };
}

/**
 * Helper: Create empty DropdownItem
 */
export function createEmptyDropdownItem(id: string): DropdownItem {
  return {
    id,
    label: '',
    description: '',
    linkType: 'page',
    pageId: null,
    pagePath: null,
    externalUrl: '',
    openInNewTab: false,
  };
}
