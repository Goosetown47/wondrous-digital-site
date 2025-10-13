'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { generateDarkModeColors } from '@/lib/theme-utils';
import { loadGoogleFonts } from '@/lib/google-fonts';

interface ThemePreviewProviderProps {
  variables: Record<string, unknown>;
  isDarkMode?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ThemePreviewProvider({ 
  variables, 
  isDarkMode = false,
  children,
  className 
}: ThemePreviewProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    
    // Convert camelCase to kebab-case for CSS variables
    const toKebabCase = (str: string) => str.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
    
    // Handle direct theme variables (from theme builder)
    // or nested structure (from other uses)
    let themeVars: Record<string, unknown> = variables;
    if (variables.colors && typeof variables.colors === 'object') {
      // If it has a colors property, use that structure
      themeVars = variables.colors as Record<string, unknown>;
    }
    
    // Font-related keys that need quotes in CSS
    const fontKeys = new Set([
      'fontHeading', 'fontBody',
      'h1Font', 'h2Font', 'h3Font', 'h4Font', 'h5Font', 'h6Font'
    ]);

    // Apply all theme variables with smart unit appending
    Object.entries(themeVars).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const cssKey = toKebabCase(key);
        let finalValue = value;

        // Smart font quoting - only quote if font name contains spaces
        if (fontKeys.has(key) && value.includes(' ')) {
          finalValue = `"${value}"`;
        }
        // Add units to typography values
        else if (key.endsWith('Size') && !value.includes('rem') && !value.includes('px')) {
          finalValue = `${value}rem`;
        }
        else if (key.endsWith('LetterSpacing') && !value.includes('em') && !value.includes('px')) {
          finalValue = `${value}em`;
        }
        // LineHeight and Weight are unitless in CSS - no change needed

        container.style.setProperty(`--${cssKey}`, finalValue);
      }
    });
    
    // Handle dark mode
    if (isDarkMode && themeVars) {
      // Convert themeVars to Record<string, string> for generateDarkModeColors
      const colorVars: Record<string, string> = {};
      Object.entries(themeVars).forEach(([key, value]) => {
        if (typeof value === 'string') {
          Object.defineProperty(colorVars, key, {
            value: value,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
      });
      
      const darkColors = (variables.darkColors as Record<string, string>) || generateDarkModeColors(colorVars);
      Object.entries(darkColors).forEach(([key, value]) => {
        if (typeof value === 'string') {
          const cssKey = toKebabCase(key);
          container.style.setProperty(`--${cssKey}`, value);
        }
      });
    }

    // Apply radius if it exists (either at root or in variables)
    const radius = variables.radius || themeVars.radius;
    if (radius && typeof radius === 'string') {
      container.style.setProperty('--radius', radius);
    }

    // Cleanup function to remove inline styles
    return () => {
      Object.keys(themeVars).forEach(key => {
        const cssKey = toKebabCase(key);
        container.style.removeProperty(`--${cssKey}`);
      });
      if (radius && typeof radius === 'string') {
        container.style.removeProperty('--radius');
      }
    };
  }, [variables, isDarkMode]);

  // Load Google Fonts for typography
  useEffect(() => {
    // Handle direct theme variables (from theme builder)
    // or nested structure (from other uses)
    let themeVars: Record<string, unknown> = variables;
    if (variables.colors && typeof variables.colors === 'object') {
      themeVars = variables.colors as Record<string, unknown>;
    }

    // Extract all font names from theme variables
    const fontKeys = [
      'fontHeading',
      'fontBody',
      'h1Font',
      'h2Font',
      'h3Font',
      'h4Font',
      'h5Font',
      'h6Font',
    ];

    const fonts = new Set<string>();
    fontKeys.forEach(key => {
      const fontValue = themeVars[key];
      if (typeof fontValue === 'string' && fontValue.trim()) {
        fonts.add(fontValue);
      }
    });

    // Load all unique fonts
    if (fonts.size > 0) {
      loadGoogleFonts(Array.from(fonts));
    }
  }, [variables]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "theme-preview-container",
        isDarkMode && "dark",
        className
      )}
      data-theme={isDarkMode ? "dark" : "light"}
    >
      {children}
    </div>
  );
}