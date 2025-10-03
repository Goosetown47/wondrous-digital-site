/**
 * Generic interfaces for structural editing system
 *
 * This type system enables type-safe array editing for any component type
 * (navigation items, footer columns, testimonials, galleries, etc.)
 */

import { ComponentType } from 'react';

/**
 * Props for custom item editor components
 *
 * @template T - The item type being edited (must have id field)
 */
export interface ItemEditorProps<T> {
  /** The item being edited (null when creating new item) */
  item: T | null;
  /** Callback when user saves the configured item */
  onSave: (item: T) => void;
  /** Callback when user cancels editing */
  onCancel: () => void;
  /** Optional project ID for context (e.g., page selection) */
  projectId?: string;
}

/**
 * Props for custom item display components
 *
 * @template T - The item type being displayed
 */
export interface ItemDisplayProps<T> {
  /** The item to display */
  item: T;
}

/**
 * Array operation types
 */
export type ArrayOperation = 'add' | 'edit' | 'delete' | 'reorder';

/**
 * Base interface that all editable items must extend
 * Ensures items have a unique identifier
 */
export interface EditableItem {
  id: string;
}

/**
 * Props for the generic EditableArray component
 *
 * @template T - The item type (must have id field)
 */
export interface EditableArrayProps<T extends EditableItem> {
  /** Array of items */
  items: T[];
  /** Callback when items array changes */
  onUpdate: (items: T[]) => void;
  /** Custom editor component for configuring items */
  itemEditor: ComponentType<ItemEditorProps<T>>;
  /** Custom display component for rendering items */
  itemDisplay: ComponentType<ItemDisplayProps<T>>;
  /** Whether editing is enabled */
  editable: boolean;
  /** Message shown when array is empty */
  emptyMessage?: string;
  /** Text for the "+ Add" button */
  addButtonText?: string;
  /** Optional project ID for context */
  projectId?: string;
}

/**
 * State for managing item configuration
 */
export interface ItemConfigState<T> {
  /** Whether modal is open */
  isOpen: boolean;
  /** Item being edited (null = creating new) */
  item: T | null;
  /** Operation type */
  operation: ArrayOperation | null;
}
