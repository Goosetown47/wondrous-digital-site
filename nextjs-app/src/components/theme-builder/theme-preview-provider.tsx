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

    // Spacing preset conversions (v0.1.9)
    const spacingPresets: Record<string, Record<string, string>> = {
      sectionPadding: { tight: '2rem', normal: '4rem', relaxed: '6rem' },
      cardPadding: { tight: '0.75rem', normal: '1rem', relaxed: '1.5rem' },
    };

    // Apply all theme variables with smart unit appending
    Object.entries(themeVars).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const cssKey = toKebabCase(key);
        let finalValue = value;

        // Convert spacing presets (v0.1.9)
        if (key in spacingPresets && value in spacingPresets[key]) {
          finalValue = spacingPresets[key][value];
        }
        // Skip shadow component properties - handled separately below
        else if (key.includes('Shadow')) {
          return; // Don't set individual shadow components as CSS variables
        }
        // Smart font quoting - only quote if font name contains spaces
        else if (fontKeys.has(key) && value.includes(' ')) {
          finalValue = `"${value}"`;
        }
        // Add units to typography values
        else if (key.endsWith('Size') && !value.includes('rem') && !value.includes('px')) {
          finalValue = `${value}rem`;
        }
        else if (key.endsWith('LetterSpacing') && !value.includes('em') && !value.includes('px')) {
          finalValue = `${value}em`;
        }
        // Add units to border width values
        else if (key.includes('BorderWidth') && !value.includes('px')) {
          finalValue = `${value}px`;
        }
        // Add rem units to radius overrides and element spacing
        else if ((key.includes('Radius') || key === 'elementSpacing') && !value.includes('rem') && !value.includes('px') && value !== '') {
          finalValue = `${value}rem`;
        }
        // LineHeight and Weight are unitless in CSS - no change needed

        container.style.setProperty(`--${cssKey}`, finalValue);
      }
    });

    // Compute and apply shadow CSS from granular components (v0.1.9)
    const computeShadow = (prefix: string): string => {
      const color = (themeVars[`${prefix}ShadowColor`] as string) || '0 0% 0%';
      const opacity = (themeVars[`${prefix}ShadowOpacity`] as string) || '20';
      const x = (themeVars[`${prefix}ShadowX`] as string) || '0';
      const y = (themeVars[`${prefix}ShadowY`] as string) || '2';
      const blur = (themeVars[`${prefix}ShadowBlur`] as string) || '4';

      // If all offsets and blur are 0, return 'none'
      if (x === '0' && y === '0' && blur === '0') return 'none';

      return `${x}px ${y}px ${blur}px hsl(${color} / ${opacity}%)`;
    };

    container.style.setProperty('--card-shadow', computeShadow('card'));
    container.style.setProperty('--button-shadow', computeShadow('button'));
    container.style.setProperty('--input-shadow', computeShadow('input'));

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
      // Remove shadow CSS variables
      container.style.removeProperty('--card-shadow');
      container.style.removeProperty('--button-shadow');
      container.style.removeProperty('--input-shadow');
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