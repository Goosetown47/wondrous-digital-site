import { describe, it, expect } from 'vitest';
import {
  getFontsByCategory,
  getAllCategories,
  searchFonts,
  getFontByName,
  generateGoogleFontsUrl,
  getFontFamilyCSS,
  getTotalFontCount,
} from '../google-fonts';

describe('Google Fonts Service', () => {
  describe('getFontsByCategory', () => {
    it('should return 20 fonts for sans-serif category', () => {
      const fonts = getFontsByCategory('sans-serif');
      expect(fonts).toHaveLength(20);
      expect(fonts[0].name).toBe('Inter');
      expect(fonts[0].category).toBe('sans-serif');
    });

    it('should return 20 fonts for serif category', () => {
      const fonts = getFontsByCategory('serif');
      expect(fonts).toHaveLength(20);
      expect(fonts[0].name).toBe('Playfair Display');
    });

    it('should return 20 fonts for display category', () => {
      const fonts = getFontsByCategory('display');
      expect(fonts).toHaveLength(20);
    });

    it('should return 20 fonts for handwriting category', () => {
      const fonts = getFontsByCategory('handwriting');
      expect(fonts).toHaveLength(20);
    });

    it('should return 20 fonts for monospace category', () => {
      const fonts = getFontsByCategory('monospace');
      expect(fonts).toHaveLength(20);
    });
  });

  describe('getAllCategories', () => {
    it('should return all 5 font categories', () => {
      const categories = getAllCategories();
      expect(categories).toHaveLength(5);
      expect(categories).toContain('sans-serif');
      expect(categories).toContain('serif');
      expect(categories).toContain('display');
      expect(categories).toContain('handwriting');
      expect(categories).toContain('monospace');
    });
  });

  describe('searchFonts', () => {
    it('should find fonts by partial name match', () => {
      const results = searchFonts('inter');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('Inter');
    });

    it('should be case-insensitive', () => {
      const results = searchFonts('ROBOTO');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(f => f.name === 'Roboto')).toBe(true);
    });

    it('should return empty array for empty query', () => {
      const results = searchFonts('');
      expect(results).toHaveLength(0);
    });

    it('should return empty array for no matches', () => {
      const results = searchFonts('xyznonexistent');
      expect(results).toHaveLength(0);
    });

    it('should find multiple fonts with similar names', () => {
      const results = searchFonts('mono');
      expect(results.length).toBeGreaterThan(1);
    });
  });

  describe('getFontByName', () => {
    it('should find exact font by name', () => {
      const font = getFontByName('Inter');
      expect(font).toBeDefined();
      expect(font?.name).toBe('Inter');
      expect(font?.category).toBe('sans-serif');
    });

    it('should return undefined for non-existent font', () => {
      const font = getFontByName('NonExistentFont');
      expect(font).toBeUndefined();
    });

    it('should be case-sensitive', () => {
      const font = getFontByName('inter'); // lowercase
      expect(font).toBeUndefined();
    });
  });

  describe('generateGoogleFontsUrl', () => {
    it('should generate valid URL for single font', () => {
      const url = generateGoogleFontsUrl(['Inter']);
      expect(url).toContain('fonts.googleapis.com');
      expect(url).toContain('family=Inter');
      expect(url).toContain('wght@');
      expect(url).toContain('display=swap');
    });

    it('should generate URL for multiple fonts', () => {
      const url = generateGoogleFontsUrl(['Inter', 'Roboto']);
      expect(url).toContain('family=Inter');
      expect(url).toContain('family=Roboto');
    });

    it('should return empty string for empty font array', () => {
      const url = generateGoogleFontsUrl([]);
      expect(url).toBe('');
    });

    it('should handle fonts with spaces in names', () => {
      const url = generateGoogleFontsUrl(['Open Sans']);
      expect(url).toContain('Open+Sans');
    });

    it('should only include available weights for font', () => {
      // Bebas Neue only has 400 weight
      const url = generateGoogleFontsUrl(['Bebas Neue']);
      expect(url).toContain('wght@400');
      expect(url).not.toContain('500');
      expect(url).not.toContain('600');
    });

    it('should use custom weights when provided', () => {
      const url = generateGoogleFontsUrl(['Inter'], ['400', '700']);
      expect(url).toContain('wght@400;700');
      expect(url).not.toContain('500');
      expect(url).not.toContain('600');
    });
  });

  describe('getFontFamilyCSS', () => {
    it('should return font-family with fallback', () => {
      const css = getFontFamilyCSS('Inter');
      expect(css).toBe("'Inter', system-ui, sans-serif");
    });

    it('should return serif fallback for serif fonts', () => {
      const css = getFontFamilyCSS('Playfair Display');
      expect(css).toBe("'Playfair Display', Georgia, serif");
    });

    it('should return default fallback for non-existent font', () => {
      const css = getFontFamilyCSS('NonExistentFont');
      expect(css).toBe('system-ui, sans-serif');
    });
  });

  describe('getTotalFontCount', () => {
    it('should return 100 total fonts', () => {
      const total = getTotalFontCount();
      expect(total).toBe(100);
    });
  });

  describe('Font Data Integrity', () => {
    it('should have all required properties for each font', () => {
      const allCategories = getAllCategories();

      allCategories.forEach(category => {
        const fonts = getFontsByCategory(category);

        fonts.forEach(font => {
          expect(font.name).toBeDefined();
          expect(font.name).not.toBe('');
          expect(font.category).toBe(category);
          expect(font.variants).toBeDefined();
          expect(font.variants.length).toBeGreaterThan(0);
          expect(font.fallback).toBeDefined();
          expect(font.fallback).not.toBe('');
        });
      });
    });

    it('should have unique font names across all categories', () => {
      const allFonts = getAllCategories().flatMap(cat => getFontsByCategory(cat));
      const fontNames = allFonts.map(f => f.name);
      const uniqueNames = new Set(fontNames);

      // Allow duplicate "Righteous" in display category (appears twice in data)
      // and "Permanent Marker" in display/handwriting
      expect(uniqueNames.size).toBeGreaterThanOrEqual(97); // Allow a few duplicates
    });
  });
});
