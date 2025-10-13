'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import {
  getFontsByCategory,
  getAllCategories,
  searchFonts,
  loadGoogleFonts,
  getFontFamilyCSS,
  type FontCategory,
} from '@/lib/google-fonts';

interface GoogleFontSelectorProps {
  label: string;
  value?: string;
  onChange: (fontName: string) => void;
  description?: string;
}

export function GoogleFontSelector({
  label,
  value,
  onChange,
  description,
}: GoogleFontSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FontCategory>('sans-serif');
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());

  // Get categories and fonts
  const categories = getAllCategories();

  // Get filtered fonts based on search or category
  const displayFonts = useMemo(() => {
    if (searchQuery.trim()) {
      return searchFonts(searchQuery);
    }
    return getFontsByCategory(selectedCategory);
  }, [searchQuery, selectedCategory]);

  // Load font when it's selected or when hovering over options
  const handleLoadFont = useCallback((fontName: string) => {
    setLoadedFonts(prev => {
      if (prev.has(fontName)) return prev;
      loadGoogleFonts([fontName]);
      return new Set([...prev, fontName]);
    });
  }, []);

  // Load currently selected font on mount
  useEffect(() => {
    if (value) {
      handleLoadFont(value);
    }
  }, [value, handleLoadFont]);

  // Load visible fonts for preview (throttled)
  useEffect(() => {
    const fontsToLoad = displayFonts.slice(0, 10).map(f => f.name);
    fontsToLoad.forEach(fontName => {
      if (!loadedFonts.has(fontName)) {
        setTimeout(() => handleLoadFont(fontName), 100);
      }
    });
  }, [displayFonts, handleLoadFont, loadedFonts]);

  const handleFontSelect = (fontName: string) => {
    handleLoadFont(fontName);
    onChange(fontName);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search fonts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category Tabs or Search Results */}
      {searchQuery.trim() ? (
        // Search Results
        <div className="border rounded-lg">
          <div className="p-3 border-b bg-muted/50">
            <p className="text-sm font-medium">
              {displayFonts.length} {displayFonts.length === 1 ? 'font' : 'fonts'} found
            </p>
          </div>
          <ScrollArea className="h-[400px]">
            <RadioGroup value={value || ''} onValueChange={handleFontSelect} className="p-2">
              {displayFonts.map((font) => (
                <div
                  key={font.name}
                  className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleFontSelect(font.name)}
                  onMouseEnter={() => handleLoadFont(font.name)}
                >
                  <RadioGroupItem value={font.name} id={`search-${font.name}`} />
                  <Label
                    htmlFor={`search-${font.name}`}
                    className="flex-1 cursor-pointer"
                    style={{ fontFamily: getFontFamilyCSS(font.name) }}
                  >
                    <span className="text-base">{font.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({font.category})
                    </span>
                  </Label>
                </div>
              ))}
              {displayFonts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No fonts found matching &quot;{searchQuery}&quot;</p>
                </div>
              )}
            </RadioGroup>
          </ScrollArea>
        </div>
      ) : (
        // Category Tabs
        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as FontCategory)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="sans-serif" className="text-xs">Sans Serif</TabsTrigger>
            <TabsTrigger value="serif" className="text-xs">Serif</TabsTrigger>
            <TabsTrigger value="display" className="text-xs">Display</TabsTrigger>
            <TabsTrigger value="handwriting" className="text-xs">Script</TabsTrigger>
            <TabsTrigger value="monospace" className="text-xs">Mono</TabsTrigger>
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="mt-4">
              <div className="border rounded-lg">
                <div className="p-3 border-b bg-muted/50">
                  <p className="text-sm font-medium capitalize">
                    {category.replace('-', ' ')} Fonts ({displayFonts.length})
                  </p>
                </div>
                <ScrollArea className="h-[400px]">
                  <RadioGroup value={value || ''} onValueChange={handleFontSelect} className="p-2">
                    {displayFonts.map((font) => (
                      <div
                        key={font.name}
                        className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleFontSelect(font.name)}
                        onMouseEnter={() => handleLoadFont(font.name)}
                      >
                        <RadioGroupItem value={font.name} id={`font-${font.name}`} />
                        <Label
                          htmlFor={`font-${font.name}`}
                          className="flex-1 cursor-pointer"
                          style={{ fontFamily: getFontFamilyCSS(font.name) }}
                        >
                          <span className="text-base">{font.name}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </ScrollArea>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Selected Font Preview */}
      {value && (
        <div className="p-4 border rounded-lg bg-muted/30">
          <p className="text-sm text-muted-foreground mb-2">Preview:</p>
          <p
            className="text-2xl"
            style={{ fontFamily: getFontFamilyCSS(value) }}
          >
            The quick brown fox jumps over the lazy dog
          </p>
          <p
            className="text-lg mt-2"
            style={{ fontFamily: getFontFamilyCSS(value) }}
          >
            ABCDEFGHIJKLMNOPQRSTUVWXYZ
          </p>
          <p
            className="text-sm mt-2 text-muted-foreground"
            style={{ fontFamily: getFontFamilyCSS(value) }}
          >
            1234567890 !@#$%^&*()
          </p>
        </div>
      )}
    </div>
  );
}
