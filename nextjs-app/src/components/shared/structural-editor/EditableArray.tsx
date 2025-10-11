/**
 * EditableArray Component
 *
 * Generic component for editing arrays of items
 * Works with any item type via custom editor/display components
 */

'use client';

import { ComponentType, useState } from 'react';
import {
  EditableItem,
  ItemEditorProps,
  ItemDisplayProps,
} from '@/lib/structural-editor/types';
import { useArrayEditor, useItemConfig } from '@/lib/structural-editor/hooks';
import { ItemConfigModal } from './ItemConfigModal';
import { ItemControls } from './ItemControls';

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

export function EditableArray<T extends EditableItem>({
  items,
  onUpdate,
  itemEditor: ItemEditor,
  itemDisplay: ItemDisplay,
  editable,
  emptyMessage = 'No items yet. Click + to add your first item.',
  addButtonText = 'Add Item',
  projectId,
}: EditableArrayProps<T>) {
  const { handleAdd, handleEdit, handleDelete } = useArrayEditor(items, onUpdate);
  const { isOpen, item, operation, openForCreate, openForEdit, close } = useItemConfig<T>();
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    openForCreate();
  };

  const handleSave = (configuredItem: T) => {
    if (operation === 'add') {
      handleAdd(configuredItem);
    } else if (operation === 'edit') {
      handleEdit(configuredItem);
    }
    close();
  };

  return (
    <>
      {/* Empty State */}
      {items.length === 0 && editable && (
        <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-module-lg col-span-full">
          {emptyMessage}
        </div>
      )}

      {/* Items with hover controls */}
      {editable ? (
        /* Edit Mode: Show items with hover controls */
        <>
          {items.map((itemData, index) => (
            <div
              key={itemData.id || `item-${index}`}
              className="relative"
              onMouseEnter={() => setHoveredItemId(itemData.id)}
              onMouseLeave={() => setHoveredItemId(null)}
            >
              <ItemDisplay item={itemData} />

              {/* Hover Controls - only show for hovered item */}
              {hoveredItemId === itemData.id && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 bg-background border border-border rounded-module-md shadow-md p-1">
                  <ItemControls
                    onEdit={() => openForEdit(itemData)}
                    onDelete={() => handleDelete(itemData.id)}
                  />
                </div>
              )}
            </div>
          ))}
        </>
      ) : (
        /* Display Mode: Just show items */
        <>
          {items.map((itemData, index) => (
            <ItemDisplay key={itemData.id || `item-${index}`} item={itemData} />
          ))}
        </>
      )}

      {/* Add Button (only in edit mode) */}
      {editable && (
        <>
          {/* Icon-only button for flex/inline layouts, full button for grid */}
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center h-8 w-8 rounded-module-full border-2 border-dashed border-module-primary/50 hover:border-module-primary hover:bg-module-primary/10 transition-colors shrink-0"
            type="button"
            title={addButtonText}
          >
            <span className="text-module-primary text-lg font-bold leading-none -mt-0.5">+</span>
          </button>
        </>
      )}

      {/* Config Modal */}
      {editable && (
        <ItemConfigModal
          isOpen={isOpen}
          onClose={close}
          onSave={handleSave}
          item={item}
          title={operation === 'add' ? `Add ${addButtonText.replace('Add ', '')}` : `Edit Item`}
        >
          <ItemEditor
            item={item}
            onSave={handleSave}
            onCancel={close}
            projectId={projectId}
          />
        </ItemConfigModal>
      )}
    </>
  );
}
