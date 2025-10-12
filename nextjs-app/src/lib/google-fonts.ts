/**
 * Google Fonts Integration Service (v0.1.8)
 *
 * Provides access to top 100 Google Fonts organized by category
 * for use in the theme editor and builder.
 *
 * Categories:
 * - Sans Serif: Modern, clean fonts (20 fonts)
 * - Serif: Traditional, elegant fonts (20 fonts)
 * - Display: Bold, decorative fonts (20 fonts)
 * - Handwriting: Personal, casual fonts (20 fonts)
 * - Monospace: Technical, code-like fonts (20 fonts)
 */

export type FontCategory = 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace';

export interface GoogleFont {
  name: string;
  category: FontCategory;
  variants: string[];  // Available font weights
  fallback: string;    // System fallback font family
}

/**
 * Top 100 Google Fonts organized by category
 * Based on popularity and visual quality
 */
export const GOOGLE_FONTS_BY_CATEGORY: Record<FontCategory, GoogleFont[]> = {
  'sans-serif': [
    { name: 'Inter', category: 'sans-serif', variants: ['400', '500', '600', '700'], fallback: 'system-ui, sans-serif' },
    { name: 'Roboto', category: 'sans-serif', variants: ['400', '500', '700'], fallback: 'system-ui, sans-serif' },
    { name: 'Open Sans', category: 'sans-serif', variants: ['400', '600', '700'], fallback: 'system-ui, sans-serif' },
    { name: 'Lato', category: 'sans-serif', variants: ['400', '700'], fallback: 'system-ui, sans-serif' },
    { name: 'Montserrat', category: 'sans-serif', variants: ['400', '500', '600', '700'], fallback: 'system-ui, sans-serif' },
    { name: 'Raleway', category: 'sans-serif', variants: ['400', '500', '600', '700'], fallback: 'system-ui, sans-serif' },
    { name: 'Poppins', category: 'sans-serif', variants: ['400', '500', '600', '700'], fallback: 'system-ui, sans-serif' },
    { name: 'Nunito', category: 'sans-serif', variants: ['400', '600', '700'], fallback: 'system-ui, sans-serif' },
    { name: 'Work Sans', category: 'sans-serif', variants: ['400', '500', '600', '700'], fallback: 'system-ui, sans-serif' },
    { name: 'Rubik', category: 'sans-serif', variants: ['400', '500', '600', '700'], fallback: 'system-ui, sans-serif' },
    { name: 'DM Sans', category: 'sans-serif', variants: ['400', '500', '700'], fallback: 'system-ui, sans-serif' },
    { name: 'Manrope', category: 'sans-serif', variants: ['400', '500', '600', '700'], fallback: 'system-ui, sans-serif' },
    { name: 'Plus Jakarta Sans', category: 'sans-serif', variants: ['400', '500', '600', '700'], fallback: 'system-ui, sans-serif' },
    { name: 'Outfit', category: 'sans-serif', variants: ['400', '500', '600', '700'], fallback: 'system-ui, sans-serif' },
    { name: 'Quicksand', category: 'sans-serif', variants: ['400', '500', '600', '700'], fallback: 'system-ui, sans-serif' },
    { name: 'Urbanist', category: 'sans-serif', variants: ['400', '500', '600', '700'], fallback: 'system-ui, sans-serif' },
    { name: 'Archivo', category: 'sans-serif', variants: ['400', '500', '600', '700'], fallback: 'system-ui, sans-serif' },
    { name: 'Lexend', category: 'sans-serif', variants: ['400', '500', '600', '700'], fallback: 'system-ui, sans-serif' },
    { name: 'Space Grotesk', category: 'sans-serif', variants: ['400', '500', '600', '700'], fallback: 'system-ui, sans-serif' },
    { name: 'Sora', category: 'sans-serif', variants: ['400', '500', '600', '700'], fallback: 'system-ui, sans-serif' },
  ],
  'serif': [
    { name: 'Playfair Display', category: 'serif', variants: ['400', '500', '600', '700'], fallback: 'Georgia, serif' },
    { name: 'Merriweather', category: 'serif', variants: ['400', '700'], fallback: 'Georgia, serif' },
    { name: 'Lora', category: 'serif', variants: ['400', '500', '600', '700'], fallback: 'Georgia, serif' },
    { name: 'Crimson Text', category: 'serif', variants: ['400', '600', '700'], fallback: 'Georgia, serif' },
    { name: 'PT Serif', category: 'serif', variants: ['400', '700'], fallback: 'Georgia, serif' },
    { name: 'Libre Baskerville', category: 'serif', variants: ['400', '700'], fallback: 'Georgia, serif' },
    { name: 'Cormorant', category: 'serif', variants: ['400', '500', '600', '700'], fallback: 'Georgia, serif' },
    { name: 'Bitter', category: 'serif', variants: ['400', '500', '600', '700'], fallback: 'Georgia, serif' },
    { name: 'EB Garamond', category: 'serif', variants: ['400', '500', '600', '700'], fallback: 'Georgia, serif' },
    { name: 'Source Serif 4', category: 'serif', variants: ['400', '500', '600', '700'], fallback: 'Georgia, serif' },
    { name: 'Spectral', category: 'serif', variants: ['400', '500', '600', '700'], fallback: 'Georgia, serif' },
    { name: 'Vollkorn', category: 'serif', variants: ['400', '500', '600', '700'], fallback: 'Georgia, serif' },
    { name: 'Cardo', category: 'serif', variants: ['400', '700'], fallback: 'Georgia, serif' },
    { name: 'Alegreya', category: 'serif', variants: ['400', '500', '700'], fallback: 'Georgia, serif' },
    { name: 'Literata', category: 'serif', variants: ['400', '500', '600', '700'], fallback: 'Georgia, serif' },
    { name: 'Brygada 1918', category: 'serif', variants: ['400', '500', '600', '700'], fallback: 'Georgia, serif' },
    { name: 'Fraunces', category: 'serif', variants: ['400', '500', '600', '700'], fallback: 'Georgia, serif' },
    { name: 'Newsreader', category: 'serif', variants: ['400', '500', '600', '700'], fallback: 'Georgia, serif' },
    { name: 'Zilla Slab', category: 'serif', variants: ['400', '500', '600', '700'], fallback: 'Georgia, serif' },
    { name: 'Crimson Pro', category: 'serif', variants: ['400', '500', '600', '700'], fallback: 'Georgia, serif' },
  ],
  'display': [
    { name: 'Bebas Neue', category: 'display', variants: ['400'], fallback: 'Impact, sans-serif' },
    { name: 'Oswald', category: 'display', variants: ['400', '500', '600', '700'], fallback: 'Impact, sans-serif' },
    { name: 'Anton', category: 'display', variants: ['400'], fallback: 'Impact, sans-serif' },
    { name: 'Righteous', category: 'display', variants: ['400'], fallback: 'Impact, sans-serif' },
    { name: 'Passion One', category: 'display', variants: ['400', '700'], fallback: 'Impact, sans-serif' },
    { name: 'Bungee', category: 'display', variants: ['400'], fallback: 'Impact, sans-serif' },
    { name: 'Abril Fatface', category: 'display', variants: ['400'], fallback: 'Impact, sans-serif' },
    { name: 'Archivo Black', category: 'display', variants: ['400'], fallback: 'Impact, sans-serif' },
    { name: 'Fredoka', category: 'display', variants: ['400', '500', '600', '700'], fallback: 'Impact, sans-serif' },
    { name: 'Lobster', category: 'display', variants: ['400'], fallback: 'Impact, sans-serif' },
    { name: 'Saira Condensed', category: 'display', variants: ['400', '500', '600', '700'], fallback: 'Impact, sans-serif' },
    { name: 'Alfa Slab One', category: 'display', variants: ['400'], fallback: 'Impact, sans-serif' },
    { name: 'Permanent Marker', category: 'display', variants: ['400'], fallback: 'Impact, sans-serif' },
    { name: 'Black Ops One', category: 'display', variants: ['400'], fallback: 'Impact, sans-serif' },
    { name: 'Staatliches', category: 'display', variants: ['400'], fallback: 'Impact, sans-serif' },
    { name: 'Fugaz One', category: 'display', variants: ['400'], fallback: 'Impact, sans-serif' },
    { name: 'Russo One', category: 'display', variants: ['400'], fallback: 'Impact, sans-serif' },
    { name: 'Titan One', category: 'display', variants: ['400'], fallback: 'Impact, sans-serif' },
    { name: 'Bowlby One', category: 'display', variants: ['400'], fallback: 'Impact, sans-serif' },
    { name: 'Exo 2', category: 'display', variants: ['400', '500', '600', '700'], fallback: 'Impact, sans-serif' },
  ],
  'handwriting': [
    { name: 'Pacifico', category: 'handwriting', variants: ['400'], fallback: 'cursive' },
    { name: 'Dancing Script', category: 'handwriting', variants: ['400', '500', '600', '700'], fallback: 'cursive' },
    { name: 'Satisfy', category: 'handwriting', variants: ['400'], fallback: 'cursive' },
    { name: 'Great Vibes', category: 'handwriting', variants: ['400'], fallback: 'cursive' },
    { name: 'Caveat', category: 'handwriting', variants: ['400', '500', '600', '700'], fallback: 'cursive' },
    { name: 'Kalam', category: 'handwriting', variants: ['400', '700'], fallback: 'cursive' },
    { name: 'Indie Flower', category: 'handwriting', variants: ['400'], fallback: 'cursive' },
    { name: 'Shadows Into Light', category: 'handwriting', variants: ['400'], fallback: 'cursive' },
    { name: 'Permanent Marker', category: 'handwriting', variants: ['400'], fallback: 'cursive' },
    { name: 'Covered By Your Grace', category: 'handwriting', variants: ['400'], fallback: 'cursive' },
    { name: 'Cookie', category: 'handwriting', variants: ['400'], fallback: 'cursive' },
    { name: 'Amatic SC', category: 'handwriting', variants: ['400', '700'], fallback: 'cursive' },
    { name: 'Patrick Hand', category: 'handwriting', variants: ['400'], fallback: 'cursive' },
    { name: 'Architects Daughter', category: 'handwriting', variants: ['400'], fallback: 'cursive' },
    { name: 'Homemade Apple', category: 'handwriting', variants: ['400'], fallback: 'cursive' },
    { name: 'Sacramento', category: 'handwriting', variants: ['400'], fallback: 'cursive' },
    { name: 'Yellowtail', category: 'handwriting', variants: ['400'], fallback: 'cursive' },
    { name: 'Allura', category: 'handwriting', variants: ['400'], fallback: 'cursive' },
    { name: 'Marck Script', category: 'handwriting', variants: ['400'], fallback: 'cursive' },
    { name: 'Kaushan Script', category: 'handwriting', variants: ['400'], fallback: 'cursive' },
  ],
  'monospace': [
    { name: 'Roboto Mono', category: 'monospace', variants: ['400', '500', '600', '700'], fallback: 'Consolas, monospace' },
    { name: 'JetBrains Mono', category: 'monospace', variants: ['400', '500', '600', '700'], fallback: 'Consolas, monospace' },
    { name: 'Fira Code', category: 'monospace', variants: ['400', '500', '600', '700'], fallback: 'Consolas, monospace' },
    { name: 'Source Code Pro', category: 'monospace', variants: ['400', '500', '600', '700'], fallback: 'Consolas, monospace' },
    { name: 'IBM Plex Mono', category: 'monospace', variants: ['400', '500', '600', '700'], fallback: 'Consolas, monospace' },
    { name: 'Space Mono', category: 'monospace', variants: ['400', '700'], fallback: 'Consolas, monospace' },
    { name: 'Courier Prime', category: 'monospace', variants: ['400', '700'], fallback: 'Consolas, monospace' },
    { name: 'Anonymous Pro', category: 'monospace', variants: ['400', '700'], fallback: 'Consolas, monospace' },
    { name: 'Inconsolata', category: 'monospace', variants: ['400', '500', '600', '700'], fallback: 'Consolas, monospace' },
    { name: 'PT Mono', category: 'monospace', variants: ['400'], fallback: 'Consolas, monospace' },
    { name: 'Nanum Gothic Coding', category: 'monospace', variants: ['400', '700'], fallback: 'Consolas, monospace' },
    { name: 'Overpass Mono', category: 'monospace', variants: ['400', '500', '600', '700'], fallback: 'Consolas, monospace' },
    { name: 'Share Tech Mono', category: 'monospace', variants: ['400'], fallback: 'Consolas, monospace' },
    { name: 'VT323', category: 'monospace', variants: ['400'], fallback: 'Consolas, monospace' },
    { name: 'B612 Mono', category: 'monospace', variants: ['400', '700'], fallback: 'Consolas, monospace' },
    { name: 'Red Hat Mono', category: 'monospace', variants: ['400', '500', '600', '700'], fallback: 'Consolas, monospace' },
    { name: 'Azeret Mono', category: 'monospace', variants: ['400', '500', '600', '700'], fallback: 'Consolas, monospace' },
    { name: 'DM Mono', category: 'monospace', variants: ['400', '500'], fallback: 'Consolas, monospace' },
    { name: 'Martian Mono', category: 'monospace', variants: ['400', '500', '600', '700'], fallback: 'Consolas, monospace' },
    { name: 'Fira Mono', category: 'monospace', variants: ['400', '500', '700'], fallback: 'Consolas, monospace' },
  ],
};

/**
 * Get all fonts for a specific category
 */
export function getFontsByCategory(category: FontCategory): GoogleFont[] {
  return GOOGLE_FONTS_BY_CATEGORY[category];
}

/**
 * Get all available font categories
 */
export function getAllCategories(): FontCategory[] {
  return Object.keys(GOOGLE_FONTS_BY_CATEGORY) as FontCategory[];
}

/**
 * Search fonts by name across all categories
 */
export function searchFonts(query: string): GoogleFont[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];

  const allFonts = Object.values(GOOGLE_FONTS_BY_CATEGORY).flat();
  return allFonts.filter(font =>
    font.name.toLowerCase().includes(normalizedQuery)
  );
}

/**
 * Get a specific font by name
 */
export function getFontByName(name: string): GoogleFont | undefined {
  const allFonts = Object.values(GOOGLE_FONTS_BY_CATEGORY).flat();
  return allFonts.find(font => font.name === name);
}

/**
 * Generate Google Fonts API URL for loading fonts
 * @param fonts Array of font names to load
 * @param weights Font weights to load (default: 400,500,600,700)
 */
export function generateGoogleFontsUrl(
  fonts: string[],
  weights: string[] = ['400', '500', '600', '700']
): string {
  if (fonts.length === 0) return '';

  const fontQueries = fonts.map(font => {
    const fontData = getFontByName(font);
    if (!fontData) return null;

    // Filter weights to only those available for this font
    const availableWeights = weights.filter(w => fontData.variants.includes(w));
    if (availableWeights.length === 0) {
      availableWeights.push(fontData.variants[0]); // Use first available weight
    }

    const fontName = font.replace(/ /g, '+');
    return `family=${fontName}:wght@${availableWeights.join(';')}`;
  }).filter(Boolean);

  if (fontQueries.length === 0) return '';

  return `https://fonts.googleapis.com/css2?${fontQueries.join('&')}&display=swap`;
}

/**
 * Load Google Fonts dynamically in the browser
 * @param fonts Array of font names to load
 */
export function loadGoogleFonts(fonts: string[]): void {
  if (typeof window === 'undefined') return; // Only run in browser

  const url = generateGoogleFontsUrl(fonts);
  if (!url) return;

  // Check if this font link already exists
  const existingLink = document.querySelector(`link[href="${url}"]`);
  if (existingLink) return;

  // Create and append link element
  const link = document.createElement('link');
  link.href = url;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

/**
 * Get CSS font-family value with fallbacks
 * @param fontName Google Font name
 */
export function getFontFamilyCSS(fontName: string): string {
  const font = getFontByName(fontName);
  if (!font) return 'system-ui, sans-serif';

  return `'${fontName}', ${font.fallback}`;
}

/**
 * Get total count of available fonts
 */
export function getTotalFontCount(): number {
  return Object.values(GOOGLE_FONTS_BY_CATEGORY).flat().length;
}
