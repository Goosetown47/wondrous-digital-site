import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Applies CSS variables from site styles to the document root
 */
export function applySiteStyleVariables(styles: Record<string, any>) {
  const root = document.documentElement;
  
  // Set color variables (support both colors and gradients)
  root.style.setProperty('--primary-color', styles.primary_color || '#000000');
  root.style.setProperty('--secondary-color', styles.secondary_color || '#374151');
  root.style.setProperty('--tertiary-color', styles.tertiary_color || '#9CA3AF');
  root.style.setProperty('--dark-color', styles.dark_color || '#000000');
  root.style.setProperty('--light-color', styles.light_color || '#F3F4F6');
  root.style.setProperty('--white-color', styles.white_color || '#FFFFFF');
  
  // Set font variables
  root.style.setProperty('--primary-font', styles.primary_font ? `'${styles.primary_font}', sans-serif` : "'Inter', sans-serif");
  root.style.setProperty('--secondary-font', styles.secondary_font ? `'${styles.secondary_font}', serif` : "'Playfair Display', serif");
  
  // Set global button variables (legacy)
  root.style.setProperty('--button-radius', styles.button_radius || 'slightly-rounded');
  root.style.setProperty('--button-style', styles.button_style || 'default');
  
  // Set per-button-type radius variables
  root.style.setProperty('--primary-button-radius', styles.primary_button_radius || 'slightly-rounded');
  root.style.setProperty('--secondary-button-radius', styles.secondary_button_radius || 'slightly-rounded');
  root.style.setProperty('--tertiary-button-radius', styles.tertiary_button_radius || 'slightly-rounded');
  root.style.setProperty('--text-link-button-radius', 'squared'); // Text links don't have radius
  
  // Set per-button-type size variables
  root.style.setProperty('--primary-button-size', styles.primary_button_size || 'medium');
  root.style.setProperty('--secondary-button-size', styles.secondary_button_size || 'medium');
  root.style.setProperty('--tertiary-button-size', styles.tertiary_button_size || 'medium');
  root.style.setProperty('--text-link-button-size', 'medium'); // Text links use medium size
  
  // Set per-button-type icon variables
  root.style.setProperty('--primary-button-icon-enabled', styles.primary_button_icon_enabled ? 'true' : 'false');
  root.style.setProperty('--primary-button-icon-position', styles.primary_button_icon_position || 'right');
  root.style.setProperty('--secondary-button-icon-enabled', styles.secondary_button_icon_enabled ? 'true' : 'false');
  root.style.setProperty('--secondary-button-icon-position', styles.secondary_button_icon_position || 'right');
  root.style.setProperty('--tertiary-button-icon-enabled', styles.tertiary_button_icon_enabled ? 'true' : 'false');
  root.style.setProperty('--tertiary-button-icon-position', styles.tertiary_button_icon_position || 'right');
  root.style.setProperty('--text-link-button-icon-enabled', 'false'); // Text links don't have icons
  root.style.setProperty('--text-link-button-icon-position', 'right');
  
  // Set per-button-type typography variables (resolve font preferences to actual fonts)
  const getPrimaryFont = () => styles.primary_font ? `'${styles.primary_font}', sans-serif` : "'Inter', sans-serif";
  const getSecondaryFont = () => styles.secondary_font ? `'${styles.secondary_font}', serif` : "'Playfair Display', serif";
  
  const resolveFontFamily = (fontPreference: string) => {
    return fontPreference === 'secondary' ? getSecondaryFont() : getPrimaryFont();
  };
  
  root.style.setProperty('--primary-button-font-family', resolveFontFamily(styles.primary_button_font || 'primary'));
  root.style.setProperty('--primary-button-font-weight', styles.primary_button_weight || '500');
  root.style.setProperty('--secondary-button-font-family', resolveFontFamily(styles.secondary_button_font || 'primary'));
  root.style.setProperty('--secondary-button-font-weight', styles.secondary_button_weight || '500');
  root.style.setProperty('--tertiary-button-font-family', resolveFontFamily(styles.tertiary_button_font || 'primary'));
  root.style.setProperty('--tertiary-button-font-weight', styles.tertiary_button_weight || '500');
  root.style.setProperty('--textlink-button-font-family', resolveFontFamily(styles.textlink_button_font || 'primary'));
  root.style.setProperty('--textlink-button-font-weight', styles.textlink_button_weight || '500');
  
  // Set existing button color variables
  root.style.setProperty('--primary-button-background-color', styles.primary_button_background_color || '#000000');
  root.style.setProperty('--secondary-button-background-color', styles.secondary_button_background_color || '#FFFFFF');
  root.style.setProperty('--primary-button-hover', styles.primary_button_hover_color || styles.dark_color || '#374151');
  root.style.setProperty('--secondary-button-hover', styles.secondary_button_hover_color || styles.secondary_color || '#F9FAFB');
  root.style.setProperty('--primary-button-text-color', styles.primary_button_text_color || '#FFFFFF');
  root.style.setProperty('--primary-button-border-color', styles.primary_button_border_color || styles.primary_color || '#000000');
  root.style.setProperty('--primary-button-shadow-color', styles.primary_button_shadow_color || styles.primary_color || '#374151');
  root.style.setProperty('--secondary-button-text-color', styles.secondary_button_text_color || '#000000');
  root.style.setProperty('--secondary-button-border-color', styles.secondary_button_border_color || '#E5E7EB');
  root.style.setProperty('--secondary-button-shadow-color', styles.secondary_button_shadow_color || '#D1D5DB');
  root.style.setProperty('--outline-text-color', styles.outline_text_color || '#000000');
  root.style.setProperty('--outline-border-color', styles.outline_border_color || '#000000');
  root.style.setProperty('--outline-hover-bg', styles.outline_hover_bg || '#F3F4F6');
  root.style.setProperty('--text-link-color', styles.text_link_color || styles.primary_color || '#000000');
  root.style.setProperty('--text-link-hover-color', styles.text_link_hover_color || styles.dark_color || '#374151');
}