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

    // Apply theme colors
    if (theme.variables.colors) {
      Object.entries(theme.variables.colors).forEach(([key, value]) => {
        container.style.setProperty(`--${key}`, value as string);
      });
    }

    // Apply other theme variables
    if (theme.variables.radius) {
      container.style.setProperty('--radius', theme.variables.radius as string);
    }

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
      if (theme.variables.colors) {
        Object.keys(theme.variables.colors).forEach(key => {
          container.style.removeProperty(`--${key}`);
        });
      }
      if (theme.variables.radius) {
        container.style.removeProperty('--radius');
      }
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