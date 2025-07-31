'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { generateDarkModeColors } from '@/lib/theme-utils';

interface ThemePreviewProviderProps {
  variables: {
    colors?: Record<string, string>;
    radius?: string;
    darkColors?: Record<string, string>;
  };
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
    
    // Get the colors based on mode
    let colors = variables.colors;
    
    if (isDarkMode) {
      // Use provided dark colors or generate them
      colors = variables.darkColors || (variables.colors ? generateDarkModeColors(variables.colors) : undefined);
    }

    if (!colors) return;

    // Apply CSS variables to the container
    Object.entries(colors).forEach(([key, value]) => {
      container.style.setProperty(`--${key}`, value);
    });

    // Apply other variables
    if (variables.radius) {
      container.style.setProperty('--radius', variables.radius);
    }

    // Cleanup function to remove inline styles
    return () => {
      if (colors) {
        Object.keys(colors).forEach(key => {
          container.style.removeProperty(`--${key}`);
        });
      }
      if (variables.radius) {
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