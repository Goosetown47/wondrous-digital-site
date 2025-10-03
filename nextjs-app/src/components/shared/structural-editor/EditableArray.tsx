/**
 * EditableArray Component
 *
 * Generic component for editing arrays of items
 * Works with any item type via custom editor/display components
 */

'use client';

import { ComponentType } from 'react';
import {
  EditableItem,
  ItemEditorProps,
  ItemDisplayProps,
} from '@/lib/structural-editor/types';
import { useArrayEditor, useItemConfig } from '@/lib/structural-editor/hooks';
import { ItemConfigModal } from './ItemConfigModal';
import { AddButton } from './AddButton';
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
  /** Compact mode for horizontal layouts (shows icon-only button, no empty message) */
  compact?: boolean;
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
  compact = false,
}: EditableArrayProps<T>) {
  const { handleAdd, handleEdit, handleDelete } = useArrayEditor(items, onUpdate);
  const { isOpen, item, operation, openForCreate, openForEdit, close } = useItemConfig<T>();

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
    <div className={compact ? 'flex items-center gap-2' : 'space-y-4'}>
      {/* Empty State - hidden in compact mode */}
      {items.length === 0 && !compact && (
        <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
          {emptyMessage}
        </div>
      )}

      {/* Items List */}
      {editable ? (
        /* Edit Mode: Show items with controls */
        <div className={compact ? 'flex items-center gap-2' : 'space-y-2'}>
          {items.map((itemData) => (
            <div
              key={itemData.id}
              className={
                compact
                  ? 'relative' // Compact mode: use relative positioning for hover controls
                  : 'flex items-start justify-between gap-4 p-4 bg-muted/30 border border-border rounded-lg hover:bg-muted/50 transition-colors'
              }
            >
              <div className={compact ? 'peer' : 'flex-1 min-w-0'}>
                <ItemDisplay item={itemData} />
              </div>

              {/* Controls: Above on hover in compact mode, inline otherwise */}
              {compact ? (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 peer-hover:opacity-100 hover:opacity-100 transition-opacity z-50 bg-background border border-border rounded-md shadow-md p-1">
                  <ItemControls
                    onEdit={() => openForEdit(itemData)}
                    onDelete={() => handleDelete(itemData.id)}
                    className="flex-shrink-0"
                  />
                </div>
              ) : (
                <ItemControls
                  onEdit={() => openForEdit(itemData)}
                  onDelete={() => handleDelete(itemData.id)}
                  className="flex-shrink-0"
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Display Mode: Just show items */
        <div className={compact ? 'flex items-center gap-4' : 'space-y-2'}>
          {items.map((itemData) => (
            <div key={itemData.id}>
              <ItemDisplay item={itemData} />
            </div>
          ))}
        </div>
      )}

      {/* Add Button (only in edit mode) */}
      {editable && (
        <div className={compact ? '' : 'flex justify-start'}>
          {compact ? (
            <button
              onClick={handleOpenCreate}
              className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-dashed border-primary/50 hover:border-primary hover:bg-primary/10 transition-colors"
              type="button"
              title={addButtonText}
            >
              <span className="text-primary text-lg font-bold leading-none -mt-0.5">+</span>
            </button>
          ) : (
            <AddButton onClick={handleOpenCreate} text={addButtonText} />
          )}
        </div>
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
    </div>
  );
}
