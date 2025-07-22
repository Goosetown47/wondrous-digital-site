'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useProject } from './ProjectContext';
import { applySiteStyleVariables } from '../lib/utils';
import { fontPreloader } from '../utils/font-preloader';

// Define the type for site styles
export interface SiteStyles {
  id?: string;
  project_id: string;
  primary_color: string;
  secondary_color: string;
  tertiary_color: string;
  dark_color: string;
  light_color: string;
  white_color: string;
  primary_font: string;
  secondary_font: string;
  button_radius: 'squared' | 'slightly-rounded' | 'fully-rounded'; // Legacy global setting
  button_style: 'default' | 'floating' | 'brick' | 'modern' | 'offset-background' | 'compact';
  
  // Per-button-type radius settings
  primary_button_radius: 'squared' | 'slightly-rounded' | 'fully-rounded';
  secondary_button_radius: 'squared' | 'slightly-rounded' | 'fully-rounded';
  tertiary_button_radius: 'squared' | 'slightly-rounded' | 'fully-rounded';
  
  // Per-button-type size settings
  primary_button_size: 'small' | 'medium' | 'large';
  secondary_button_size: 'small' | 'medium' | 'large';
  tertiary_button_size: 'small' | 'medium' | 'large';
  
  // Per-button-type icon settings
  primary_button_icon_enabled: boolean;
  primary_button_icon_position: 'left' | 'right';
  secondary_button_icon_enabled: boolean;
  secondary_button_icon_position: 'left' | 'right';
  tertiary_button_icon_enabled: boolean;
  tertiary_button_icon_position: 'left' | 'right';
  
  // Per-button-type typography settings
  primary_button_font: 'primary' | 'secondary';
  primary_button_weight: string;
  secondary_button_font: 'primary' | 'secondary';
  secondary_button_weight: string;
  tertiary_button_font: 'primary' | 'secondary';
  tertiary_button_weight: string;
  textlink_button_font: 'primary' | 'secondary';
  textlink_button_weight: string;
  
  // Existing color settings
  primary_button_hover_color: string;
  secondary_button_hover_color: string;
  primary_button_background_color: string;
  secondary_button_background_color: string;
  primary_button_text_color: string;
  primary_button_border_color: string;
  primary_button_shadow_color: string;
  secondary_button_text_color: string;
  secondary_button_border_color: string;
  secondary_button_shadow_color: string;
  outline_text_color: string;
  outline_border_color: string;
  outline_hover_bg: string;
  text_link_color: string;
  text_link_hover_color: string;
  
  // Typography line height settings
  h1_line_height: string;
  h2_line_height: string;
  h3_line_height: string;
  h4_line_height: string;
  h5_line_height: string;
  h6_line_height: string;
  p_line_height: string;
}

// Default styles
const DEFAULT_STYLES: Partial<SiteStyles> = {
  primary_color: '#000000',
  secondary_color: '#374151',
  tertiary_color: '#9CA3AF',
  dark_color: '#000000',
  light_color: '#F3F4F6',
  white_color: '#FFFFFF',
  primary_font: 'Inter',
  secondary_font: 'Inter',
  button_radius: 'slightly-rounded', // Legacy global setting
  button_style: 'default',
  
  // Per-button-type radius defaults
  primary_button_radius: 'slightly-rounded',
  secondary_button_radius: 'slightly-rounded',
  tertiary_button_radius: 'slightly-rounded',
  
  // Per-button-type size defaults
  primary_button_size: 'medium',
  secondary_button_size: 'medium',
  tertiary_button_size: 'medium',
  
  // Per-button-type icon defaults
  primary_button_icon_enabled: false,
  primary_button_icon_position: 'right',
  secondary_button_icon_enabled: false,
  secondary_button_icon_position: 'right',
  tertiary_button_icon_enabled: false,
  tertiary_button_icon_position: 'right',
  
  // Per-button-type typography defaults
  primary_button_font: 'primary',
  primary_button_weight: '500',
  secondary_button_font: 'primary',
  secondary_button_weight: '500',
  tertiary_button_font: 'primary',
  tertiary_button_weight: '500',
  textlink_button_font: 'primary',
  textlink_button_weight: '500',
  
  // Existing color settings
  primary_button_hover_color: '#374151',
  secondary_button_hover_color: '#F9FAFB',
  primary_button_background_color: '#000000',
  secondary_button_background_color: '#FFFFFF',
  primary_button_text_color: '#FFFFFF',
  primary_button_border_color: '#000000',
  primary_button_shadow_color: '#374151',
  secondary_button_text_color: '#000000',
  secondary_button_border_color: '#E5E7EB',
  secondary_button_shadow_color: '#D1D5DB',
  outline_text_color: '#000000',
  outline_border_color: '#000000',
  outline_hover_bg: '#F3F4F6',
  text_link_color: '#000000',
  text_link_hover_color: '#374151',
  
  // Typography line height defaults
  h1_line_height: '1.2',
  h2_line_height: '1.3',
  h3_line_height: '1.4',
  h4_line_height: '1.4',
  h5_line_height: '1.4',
  h6_line_height: '1.4',
  p_line_height: '1.6'
};

// Define the context shape
interface SiteStylesContextType {
  styles: Partial<SiteStyles>;
  loading: boolean;
  error: string | null;
  setCssVariables: () => void;
}

// Create the context with default values
const SiteStylesContext = createContext<SiteStylesContextType>({
  styles: DEFAULT_STYLES,
  loading: true,
  error: null,
  setCssVariables: () => {},
});

// CSS Variable-based provider (for PageBuilder/Preview that already have styles applied)
export const CSSSiteStylesProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [styles, setStyles] = useState<Partial<SiteStyles>>(DEFAULT_STYLES);
  const [loading, setLoading] = useState(true); // Start as loading until we read CSS variables
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());

  // Performance-optimized font loading for CSS-based styles
  const loadFontsFromCSSStyles = async (cssStyles: Partial<SiteStyles>) => {
    const fontsToLoad: string[] = [];
    
    // Collect fonts that need to be loaded (comparing with previous state)
    if (cssStyles.primary_font && cssStyles.primary_font !== DEFAULT_STYLES.primary_font && !loadedFonts.has(cssStyles.primary_font)) {
      fontsToLoad.push(cssStyles.primary_font);
    }
    if (cssStyles.secondary_font && cssStyles.secondary_font !== DEFAULT_STYLES.secondary_font && !loadedFonts.has(cssStyles.secondary_font)) {
      fontsToLoad.push(cssStyles.secondary_font);
    }
    
    // Load fonts asynchronously in parallel for better performance
    if (fontsToLoad.length > 0) {
      try {
        await Promise.all(
          fontsToLoad.map(fontName => 
            fontPreloader.loadFont(fontName).catch(error => {
              console.warn(`CSSSiteStylesProvider: Failed to load font: ${fontName}`, error);
            })
          )
        );
        
        // Update loaded fonts state
        setLoadedFonts(prev => new Set([...prev, ...fontsToLoad]));
      } catch (error) {
        console.warn('CSSSiteStylesProvider: Some fonts failed to load:', error);
      }
    }
  };

  // Read styles from CSS variables that have already been applied
  useEffect(() => {
    const readCSSVariables = () => {
      const getCSSVar = (name: string) => {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim().replace(/'/g, '');
      };

      const cssStyles: Partial<SiteStyles> = {
        ...DEFAULT_STYLES,
        // Read all the CSS variables that applySiteStyleVariables sets
        primary_color: getCSSVar('--primary-color') || DEFAULT_STYLES.primary_color,
        secondary_color: getCSSVar('--secondary-color') || DEFAULT_STYLES.secondary_color,
        tertiary_color: getCSSVar('--tertiary-color') || DEFAULT_STYLES.tertiary_color,
        dark_color: getCSSVar('--dark-color') || DEFAULT_STYLES.dark_color,
        light_color: getCSSVar('--light-color') || DEFAULT_STYLES.light_color,
        white_color: getCSSVar('--white-color') || DEFAULT_STYLES.white_color,
        primary_font: getCSSVar('--primary-font') || DEFAULT_STYLES.primary_font,
        secondary_font: getCSSVar('--secondary-font') || DEFAULT_STYLES.secondary_font,
        button_style: getCSSVar('--button-style') as any || DEFAULT_STYLES.button_style,
        button_radius: getCSSVar('--button-radius') as any || DEFAULT_STYLES.button_radius,
        // Read line height CSS variables
        h1_line_height: getCSSVar('--h1-line-height') || DEFAULT_STYLES.h1_line_height,
        h2_line_height: getCSSVar('--h2-line-height') || DEFAULT_STYLES.h2_line_height,
        h3_line_height: getCSSVar('--h3-line-height') || DEFAULT_STYLES.h3_line_height,
        h4_line_height: getCSSVar('--h4-line-height') || DEFAULT_STYLES.h4_line_height,
        h5_line_height: getCSSVar('--h5-line-height') || DEFAULT_STYLES.h5_line_height,
        h6_line_height: getCSSVar('--h6-line-height') || DEFAULT_STYLES.h6_line_height,
        p_line_height: getCSSVar('--p-line-height') || DEFAULT_STYLES.p_line_height,
      };

      setStyles(cssStyles);
      
      // Always mark as loaded after attempting to read, even if we got defaults
      setLoading(false);
      
      // Load fonts after updating styles (non-blocking)
      loadFontsFromCSSStyles(cssStyles).catch(error => {
        console.warn('CSSSiteStylesProvider: Font loading failed:', error);
      });
    };

    // Set up a mutation observer to watch for CSS variable changes
    const observer = new MutationObserver(() => {
      readCSSVariables();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style']
    });

    // Initial read with a small delay to allow parent components to set CSS variables
    const timeoutId = setTimeout(() => {
      readCSSVariables();
    }, 50);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  const value = {
    styles,
    loading,
    error: null,
    updateStyles: () => {}, // No-op for CSS-based provider
    refetchStyles: () => {}, // No-op for CSS-based provider
  };

  return (
    <SiteStylesContext.Provider value={value}>
      {children}
    </SiteStylesContext.Provider>
  );
};

// Original database-based provider component
export const SiteStylesProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { selectedProject } = useProject();
  const [styles, setStyles] = useState<Partial<SiteStyles>>(DEFAULT_STYLES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch site styles when selected project changes
  useEffect(() => {
    if (selectedProject) {
      fetchSiteStyles();
    }
  }, [selectedProject]); // eslint-disable-line react-hooks/exhaustive-deps

  // Function to fetch site styles
  const fetchSiteStyles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('site_styles')
        .select('*')
        .eq('project_id', selectedProject.id)
        .maybeSingle();
        
      if (error) throw error;
      
      if (data) {
        setStyles({
          ...DEFAULT_STYLES,
          ...data
        });
      } else {
        setStyles(DEFAULT_STYLES);
      }
      
      // Set CSS variables after fetching styles
      setCssVariables();
    } catch (err: unknown) {
      console.error('Error fetching site styles:', err);
      setError(err instanceof Error ? err.message : 'Failed to load site styles');
      setStyles(DEFAULT_STYLES);
    } finally {
      setLoading(false);
    }
  };

  // Function to set CSS variables in the document root
  const setCssVariables = () => {
    applySiteStyleVariables({...DEFAULT_STYLES, ...styles});
  };

  // Apply CSS variables whenever styles change
  useEffect(() => {
    setCssVariables();
  }, [styles]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SiteStylesContext.Provider 
      value={{ 
        styles, 
        loading, 
        error,
        setCssVariables
      }}
    >
      {children}
    </SiteStylesContext.Provider>
  );
};

// Custom hook for accessing site styles
export const useSiteStyles = () => useContext(SiteStylesContext);