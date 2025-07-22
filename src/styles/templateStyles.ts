/**
 * Shared template CSS generation for both PageBuilder and deployment
 * This ensures consistent styling across preview and deployed sites
 */

import { SiteStyles } from '@/types/siteStyles';

/**
 * Generate CSS variables from site styles
 */
export function generateCSSVariables(siteStyles: Partial<SiteStyles>): string {
  const cssVariables: string[] = [];
  
  // Colors
  if (siteStyles.primary_color) cssVariables.push(`--color-primary: ${siteStyles.primary_color}`);
  if (siteStyles.secondary_color) cssVariables.push(`--color-secondary: ${siteStyles.secondary_color}`);
  if (siteStyles.tertiary_color) cssVariables.push(`--color-tertiary: ${siteStyles.tertiary_color}`);
  if (siteStyles.text_color) cssVariables.push(`--color-text: ${siteStyles.text_color}`);
  if (siteStyles.background_color) cssVariables.push(`--color-background: ${siteStyles.background_color}`);
  if (siteStyles.dark_color) cssVariables.push(`--dark-color: ${siteStyles.dark_color}`);
  if (siteStyles.light_color) cssVariables.push(`--light-color: ${siteStyles.light_color}`);
  if (siteStyles.white_color) cssVariables.push(`--white-color: ${siteStyles.white_color}`);
  
  // Button colors - Primary (using correct field names from database)
  if (siteStyles.primary_button_background_color) cssVariables.push(`--primary-button-background-color: ${siteStyles.primary_button_background_color}`);
  if (siteStyles.primary_button_text_color) cssVariables.push(`--primary-button-text-color: ${siteStyles.primary_button_text_color}`);
  if (siteStyles.primary_button_border_color) cssVariables.push(`--primary-button-border-color: ${siteStyles.primary_button_border_color}`);
  if (siteStyles.primary_button_hover_color) cssVariables.push(`--primary-button-hover: ${siteStyles.primary_button_hover_color}`);
  if (siteStyles.primary_button_shadow_color) cssVariables.push(`--primary-button-shadow-color: ${siteStyles.primary_button_shadow_color}`);
  
  // Button colors - Secondary (using correct field names from database)
  if (siteStyles.secondary_button_background_color) cssVariables.push(`--secondary-button-background-color: ${siteStyles.secondary_button_background_color}`);
  if (siteStyles.secondary_button_text_color) cssVariables.push(`--secondary-button-text-color: ${siteStyles.secondary_button_text_color}`);
  if (siteStyles.secondary_button_border_color) cssVariables.push(`--secondary-button-border-color: ${siteStyles.secondary_button_border_color}`);
  if (siteStyles.secondary_button_hover_color) cssVariables.push(`--secondary-button-hover: ${siteStyles.secondary_button_hover_color}`);
  if (siteStyles.secondary_button_shadow_color) cssVariables.push(`--secondary-button-shadow-color: ${siteStyles.secondary_button_shadow_color}`);
  
  // Button colors - Outline/Tertiary (using correct field names from database)
  if (siteStyles.outline_text_color) cssVariables.push(`--outline-text-color: ${siteStyles.outline_text_color}`);
  if (siteStyles.outline_border_color) cssVariables.push(`--outline-border-color: ${siteStyles.outline_border_color}`);
  if (siteStyles.outline_hover_bg) cssVariables.push(`--outline-hover-bg: ${siteStyles.outline_hover_bg}`);
  
  // Button colors - Text link
  if (siteStyles.textlink_button_text_color) cssVariables.push(`--text-link-color: ${siteStyles.textlink_button_text_color}`);
  if (siteStyles.textlink_button_hover_color) cssVariables.push(`--text-link-hover-color: ${siteStyles.textlink_button_hover_color}`);
  
  // Typography (using correct field names from database)
  if (siteStyles.primary_font) cssVariables.push(`--font-family-heading: ${siteStyles.primary_font}, sans-serif`);
  if (siteStyles.secondary_font) cssVariables.push(`--font-family-body: ${siteStyles.secondary_font}, sans-serif`);
  if (siteStyles.font_size_base) cssVariables.push(`--font-size-base: ${siteStyles.font_size_base}`);
  if (siteStyles.line_height_base) cssVariables.push(`--line-height-base: ${siteStyles.line_height_base}`);
  
  // Button sizes
  if (siteStyles.primary_button_size) cssVariables.push(`--primary-button-size: ${siteStyles.primary_button_size}`);
  if (siteStyles.secondary_button_size) cssVariables.push(`--secondary-button-size: ${siteStyles.secondary_button_size}`);
  if (siteStyles.tertiary_button_size) cssVariables.push(`--tertiary-button-size: ${siteStyles.tertiary_button_size}`);
  if (siteStyles.textlink_button_size) cssVariables.push(`--textlink-button-size: ${siteStyles.textlink_button_size}`);
  
  // Button radii
  const radiusMap: Record<string, string> = {
    'squared': '0',
    'slightly-rounded': '0.5rem',
    'fully-rounded': '9999px'
  };
  
  if (siteStyles.primary_button_radius) {
    cssVariables.push(`--primary-button-radius: ${siteStyles.primary_button_radius}`);
    cssVariables.push(`--primary-button-radius-value: ${radiusMap[siteStyles.primary_button_radius] || '0.5rem'}`);
  }
  if (siteStyles.secondary_button_radius) {
    cssVariables.push(`--secondary-button-radius: ${siteStyles.secondary_button_radius}`);
    cssVariables.push(`--secondary-button-radius-value: ${radiusMap[siteStyles.secondary_button_radius] || '0.5rem'}`);
  }
  if (siteStyles.tertiary_button_radius) {
    cssVariables.push(`--tertiary-button-radius: ${siteStyles.tertiary_button_radius}`);
    cssVariables.push(`--tertiary-button-radius-value: ${radiusMap[siteStyles.tertiary_button_radius] || '0.5rem'}`);
  }
  if (siteStyles.textlink_button_radius) {
    cssVariables.push(`--textlink-button-radius: ${siteStyles.textlink_button_radius}`);
    cssVariables.push(`--textlink-button-radius-value: ${radiusMap[siteStyles.textlink_button_radius] || '0'}`);
  }
  
  // Button fonts
  if (siteStyles.primary_button_font) cssVariables.push(`--primary-button-font-family: ${siteStyles.primary_button_font}, sans-serif`);
  if (siteStyles.secondary_button_font) cssVariables.push(`--secondary-button-font-family: ${siteStyles.secondary_button_font}, sans-serif`);
  if (siteStyles.tertiary_button_font) cssVariables.push(`--tertiary-button-font-family: ${siteStyles.tertiary_button_font}, sans-serif`);
  if (siteStyles.textlink_button_font) cssVariables.push(`--textlink-button-font-family: ${siteStyles.textlink_button_font}, sans-serif`);
  
  // Button font weights
  if (siteStyles.primary_button_font_weight) cssVariables.push(`--primary-button-font-weight: ${siteStyles.primary_button_font_weight}`);
  if (siteStyles.secondary_button_font_weight) cssVariables.push(`--secondary-button-font-weight: ${siteStyles.secondary_button_font_weight}`);
  if (siteStyles.tertiary_button_font_weight) cssVariables.push(`--tertiary-button-font-weight: ${siteStyles.tertiary_button_font_weight}`);
  if (siteStyles.textlink_button_font_weight) cssVariables.push(`--textlink-button-font-weight: ${siteStyles.textlink_button_font_weight}`);
  
  // Button style variants
  if (siteStyles.button_style) cssVariables.push(`--button-style: ${siteStyles.button_style}`);
  
  return `:root {\n  ${cssVariables.join(';\n  ')};\n}`;
}

/**
 * Generate component CSS that uses the CSS variables
 */
export function generateComponentCSS(): string {
  return `/* Component Styles */

/* Base Styles */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--font-family-body, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
  font-size: var(--font-size-base, 16px);
  line-height: var(--line-height-base, 1.5);
  color: var(--color-text, #000000);
  background-color: var(--color-background, #ffffff);
}

/* Container */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Section Base */
.section {
  padding: var(--section-padding-y, 3rem) 0;
}

/* Hero Section */
.hero,
.section-hero {
  min-height: var(--hero-min-height, 500px);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
  text-align: left;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 600px;
  margin: 0 auto;
}

.hero-split .hero-content {
  max-width: none;
}

.hero-image {
  position: relative;
  height: 100%;
  min-height: 400px;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero h1 {
  font-family: var(--font-family-heading, inherit);
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.125rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-split .button-group {
  justify-content: flex-start;
}

@media (max-width: 768px) {
  .hero-split {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero-split .button-group {
    justify-content: center;
  }
  
  .hero h1 {
    font-size: 2rem;
  }
}

/* Features Section */
.section-features {
  text-align: center;
}

.section-features .tagline {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.section-features h2 {
  font-family: var(--font-family-heading, inherit);
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 1rem;
}

.section-features .description {
  max-width: 600px;
  margin: 0 auto 3rem;
}

.feature-item {
  text-align: center;
}

.feature-item h3 {
  font-family: var(--font-family-heading, inherit);
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem;
}

.feature-item p {
  opacity: 0.8;
}

.feature-icon {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background-color: var(--light-color, #f3f4f6);
  border-radius: 0.5rem;
  color: var(--primary-color, #000000);
}

/* Icon font placeholder - will show emoji for now */
.feature-icon i[class^="icon-"] {
  font-style: normal;
}

.feature-icon i.icon-emoji::before {
  content: attr(data-emoji);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 1px solid transparent;
  font-weight: 500;
  position: relative;
  white-space: nowrap;
}

/* Button sizes */
.btn-small {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.btn-medium {
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1rem;
}

/* Button radius variants */
.btn-radius-squared {
  border-radius: 0;
}

.btn-radius-slightly-rounded {
  border-radius: 0.5rem;
}

.btn-radius-fully-rounded {
  border-radius: 9999px;
}

/* Primary button */
.btn-primary {
  background-color: var(--primary-button-background-color, #000000);
  color: var(--primary-button-text-color, #ffffff);
  border-color: var(--primary-button-border-color, #000000);
  font-family: var(--primary-button-font-family, inherit);
  font-weight: var(--primary-button-font-weight, 500);
  border-radius: var(--primary-button-radius-value, 0.5rem);
}

.btn-primary:hover {
  background-color: var(--primary-button-hover, #374151);
  text-decoration: none;
}

/* Secondary button */
.btn-secondary {
  background-color: var(--secondary-button-background-color, #ffffff);
  color: var(--secondary-button-text-color, #000000);
  border-color: var(--secondary-button-border-color, #e5e7eb);
  font-family: var(--secondary-button-font-family, inherit);
  font-weight: var(--secondary-button-font-weight, 500);
  border-radius: var(--secondary-button-radius-value, 0.5rem);
}

.btn-secondary:hover {
  background-color: var(--secondary-button-hover, #f9fafb);
  text-decoration: none;
}

/* Tertiary button */
.btn-tertiary {
  background-color: transparent;
  color: var(--outline-text-color, #000000);
  border-color: var(--outline-border-color, #000000);
  font-family: var(--tertiary-button-font-family, inherit);
  font-weight: var(--tertiary-button-font-weight, 500);
  border-radius: var(--tertiary-button-radius-value, 0.5rem);
}

.btn-tertiary:hover {
  background-color: var(--outline-hover-bg, #f3f4f6);
  text-decoration: none;
}

/* Text link button */
.btn-text-link {
  background-color: transparent;
  color: var(--text-link-color, #000000);
  border: none;
  padding: 0;
  font-family: var(--textlink-button-font-family, inherit);
  font-weight: var(--textlink-button-font-weight, 500);
}

.btn-text-link:hover {
  color: var(--text-link-hover-color, #374151);
  text-decoration: underline;
}

/* Button style variants */

/* Offset background style */
.btn-offset-wrapper {
  position: relative;
  display: inline-flex;
}

.btn-offset-background {
  position: absolute;
  inset: 0;
  transform: translate(8px, 8px);
  transition: transform 0.2s ease-in-out;
  border-radius: inherit;
}

.btn-offset-wrapper:hover .btn-offset-background {
  transform: translate(0, 0);
}

/* Offset background style - for now, just add a shadow effect */
.btn-style-offset-background {
  position: relative;
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.2);
  transition: box-shadow 0.2s ease;
}

.btn-style-offset-background:hover {
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
  transform: translate(2px, 2px);
}

.btn-offset-wrapper.primary .btn-offset-background {
  background-color: var(--primary-button-background-color, #000000);
}

.btn-offset-wrapper.secondary .btn-offset-background {
  background-color: var(--secondary-button-background-color, #ffffff);
}

.btn-offset-wrapper.tertiary .btn-offset-background {
  background-color: var(--outline-hover-bg, #f3f4f6);
}

/* Grid System */
.grid {
  display: grid;
  gap: var(--grid-gap, 2rem);
}

.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 768px) {
  .grid-cols-2,
  .grid-cols-3,
  .grid-cols-4 {
    grid-template-columns: 1fr;
  }
}

/* Navigation */
.section-navigation,
.section-navigation-desktop {
  padding: 1rem 0;
  background-color: var(--nav-background, transparent);
}

.nav-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  font-size: 1.25rem;
  font-weight: 600;
  color: inherit;
  text-decoration: none;
}

.nav-menu {
  display: flex;
  gap: 2rem;
  margin: 0 auto;
  list-style: none;
  padding: 0;
}

.nav-cta {
  display: flex;
  gap: 0.5rem;
}

.nav-link {
  color: var(--nav-link-color, var(--color-text));
  font-weight: 500;
  text-decoration: none;
}

.nav-link:hover {
  color: var(--color-primary, #007bff);
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-family-heading, inherit);
  line-height: 1.3;
  margin-top: 0;
}

p {
  margin-top: 0;
  margin-bottom: 1rem;
}

/* Utility Classes */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.mt-0 { margin-top: 0; }
.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-4 { margin-top: 1rem; }
.mt-8 { margin-top: 2rem; }

.mb-0 { margin-bottom: 0; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-8 { margin-bottom: 2rem; }

.opacity-90 { opacity: 0.9; }
.opacity-80 { opacity: 0.8; }
.opacity-70 { opacity: 0.7; }`;
}

/**
 * Generate component CSS with inline values instead of CSS variables
 * This is used for preview mode where CSS variables might not cascade properly
 */
export function generateComponentCSSWithInlineValues(siteStyles: Partial<SiteStyles>): string {
  // Get actual values with defaults
  const primaryColor = siteStyles.primary_color || '#007BFF';
  const secondaryColor = siteStyles.secondary_color || '#6C757D';
  const tertiaryColor = siteStyles.tertiary_color || '#28A745';
  const textColor = siteStyles.text_color || '#000000';
  const backgroundColor = siteStyles.background_color || '#ffffff';
  const darkColor = siteStyles.dark_color || '#343A40';
  const lightColor = siteStyles.light_color || '#F8F9FA';
  const whiteColor = siteStyles.white_color || '#FFFFFF';
  
  // Strip quotes from font families if they're already included
  const stripQuotes = (font: string) => {
    if (!font) return 'Inter';
    // Remove all quotes and trim
    const cleaned = font.replace(/['"]/g, '').trim();
    // If it contains comma-separated fonts, wrap the first one in quotes
    if (cleaned.includes(',')) {
      const parts = cleaned.split(',').map(p => p.trim());
      return `'${parts[0]}', ${parts.slice(1).join(', ')}`;
    }
    return `'${cleaned}'`;
  };
  
  const fontFamilyBody = stripQuotes(siteStyles.secondary_font || 'Inter');
  const fontFamilyHeading = stripQuotes(siteStyles.primary_font || 'Inter');
  
  // Button colors
  const primaryButtonBg = siteStyles.primary_button_background_color || primaryColor;
  const primaryButtonText = siteStyles.primary_button_text_color || '#ffffff';
  const primaryButtonBorder = siteStyles.primary_button_border_color || primaryButtonBg;
  const primaryButtonHover = siteStyles.primary_button_hover_color || darkColor;
  
  const secondaryButtonBg = siteStyles.secondary_button_background_color || '#ffffff';
  const secondaryButtonText = siteStyles.secondary_button_text_color || primaryColor;
  const secondaryButtonBorder = siteStyles.secondary_button_border_color || '#e5e7eb';
  const secondaryButtonHover = siteStyles.secondary_button_hover_color || '#f9fafb';
  
  const outlineTextColor = siteStyles.outline_text_color || primaryColor;
  const outlineBorderColor = siteStyles.outline_border_color || primaryColor;
  const outlineHoverBg = siteStyles.outline_hover_bg || lightColor;
  
  const textLinkColor = siteStyles.textlink_button_text_color || primaryColor;
  const textLinkHoverColor = siteStyles.textlink_button_hover_color || darkColor;
  
  // Button sizes
  const primaryButtonSize = siteStyles.primary_button_size || 'medium';
  const secondaryButtonSize = siteStyles.secondary_button_size || 'medium';
  const tertiaryButtonSize = siteStyles.tertiary_button_size || 'medium';
  
  // Button radii
  const radiusMap: Record<string, string> = {
    'squared': '0',
    'slightly-rounded': '0.5rem',
    'fully-rounded': '9999px'
  };
  
  const primaryButtonRadius = radiusMap[siteStyles.primary_button_radius || 'slightly-rounded'] || '0.5rem';
  const secondaryButtonRadius = radiusMap[siteStyles.secondary_button_radius || 'slightly-rounded'] || '0.5rem';
  const tertiaryButtonRadius = radiusMap[siteStyles.tertiary_button_radius || 'slightly-rounded'] || '0.5rem';
  
  // Button fonts
  const primaryButtonFont = stripQuotes(siteStyles.primary_button_font || fontFamilyHeading);
  const secondaryButtonFont = stripQuotes(siteStyles.secondary_button_font || fontFamilyBody);
  const tertiaryButtonFont = stripQuotes(siteStyles.tertiary_button_font || fontFamilyBody);
  
  // Button font weights
  const primaryButtonFontWeight = siteStyles.primary_button_font_weight || '600';
  const secondaryButtonFontWeight = siteStyles.secondary_button_font_weight || '500';
  const tertiaryButtonFontWeight = siteStyles.tertiary_button_font_weight || '500';
  
  return `/* Component Styles with Inline Values */

/* Base Styles */
* {
  box-sizing: border-box;
}

.template-section {
  font-family: ${fontFamilyBody}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: ${textColor};
}

/* Container */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Section Base */
.section {
  padding: 3rem 0;
}

/* Hero Section */
.hero,
.section-hero {
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
  text-align: left;
}

.hero h1 {
  font-family: ${fontFamilyHeading}, inherit;
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.2;
  color: ${textColor};
  margin: 0 0 1rem;
}

.hero p {
  font-size: 1.125rem;
  color: ${textColor};
  opacity: 0.9;
  margin-bottom: 2rem;
}

/* Features Section */
.section-features {
  text-align: center;
  padding: 3rem 0;
}

.section-features .tagline {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  color: ${primaryColor};
}

.section-features h2 {
  font-family: ${fontFamilyHeading}, inherit;
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 1rem;
  color: ${textColor};
}

.section-features .description {
  max-width: 600px;
  margin: 0 auto 3rem;
  color: ${textColor};
  opacity: 0.8;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.feature-item {
  text-align: center;
}

.feature-item h3 {
  font-family: ${fontFamilyHeading}, inherit;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem;
  color: ${textColor};
}

.feature-item p {
  opacity: 0.8;
  color: ${textColor};
}

.feature-icon {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background-color: ${lightColor};
  border-radius: 0.5rem;
  color: ${primaryColor};
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 1px solid transparent;
  font-weight: 500;
  position: relative;
  white-space: nowrap;
}

/* Button sizes */
.btn-small {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.btn-medium {
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1rem;
}

/* Primary button */
.btn-primary {
  background-color: ${primaryButtonBg};
  color: ${primaryButtonText};
  border-color: ${primaryButtonBorder};
  font-family: ${primaryButtonFont}, sans-serif;
  font-weight: ${primaryButtonFontWeight};
  border-radius: ${primaryButtonRadius};
}

.btn-primary:hover {
  background-color: ${primaryButtonHover};
  text-decoration: none;
}

.btn-primary.btn-${primaryButtonSize} {
  ${primaryButtonSize === 'small' ? 'padding: 0.375rem 0.75rem; font-size: 0.75rem;' : 
    primaryButtonSize === 'large' ? 'padding: 1rem 2rem; font-size: 1rem;' : 
    'padding: 0.75rem 1.5rem; font-size: 0.875rem;'}
}

/* Secondary button */
.btn-secondary {
  background-color: ${secondaryButtonBg};
  color: ${secondaryButtonText};
  border-color: ${secondaryButtonBorder};
  font-family: ${secondaryButtonFont}, sans-serif;
  font-weight: ${secondaryButtonFontWeight};
  border-radius: ${secondaryButtonRadius};
}

.btn-secondary:hover {
  background-color: ${secondaryButtonHover};
  text-decoration: none;
}

.btn-secondary.btn-${secondaryButtonSize} {
  ${secondaryButtonSize === 'small' ? 'padding: 0.375rem 0.75rem; font-size: 0.75rem;' : 
    secondaryButtonSize === 'large' ? 'padding: 1rem 2rem; font-size: 1rem;' : 
    'padding: 0.75rem 1.5rem; font-size: 0.875rem;'}
}

/* Tertiary button */
.btn-tertiary {
  background-color: transparent;
  color: ${outlineTextColor};
  border-color: ${outlineBorderColor};
  font-family: ${tertiaryButtonFont}, sans-serif;
  font-weight: ${tertiaryButtonFontWeight};
  border-radius: ${tertiaryButtonRadius};
}

.btn-tertiary:hover {
  background-color: ${outlineHoverBg};
  text-decoration: none;
}

.btn-tertiary.btn-${tertiaryButtonSize} {
  ${tertiaryButtonSize === 'small' ? 'padding: 0.375rem 0.75rem; font-size: 0.75rem;' : 
    tertiaryButtonSize === 'large' ? 'padding: 1rem 2rem; font-size: 1rem;' : 
    'padding: 0.75rem 1.5rem; font-size: 0.875rem;'}
}

/* Text link button */
.btn-text-link {
  background-color: transparent;
  color: ${textLinkColor};
  border: none;
  padding: 0;
  font-family: ${fontFamilyBody}, sans-serif;
  font-weight: 500;
}

.btn-text-link:hover {
  color: ${textLinkHoverColor};
  text-decoration: underline;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  font-family: ${fontFamilyHeading}, inherit;
  line-height: 1.3;
  margin-top: 0;
  color: ${textColor};
}

p {
  margin-top: 0;
  margin-bottom: 1rem;
  color: ${textColor};
}

/* Grid System */
.grid {
  display: grid;
  gap: 2rem;
}

.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 768px) {
  .grid-cols-2,
  .grid-cols-3,
  .grid-cols-4 {
    grid-template-columns: 1fr;
  }
}

/* Hero specific */
.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-split .button-group {
  justify-content: flex-start;
}

/* Icon font placeholder */
.feature-icon i[class^="icon-"] {
  font-style: normal;
}

.feature-icon i.icon-emoji {
  font-style: normal;
  display: block;
}

/* Utility Classes */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.mt-0 { margin-top: 0; }
.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-4 { margin-top: 1rem; }
.mt-8 { margin-top: 2rem; }

.mb-0 { margin-bottom: 0; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-8 { margin-bottom: 2rem; }

.opacity-90 { opacity: 0.9; }
.opacity-80 { opacity: 0.8; }
.opacity-70 { opacity: 0.7; }`;
}

/**
 * Generate complete template CSS including variables and components
 */
export function generateTemplateCSS(siteStyles: Partial<SiteStyles>): string {
  return `${generateCSSVariables(siteStyles)}\n\n${generateComponentCSS()}`;
}

/**
 * Generate template CSS for preview mode with inline values
 */
export function generateTemplateCSSForPreview(siteStyles: Partial<SiteStyles>): string {
  return generateComponentCSSWithInlineValues(siteStyles);
}

/**
 * Get button size class based on size value
 */
export function getButtonSizeClass(size: string): string {
  const sizeMap: Record<string, string> = {
    'small': 'btn-small',
    'medium': 'btn-medium',
    'large': 'btn-large'
  };
  return sizeMap[size] || 'btn-medium';
}

/**
 * Get button radius class based on radius value
 */
export function getButtonRadiusClass(radius: string): string {
  const radiusMap: Record<string, string> = {
    'squared': 'btn-radius-squared',
    'slightly-rounded': 'btn-radius-slightly-rounded',
    'fully-rounded': 'btn-radius-fully-rounded'
  };
  return radiusMap[radius] || 'btn-radius-slightly-rounded';
}