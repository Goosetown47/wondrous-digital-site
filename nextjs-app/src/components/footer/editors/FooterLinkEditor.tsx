/**
 * FooterLinkEditor Component
 *
 * Editor for configuring a footer link
 */

'use client';

import { useState } from 'react';
import { ItemEditorProps } from '@/lib/structural-editor/types';
import { FooterLink, createEmptyFooterLink } from '../footer-types';
import { generateId } from '@/lib/structural-editor/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LinkTypeToggle } from '@/components/shared/structural-editor/LinkTypeToggle';
import { PageSelector } from '@/components/shared/structural-editor/PageSelector';

export function FooterLinkEditor({
  item,
  onSave,
  onCancel,
  projectId,
}: ItemEditorProps<FooterLink>) {
  // Initialize form state
  const [formData, setFormData] = useState<FooterLink>(() => {
    if (item) return item;
    return createEmptyFooterLink(generateId());
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.label.trim()) {
      newErrors.label = 'Label is required';
    }

    if (formData.linkType === 'page' && !formData.pageId) {
      newErrors.pageId = 'Please select a page';
    }

    if (formData.linkType === 'external' && !formData.externalUrl?.trim()) {
      newErrors.externalUrl = 'URL is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (!validate()) return;
    onSave(formData);
  };

  // Handle link type change
  const handleLinkTypeChange = (type: 'page' | 'external') => {
    setFormData((prev) => ({
      ...prev,
      linkType: type,
      pageId: type === 'page' ? prev.pageId : null,
      externalUrl: type === 'external' ? prev.externalUrl : '',
    }));
  };

  return (
    <div className="space-y-6">
      {/* Label */}
      <div className="space-y-2">
        <Label htmlFor="link-label">
          Link Text <span className="text-destructive">*</span>
        </Label>
        <Input
          id="link-label"
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          placeholder="e.g., About Us, Contact, Privacy Policy"
          className={errors.label ? 'border-destructive' : ''}
        />
        {errors.label && <p className="text-sm text-destructive">{errors.label}</p>}
      </div>

      {/* Link Type */}
      <LinkTypeToggle type={formData.linkType} onChange={handleLinkTypeChange} />

      {/* Page Selector OR URL Input */}
      {formData.linkType === 'page' ? (
        projectId && (
          <PageSelector
            projectId={projectId}
            value={formData.pageId || null}
            onChange={(pageId) => setFormData({ ...formData, pageId })}
            label="Select Page"
            placeholder="Choose a page..."
            className={errors.pageId ? 'border-destructive' : ''}
          />
        )
      ) : (
        <div className="space-y-2">
          <Label htmlFor="link-url">
            External URL <span className="text-destructive">*</span>
          </Label>
          <Input
            id="link-url"
            type="url"
            value={formData.externalUrl || ''}
            onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
            placeholder="https://example.com"
            className={errors.externalUrl ? 'border-destructive' : ''}
          />
          {errors.externalUrl && (
            <p className="text-sm text-destructive">{errors.externalUrl}</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button onClick={handleSave} type="button">
          Save
        </Button>
      </div>
    </div>
  );
}
