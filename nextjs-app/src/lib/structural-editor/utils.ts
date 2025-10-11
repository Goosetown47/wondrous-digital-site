/**
 * Utility functions for structural editing
 */

import { EditableItem } from './types';

/**
 * Generate a unique ID for new items
 * Uses timestamp + random string for uniqueness
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Reorder an array by moving an item from one index to another
 *
 * @template T - Item type
 * @param arr - Array to reorder
 * @param fromIndex - Source index
 * @param toIndex - Destination index
 * @returns New reordered array
 */
export function reorderArray<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...arr];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

/**
 * Remove an item from array by ID
 *
 * @template T - Item type (must have id field)
 * @param arr - Array to remove from
 * @param id - ID of item to remove
 * @returns New array without the item
 */
export function removeItem<T extends EditableItem>(arr: T[], id: string): T[] {
  return arr.filter((item) => item.id !== id);
}

/**
 * Update an item in array by ID
 *
 * @template T - Item type (must have id field)
 * @param arr - Array to update
 * @param id - ID of item to update
 * @param updates - Partial updates to apply
 * @returns New array with updated item
 */
export function updateItem<T extends EditableItem>(
  arr: T[],
  id: string,
  updates: Partial<T>
): T[] {
  return arr.map((item) => (item.id === id ? { ...item, ...updates } : item));
}

/**
 * Add an item to array
 *
 * @template T - Item type
 * @param arr - Array to add to
 * @param item - Item to add
 * @returns New array with added item
 */
export function addItem<T>(arr: T[], item: T): T[] {
  return [...arr, item];
}

/**
 * Replace an item in array (used for editing)
 *
 * @template T - Item type (must have id field)
 * @param arr - Array to update
 * @param item - Updated item (matched by ID)
 * @returns New array with replaced item
 */
export function replaceItem<T extends EditableItem>(arr: T[], item: T): T[] {
  return arr.map((existingItem) => (existingItem.id === item.id ? item : existingItem));
}

/**
 * Find item by ID
 *
 * @template T - Item type (must have id field)
 * @param arr - Array to search
 * @param id - ID to find
 * @returns Item or undefined
 */
export function findItemById<T extends EditableItem>(arr: T[], id: string): T | undefined {
  return arr.find((item) => item.id === id);
}
