/**
 * Structural Editor Library
 *
 * Generic, reusable system for editing array-based content
 * (navigation menus, footers, galleries, testimonials, etc.)
 */

// Types
export type {
  ItemEditorProps,
  ItemDisplayProps,
  ArrayOperation,
  EditableItem,
  EditableArrayProps,
  ItemConfigState,
} from './types';

// Utilities
export {
  generateId,
  reorderArray,
  removeItem,
  updateItem,
  addItem,
  replaceItem,
  findItemById,
} from './utils';

// Hooks
export { useArrayEditor, useItemConfig, useItemFactory } from './hooks';
