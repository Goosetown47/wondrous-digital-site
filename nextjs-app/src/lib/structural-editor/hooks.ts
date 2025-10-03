/**
 * Reusable hooks for structural editing
 */

'use client';

import { useState, useCallback } from 'react';
import { EditableItem, ItemConfigState } from './types';
import { generateId, addItem, replaceItem, removeItem } from './utils';

/**
 * Hook for managing array editing operations
 *
 * @template T - Item type (must have id field)
 * @param items - Current items array
 * @param onUpdate - Callback when array changes
 * @returns Object with add, edit, delete handlers
 */
export function useArrayEditor<T extends EditableItem>(
  items: T[],
  onUpdate: (items: T[]) => void
) {
  const handleAdd = useCallback(
    (item: T) => {
      onUpdate(addItem(items, item));
    },
    [items, onUpdate]
  );

  const handleEdit = useCallback(
    (item: T) => {
      onUpdate(replaceItem(items, item));
    },
    [items, onUpdate]
  );

  const handleDelete = useCallback(
    (id: string) => {
      onUpdate(removeItem(items, id));
    },
    [items, onUpdate]
  );

  return {
    handleAdd,
    handleEdit,
    handleDelete,
  };
}

/**
 * Hook for managing item configuration modal state
 *
 * @template T - Item type
 * @returns State and handlers for modal
 */
export function useItemConfig<T>() {
  const [state, setState] = useState<ItemConfigState<T>>({
    isOpen: false,
    item: null,
    operation: null,
  });

  const openForCreate = useCallback(() => {
    setState({
      isOpen: true,
      item: null,
      operation: 'add',
    });
  }, []);

  const openForEdit = useCallback((item: T) => {
    setState({
      isOpen: true,
      item,
      operation: 'edit',
    });
  }, []);

  const close = useCallback(() => {
    setState({
      isOpen: false,
      item: null,
      operation: null,
    });
  }, []);

  return {
    ...state,
    openForCreate,
    openForEdit,
    close,
  };
}

/**
 * Hook for creating empty items with generated IDs
 *
 * @template T - Item type (must have id field)
 * @param defaults - Default values for new items (excluding id)
 * @returns Function to create new item
 */
export function useItemFactory<T extends EditableItem>(
  defaults: Omit<T, 'id'>
): () => T {
  return useCallback(() => {
    return {
      ...defaults,
      id: generateId(),
    } as T;
  }, [defaults]);
}
