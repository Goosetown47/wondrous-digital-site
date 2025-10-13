'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { GoogleFontSelector } from './GoogleFontSelector';
import { loadGoogleFonts, getFontFamilyCSS } from '@/lib/google-fonts';

interface HeadingConfig {
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'small';
  label: string;
  defaultSize: string;
  defaultLineHeight: string;
  defaultWeight: string;
  defaultLetterSpacing: string;
}

const HEADING_CONFIGS: HeadingConfig[] = [
  { level: 'h1', label: 'Heading 1', defaultSize: '3', defaultLineHeight: '1.2', defaultWeight: '700', defaultLetterSpacing: '-0.02' },
  { level: 'h2', label: 'Heading 2', defaultSize: '2.25', defaultLineHeight: '1.3', defaultWeight: '600', defaultLetterSpacing: '-0.01' },
  { level: 'h3', label: 'Heading 3', defaultSize: '1.875', defaultLineHeight: '1.4', defaultWeight: '600', defaultLetterSpacing: '0' },
  { level: 'h4', label: 'Heading 4', defaultSize: '1.5', defaultLineHeight: '1.4', defaultWeight: '600', defaultLetterSpacing: '0' },
  { level: 'h5', label: 'Heading 5', defaultSize: '1.25', defaultLineHeight: '1.5', defaultWeight: '500', defaultLetterSpacing: '0' },
  { level: 'h6', label: 'Heading 6', defaultSize: '1', defaultLineHeight: '1.5', defaultWeight: '500', defaultLetterSpacing: '0' },
  { level: 'body', label: 'Body Text', defaultSize: '1', defaultLineHeight: '1.6', defaultWeight: '400', defaultLetterSpacing: '0' },
  { level: 'small', label: 'Small Text', defaultSize: '0.875', defaultLineHeight: '1.5', defaultWeight: '400', defaultLetterSpacing: '0' },
];

const FONT_WEIGHTS = [
  { value: '300', label: 'Light (300)' },
  { value: '400', label: 'Regular (400)' },
  { value: '500', label: 'Medium (500)' },
  { value: '600', label: 'Semi Bold (600)' },
  { value: '700', label: 'Bold (700)' },
  { value: '800', label: 'Extra Bold (800)' },
];

interface TypographyStyleEditorProps {
  // Base font defaults
  baseFontHeading?: string;
  baseFontBody?: string;

  // Values for each level
  values: {
    [key: string]: string | Record<string, string> | undefined;
  };

  onChange: (key: string, value: string) => void;
}

interface BaseFontEditorProps {
  label: string;
  description: string;
  value?: string;
  onChange: (value: string) => void;
}

function BaseFontEditor({
  label,
  description,
  value,
  onChange,
}: BaseFontEditorProps) {
  const [isOpen, setIsOpen] = useState(true); // Base fonts default to open

  // Load font when value changes
  useEffect(() => {
    if (value && value !== 'Inter') {
      loadGoogleFonts([value]);
    }
  }, [value]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-primary/20">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <div className="text-left">
                  <CardTitle className="text-base">{label}</CardTitle>
                  <CardDescription className="text-xs mt-1">{description}</CardDescription>
                </div>
              </div>
              <div
                className="text-sm font-medium"
                style={{
                  fontFamily: getFontFamilyCSS(value || 'Inter'),
                }}
              >
                {value || 'Inter'}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <GoogleFontSelector
              label=""
              value={value}
              onChange={onChange}
            />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

interface HeadingEditorProps {
  config: HeadingConfig;
  font?: string;
  size?: string;
  lineHeight?: string;
  weight?: string;
  letterSpacing?: string;
  baseFontHeading?: string;
  baseFontBody?: string;
  onChange: (key: string, value: string) => void;
}

function HeadingEditor({
  config,
  font,
  size,
  lineHeight,
  weight,
  letterSpacing,
  baseFontHeading,
  baseFontBody,
  onChange,
}: HeadingEditorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const level = config.level;
  const isHeading = level.startsWith('h');
  const effectiveFont = font || (isHeading ? baseFontHeading : baseFontBody) || 'Inter';
  const effectiveSize = size || config.defaultSize;
  const effectiveLineHeight = lineHeight || config.defaultLineHeight;
  const effectiveWeight = weight || config.defaultWeight;
  const effectiveLetterSpacing = letterSpacing || config.defaultLetterSpacing;

  const hasOverride = !!font;
  const baseFont = isHeading ? baseFontHeading : baseFontBody;

  // Load font when effectiveFont changes
  useEffect(() => {
    if (effectiveFont && effectiveFont !== 'Inter') {
      loadGoogleFonts([effectiveFont]);
    }
  }, [effectiveFont]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 flex-shrink-0" />
                )}
                <div className="flex flex-col items-start min-w-0 flex-1">
                  <CardTitle className="text-base">{config.label}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    {hasOverride ? (
                      <>
                        <Badge variant="default" className="text-xs">
                          Override: {font}
                        </Badge>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            onChange(`${level}Font`, '');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.stopPropagation();
                              onChange(`${level}Font`, '');
                            }
                          }}
                          className="inline-flex h-5 w-5 items-center justify-center rounded hover:bg-destructive/10 cursor-pointer transition-colors"
                          aria-label="Clear font override"
                        >
                          <X className="h-3 w-3" />
                        </span>
                      </>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Using {isHeading ? 'Heading' : 'Body'}: {baseFont || 'Inter'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div
                className="text-sm text-muted-foreground flex-shrink-0"
                style={{
                  fontFamily: getFontFamilyCSS(effectiveFont),
                  fontSize: `${effectiveSize}rem`,
                  fontWeight: effectiveWeight,
                }}
              >
                Aa
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6 pt-0">
            {/* Font Override */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Font Override (Optional)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                {hasOverride ? (
                  <>Currently overriding with <strong>{font}</strong>. Use the X button in the header to clear.</>
                ) : (
                  <>Leave empty to use {isHeading ? 'heading' : 'body'} font: <strong>{baseFont || 'Inter'}</strong></>
                )}
              </p>
              <GoogleFontSelector
                label=""
                value={font}
                onChange={(value) => onChange(`${level}Font`, value)}
              />
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={`${level}-size`}>Font Size (rem)</Label>
                <span className="text-sm text-muted-foreground">
                  {effectiveSize}rem
                </span>
              </div>
              <Input
                id={`${level}-size`}
                type="number"
                step="0.125"
                min="0.5"
                max="6"
                value={size || ''}
                placeholder={config.defaultSize}
                onChange={(e) => onChange(`${level}Size`, e.target.value)}
              />
            </div>

            {/* Line Height */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={`${level}-line-height`}>Line Height</Label>
                <span className="text-sm text-muted-foreground">
                  {effectiveLineHeight}
                </span>
              </div>
              <Slider
                id={`${level}-line-height`}
                value={[parseFloat(lineHeight || config.defaultLineHeight)]}
                onValueChange={([value]) => onChange(`${level}LineHeight`, value.toString())}
                min={1.0}
                max={2.5}
                step={0.1}
              />
            </div>

            {/* Font Weight */}
            <div className="space-y-2">
              <Label htmlFor={`${level}-weight`}>Font Weight</Label>
              <Select
                value={weight || config.defaultWeight}
                onValueChange={(value) => onChange(`${level}Weight`, value)}
              >
                <SelectTrigger id={`${level}-weight`}>
                  <SelectValue placeholder="Select weight" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_WEIGHTS.map((fw) => (
                    <SelectItem key={fw.value} value={fw.value}>
                      {fw.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Letter Spacing */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={`${level}-letter-spacing`}>Letter Spacing (em)</Label>
                <span className="text-sm text-muted-foreground">
                  {effectiveLetterSpacing}em
                </span>
              </div>
              <Slider
                id={`${level}-letter-spacing`}
                value={[parseFloat(letterSpacing || config.defaultLetterSpacing)]}
                onValueChange={([value]) => onChange(`${level}LetterSpacing`, value.toFixed(2))}
                min={-0.1}
                max={0.2}
                step={0.01}
              />
            </div>

            {/* Preview */}
            <div className="p-4 rounded-lg border bg-muted/30">
              <p className="text-xs text-muted-foreground mb-2">Preview:</p>
              <div
                style={{
                  fontFamily: getFontFamilyCSS(effectiveFont),
                  fontSize: `${effectiveSize}rem`,
                  lineHeight: effectiveLineHeight,
                  fontWeight: effectiveWeight,
                  letterSpacing: `${effectiveLetterSpacing}em`,
                }}
              >
                The quick brown fox jumps
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export function TypographyStyleEditor({
  baseFontHeading,
  baseFontBody,
  values,
  onChange,
}: TypographyStyleEditorProps) {
  return (
    <div className="space-y-6">
      {/* Base Fonts Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Base Fonts</h3>
          <p className="text-sm text-muted-foreground">
            Set default fonts for headings and body text. Individual heading levels can override these below.
          </p>
        </div>

        <BaseFontEditor
          label="Heading Font (Base)"
          description="Default font for all headings (h1, h2, h3, etc.)"
          value={baseFontHeading}
          onChange={(value) => onChange('fontHeading', value)}
        />

        <BaseFontEditor
          label="Body Font (Base)"
          description="Font used for body text, paragraphs, and UI elements"
          value={baseFontBody}
          onChange={(value) => onChange('fontBody', value)}
        />
      </div>

      {/* Granular Typography Controls Section */}
      <div className="border-t pt-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Granular Typography Controls</h3>
          <p className="text-sm text-muted-foreground">
            Customize each heading level individually. Each heading inherits from the base heading font unless overridden.
          </p>
        </div>

        {HEADING_CONFIGS.map((config) => {
          const levelFont = values[`${config.level}Font`];
          const levelSize = values[`${config.level}Size`];
          const levelLineHeight = values[`${config.level}LineHeight`];
          const levelWeight = values[`${config.level}Weight`];
          const levelLetterSpacing = values[`${config.level}LetterSpacing`];

          return (
            <HeadingEditor
              key={config.level}
              config={config}
              font={typeof levelFont === 'string' ? levelFont : undefined}
              size={typeof levelSize === 'string' ? levelSize : undefined}
              lineHeight={typeof levelLineHeight === 'string' ? levelLineHeight : undefined}
              weight={typeof levelWeight === 'string' ? levelWeight : undefined}
              letterSpacing={typeof levelLetterSpacing === 'string' ? levelLetterSpacing : undefined}
              baseFontHeading={baseFontHeading}
              baseFontBody={baseFontBody}
              onChange={onChange}
            />
          );
        })}
      </div>
    </div>
  );
}
