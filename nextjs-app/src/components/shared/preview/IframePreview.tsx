'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Theme } from '@/types/builder';

interface IframePreviewProps {
  children: React.ReactNode;
  className?: string;
  isDarkMode?: boolean;
  theme?: Theme | null;
}

export function IframePreview({ children, className = '', isDarkMode = false, theme }: IframePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const mountNodeRef = useRef<HTMLElement | null>(null);

  // Generate CSS variables from theme
  const generateThemeCSS = (theme: Theme | null | undefined): string => {
    if (!theme?.variables) return '';

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

    let cssVars = ':root {\n';

    // Handle both nested and flat color structures
    const colorVars = theme.variables.colors || theme.variables;

    // Add color variables
    if (colorVars) {
      Object.entries(colorVars).forEach(([key, value]) => {
        if (colorKeys.includes(key) && typeof value === 'string') {
          cssVars += `  --${key}: ${value};\n`;
        }
      });
    }

    // Add radius if present
    if (theme.variables.radius) {
      cssVars += `  --radius: ${theme.variables.radius};\n`;
    }

    // Add any other direct variables that aren't colors
    if (theme.variables) {
      Object.entries(theme.variables).forEach(([key, value]) => {
        if (key !== 'colors' && !colorKeys.includes(key) && key !== 'radius' && typeof value === 'string') {
          cssVars += `  --${key}: ${value};\n`;
        }
      });
    }

    cssVars += '}';
    return cssVars;
  };

  // Set up iframe document (only on mount and dark mode changes)
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    // Get all stylesheets from the parent document
    const parentStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(element => {
        if (element instanceof HTMLLinkElement) {
          return `<link rel="stylesheet" href="${element.href}">`;
        } else if (element instanceof HTMLStyleElement) {
          // Skip style tags that are for specific components or have IDs we don't want
          if (element.id && element.id !== 'theme-variables') {
            return '';
          }
          return `<style>${element.textContent}</style>`;
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');

    // Simple iframe document with compiled CSS from parent
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html class="${isDarkMode ? 'dark' : ''}">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${parentStyles}
          <style id="iframe-base-styles">
            /* Iframe-specific overrides */
            html, body {
              margin: 0;
              padding: 0;
              height: 100%;
              overflow-y: auto;
              overflow-x: hidden;
            }

            * {
              box-sizing: border-box;
            }
          </style>
          <style id="theme-variables">
            /* Theme variables will be injected here */
          </style>
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>
    `);
    doc.close();

    // Store the mount node
    mountNodeRef.current = doc.getElementById('root');
  }, [isDarkMode]);

  // Update theme CSS variables without recreating the document
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;

    const doc = iframe.contentDocument;
    const themeStyleElement = doc.getElementById('theme-variables');

    if (!themeStyleElement) return;

    // Generate and inject theme CSS
    const themeCSS = generateThemeCSS(theme);
    themeStyleElement.textContent = themeCSS;
  }, [theme]);


  // Render children into iframe using Portal
  if (mountNodeRef.current) {
    return (
      <>
        <iframe
          ref={iframeRef}
          className={className}
          style={{
            width: '100%',
            border: 'none',
            display: 'block',
            flex: '1 1 0%'
          }}
          title="Preview"
        />
        {createPortal(children, mountNodeRef.current)}
      </>
    );
  }

  // Initial render before iframe is ready
  return (
    <iframe
      ref={iframeRef}
      className={className}
      style={{
        width: '100%',
        border: 'none',
        display: 'block',
        flex: '1 1 0%'
      }}
      title="Preview"
    />
  );
}