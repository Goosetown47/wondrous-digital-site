'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link2 } from 'lucide-react';

export interface ButtonData {
  text: string;
  url: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  openInNewTab?: boolean;
}

interface ButtonEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buttonData: ButtonData;
  onUpdate: (data: ButtonData) => void;
}

export function ButtonEditorModal({
  open,
  onOpenChange,
  buttonData,
  onUpdate,
}: ButtonEditorModalProps) {
  const [text, setText] = useState(buttonData.text || '');
  const [url, setUrl] = useState(buttonData.url || '');
  const [variant, setVariant] = useState<ButtonData['variant']>(buttonData.variant || 'default');
  const [size, setSize] = useState<ButtonData['size']>(buttonData.size || 'default');
  const [openInNewTab, setOpenInNewTab] = useState(buttonData.openInNewTab || false);
  const [errors, setErrors] = useState<{ text?: string; url?: string }>({});

  // Update local state when buttonData changes
  useEffect(() => {
    setText(buttonData.text || '');
    setUrl(buttonData.url || '');
    setVariant(buttonData.variant || 'default');
    setSize(buttonData.size || 'default');
    setOpenInNewTab(buttonData.openInNewTab || false);
    setErrors({});
  }, [buttonData, open]);

  const validateInputs = useCallback((): boolean => {
    const newErrors: { text?: string; url?: string } = {};

    if (!text.trim()) {
      newErrors.text = 'Button text is required';
    }

    if (!url.trim()) {
      newErrors.url = 'Button URL is required';
    } else if (!url.startsWith('http') && !url.startsWith('/') && !url.startsWith('#')) {
      newErrors.url = 'URL must start with http://, https://, /, or #';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [text, url]);

  const handleSave = useCallback(() => {
    if (!validateInputs()) {
      return;
    }

    const updatedButton: ButtonData = {
      text: text.trim(),
      url: url.trim(),
      variant,
      size,
      openInNewTab,
    };

    onUpdate(updatedButton);
    onOpenChange(false);
  }, [text, url, variant, size, openInNewTab, validateInputs, onUpdate, onOpenChange]);

  const handleCancel = useCallback(() => {
    // Reset to original values
    setText(buttonData.text || '');
    setUrl(buttonData.url || '');
    setVariant(buttonData.variant || 'default');
    setSize(buttonData.size || 'default');
    setOpenInNewTab(buttonData.openInNewTab || false);
    setErrors({});
    onOpenChange(false);
  }, [buttonData, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Edit Button
          </DialogTitle>
          <DialogDescription className="sr-only">
            Edit button text, URL, style, and behavior
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Button Text */}
          <div className="grid gap-2">
            <Label htmlFor="button-text">
              Button Text <span className="text-destructive">*</span>
            </Label>
            <Input
              id="button-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Click here"
              className={errors.text ? 'border-destructive' : ''}
            />
            {errors.text && (
              <p className="text-sm text-destructive">{errors.text}</p>
            )}
          </div>

          {/* Button URL */}
          <div className="grid gap-2">
            <Label htmlFor="button-url">
              Button URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="button-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com or /page"
              className={errors.url ? 'border-destructive' : ''}
            />
            {errors.url && (
              <p className="text-sm text-destructive">{errors.url}</p>
            )}
          </div>

          {/* Button Variant */}
          <div className="grid gap-2">
            <Label htmlFor="button-variant">Button Style</Label>
            <Select value={variant} onValueChange={(value) => setVariant(value as ButtonData['variant'])}>
              <SelectTrigger id="button-variant">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Primary (Default)</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
                <SelectItem value="outline">Outline</SelectItem>
                <SelectItem value="ghost">Ghost</SelectItem>
                <SelectItem value="link">Link</SelectItem>
                <SelectItem value="destructive">Destructive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Button Size */}
          <div className="grid gap-2">
            <Label htmlFor="button-size">Button Size</Label>
            <Select value={size} onValueChange={(value) => setSize(value as ButtonData['size'])}>
              <SelectTrigger id="button-size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
                <SelectItem value="icon">Icon Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Open in New Tab */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="open-new-tab"
              checked={openInNewTab}
              onCheckedChange={(checked) => setOpenInNewTab(checked as boolean)}
            />
            <Label
              htmlFor="open-new-tab"
              className="text-sm font-normal cursor-pointer"
            >
              Open link in new tab
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
