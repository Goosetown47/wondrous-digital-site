'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { ColorPicker } from './color-picker';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { validateContrast, getContrastRating } from '@/lib/contrast-validation';
import { AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionStyleProps {
  styleNumber: 1 | 2 | 3 | 4;
  name?: string;
  description?: string;
  bg?: string;
  fg?: string;
  card?: string;
  cardFg?: string;
  cardBorder?: string;
  cardBorderWidth?: string;
  onChange: (updates: {
    name?: string;
    description?: string;
    bg?: string;
    fg?: string;
    card?: string;
    cardFg?: string;
    cardBorder?: string;
    cardBorderWidth?: string;
  }) => void;
}

export function SectionStyleEditor({
  styleNumber,
  name,
  description,
  bg = '0 0% 100%',
  fg = '0 0% 0%',
  card = '0 0% 96%',
  cardFg = '0 0% 0%',
  cardBorder = '0 0% 89%',
  cardBorderWidth = '1',
  onChange,
}: SectionStyleProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Calculate contrast ratios
  const sectionContrast = validateContrast(fg, bg, 'AA');
  const cardContrast = validateContrast(cardFg, card, 'AA');
  const cardOnSectionContrast = validateContrast(card, bg, 'AA', 'large');

  return (
    <Card className="border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">
                    Section Style {styleNumber}
                    {name && <span className="text-muted-foreground font-normal"> - {name}</span>}
                  </CardTitle>
                  {sectionContrast.passes && cardContrast.passes ? (
                    <Badge variant="default" className="text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      WCAG AA
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Contrast Issue
                    </Badge>
                  )}
                </div>
                <CardDescription className="mt-1">
                  {description || 'Define a pre-matched color palette with guaranteed contrast'}
                </CardDescription>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0 ml-2",
                  isOpen && "rotate-180"
                )}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-6">
        {/* Name and Description */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`style-${styleNumber}-name`}>Style Name</Label>
            <Input
              id={`style-${styleNumber}-name`}
              placeholder={`e.g., "Light & Clean" or "Dark & Bold"`}
              value={name || ''}
              onChange={(e) => onChange({ name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`style-${styleNumber}-description`}>Description (Optional)</Label>
            <Input
              id={`style-${styleNumber}-description`}
              placeholder="Brief description for users"
              value={description || ''}
              onChange={(e) => onChange({ description: e.target.value })}
            />
          </div>
        </div>

        {/* Section Colors */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h4 className="text-sm font-medium">Section Colors</h4>

          <ColorPicker
            label="Section Background"
            value={bg}
            onChange={(value) => onChange({ bg: value })}
          />

          <ColorPicker
            label="Section Text"
            value={fg}
            onChange={(value) => onChange({ fg: value })}
          />

          {/* Contrast Validation */}
          <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
            <div className="flex items-center gap-2">
              {sectionContrast.passes ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-destructive" />
              )}
              <span className="text-sm">Text on Background</span>
            </div>
            <div className="text-right">
              <span className={`text-sm font-medium ${sectionContrast.passes ? 'text-green-600' : 'text-destructive'}`}>
                {sectionContrast.ratio.toFixed(2)}:1
              </span>
              <p className="text-xs text-muted-foreground">
                {getContrastRating(sectionContrast.ratio)}
              </p>
            </div>
          </div>
        </div>

        {/* Card Colors */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h4 className="text-sm font-medium">Card Colors</h4>
          <p className="text-xs text-muted-foreground">
            Cards appear on top of the section background
          </p>

          <ColorPicker
            label="Card Background"
            value={card}
            onChange={(value) => onChange({ card: value })}
          />

          <ColorPicker
            label="Card Text"
            value={cardFg}
            onChange={(value) => onChange({ cardFg: value })}
          />

          <ColorPicker
            label="Card Border Color"
            value={cardBorder}
            onChange={(value) => onChange({ cardBorder: value })}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={`card-border-width-${styleNumber}`}>Card Border Width</Label>
              <span className="text-sm text-muted-foreground">{cardBorderWidth}px</span>
            </div>
            <Slider
              id={`card-border-width-${styleNumber}`}
              value={[parseFloat(cardBorderWidth)]}
              onValueChange={([value]) => onChange({ cardBorderWidth: value.toString() })}
              min={0}
              max={4}
              step={0.5}
            />
          </div>

          {/* Contrast Validations */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
              <div className="flex items-center gap-2">
                {cardContrast.passes ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                <span className="text-sm">Card Text on Card</span>
              </div>
              <div className="text-right">
                <span className={`text-sm font-medium ${cardContrast.passes ? 'text-green-600' : 'text-destructive'}`}>
                  {cardContrast.ratio.toFixed(2)}:1
                </span>
                <p className="text-xs text-muted-foreground">
                  {getContrastRating(cardContrast.ratio)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
              <div className="flex items-center gap-2">
                {cardOnSectionContrast.passes ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                )}
                <span className="text-sm">Card on Section</span>
              </div>
              <div className="text-right">
                <span className={`text-sm font-medium ${cardOnSectionContrast.passes ? 'text-green-600' : 'text-orange-500'}`}>
                  {cardOnSectionContrast.ratio.toFixed(2)}:1
                </span>
                <p className="text-xs text-muted-foreground">
                  {cardOnSectionContrast.passes ? 'Visible' : 'Low contrast'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Preview */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: `hsl(${bg})`, color: `hsl(${fg})` }}>
          <h3 className="text-lg font-semibold mb-3">Section Preview</h3>
          <p className="text-sm mb-4">This is how text will appear on the section background.</p>

          <div
            className="p-4 rounded-md"
            style={{
              backgroundColor: `hsl(${card})`,
              color: `hsl(${cardFg})`,
              border: `${cardBorderWidth}px solid hsl(${cardBorder})`
            }}
          >
            <h4 className="font-medium mb-2">Card Preview</h4>
            <p className="text-sm">This is how text will appear on cards within this section.</p>
          </div>
        </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
