import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { GOOGLE_FONTS } from "../data/google-fonts"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Memoized font category lookup for performance
const fontCategoryCache = new Map<string, string>();

/**
 * Get font category (serif, sans-serif, etc.) from Google Fonts data
 * Uses memoization for performance with 1790+ fonts
 */
function getFontCategory(fontName: string): string {
  if (!fontName) return 'sans-serif';
  
  // Check cache first
  if (fontCategoryCache.has(fontName)) {
    return fontCategoryCache.get(fontName)!;
  }
  
  // Find font in Google Fonts data
  const font = GOOGLE_FONTS.find(f => f.name === fontName);
  const category = font?.category || 'sans-serif';
  
  // Cache the result
  fontCategoryCache.set(fontName, category);
  
  return category;
}

/**
 * Check if a font is serif based on Google Fonts data
 */
function isFontSerif(fontName: string): boolean {
  return getFontCategory(fontName) === 'serif';
}

/**
 * Applies CSS variables from site styles to the document root
 */
export function applySiteStyleVariables(styles: Record<string, any>) {
  // Apply styles globally (needed for buttons and components to work)
  const target = document.documentElement;
  
  // Set color variables (support both colors and gradients)
  target.style.setProperty('--primary-color', styles.primary_color || '#000000');
  target.style.setProperty('--secondary-color', styles.secondary_color || '#374151');
  target.style.setProperty('--tertiary-color', styles.tertiary_color || '#9CA3AF');
  target.style.setProperty('--dark-color', styles.dark_color || '#000000');
  target.style.setProperty('--light-color', styles.light_color || '#F3F4F6');
  target.style.setProperty('--white-color', styles.white_color || '#FFFFFF');
  
  // Set font variables with appropriate fallbacks
  // Use dynamic serif detection from Google Fonts data (performance optimized)
  const isPrimarySerif = styles.primary_font && isFontSerif(styles.primary_font);
  const isSecondarySerif = styles.secondary_font && isFontSerif(styles.secondary_font);
  
  target.style.setProperty('--primary-font', styles.primary_font ? 
    `'${styles.primary_font}', ${isPrimarySerif ? 'serif' : 'sans-serif'}` : 
    "'Inter', sans-serif"
  );
  target.style.setProperty('--secondary-font', styles.secondary_font ? 
    `'${styles.secondary_font}', ${isSecondarySerif ? 'serif' : 'sans-serif'}` : 
    "'Playfair Display', serif"
  );
  
  // Set global button variables (legacy)
  target.style.setProperty('--button-radius', styles.button_radius || 'slightly-rounded');
  target.style.setProperty('--button-style', styles.button_style || 'default');
  
  // Set per-button-type radius variables
  target.style.setProperty('--primary-button-radius', styles.primary_button_radius || 'slightly-rounded');
  target.style.setProperty('--secondary-button-radius', styles.secondary_button_radius || 'slightly-rounded');
  target.style.setProperty('--tertiary-button-radius', styles.tertiary_button_radius || 'slightly-rounded');
  target.style.setProperty('--text-link-button-radius', 'squared'); // Text links don't have radius
  
  // Set per-button-type size variables
  target.style.setProperty('--primary-button-size', styles.primary_button_size || 'medium');
  target.style.setProperty('--secondary-button-size', styles.secondary_button_size || 'medium');
  target.style.setProperty('--tertiary-button-size', styles.tertiary_button_size || 'medium');
  target.style.setProperty('--text-link-button-size', 'medium'); // Text links use medium size
  
  // Set per-button-type icon variables
  target.style.setProperty('--primary-button-icon-enabled', styles.primary_button_icon_enabled ? 'true' : 'false');
  target.style.setProperty('--primary-button-icon-position', styles.primary_button_icon_position || 'right');
  target.style.setProperty('--secondary-button-icon-enabled', styles.secondary_button_icon_enabled ? 'true' : 'false');
  target.style.setProperty('--secondary-button-icon-position', styles.secondary_button_icon_position || 'right');
  target.style.setProperty('--tertiary-button-icon-enabled', styles.tertiary_button_icon_enabled ? 'true' : 'false');
  target.style.setProperty('--tertiary-button-icon-position', styles.tertiary_button_icon_position || 'right');
  target.style.setProperty('--text-link-button-icon-enabled', 'false'); // Text links don't have icons
  target.style.setProperty('--text-link-button-icon-position', 'right');
  
  // Set per-button-type typography variables (resolve font preferences to actual fonts)
  const getPrimaryFont = () => styles.primary_font ? `'${styles.primary_font}', sans-serif` : "'Inter', sans-serif";
  const getSecondaryFont = () => styles.secondary_font ? `'${styles.secondary_font}', serif` : "'Playfair Display', serif";
  
  const resolveFontFamily = (fontPreference: string) => {
    return fontPreference === 'secondary' ? getSecondaryFont() : getPrimaryFont();
  };
  
  target.style.setProperty('--primary-button-font-family', resolveFontFamily(styles.primary_button_font || 'primary'));
  target.style.setProperty('--primary-button-font-weight', styles.primary_button_weight || '500');
  target.style.setProperty('--secondary-button-font-family', resolveFontFamily(styles.secondary_button_font || 'primary'));
  target.style.setProperty('--secondary-button-font-weight', styles.secondary_button_weight || '500');
  target.style.setProperty('--tertiary-button-font-family', resolveFontFamily(styles.tertiary_button_font || 'primary'));
  target.style.setProperty('--tertiary-button-font-weight', styles.tertiary_button_weight || '500');
  target.style.setProperty('--textlink-button-font-family', resolveFontFamily(styles.textlink_button_font || 'primary'));
  target.style.setProperty('--textlink-button-font-weight', styles.textlink_button_weight || '500');
  
  // Set existing button color variables
  target.style.setProperty('--primary-button-background-color', styles.primary_button_background_color || '#000000');
  target.style.setProperty('--secondary-button-background-color', styles.secondary_button_background_color || '#FFFFFF');
  target.style.setProperty('--primary-button-hover', styles.primary_button_hover_color || styles.dark_color || '#374151');
  target.style.setProperty('--secondary-button-hover', styles.secondary_button_hover_color || styles.secondary_color || '#F9FAFB');
  target.style.setProperty('--primary-button-text-color', styles.primary_button_text_color || '#FFFFFF');
  target.style.setProperty('--primary-button-border-color', styles.primary_button_border_color || styles.primary_color || '#000000');
  target.style.setProperty('--primary-button-shadow-color', styles.primary_button_shadow_color || styles.primary_color || '#374151');
  target.style.setProperty('--secondary-button-text-color', styles.secondary_button_text_color || '#000000');
  target.style.setProperty('--secondary-button-border-color', styles.secondary_button_border_color || '#E5E7EB');
  target.style.setProperty('--secondary-button-shadow-color', styles.secondary_button_shadow_color || '#D1D5DB');
  target.style.setProperty('--outline-text-color', styles.outline_text_color || '#000000');
  target.style.setProperty('--outline-border-color', styles.outline_border_color || '#000000');
  target.style.setProperty('--outline-hover-bg', styles.outline_hover_bg || '#F3F4F6');
  target.style.setProperty('--text-link-color', styles.text_link_color || styles.primary_color || '#000000');
  target.style.setProperty('--text-link-hover-color', styles.text_link_hover_color || styles.dark_color || '#374151');
  
  // Set typography variables for dynamic font sizes and weights
  // Helper function to resolve font family from source (primary_font or secondary_font)
  const resolveFontFromSource = (fontSource: string) => {
    if (fontSource === 'secondary_font') {
      return styles.secondary_font ? 
        `'${styles.secondary_font}', ${isSecondarySerif ? 'serif' : 'sans-serif'}` : 
        "'Playfair Display', serif";
    } else {
      return styles.primary_font ? 
        `'${styles.primary_font}', ${isPrimarySerif ? 'serif' : 'sans-serif'}` : 
        "'Inter', sans-serif";
    }
  };
  
  // Set heading font families based on font source preferences
  target.style.setProperty('--h1-font-family', resolveFontFromSource(styles.h1_font_source || 'secondary_font'));
  target.style.setProperty('--h2-font-family', resolveFontFromSource(styles.h2_font_source || 'secondary_font'));
  target.style.setProperty('--h3-font-family', resolveFontFromSource(styles.h3_font_source || 'secondary_font'));
  target.style.setProperty('--h4-font-family', resolveFontFromSource(styles.h4_font_source || 'secondary_font'));
  target.style.setProperty('--h5-font-family', resolveFontFromSource(styles.h5_font_source || 'secondary_font'));
  target.style.setProperty('--h6-font-family', resolveFontFromSource(styles.h6_font_source || 'secondary_font'));
  target.style.setProperty('--p-font-family', resolveFontFromSource(styles.p_font_source || 'primary_font'));
  
  // Set heading and paragraph font sizes
  target.style.setProperty('--h1-font-size', styles.h1_font_size || '2.5rem');
  target.style.setProperty('--h2-font-size', styles.h2_font_size || '2rem');
  target.style.setProperty('--h3-font-size', styles.h3_font_size || '1.75rem');
  target.style.setProperty('--h4-font-size', styles.h4_font_size || '1.5rem');
  target.style.setProperty('--h5-font-size', styles.h5_font_size || '1.25rem');
  target.style.setProperty('--h6-font-size', styles.h6_font_size || '1rem');
  target.style.setProperty('--p-font-size', styles.p_font_size || '1rem');
  
  // Set heading and paragraph font weights
  target.style.setProperty('--h1-font-weight', styles.h1_font_weight || '700');
  target.style.setProperty('--h2-font-weight', styles.h2_font_weight || '700');
  target.style.setProperty('--h3-font-weight', styles.h3_font_weight || '600');
  target.style.setProperty('--h4-font-weight', styles.h4_font_weight || '600');
  target.style.setProperty('--h5-font-weight', styles.h5_font_weight || '600');
  target.style.setProperty('--h6-font-weight', styles.h6_font_weight || '600');
  target.style.setProperty('--p-font-weight', styles.p_font_weight || '400');
  
  // Set heading and paragraph line heights
  target.style.setProperty('--h1-line-height', styles.h1_line_height || '1.2');
  target.style.setProperty('--h2-line-height', styles.h2_line_height || '1.3');
  target.style.setProperty('--h3-line-height', styles.h3_line_height || '1.4');
  target.style.setProperty('--h4-line-height', styles.h4_line_height || '1.4');
  target.style.setProperty('--h5-line-height', styles.h5_line_height || '1.4');
  target.style.setProperty('--h6-line-height', styles.h6_line_height || '1.4');
  target.style.setProperty('--p-line-height', styles.p_line_height || '1.6');
}