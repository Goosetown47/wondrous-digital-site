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
  /** External URL (if linkType is 'external') */
  externalUrl?: string;
  /** Whether this item has a dropdown menu */
  hasDropdown: boolean;
  /** Dropdown items (if hasDropdown is true) */
  dropdownItems?: DropdownItem[];
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
  /** External URL (if linkType is 'external') */
  externalUrl?: string;
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
    externalUrl: '',
    hasDropdown: false,
    dropdownItems: [],
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
    externalUrl: '',
  };
}
