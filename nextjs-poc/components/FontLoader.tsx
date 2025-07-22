'use client';

import { useEffect } from 'react';

interface FontLoaderProps {
  primaryFont?: string;
  secondaryFont?: string;
}

export default function FontLoader({ primaryFont, secondaryFont }: FontLoaderProps) {
  useEffect(() => {
    // Get unique fonts (avoid loading the same font twice)
    const fonts = new Set<string>();
    if (primaryFont) fonts.add(primaryFont);
    if (secondaryFont) fonts.add(secondaryFont);
    
    // Skip if no fonts to load
    if (fonts.size === 0) return;
    
    // Check if fonts are already loaded
    const existingLinks = document.querySelectorAll('link[data-font-loader]');
    const loadedFonts = new Set(
      Array.from(existingLinks).map(link => 
        link.getAttribute('data-font-name') || ''
      )
    );
    
    // Load new fonts
    fonts.forEach(font => {
      if (!loadedFonts.has(font)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${font.replace(' ', '+')}:wght@300;400;500;600;700;800;900&display=swap`;
        link.setAttribute('data-font-loader', 'true');
        link.setAttribute('data-font-name', font);
        document.head.appendChild(link);
      }
    });
    
    // Cleanup function
    return () => {
      // We don't remove fonts on cleanup as they might be used by other components
    };
  }, [primaryFont, secondaryFont]);
  
  return null;
}