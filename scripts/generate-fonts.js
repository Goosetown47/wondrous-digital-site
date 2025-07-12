#!/usr/bin/env node

/**
 * Generate complete Google Fonts database from google-font-metadata
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the complete Google Fonts API response
const apiResponse = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../node_modules/google-font-metadata/data/api-response.json'), 'utf8')
);

// Our current popular fonts (to mark them as popular in the new database)
const POPULAR_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Nunito', 'Source Sans Pro',
  'Playfair Display', 'Merriweather', 'Crimson Text', 'Lora', 'Bebas Neue', 'Oswald', 'Dancing Script', 'Pacifico',
  'Source Code Pro', 'Roboto Mono'
];

// Convert API response to our FontData format
const convertToFontData = (apiFont) => {
  // Convert variants array to our weights format
  const weights = apiFont.variants
    .filter(variant => /^\d+$/.test(variant) || variant === 'regular')
    .map(variant => variant === 'regular' ? '400' : variant)
    .sort((a, b) => parseInt(a) - parseInt(b));

  // Ensure we have at least 400 weight
  if (!weights.includes('400')) {
    weights.push('400');
    weights.sort((a, b) => parseInt(a) - parseInt(b));
  }

  return {
    name: apiFont.family,
    category: apiFont.category,
    weights: weights,
    popular: POPULAR_FONTS.includes(apiFont.family),
    tags: [] // We can add tags later if needed
  };
};

// Convert all fonts
const allFonts = apiResponse.map(convertToFontData);

// Generate TypeScript content
const tsContent = `// Comprehensive Google Fonts data generated from google-font-metadata
// Total fonts: ${allFonts.length}
// Generated: ${new Date().toISOString()}

export interface FontData {
  name: string;
  category: 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace';
  weights: string[];
  popular?: boolean;
  tags?: string[];
}

export const GOOGLE_FONTS: FontData[] = ${JSON.stringify(allFonts, null, 2)};

// Get fonts by category
export const getFontsByCategory = (category: FontData['category']): FontData[] => {
  return GOOGLE_FONTS.filter(font => font.category === category);
};

// Get popular fonts
export const getPopularFonts = (): FontData[] => {
  return GOOGLE_FONTS.filter(font => font.popular === true);
};

// Get all categories
export const FONT_CATEGORIES: { value: FontData['category']; label: string; description: string }[] = [
  { 
    value: 'sans-serif', 
    label: 'Sans Serif', 
    description: 'Clean, modern fonts without decorative strokes' 
  },
  { 
    value: 'serif', 
    label: 'Serif', 
    description: 'Traditional fonts with decorative strokes' 
  },
  { 
    value: 'display', 
    label: 'Display', 
    description: 'Decorative fonts for headlines and titles' 
  },
  { 
    value: 'handwriting', 
    label: 'Handwriting', 
    description: 'Fonts that mimic handwritten text' 
  },
  { 
    value: 'monospace', 
    label: 'Monospace', 
    description: 'Fixed-width fonts for code and technical text' 
  }
];

// Search fonts by name
export const searchFonts = (query: string): FontData[] => {
  const lowerQuery = query.toLowerCase();
  return GOOGLE_FONTS.filter(font => 
    font.name.toLowerCase().includes(lowerQuery)
  );
};
`;

// Write the file
const outputPath = path.join(__dirname, '../src/data/google-fonts.ts');
fs.writeFileSync(outputPath, tsContent, 'utf8');

console.log(`✅ Generated Google Fonts database with ${allFonts.length} fonts`);
console.log(`📝 Output: ${outputPath}`);

// Show category breakdown
const categoryStats = {};
allFonts.forEach(font => {
  categoryStats[font.category] = (categoryStats[font.category] || 0) + 1;
});

console.log('\n📊 Font categories:');
Object.entries(categoryStats).forEach(([category, count]) => {
  console.log(`   ${category}: ${count} fonts`);
});

console.log(`\n🌟 Popular fonts: ${allFonts.filter(f => f.popular).length}`);
console.log(`\n🔍 Playwrite fonts: ${allFonts.filter(f => f.name.toLowerCase().includes('playwrite')).length}`);