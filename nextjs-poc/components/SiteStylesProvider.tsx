import { SiteStyles } from '@/lib/supabase';
import FontLoader from './FontLoader';

interface SiteStylesProviderProps {
  styles: SiteStyles | null;
  children: React.ReactNode;
}

export function SiteStylesProvider({ styles, children }: SiteStylesProviderProps) {
  // Generate CSS variables from site styles
  const cssVariables = generateCSSVariables(styles || {});
  
  return (
    <>
      <FontLoader 
        primaryFont={styles?.primary_font} 
        secondaryFont={styles?.secondary_font} 
      />
      <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
      {children}
    </>
  );
}

function generateCSSVariables(styles: Partial<SiteStyles>): string {
  const vars: string[] = [];
  
  // Colors
  if (styles.primary_color) vars.push(`--primary-color: ${styles.primary_color}`);
  if (styles.secondary_color) vars.push(`--secondary-color: ${styles.secondary_color}`);
  if (styles.tertiary_color) vars.push(`--tertiary-color: ${styles.tertiary_color}`);
  if (styles.text_color) vars.push(`--text-color: ${styles.text_color}`);
  if (styles.background_color) vars.push(`--background-color: ${styles.background_color}`);
  if (styles.dark_color) vars.push(`--dark-color: ${styles.dark_color}`);
  if (styles.light_color) vars.push(`--light-color: ${styles.light_color}`);
  if (styles.white_color) vars.push(`--white-color: ${styles.white_color}`);
  
  // Fonts
  if (styles.primary_font) vars.push(`--primary-font: '${styles.primary_font}', serif`);
  if (styles.secondary_font) vars.push(`--secondary-font: '${styles.secondary_font}', sans-serif`);
  
  // Primary button
  if (styles.primary_button_background_color) vars.push(`--primary-button-background-color: ${styles.primary_button_background_color}`);
  if (styles.primary_button_text_color) vars.push(`--primary-button-text-color: ${styles.primary_button_text_color}`);
  if (styles.primary_button_border_color) vars.push(`--primary-button-border-color: ${styles.primary_button_border_color}`);
  if (styles.primary_button_hover_color) vars.push(`--primary-button-hover: ${styles.primary_button_hover_color}`);
  if (styles.primary_button_size) vars.push(`--primary-button-size: ${styles.primary_button_size}`);
  if (styles.primary_button_radius) vars.push(`--primary-button-radius: ${styles.primary_button_radius}`);
  if (styles.primary_button_font) {
    vars.push(`--primary-button-font: '${styles.primary_button_font}', sans-serif`);
    vars.push(`--primary-button-font-family: '${styles.primary_button_font}', sans-serif`);
  }
  if (styles.primary_button_font_weight) vars.push(`--primary-button-font-weight: ${styles.primary_button_font_weight}`);
  
  // Secondary button
  if (styles.secondary_button_background_color) vars.push(`--secondary-button-background-color: ${styles.secondary_button_background_color}`);
  if (styles.secondary_button_text_color) vars.push(`--secondary-button-text-color: ${styles.secondary_button_text_color}`);
  if (styles.secondary_button_border_color) vars.push(`--secondary-button-border-color: ${styles.secondary_button_border_color}`);
  if (styles.secondary_button_hover_color) vars.push(`--secondary-button-hover: ${styles.secondary_button_hover_color}`);
  if (styles.secondary_button_size) vars.push(`--secondary-button-size: ${styles.secondary_button_size}`);
  if (styles.secondary_button_radius) vars.push(`--secondary-button-radius: ${styles.secondary_button_radius}`);
  if (styles.secondary_button_font) {
    vars.push(`--secondary-button-font: '${styles.secondary_button_font}', sans-serif`);
    vars.push(`--secondary-button-font-family: '${styles.secondary_button_font}', sans-serif`);
  }
  if (styles.secondary_button_font_weight) vars.push(`--secondary-button-font-weight: ${styles.secondary_button_font_weight}`);
  
  // Tertiary/outline button
  if (styles.outline_text_color) vars.push(`--outline-text-color: ${styles.outline_text_color}`);
  if (styles.outline_border_color) vars.push(`--outline-border-color: ${styles.outline_border_color}`);
  if (styles.outline_hover_bg) vars.push(`--outline-hover-bg: ${styles.outline_hover_bg}`);
  if (styles.tertiary_button_size) vars.push(`--tertiary-button-size: ${styles.tertiary_button_size}`);
  if (styles.tertiary_button_radius) vars.push(`--tertiary-button-radius: ${styles.tertiary_button_radius}`);
  if (styles.tertiary_button_font) {
    vars.push(`--tertiary-button-font: '${styles.tertiary_button_font}', sans-serif`);
    vars.push(`--tertiary-button-font-family: '${styles.tertiary_button_font}', sans-serif`);
  }
  if (styles.tertiary_button_font_weight) vars.push(`--tertiary-button-font-weight: ${styles.tertiary_button_font_weight}`);
  
  // Text link button
  if (styles.textlink_button_text_color) vars.push(`--text-link-color: ${styles.textlink_button_text_color}`);
  if (styles.textlink_button_hover_color) vars.push(`--text-link-hover-color: ${styles.textlink_button_hover_color}`);
  // Text links typically inherit font from body, but adding for completeness
  if (styles.secondary_font) {
    vars.push(`--textlink-button-font-family: '${styles.secondary_font}', sans-serif`);
  }
  
  // Button style
  if (styles.button_style) vars.push(`--button-style: ${styles.button_style}`);
  
  // Build the CSS
  const css = `
    :root {
      ${vars.join(';\n      ')};
    }
    
    /* Apply fonts */
    body {
      font-family: var(--secondary-font, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
      color: var(--text-color, #000000);
      background-color: var(--background-color, #ffffff);
    }
    
    h1, h2, h3, h4, h5, h6 {
      font-family: var(--primary-font, inherit);
    }
    
    /* Apply button typography via CSS to avoid SSR issues */
    a[class*="primary"], button[class*="primary"] {
      font-family: var(--primary-button-font-family, var(--primary-font, inherit));
      font-weight: var(--primary-button-font-weight, 600);
    }
    
    a[class*="secondary"], button[class*="secondary"] {
      font-family: var(--secondary-button-font-family, var(--secondary-font, inherit));
      font-weight: var(--secondary-button-font-weight, 600);
    }
    
    a[class*="tertiary"], button[class*="tertiary"] {
      font-family: var(--tertiary-button-font-family, var(--secondary-font, inherit));
      font-weight: var(--tertiary-button-font-weight, 600);
    }
    
    a[class*="text-link"], button[class*="text-link"] {
      font-family: var(--textlink-button-font-family, var(--secondary-font, inherit));
      font-weight: var(--textlink-button-font-weight, 400);
    }
  `;
  
  return css;
}