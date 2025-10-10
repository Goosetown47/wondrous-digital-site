/**
 * DropdownItemsEditor Component
 *
 * Manages array of dropdown items (nested within NavItem)
 * Uses the generic EditableArray component
 */

'use client';

import { EditableArray } from '@/components/shared/structural-editor';
import { DropdownItem } from '../nav-types';
import { DropdownItemEditor } from './DropdownItemEditor';
import { DropdownItemDisplay } from './DropdownItemDisplay';

export interface DropdownItemsEditorProps {
  /** Array of dropdown items */
  items: DropdownItem[];
  /** Callback when items change */
  onUpdate: (items: DropdownItem[]) => void;
  /** Optional project ID for page selection */
  projectId?: string;
}

export function DropdownItemsEditor({
  items,
  onUpdate,
  projectId,
}: DropdownItemsEditorProps) {
  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-foreground">Dropdown Items</div>
      <EditableArray
        items={items}
        onUpdate={onUpdate}
        itemEditor={DropdownItemEditor}
        itemDisplay={DropdownItemDisplay}
        editable={true}
        emptyMessage="No dropdown items yet. Click + to add the first one."
        addButtonText="Add Dropdown Item"
        projectId={projectId}
      />
    </div>
  );
}
