/**
 * FooterColumnEditor Component
 *
 * Editor for configuring a footer column (title + links)
 */

'use client';

import { useState } from 'react';
import { ItemEditorProps } from '@/lib/structural-editor/types';
import { FooterColumn, createEmptyFooterColumn } from '../footer-types';
import { generateId } from '@/lib/structural-editor/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EditableArray } from '@/components/shared/structural-editor';
import { FooterLinkEditor } from './FooterLinkEditor';
import { FooterLinkDisplay } from './FooterLinkDisplay';

export function FooterColumnEditor({
  item,
  onSave,
  onCancel,
  projectId,
}: ItemEditorProps<FooterColumn>) {
  // Initialize form state
  const [formData, setFormData] = useState<FooterColumn>(() => {
    if (item) return item;
    return createEmptyFooterColumn(generateId());
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Column title is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (!validate()) return;
    onSave(formData);
  };

  return (
    <div className="space-y-6">
      {/* Column Title */}
      <div className="space-y-2">
        <Label htmlFor="column-title">
          Column Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="column-title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Product, Company, Resources"
          className={errors.title ? 'border-destructive' : ''}
        />
        {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
      </div>

      {/* Links */}
      <div className="border border-border rounded-lg p-4 bg-muted/20">
        <EditableArray
          items={formData.links}
          onUpdate={(links) => setFormData({ ...formData, links })}
          itemEditor={FooterLinkEditor}
          itemDisplay={FooterLinkDisplay}
          editable={true}
          addButtonText="Add Link"
          emptyMessage="No links yet. Click + to add the first link to this column."
          projectId={projectId}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button onClick={handleSave} type="button">
          Save Column
        </Button>
      </div>
    </div>
  );
}
