'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * TypographyPreview Component
 *
 * Displays the complete typography hierarchy (H1-H6, body, small text)
 * with visual examples and metadata for each level.
 */
export function TypographyPreview() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Typography System</h2>
        <p className="text-muted-foreground">
          Preview your complete typography hierarchy and font settings
        </p>
      </div>

      {/* Heading 1 */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-baseline justify-between gap-4">
            <h1>The quick brown fox jumps over the lazy dog</h1>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
            <span>Heading 1</span>
            <span>•</span>
            <span>Primary page titles</span>
          </div>
        </CardContent>
      </Card>

      {/* Heading 2 */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-baseline justify-between gap-4">
            <h2>The quick brown fox jumps over the lazy dog</h2>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
            <span>Heading 2</span>
            <span>•</span>
            <span>Section titles</span>
          </div>
        </CardContent>
      </Card>

      {/* Heading 3 */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-baseline justify-between gap-4">
            <h3>The quick brown fox jumps over the lazy dog</h3>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
            <span>Heading 3</span>
            <span>•</span>
            <span>Subsection titles</span>
          </div>
        </CardContent>
      </Card>

      {/* Heading 4 */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-baseline justify-between gap-4">
            <h4>The quick brown fox jumps over the lazy dog</h4>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
            <span>Heading 4</span>
            <span>•</span>
            <span>Card titles</span>
          </div>
        </CardContent>
      </Card>

      {/* Heading 5 */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-baseline justify-between gap-4">
            <h5>The quick brown fox jumps over the lazy dog</h5>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
            <span>Heading 5</span>
            <span>•</span>
            <span>Small headings</span>
          </div>
        </CardContent>
      </Card>

      {/* Heading 6 */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-baseline justify-between gap-4">
            <h6>The quick brown fox jumps over the lazy dog</h6>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
            <span>Heading 6</span>
            <span>•</span>
            <span>Tiny headings</span>
          </div>
        </CardContent>
      </Card>

      {/* Body Text */}
      <Card>
        <CardHeader>
          <CardTitle>Body Text</CardTitle>
          <CardDescription>Primary content text</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            This is regular body text used throughout the interface for content and descriptions.
            It should be comfortable to read at length. Body text is the foundation of your content
            and should have good contrast with its background. The quick brown fox jumps over the
            lazy dog. ABCDEFGHIJKLMNOPQRSTUVWXYZ 1234567890.
          </p>
          <p>
            Multiple paragraphs demonstrate proper line height and spacing. Good typography makes
            content more readable and helps guide users through your interface naturally.
          </p>
        </CardContent>
      </Card>

      {/* Small Text */}
      <Card>
        <CardHeader>
          <CardTitle>Small Text</CardTitle>
          <CardDescription>Captions, labels, and supplementary information</CardDescription>
        </CardHeader>
        <CardContent>
          <small className="block">
            This is small text used for captions, labels, and supplementary information. While smaller,
            it should still be readable and maintain good contrast. The quick brown fox jumps over the
            lazy dog. ABCDEFGHIJKLMNOPQRSTUVWXYZ 1234567890.
          </small>
        </CardContent>
      </Card>

      {/* Typography Samples */}
      <Card>
        <CardHeader>
          <CardTitle>Typography Samples</CardTitle>
          <CardDescription>Additional character sets and styles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Alphabet</p>
            <p>ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
            <p>abcdefghijklmnopqrstuvwxyz</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Numbers &amp; Special Characters</p>
            <p>0123456789</p>
            <p>!@#$%^&amp;*()_+-=[]{}|;:&apos;&quot;,./&lt;&gt;?</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Sample Sentence</p>
            <p>
              Pack my box with five dozen liquor jugs. How quickly daft jumping zebras vex.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
