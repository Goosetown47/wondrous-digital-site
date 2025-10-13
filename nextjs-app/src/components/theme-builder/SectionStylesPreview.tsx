'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SectionStylesPreviewProps {
  styles: Array<{
    number: 1 | 2 | 3 | 4;
    name?: string;
    description?: string;
    bg?: string;
    fg?: string;
    card?: string;
    cardFg?: string;
  }>;
}

/**
 * SectionStylesPreview Component
 *
 * Displays all 4 section styles side-by-side in a grid,
 * showing how each style looks with section backgrounds and cards.
 */
export function SectionStylesPreview({ styles }: SectionStylesPreviewProps) {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Section Style System</h2>
        <p className="text-muted-foreground">
          Preview all section styles with their backgrounds, text, and card combinations
        </p>
      </div>

      {/* Grid of Section Styles */}
      <div className="grid gap-6 md:grid-cols-2">
        {styles.map((style) => {
          const styleName = style.name || `Style ${style.number}`;
          const styleDescription = style.description || `Section style ${style.number}`;
          const hasBg = !!style.bg;

          return (
            <Card key={style.number} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {styleName}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {styleDescription}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">Style {style.number}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {hasBg ? (
                  <>
                    {/* Section Background Demo */}
                    <div
                      className="p-6 space-y-4"
                      style={{
                        backgroundColor: style.bg ? `hsl(${style.bg})` : undefined,
                        color: style.fg ? `hsl(${style.fg})` : undefined,
                      }}
                    >
                      <div>
                        <h4 className="font-semibold mb-2">Section Background</h4>
                        <p className="text-sm opacity-90">
                          This text appears directly on the section background.
                          Good contrast is essential for readability.
                        </p>
                      </div>

                      {/* Card on Section Background */}
                      <div
                        className="p-4 rounded-lg border space-y-2"
                        style={{
                          backgroundColor: style.card ? `hsl(${style.card})` : undefined,
                          color: style.cardFg ? `hsl(${style.cardFg})` : undefined,
                          borderColor: style.cardFg ? `hsl(${style.cardFg} / 0.2)` : undefined,
                        }}
                      >
                        <h5 className="font-medium text-sm">Card Component</h5>
                        <p className="text-xs opacity-90">
                          Cards sit on top of section backgrounds with their own
                          background and text colors for contrast.
                        </p>
                      </div>
                    </div>

                    {/* Color Metadata */}
                    <div className="p-4 bg-muted/30 border-t">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="font-medium text-muted-foreground">Section BG</p>
                          <code className="text-xs">{style.bg || 'Not set'}</code>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground">Section Text</p>
                          <code className="text-xs">{style.fg || 'Not set'}</code>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground">Card BG</p>
                          <code className="text-xs">{style.card || 'Not set'}</code>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground">Card Text</p>
                          <code className="text-xs">{style.cardFg || 'Not set'}</code>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-12 text-center text-muted-foreground">
                    <p className="text-sm">Style {style.number} not configured</p>
                    <p className="text-xs mt-1">
                      Configure this style in the Section Styles tab
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Usage Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Using Section Styles</CardTitle>
          <CardDescription>
            How to apply these styles in your sections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>Section Styles</strong> provide pre-matched color palettes for different sections
            of your website. Each style includes:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
            <li>Section background color with guaranteed contrast for text</li>
            <li>Card background color with guaranteed contrast on the section</li>
            <li>Automatic text colors for optimal readability</li>
          </ul>
          <p className="text-muted-foreground">
            In the page builder, you can assign any of these styles to individual sections,
            allowing you to create visual variety while maintaining consistent design quality.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
