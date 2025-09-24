'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { Theme } from '@/types/builder';

interface ThemeProviderProps {
  theme?: Theme | null;
  overrides?: Record<string, unknown> | null;
  children: React.ReactNode;
  className?: string;
}

// List of known color variable names
const colorKeys = [
  'background', 'foreground',
  'primary', 'primary-foreground',
  'secondary', 'secondary-foreground',
  'accent', 'accent-foreground',
  'muted', 'muted-foreground',
  'card', 'card-foreground',
  'popover', 'popover-foreground',
  'destructive', 'destructive-foreground',
  'border', 'input', 'ring'
];

export function ThemeProvider({
  theme,
  overrides,
  children,
  className
}: ThemeProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Clear any existing theme variables
    const existingVars = Array.from(container.style.cssText.matchAll(/--[\w-]+:/g));
    existingVars.forEach(match => {
      const varName = match[0].slice(0, -1); // Remove trailing colon
      container.style.removeProperty(varName);
    });

    if (!theme?.variables) return;

    // Handle both nested and flat color structures
    // First check if colors are nested under 'colors' property
    const colorVars = theme.variables.colors || theme.variables;

    // Apply color variables
    if (colorVars) {
      Object.entries(colorVars).forEach(([key, value]) => {
        // Only apply if it's a known color variable
        if (colorKeys.includes(key) && typeof value === 'string') {
          container.style.setProperty(`--${key}`, value);
        }
      });
    }

    // Apply non-color theme variables (like radius)
    if (theme.variables.radius) {
      container.style.setProperty('--radius', theme.variables.radius as string);
    }

    // Apply any other direct variables that aren't colors
    Object.entries(theme.variables).forEach(([key, value]) => {
      // Skip 'colors' object and already processed color keys
      if (key !== 'colors' && !colorKeys.includes(key) && key !== 'radius' && typeof value === 'string') {
        container.style.setProperty(`--${key}`, value);
      }
    });

    // Apply any overrides
    if (overrides) {
      Object.entries(overrides).forEach(([key, value]) => {
        if (typeof value === 'string') {
          container.style.setProperty(`--${key}`, value);
        }
      });
    }

    // Cleanup function
    return () => {
      if (!container) return;

      // Remove all theme variables
      const colorVars = theme.variables.colors || theme.variables;

      // Remove color variables
      if (colorVars) {
        Object.keys(colorVars).forEach(key => {
          if (colorKeys.includes(key)) {
            container.style.removeProperty(`--${key}`);
          }
        });
      }

      // Remove radius
      if (theme.variables.radius) {
        container.style.removeProperty('--radius');
      }

      // Remove any other direct variables
      Object.keys(theme.variables).forEach(key => {
        if (key !== 'colors' && !colorKeys.includes(key) && key !== 'radius') {
          container.style.removeProperty(`--${key}`);
        }
      });

      // Remove overrides
      if (overrides) {
        Object.keys(overrides).forEach(key => {
          container.style.removeProperty(`--${key}`);
        });
      }
    };
  }, [theme, overrides]);

  return (
    <div 
      ref={containerRef}
      className={cn("theme-provider", className)}
      data-theme={theme?.id || 'default'}
    >
      {children}
    </div>
  );
}