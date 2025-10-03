/**
 * SectionSettingsModal Component
 *
 * Modal for configuring section-level settings including:
 * - Scope: Page-Specific vs Global Project Section
 * - Placement: Where the global section appears
 * - Display Order: Order within placement group
 */

'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export type SectionScope = 'page' | 'global';
export type SectionPlacement = 'global_header' | 'global_footer' | 'above_content' | 'below_content';

export interface SectionSettings {
  scope: SectionScope;
  placement?: SectionPlacement;
  displayOrder?: number;
}

interface SectionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: SectionSettings) => void;
  currentSettings: SectionSettings;
  sectionId: string;
  sectionName?: string;
}

const PLACEMENT_OPTIONS = [
  { value: 'global_header', label: 'Global Header', description: 'Appears at the top of every page' },
  { value: 'global_footer', label: 'Global Footer', description: 'Appears at the bottom of every page' },
  { value: 'above_content', label: 'Above Page Content', description: 'Appears above page-specific content' },
  { value: 'below_content', label: 'Below Page Content', description: 'Appears below page-specific content' },
];

export function SectionSettingsModal({
  isOpen,
  onClose,
  onSave,
  currentSettings,
  sectionName,
}: Omit<SectionSettingsModalProps, 'sectionId'>) {
  const [settings, setSettings] = useState<SectionSettings>(currentSettings);

  // Reset settings when modal opens
  useEffect(() => {
    if (isOpen) {
      setSettings(currentSettings);
    }
  }, [isOpen, currentSettings]);

  const handleSave = () => {
    // Validate
    if (settings.scope === 'global' && !settings.placement) {
      // Should not happen due to UI, but safety check
      return;
    }

    onSave(settings);
    onClose();
  };

  const handleCancel = () => {
    setSettings(currentSettings); // Reset
    onClose();
  };

  const placementOption = PLACEMENT_OPTIONS.find((opt) => opt.value === settings.placement);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Section Settings</DialogTitle>
          <DialogDescription>
            Configure how this section appears across your site
            {sectionName && <span className="font-medium"> • {sectionName}</span>}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">Section Settings</TabsTrigger>
            <TabsTrigger value="advanced" disabled>
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6 pt-4">
            {/* Scope Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Section Scope</Label>
              <RadioGroup
                value={settings.scope}
                onValueChange={(value: SectionScope) => {
                  setSettings({
                    scope: value,
                    placement: value === 'global' ? 'global_header' : undefined,
                    displayOrder: value === 'global' ? 0 : undefined,
                  });
                }}
              >
                <div className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="page" id="scope-page" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="scope-page" className="font-medium cursor-pointer">
                      Page-Specific Section
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      This section only appears on the current page
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="global" id="scope-global" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="scope-global" className="font-medium cursor-pointer">
                      Global Project Section
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      This section appears on all pages across your entire project
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Global Settings (conditional) */}
            {settings.scope === 'global' && (
              <>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Making this section global will remove it from the current page and add it to all pages in
                    your project. This change cannot be undone automatically.
                  </AlertDescription>
                </Alert>

                {/* Placement */}
                <div className="space-y-3">
                  <Label htmlFor="placement" className="text-base font-semibold">
                    Placement
                  </Label>
                  <Select
                    value={settings.placement}
                    onValueChange={(value: SectionPlacement) =>
                      setSettings({ ...settings, placement: value })
                    }
                  >
                    <SelectTrigger id="placement">
                      <SelectValue placeholder="Select placement" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLACEMENT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-muted-foreground">{option.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {placementOption && (
                    <p className="text-sm text-muted-foreground">{placementOption.description}</p>
                  )}
                </div>

                {/* Display Order */}
                <div className="space-y-3">
                  <Label htmlFor="display-order" className="text-base font-semibold">
                    Display Order
                  </Label>
                  <Input
                    id="display-order"
                    type="number"
                    min="0"
                    value={settings.displayOrder ?? 0}
                    onChange={(e) =>
                      setSettings({ ...settings, displayOrder: parseInt(e.target.value) || 0 })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Sections with lower numbers appear first within their placement group
                  </p>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6 pt-4">
            <p className="text-sm text-muted-foreground">Advanced settings coming soon...</p>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
