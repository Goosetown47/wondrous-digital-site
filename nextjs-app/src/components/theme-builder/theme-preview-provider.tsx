'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { generateDarkModeColors } from '@/lib/theme-utils';

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
    
    // Apply all theme variables
    Object.entries(themeVars).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const cssKey = toKebabCase(key);
        container.style.setProperty(`--${cssKey}`, value);
      }
    });
    
    // Handle dark mode
    if (isDarkMode && themeVars) {
      // Convert themeVars to Record<string, string> for generateDarkModeColors
      const colorVars: Record<string, string> = {};
      Object.entries(themeVars).forEach(([key, value]) => {
        if (typeof value === 'string') {
          colorVars[key] = value;
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