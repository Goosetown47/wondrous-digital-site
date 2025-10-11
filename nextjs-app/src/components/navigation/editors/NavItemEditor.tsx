/**
 * NavItemEditor Component
 *
 * Editor for configuring a navigation menu item
 */

'use client';

import { useState } from 'react';
import { ItemEditorProps } from '@/lib/structural-editor/types';
import { NavItem, createEmptyNavItem } from '../nav-types';
import { generateId } from '@/lib/structural-editor/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { LinkTypeToggle } from '@/components/shared/structural-editor/LinkTypeToggle';
import { PageSelector } from '@/components/shared/structural-editor/PageSelector';
import { DropdownItemsEditor } from './DropdownItemsEditor';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function NavItemEditor({
  item,
  onSave,
  onCancel,
  projectId,
}: ItemEditorProps<NavItem>) {
  // Initialize form state
  const [formData, setFormData] = useState<NavItem>(() => {
    if (item) return item;
    return createEmptyNavItem(generateId());
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDropdownEditor, setShowDropdownEditor] = useState(false);

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

  // Handle dropdown toggle
  const handleDropdownToggle = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      hasDropdown: checked,
      dropdownItems: checked ? prev.dropdownItems || [] : [],
    }));
    if (checked) {
      setShowDropdownEditor(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Label */}
      <div className="space-y-2">
        <Label htmlFor="nav-label">
          Label <span className="text-destructive">*</span>
        </Label>
        <Input
          id="nav-label"
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          placeholder="e.g., Products, Services, About"
          className={errors.label ? 'border-destructive' : ''}
        />
        {errors.label && <p className="text-sm text-destructive">{errors.label}</p>}
      </div>

      {/* Link Type */}
      <LinkTypeToggle type={formData.linkType} onChange={handleLinkTypeChange} />

      {/* Page Selector OR URL Input */}
      {formData.linkType === 'page' ? (
        projectId ? (
          <PageSelector
            projectId={projectId}
            value={formData.pageId || null}
            onChange={(pageId, pagePath) => setFormData({ ...formData, pageId, pagePath })}
            label="Select Page"
            placeholder="Choose a page..."
            className={errors.pageId ? 'border-destructive' : ''}
          />
        ) : (
          <div className="space-y-2">
            <Label>Select Page</Label>
            <div className="p-4 border border-border rounded-md bg-muted/30">
              <p className="text-sm text-muted-foreground text-center">
                Page selection requires a project context. <br />
                This feature will work when the component is used in a real project.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: Use "External URL" for testing in LAB
            </p>
          </div>
        )
      ) : (
        <div className="space-y-2">
          <Label htmlFor="nav-url">
            External URL <span className="text-destructive">*</span>
          </Label>
          <Input
            id="nav-url"
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

      {/* Open in New Tab */}
      <div className="flex items-center space-x-2 pt-2">
        <Checkbox
          id="open-new-tab"
          checked={formData.openInNewTab || false}
          onCheckedChange={(checked) => setFormData({ ...formData, openInNewTab: checked as boolean })}
        />
        <Label htmlFor="open-new-tab" className="font-normal cursor-pointer">
          Open link in new tab
        </Label>
      </div>

      {/* Has Dropdown */}
      <div className="flex items-center space-x-2 pt-2">
        <Checkbox
          id="has-dropdown"
          checked={formData.hasDropdown}
          onCheckedChange={handleDropdownToggle}
        />
        <Label htmlFor="has-dropdown" className="font-normal cursor-pointer">
          This item has a dropdown menu
        </Label>
      </div>

      {/* Main Item Clickable (only show when dropdown is enabled) */}
      {formData.hasDropdown && (
        <div className="flex items-center space-x-2 pt-2 pl-6">
          <Checkbox
            id="main-item-clickable"
            checked={formData.mainItemClickable || false}
            onCheckedChange={(checked) => setFormData({ ...formData, mainItemClickable: checked as boolean })}
          />
          <Label htmlFor="main-item-clickable" className="font-normal cursor-pointer text-sm text-muted-foreground">
            Make main nav item clickable (navigates on click, hover still shows dropdown)
          </Label>
        </div>
      )}

      {/* Dropdown Items Editor */}
      {formData.hasDropdown && (
        <div className="border border-border rounded-lg p-4 bg-muted/20">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-foreground">Dropdown Configuration</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDropdownEditor(!showDropdownEditor)}
              type="button"
            >
              {showDropdownEditor ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Expand
                </>
              )}
            </Button>
          </div>

          {showDropdownEditor && (
            <DropdownItemsEditor
              items={formData.dropdownItems || []}
              onUpdate={(items) => setFormData({ ...formData, dropdownItems: items })}
              projectId={projectId}
            />
          )}

          {!showDropdownEditor && formData.dropdownItems && formData.dropdownItems.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {formData.dropdownItems.length} dropdown item
              {formData.dropdownItems.length !== 1 ? 's' : ''} configured
            </p>
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
