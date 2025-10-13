'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ColorPicker } from './color-picker';

interface SizingEffectsEditorProps {
  values: Record<string, unknown>;
  onChange: (key: string, value: string | boolean) => void;
}

export function SizingEffectsEditor({ values, onChange }: SizingEffectsEditorProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    spacing: true,
    shadows: false,
    radius: false,
    borders: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Helper to get string value
  const getValue = (key: string, defaultValue = ''): string => {
    const value = values[key];
    return typeof value === 'string' ? value : defaultValue;
  };

  // Helper to get boolean value
  const getBooleanValue = (key: string, defaultValue = true): boolean => {
    const value = values[key];
    return typeof value === 'boolean' ? value : defaultValue;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Sizing & Effects</h3>
        <p className="text-sm text-muted-foreground">
          Control spacing, shadows, corner radius, and border widths across your theme
        </p>
      </div>

      {/* Spacing System */}
      <Collapsible open={openSections.spacing} onOpenChange={() => toggleSection('spacing')}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <CardTitle className="text-base">Spacing System</CardTitle>
                  <CardDescription>Control padding and spacing throughout your theme</CardDescription>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    openSections.spacing && "rotate-180"
                  )}
                />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2">
                <Label htmlFor="section-padding">Section Padding</Label>
                <Select
                  value={getValue('sectionPadding', 'normal')}
                  onValueChange={(value) => onChange('sectionPadding', value)}
                >
                  <SelectTrigger id="section-padding">
                    <SelectValue placeholder="Select padding" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tight">Tight (2rem / 32px)</SelectItem>
                    <SelectItem value="normal">Normal (4rem / 64px)</SelectItem>
                    <SelectItem value="relaxed">Relaxed (6rem / 96px)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Top and bottom padding for sections
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="card-padding">Card Padding</Label>
                <Select
                  value={getValue('cardPadding', 'normal')}
                  onValueChange={(value) => onChange('cardPadding', value)}
                >
                  <SelectTrigger id="card-padding">
                    <SelectValue placeholder="Select padding" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tight">Tight (0.75rem / 12px)</SelectItem>
                    <SelectItem value="normal">Normal (1rem / 16px)</SelectItem>
                    <SelectItem value="relaxed">Relaxed (1.5rem / 24px)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Internal padding for cards and containers
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="element-spacing">Element Spacing (rem)</Label>
                <Input
                  id="element-spacing"
                  type="number"
                  step="0.25"
                  min="0.25"
                  max="3"
                  value={getValue('elementSpacing', '1')}
                  placeholder="1"
                  onChange={(e) => onChange('elementSpacing', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Gap between elements (headings, paragraphs, etc.)
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Shadow System */}
      <Collapsible open={openSections.shadows} onOpenChange={() => toggleSection('shadows')}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <CardTitle className="text-base">Global Shadow System</CardTitle>
                  <CardDescription>Control shadows for all elements across your theme</CardDescription>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    openSections.shadows && "rotate-180"
                  )}
                />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-8 pt-0">
              {/* Card Shadow Controls */}
              <div className="space-y-4 pb-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">Card Shadow</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Shadow applied to all cards throughout the site
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="card-shadow-enabled" className="text-xs text-muted-foreground">
                      {getBooleanValue('cardShadowEnabled', true) ? 'Enabled' : 'Disabled'}
                    </Label>
                    <Switch
                      id="card-shadow-enabled"
                      checked={getBooleanValue('cardShadowEnabled', true)}
                      onCheckedChange={(checked) => onChange('cardShadowEnabled', checked)}
                    />
                  </div>
                </div>

                <ColorPicker
                  label="Shadow Color"
                  value={getValue('cardShadowColor', '0 0% 0%')}
                  onChange={(value) => onChange('cardShadowColor', value)}
                  showTailwindPalette={false}
                />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Opacity</Label>
                    <span className="text-sm text-muted-foreground">{getValue('cardShadowOpacity', '20')}%</span>
                  </div>
                  <Slider
                    value={[parseFloat(getValue('cardShadowOpacity', '20'))]}
                    onValueChange={([value]) => onChange('cardShadowOpacity', value.toString())}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="card-shadow-x" className="text-xs">X Offset (px)</Label>
                    <Input
                      id="card-shadow-x"
                      type="number"
                      value={getValue('cardShadowX', '0')}
                      onChange={(e) => onChange('cardShadowX', e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card-shadow-y" className="text-xs">Y Offset (px)</Label>
                    <Input
                      id="card-shadow-y"
                      type="number"
                      value={getValue('cardShadowY', '2')}
                      onChange={(e) => onChange('cardShadowY', e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card-shadow-blur" className="text-xs">Blur (px)</Label>
                    <Input
                      id="card-shadow-blur"
                      type="number"
                      value={getValue('cardShadowBlur', '4')}
                      onChange={(e) => onChange('cardShadowBlur', e.target.value)}
                      min="0"
                      className="h-9"
                    />
                  </div>
                </div>
              </div>

              {/* Button Shadow Controls */}
              <div className="space-y-4 pb-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">Button Shadow</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Shadow applied to all buttons throughout the site
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="button-shadow-enabled" className="text-xs text-muted-foreground">
                      {getBooleanValue('buttonShadowEnabled', false) ? 'Enabled' : 'Disabled'}
                    </Label>
                    <Switch
                      id="button-shadow-enabled"
                      checked={getBooleanValue('buttonShadowEnabled', false)}
                      onCheckedChange={(checked) => onChange('buttonShadowEnabled', checked)}
                    />
                  </div>
                </div>

                <ColorPicker
                  label="Shadow Color"
                  value={getValue('buttonShadowColor', '0 0% 0%')}
                  onChange={(value) => onChange('buttonShadowColor', value)}
                  showTailwindPalette={false}
                />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Opacity</Label>
                    <span className="text-sm text-muted-foreground">{getValue('buttonShadowOpacity', '0')}%</span>
                  </div>
                  <Slider
                    value={[parseFloat(getValue('buttonShadowOpacity', '0'))]}
                    onValueChange={([value]) => onChange('buttonShadowOpacity', value.toString())}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="button-shadow-x" className="text-xs">X Offset (px)</Label>
                    <Input
                      id="button-shadow-x"
                      type="number"
                      value={getValue('buttonShadowX', '0')}
                      onChange={(e) => onChange('buttonShadowX', e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="button-shadow-y" className="text-xs">Y Offset (px)</Label>
                    <Input
                      id="button-shadow-y"
                      type="number"
                      value={getValue('buttonShadowY', '0')}
                      onChange={(e) => onChange('buttonShadowY', e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="button-shadow-blur" className="text-xs">Blur (px)</Label>
                    <Input
                      id="button-shadow-blur"
                      type="number"
                      value={getValue('buttonShadowBlur', '0')}
                      onChange={(e) => onChange('buttonShadowBlur', e.target.value)}
                      min="0"
                      className="h-9"
                    />
                  </div>
                </div>
              </div>

              {/* Input Shadow Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">Input Shadow</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Shadow applied to all input fields throughout the site
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="input-shadow-enabled" className="text-xs text-muted-foreground">
                      {getBooleanValue('inputShadowEnabled', false) ? 'Enabled' : 'Disabled'}
                    </Label>
                    <Switch
                      id="input-shadow-enabled"
                      checked={getBooleanValue('inputShadowEnabled', false)}
                      onCheckedChange={(checked) => onChange('inputShadowEnabled', checked)}
                    />
                  </div>
                </div>

                <ColorPicker
                  label="Shadow Color"
                  value={getValue('inputShadowColor', '0 0% 0%')}
                  onChange={(value) => onChange('inputShadowColor', value)}
                  showTailwindPalette={false}
                />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Opacity</Label>
                    <span className="text-sm text-muted-foreground">{getValue('inputShadowOpacity', '0')}%</span>
                  </div>
                  <Slider
                    value={[parseFloat(getValue('inputShadowOpacity', '0'))]}
                    onValueChange={([value]) => onChange('inputShadowOpacity', value.toString())}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="input-shadow-x" className="text-xs">X Offset (px)</Label>
                    <Input
                      id="input-shadow-x"
                      type="number"
                      value={getValue('inputShadowX', '0')}
                      onChange={(e) => onChange('inputShadowX', e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="input-shadow-y" className="text-xs">Y Offset (px)</Label>
                    <Input
                      id="input-shadow-y"
                      type="number"
                      value={getValue('inputShadowY', '0')}
                      onChange={(e) => onChange('inputShadowY', e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="input-shadow-blur" className="text-xs">Blur (px)</Label>
                    <Input
                      id="input-shadow-blur"
                      type="number"
                      value={getValue('inputShadowBlur', '0')}
                      onChange={(e) => onChange('inputShadowBlur', e.target.value)}
                      min="0"
                      className="h-9"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Radius Overrides */}
      <Collapsible open={openSections.radius} onOpenChange={() => toggleSection('radius')}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <CardTitle className="text-base">Border Radius Overrides</CardTitle>
                  <CardDescription>Override global radius for specific elements</CardDescription>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    openSections.radius && "rotate-180"
                  )}
                />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <p className="text-xs text-muted-foreground">
                Leave empty to use the global radius setting. Values in rem (e.g., 0.5 for 8px).
              </p>

              <div className="space-y-2">
                <Label htmlFor="card-radius">Card Radius (rem)</Label>
                <Input
                  id="card-radius"
                  type="number"
                  step="0.125"
                  min="0"
                  max="2"
                  value={getValue('cardRadius')}
                  placeholder="Use global"
                  onChange={(e) => onChange('cardRadius', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="button-radius">Button Radius (rem)</Label>
                <Input
                  id="button-radius"
                  type="number"
                  step="0.125"
                  min="0"
                  max="2"
                  value={getValue('buttonRadius')}
                  placeholder="Use global"
                  onChange={(e) => onChange('buttonRadius', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="input-radius">Input Radius (rem)</Label>
                <Input
                  id="input-radius"
                  type="number"
                  step="0.125"
                  min="0"
                  max="2"
                  value={getValue('inputRadius')}
                  placeholder="Use global"
                  onChange={(e) => onChange('inputRadius', e.target.value)}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Border Width System */}
      <Collapsible open={openSections.borders} onOpenChange={() => toggleSection('borders')}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <CardTitle className="text-base">Border Width System</CardTitle>
                  <CardDescription>Control border thickness across elements</CardDescription>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    openSections.borders && "rotate-180"
                  )}
                />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2">
                <Label htmlFor="global-border-width">Global Border Width (px)</Label>
                <Input
                  id="global-border-width"
                  type="number"
                  step="0.5"
                  min="0"
                  max="4"
                  value={getValue('globalBorderWidth', '1')}
                  placeholder="1"
                  onChange={(e) => onChange('globalBorderWidth', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Default border width for cards, dividers, etc.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="input-border-width">Input Border Width (px)</Label>
                <Input
                  id="input-border-width"
                  type="number"
                  step="0.5"
                  min="0"
                  max="4"
                  value={getValue('inputBorderWidth')}
                  placeholder="Use global"
                  onChange={(e) => onChange('inputBorderWidth', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Override border width for input fields and textareas
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
