// Edge Function version of NetlifyDeploymentEngine
// Adapted for Deno runtime

import { TemplateRenderer } from './templateRenderer.ts';

interface ExportedPage {
  filename: string;
  content: string;
  slug: string;
  is_homepage: boolean;
}

interface ExportedAsset {
  path: string;
  content: string | Uint8Array;
  type: 'css' | 'image' | 'font' | 'js' | 'other';
}

interface ExportResult {
  pages: ExportedPage[];
  assets: ExportedAsset[];
  manifest: {
    projectId: string;
    projectName: string;
    exportedAt: string;
    pageCount: number;
    assetCount: number;
  };
}

interface SiteStyles {
  [key: string]: string;
}

interface Section {
  id: string;
  type: string;
  content: any;
  settings?: any;
}

interface Page {
  id: string;
  page_name: string;
  slug: string;
  is_homepage: boolean;
  status: string;
}

interface Project {
  id: string;
  project_name: string;
  site_styles: SiteStyles;
}

export class DeploymentEngine {
  private templateCache: Map<string, string> = new Map();
  
  constructor(private supabase: any) {}
  
  /**
   * Get section template from cache or database
   */
  private async getSectionTemplate(sectionType: string): Promise<string | null> {
    // Check cache first
    if (this.templateCache.has(sectionType)) {
      return this.templateCache.get(sectionType) || null;
    }
    
    // Fetch from database
    const { data, error } = await this.supabase
      .from('section_templates')
      .select('html_template')
      .eq('section_type', sectionType)
      .single();
    
    if (error || !data?.html_template) {
      return null;
    }
    
    // Cache the template
    this.templateCache.set(sectionType, data.html_template);
    return data.html_template;
  }

  /**
   * Generate a complete static site from project data
   */
  async generateStaticSite(projectId: string): Promise<ExportResult> {
    // Fetch project data
    const { data: project, error: projectError } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      throw new Error('Project not found');
    }

    // Fetch site styles for the project
    const { data: siteStyles } = await this.supabase
      .from('site_styles')
      .select('*')
      .eq('project_id', projectId)
      .single();

    // Add site_styles to project object
    project.site_styles = siteStyles || {};

    // Fetch all published pages
    const { data: pages, error: pagesError } = await this.supabase
      .from('pages')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'published')
      .order('order_index', { ascending: true });

    if (pagesError) {
      console.error('Error fetching pages:', pagesError);
    }

    // Check if this is a project without pages (like templates)
    const hasPages = pages && pages.length > 0;
    
    if (!hasPages) {
      console.log('No pages found, checking for project-level sections...');
      
      // Try to get sections directly attached to the project
      const { data: projectSections, error: projectSectionsError } = await this.supabase
        .from('page_sections')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });
      
      if (projectSectionsError || !projectSections || projectSections.length === 0) {
        throw new Error('No pages or project sections found');
      }
      
      console.log(`Found ${projectSections.length} project-level sections`);
      
      // Create a synthetic page for projects without pages
      const syntheticPage = {
        id: 'index',
        page_name: project.project_name || 'Home',
        slug: 'index',
        is_homepage: true,
        status: 'published'
      };
      
      // Map project sections to expected interface
      const mappedSections = projectSections.map((section: any) => ({
        id: section.id,
        type: section.section_type,
        content: section.content,
        settings: section.settings
      }));
      
      // Generate the page HTML from project sections
      const pageHtml = await this.generatePageHTML(syntheticPage, mappedSections, project.site_styles || {}, project.project_name);
      
      // Generate CSS - include component CSS in main.css
      const cssVariables = this.generateCSS(project.site_styles || {});
      const componentCss = this.generateComponentCSS();
      const cssContent = `${cssVariables}\n\n${componentCss}`;
      
      return {
        pages: [{
          filename: 'index.html',
          content: pageHtml,
          slug: 'index',
          is_homepage: true
        }],
        assets: [
          {
            path: 'css/main.css',
            content: cssContent,
            type: 'css' as const
          }
        ],
        manifest: {
          projectId: project.id,
          projectName: project.project_name,
          exportedAt: new Date().toISOString(),
          pageCount: 1,
          assetCount: 1
        }
      };
    }

    // Fetch sections for all pages
    const pageIds = pages.map((p: Page) => p.id);
    const { data: sections, error: sectionsError } = await this.supabase
      .from('page_sections')
      .select('*')
      .in('page_id', pageIds)
      .order('order_index', { ascending: true });

    if (sectionsError) {
      throw new Error('Failed to fetch page sections');
    }

    // Group sections by page
    const sectionsByPage = sections?.reduce((acc: any, section: any) => {
      const pageId = section.page_id;
      if (!acc[pageId]) acc[pageId] = [];
      // Map database fields to expected interface
      acc[pageId].push({
        id: section.id,
        type: section.section_type,
        content: section.content,
        settings: section.settings
      });
      return acc;
    }, {}) || {};

    // Generate CSS from site styles - include component CSS in main.css
    const cssVariables = this.generateCSS(project.site_styles || {});
    const componentCss = this.generateComponentCSS();
    const mainCss = `${cssVariables}\n\n${componentCss}`;

    // Collect all assets from sections
    const allAssets: ExportedAsset[] = [];
    const imageUrls = new Set<string>();

    // Generate HTML for each page
    const pagePromises = pages.map(async (page: any) => {
      // First check if page has embedded sections from page builder
      let sectionsToRender: Section[] = [];
      
      if (page.sections && Array.isArray(page.sections) && page.sections.length > 0) {
        // Use embedded sections from page builder
        console.log(`Using ${page.sections.length} embedded sections for page ${page.page_name}`);
        sectionsToRender = page.sections.map((section: any, index: number) => ({
          id: section.id || `embedded-${index}`,
          type: section.type,
          content: section.content,
          settings: section.settings || {}
        }));
      } else {
        // Fall back to page_sections table
        sectionsToRender = sectionsByPage[page.id] || [];
      }
      
      // Collect images from this page
      sectionsToRender.forEach((section: Section) => {
        const images = this.extractImagesFromSection(section);
        images.forEach((url: string) => imageUrls.add(url));
      });

      const htmlContent = await this.generatePageHTML(
        page,
        sectionsToRender,
        project.site_styles || {},
        project.project_name
      );

      return {
        filename: page.is_homepage ? 'index.html' : `${page.slug}.html`,
        content: htmlContent,
        slug: page.slug,
        is_homepage: page.is_homepage
      };
    });
    
    const exportedPages = await Promise.all(pagePromises);

    // Add CSS assets
    allAssets.push({
      path: 'css/main.css',
      content: mainCss,
      type: 'css'
    });

    allAssets.push({
      path: 'css/components.css',
      content: componentCss,
      type: 'css'
    });

    // Add netlify.toml for configuration
    const netlifyConfig = this.generateNetlifyConfig(pages);
    if (netlifyConfig) {
      allAssets.push({
        path: 'netlify.toml',
        content: netlifyConfig,
        type: 'other'
      });
    }

    // Create manifest
    const manifest = {
      projectId: project.id,
      projectName: project.project_name,
      exportedAt: new Date().toISOString(),
      pageCount: exportedPages.length,
      assetCount: allAssets.length
    };

    return {
      pages: exportedPages,
      assets: allAssets,
      manifest
    };
  }

  /**
   * Generate main CSS from site styles
   */
  private generateCSS(siteStyles: any): string {
    // Convert database site styles to CSS variables
    const cssVariables = [];
    
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
    
    // Button colors - Tertiary/Outline (using correct field names from database)
    if (siteStyles.outline_text_color) cssVariables.push(`--outline-text-color: ${siteStyles.outline_text_color}`);
    if (siteStyles.outline_border_color) cssVariables.push(`--outline-border-color: ${siteStyles.outline_border_color}`);
    if (siteStyles.outline_hover_bg) cssVariables.push(`--outline-hover-bg: ${siteStyles.outline_hover_bg}`);
    
    // Text Link colors (using correct field names from database)
    if (siteStyles.textlink_button_text_color) cssVariables.push(`--text-link-color: ${siteStyles.textlink_button_text_color}`);
    if (siteStyles.textlink_button_hover_color) cssVariables.push(`--text-link-hover-color: ${siteStyles.textlink_button_hover_color}`);
    
    // Button style and radius settings per button type
    cssVariables.push(`--button-style: ${siteStyles.button_style || 'default'}`);
    
    // Primary button settings
    cssVariables.push(`--primary-button-radius: ${siteStyles.primary_button_radius || 'slightly-rounded'}`);
    cssVariables.push(`--primary-button-size: ${siteStyles.primary_button_size || 'medium'}`);
    cssVariables.push(`--primary-button-icon-enabled: ${siteStyles.primary_button_icon_enabled || 'false'}`);
    cssVariables.push(`--primary-button-icon-position: ${siteStyles.primary_button_icon_position || 'right'}`);
    cssVariables.push(`--primary-button-font-family: ${siteStyles.primary_button_font_family || siteStyles.body_font || 'Inter, sans-serif'}`);
    cssVariables.push(`--primary-button-font-weight: ${siteStyles.primary_button_font_weight || '500'}`);
    
    // Secondary button settings
    cssVariables.push(`--secondary-button-radius: ${siteStyles.secondary_button_radius || 'slightly-rounded'}`);
    cssVariables.push(`--secondary-button-size: ${siteStyles.secondary_button_size || 'medium'}`);
    cssVariables.push(`--secondary-button-icon-enabled: ${siteStyles.secondary_button_icon_enabled || 'false'}`);
    cssVariables.push(`--secondary-button-icon-position: ${siteStyles.secondary_button_icon_position || 'right'}`);
    cssVariables.push(`--secondary-button-font-family: ${siteStyles.secondary_button_font_family || siteStyles.body_font || 'Inter, sans-serif'}`);
    cssVariables.push(`--secondary-button-font-weight: ${siteStyles.secondary_button_font_weight || '500'}`);
    
    // Tertiary button settings
    cssVariables.push(`--tertiary-button-radius: ${siteStyles.tertiary_button_radius || 'slightly-rounded'}`);
    cssVariables.push(`--tertiary-button-size: ${siteStyles.tertiary_button_size || 'medium'}`);
    cssVariables.push(`--tertiary-button-icon-enabled: ${siteStyles.tertiary_button_icon_enabled || 'false'}`);
    cssVariables.push(`--tertiary-button-icon-position: ${siteStyles.tertiary_button_icon_position || 'right'}`);
    cssVariables.push(`--tertiary-button-font-family: ${siteStyles.tertiary_button_font_family || siteStyles.body_font || 'Inter, sans-serif'}`);
    cssVariables.push(`--tertiary-button-font-weight: ${siteStyles.tertiary_button_font_weight || '500'}`);
    
    // Text link button settings
    cssVariables.push(`--text-link-button-radius: squared`);
    cssVariables.push(`--text-link-button-size: medium`);
    cssVariables.push(`--textlink-button-font-family: ${siteStyles.body_font || 'Inter, sans-serif'}`);
    cssVariables.push(`--textlink-button-font-weight: 500`)
    
    // Typography
    if (siteStyles.primary_font) cssVariables.push(`--font-body: '${siteStyles.primary_font}', -apple-system, BlinkMacSystemFont, sans-serif`);
    if (siteStyles.secondary_font) cssVariables.push(`--font-heading: '${siteStyles.secondary_font}', -apple-system, BlinkMacSystemFont, sans-serif`);
    if (siteStyles.p_font_size) cssVariables.push(`--font-size-body: ${siteStyles.p_font_size}px`);
    if (siteStyles.h1_font_size) cssVariables.push(`--font-size-h1: ${siteStyles.h1_font_size}px`);
    if (siteStyles.h2_font_size) cssVariables.push(`--font-size-h2: ${siteStyles.h2_font_size}px`);
    if (siteStyles.h3_font_size) cssVariables.push(`--font-size-h3: ${siteStyles.h3_font_size}px`);
    
    // Heading font weights
    if (siteStyles.h1_font_weight) cssVariables.push(`--h1-font-weight: ${siteStyles.h1_font_weight}`);
    if (siteStyles.h2_font_weight) cssVariables.push(`--h2-font-weight: ${siteStyles.h2_font_weight}`);
    if (siteStyles.h3_font_weight) cssVariables.push(`--h3-font-weight: ${siteStyles.h3_font_weight}`);
    
    // Line heights
    if (siteStyles.h1_line_height) cssVariables.push(`--h1-line-height: ${siteStyles.h1_line_height}`);
    if (siteStyles.h2_line_height) cssVariables.push(`--h2-line-height: ${siteStyles.h2_line_height}`);
    if (siteStyles.p_line_height) cssVariables.push(`--line-height-body: ${siteStyles.p_line_height}`);
    
    // Layout
    if (siteStyles.container_width) cssVariables.push(`--container-max-width: ${siteStyles.container_width}px`);
    if (siteStyles.section_padding_y) cssVariables.push(`--section-padding-y: ${siteStyles.section_padding_y}px`);
    
    const cssVarsString = cssVariables.map(v => `  ${v};`).join('\n');

    // Generate base CSS with proper rules
    return `/* Generated CSS from Site Styles */
:root {
${cssVarsString}
}

/* Reset and Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-body, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
  font-size: var(--font-size-body, 1rem);
  line-height: var(--line-height-body, 1.5);
  color: var(--color-text, #333333);
  background-color: var(--color-background, #ffffff);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading, var(--font-body));
  font-weight: var(--font-weight-heading, 700);
  line-height: var(--line-height-heading, 1.2);
  color: var(--color-heading, var(--color-text));
}

h1 { font-size: var(--font-size-h1, 2.5rem); }
h2 { font-size: var(--font-size-h2, 2rem); }
h3 { font-size: var(--font-size-h3, 1.75rem); }
h4 { font-size: var(--font-size-h4, 1.5rem); }
h5 { font-size: var(--font-size-h5, 1.25rem); }
h6 { font-size: var(--font-size-h6, 1rem); }

a {
  color: var(--color-primary, #007bff);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

.container {
  width: 100%;
  max-width: var(--container-max-width, 1200px);
  margin: 0 auto;
  padding: 0 var(--container-padding, 1rem);
}

/* Utility Classes */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.mt-1 { margin-top: 0.5rem; }
.mt-2 { margin-top: 1rem; }
.mt-3 { margin-top: 1.5rem; }
.mt-4 { margin-top: 2rem; }
.mt-5 { margin-top: 3rem; }

.mb-1 { margin-bottom: 0.5rem; }
.mb-2 { margin-bottom: 1rem; }
.mb-3 { margin-bottom: 1.5rem; }
.mb-4 { margin-bottom: 2rem; }
.mb-5 { margin-bottom: 3rem; }

.py-1 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.py-2 { padding-top: 1rem; padding-bottom: 1rem; }
.py-3 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
.py-4 { padding-top: 2rem; padding-bottom: 2rem; }
.py-5 { padding-top: 3rem; padding-bottom: 3rem; }

/* Responsive Design */
@media (max-width: 768px) {
  html { font-size: 14px; }
  .container { padding: 0 0.75rem; }
}
`;
  }

  /**
   * Generate component-specific CSS
   */
  private generateComponentCSS(): string {
    return `/* Component Styles */

/* Section Base */
.section {
  padding: var(--section-padding-y, 3rem) 0;
}

/* Hero Section */
.hero {
  min-height: var(--hero-min-height, 500px);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero h1 {
  margin-bottom: 1rem;
  font-size: var(--font-size-h1, 3rem);
  font-weight: var(--h1-font-weight, 700);
  line-height: var(--h1-line-height, 1.2);
}

.hero p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  color: var(--tertiary-color, #6B7280);
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* Split Hero Layout */
.hero-split {
  min-height: var(--hero-min-height, 500px);
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.hero-split .hero-split-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  width: 100%;
}

.hero-split .hero-content {
  text-align: left;
}

.hero-split .hero-buttons {
  justify-content: flex-start;
}

.hero-split .hero-image {
  position: relative;
  height: 100%;
  min-height: 400px;
}

.hero-split .hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.5rem;
}

@media (max-width: 768px) {
  .hero-split .hero-split-wrapper {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .hero-split .hero-content {
    text-align: center;
  }
  
  .hero-split .hero-buttons {
    justify-content: center;
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

.section-features .description {
  max-width: 600px;
  margin: 0 auto 3rem;
}

.feature-item {
  text-align: center;
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
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

/* Default style */
.btn-style-default {
  /* Uses base button styles */
}

/* Floating style */
.btn-style-floating {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform: translateY(0);
}

.btn-style-floating:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transform: translateY(-2px);
}

.btn-style-floating:active {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transform: translateY(0);
}

/* Brick style */
.btn-style-brick {
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-width: 2px;
}

.btn-style-brick.btn-primary {
  box-shadow: 3px 3px 0 var(--primary-button-shadow-color, #374151);
}

.btn-style-brick.btn-primary:hover {
  box-shadow: 1px 1px 0 var(--primary-button-shadow-color, #374151);
}

.btn-style-brick.btn-primary:active {
  transform: translate(2px, 2px);
  box-shadow: none;
}

.btn-style-brick.btn-secondary {
  box-shadow: 3px 3px 0 var(--secondary-button-shadow-color, #d1d5db);
}

.btn-style-brick.btn-secondary:hover {
  box-shadow: 1px 1px 0 var(--secondary-button-shadow-color, #d1d5db);
}

.btn-style-brick.btn-tertiary {
  border-width: 2px;
}

/* Modern style */
.btn-style-modern {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.btn-style-modern:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.25);
}

.btn-style-modern:active {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

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

/* Compact style */
.btn-style-compact {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  border: none;
}

/* Button icons */
.btn-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.btn-icon-left {
  margin-right: 0.5rem;
}

.btn-icon-right {
  margin-left: 0.5rem;
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

/* Cards */
.card {
  background: var(--card-background, #ffffff);
  border: 1px solid var(--card-border-color, #e0e0e0);
  border-radius: var(--card-border-radius, 0.5rem);
  padding: var(--card-padding, 1.5rem);
  box-shadow: var(--card-shadow, 0 2px 4px rgba(0,0,0,0.1));
}

/* Navigation */
.section-navigation,
.section-navigation-desktop {
  padding: 1rem 0;
}

.nav-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  font-size: 1.25rem;
  font-weight: 600;
}

.nav-menu {
  display: flex;
  gap: 2rem;
  margin: 0 auto;
}

.nav-cta {
  display: flex;
  gap: 0.5rem;
}

.nav-link {
  color: var(--nav-link-color, var(--color-text));
  font-weight: 500;
}

.nav-link:hover {
  color: var(--color-primary, #007bff);
}

/* Footer */
.footer {
  background: var(--footer-background, #f8f9fa);
  padding: 3rem 0 2rem;
  margin-top: auto;
}

.footer-content {
  text-align: center;
  color: var(--footer-text-color, #6c757d);
}

/* Icon Styles */
.icon,
[class^="icon-"],
[class*=" icon-"] {
  display: inline-block;
  width: 1.5em;
  height: 1.5em;
  stroke-width: 0;
  stroke: currentColor;
  fill: currentColor;
}

/* Feature Icons */
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

/* Service Icons */
.service-icon {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background-color: var(--primary-color, #000000);
  border-radius: 0.5rem;
  color: var(--white-color, #ffffff);
}

/* Team Member Styles */
.team-member {
  text-align: center;
}

.team-member-image {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 1rem;
}

.team-member h3 {
  margin-bottom: 0.5rem;
}

.team-member-role {
  color: var(--tertiary-color, #9ca3af);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.team-member-bio {
  font-size: 0.875rem;
  line-height: 1.6;
}

/* Service Grid Styles */
.service-item {
  transition: transform 0.2s ease-in-out;
}

.service-item:hover {
  transform: translateY(-4px);
}

.service-item h3 {
  margin-bottom: 0.5rem;
}

/* Logo Styles */
.logo-image {
  height: 40px;
  width: auto;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color, #000000);
}

/* Mobile Navigation */
.nav-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text, #000000);
}

@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
  
  .nav-cta {
    display: none;
  }
  
  .nav-toggle {
    display: block;
  }
  
  .navigation-mobile .nav-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: inherit;
    flex-direction: column;
    padding: 1rem;
    display: none;
  }
  
  .navigation-mobile .nav-menu.open {
    display: flex;
  }
}
`;
  }

  /**
   * Generate HTML for a complete page
   */
  private async generatePageHTML(
    page: Page,
    sections: Section[],
    siteStyles: SiteStyles,
    projectName: string
  ): Promise<string> {
    const title = page.page_name || projectName;
    const sectionPromises = sections.map((section: Section) => 
      this.renderSection(section, siteStyles)
    );
    const sectionResults = await Promise.all(sectionPromises);
    const sectionsHTML = sectionResults.join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${title} - ${projectName}">
  <title>${title} - ${projectName}</title>
  
  <!-- CSS Files -->
  <link rel="stylesheet" href="/css/main.css">
  <link rel="stylesheet" href="/css/components.css">
  
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="/favicon.png">
</head>
<body>
  <!-- Page sections from PageBuilder -->
  ${sectionsHTML}
</body>
</html>`;
  }

  /**
   * Render a section to HTML
   */
  private async renderSection(section: Section, siteStyles?: SiteStyles): Promise<string> {
    const { type, content, settings } = section;
    
    // Try to get template from cache or database
    const template = await this.getSectionTemplate(type);
    
    if (template) {
      // Use template renderer for sections with templates
      const context = {
        ...content,
        _siteStyles: siteStyles,
        _sectionType: type
      };
      return TemplateRenderer.render(template, context);
    }
    
    // Fallback to manual rendering for sections without templates
    const sectionClasses = ['section', `section-${type}`].join(' ');
    
    switch (type) {
      case 'hero':
        return this.renderHeroSection(content, settings, siteStyles);
      
      case 'text':
        return this.renderTextSection(content, settings);
      
      case 'image':
        return this.renderImageSection(content, settings);
      
      case 'cards':
        return this.renderCardsSection(content, settings, siteStyles);
      
      case 'cta':
        return this.renderCTASection(content, settings, siteStyles);
        
      case 'features':
        return this.renderFeaturesSection(content, settings);
        
      case 'team':
        return this.renderTeamSection(content, settings);
        
      case 'services-grid':
        return this.renderServicesGridSection(content, settings);
      
      case 'navigation':
      case 'navigation-desktop':
        return this.renderNavigationSection(content, settings, type, siteStyles);
      
      default:
        // Fallback for unknown section types - render the actual content
        return this.renderGenericSection(type, content, settings, sectionClasses);
    }
  }

  /**
   * Render hero section
   */
  private renderHeroSection(content: any, settings: any, siteStyles?: SiteStyles): string {
    // Handle both old format and page builder format
    // Support multiple field names for maximum compatibility
    const heading = content.heading || content.heroHeading?.text || content.headline?.text || 'Welcome';
    const subheading = content.subheading || content.heroSubheading?.text || content.description?.text || '';
    const buttonText = content.buttonText || content.primaryButton?.text || '';
    const buttonLink = content.buttonLink || content.primaryButton?.href || '#';
    const secondaryButtonText = content.secondaryButton?.text || '';
    const secondaryButtonLink = content.secondaryButton?.href || '#';
    
    // Handle hero image for split layout
    const heroImage = content.heroImage;
    const hasImage = heroImage && heroImage.src;
    
    // Handle background
    const backgroundColor = content.backgroundColor || '#FFFFFF';
    const backgroundType = content.backgroundType || 'color';
    let backgroundStyle = `background-color: ${backgroundColor};`;
    
    if (backgroundType === 'image' && content.backgroundImage) {
      backgroundStyle = `background-image: url('${content.backgroundImage}'); background-size: cover; background-position: center;`;
    } else if (backgroundType === 'gradient' && content.backgroundGradient) {
      backgroundStyle = `background: ${content.backgroundGradient};`;
    }

    // For split layout with image
    if (hasImage) {
      return `
      <section class="section section-hero hero-split" style="${backgroundStyle}">
        <div class="container">
          <div class="hero-split-wrapper">
            <div class="hero-content">
              <h1>${heading}</h1>
              ${subheading ? `<p>${subheading}</p>` : ''}
              <div class="hero-buttons">
                ${this.renderButton({ text: buttonText, href: buttonLink, variant: 'primary' }, siteStyles)}
                ${this.renderButton({ text: secondaryButtonText, href: secondaryButtonLink, variant: 'secondary' }, siteStyles)}
              </div>
            </div>
            <div class="hero-image">
              <img src="${heroImage.src}" alt="${heroImage.alt || 'Hero image'}" />
            </div>
          </div>
        </div>
      </section>
      `;
    }

    // Regular centered hero
    return `
    <section class="section section-hero hero" style="${backgroundStyle}">
      <div class="container">
        <div class="hero-content">
          <h1>${heading}</h1>
          ${subheading ? `<p>${subheading}</p>` : ''}
          <div class="hero-buttons">
            ${this.renderButton({ text: buttonText, href: buttonLink, variant: 'primary' }, siteStyles)}
            ${this.renderButton({ text: secondaryButtonText, href: secondaryButtonLink, variant: 'secondary' }, siteStyles)}
          </div>
        </div>
      </div>
    </section>
    `;
  }

  /**
   * Render text section
   */
  private renderTextSection(content: any, settings: any): string {
    const { 
      heading = '', 
      text = '',
      alignment = 'left'
    } = content;

    return `
    <section class="section section-text">
      <div class="container">
        <div class="text-content text-${alignment}">
          ${heading ? `<h2>${heading}</h2>` : ''}
          ${text ? `<div class="prose">${this.parseMarkdown(text)}</div>` : ''}
        </div>
      </div>
    </section>
    `;
  }

  /**
   * Render image section
   */
  private renderImageSection(content: any, settings: any): string {
    const { 
      imageUrl = '', 
      caption = '',
      alignment = 'center'
    } = content;

    if (!imageUrl) return '';

    return `
    <section class="section section-image">
      <div class="container">
        <div class="image-content text-${alignment}">
          <img src="${imageUrl}" alt="${caption || 'Image'}" />
          ${caption ? `<p class="image-caption mt-2">${caption}</p>` : ''}
        </div>
      </div>
    </section>
    `;
  }

  /**
   * Render cards section
   */
  private renderCardsSection(content: any, settings: any, siteStyles?: SiteStyles): string {
    const { 
      heading = '',
      cards = []
    } = content;

    const cardsHTML = cards.map((card: any) => `
      <div class="card">
        ${card.image ? `<img src="${card.image}" alt="${card.title || 'Card image'}" class="card-image mb-3">` : ''}
        ${card.title ? `<h3>${card.title}</h3>` : ''}
        ${card.description ? `<p class="mt-2">${card.description}</p>` : ''}
        ${card.buttonText ? `<div class="mt-3">${this.renderButton({ text: card.buttonText, href: card.buttonLink || '#', variant: 'primary' }, siteStyles)}</div>` : ''}
      </div>
    `).join('');

    return `
    <section class="section section-cards">
      <div class="container">
        ${heading ? `<h2 class="text-center mb-4">${heading}</h2>` : ''}
        <div class="grid grid-cols-${Math.min(cards.length, 3)}">
          ${cardsHTML}
        </div>
      </div>
    </section>
    `;
  }

  /**
   * Render CTA section
   */
  private renderCTASection(content: any, settings: any, siteStyles?: SiteStyles): string {
    const { 
      heading = 'Ready to get started?',
      text = '',
      buttonText = 'Contact Us',
      buttonLink = '#'
    } = content;

    return `
    <section class="section section-cta" style="background-color: var(--color-primary-light, #f0f8ff);">
      <div class="container">
        <div class="cta-content text-center">
          <h2>${heading}</h2>
          ${text ? `<p class="mt-2 mb-4">${text}</p>` : ''}
          ${this.renderButton({ text: buttonText, href: buttonLink, variant: 'primary' }, siteStyles)}
        </div>
      </div>
    </section>
    `;
  }

  /**
   * Render features section
   */
  private renderFeaturesSection(content: any, settings: any): string {
    // Handle page builder format
    const heading = content.heading || content.mainHeading?.text || '';
    const tagline = content.tagline?.text || content.tagline || '';
    const description = content.description?.text || content.description || '';
    
    // Build features array from either format
    let features = content.features || [];
    
    // If no features array, check for individual feature fields (page builder format)
    if (features.length === 0) {
      const featureFields = [];
      // Check for feature1, feature2, etc.
      for (let i = 1; i <= 4; i++) {
        const featureKey = `feature${i}`;
        const iconKey = `${featureKey}Icon`;
        const headingKey = `${featureKey}Heading`;
        const descKey = `${featureKey}Description`;
        
        if (content[headingKey] || content[descKey]) {
          featureFields.push({
            icon: content[iconKey]?.icon || '',
            iconColor: content[iconKey]?.color || '#000',
            title: content[headingKey]?.text || '',
            description: content[descKey]?.text || ''
          });
        }
      }
      if (featureFields.length > 0) {
        features = featureFields;
      }
    }
    
    const featuresHTML = features.map((feature: any) => {
      const iconHtml = feature.icon ? 
        (feature.icon.length === 1 || feature.icon.startsWith('&') ? 
          `<div class="feature-icon" style="color: ${feature.iconColor || '#000'}">${feature.icon}</div>` :
          `<div class="feature-icon"><i class="icon-${feature.icon.toLowerCase()}"></i></div>`) 
        : '';
      
      return `
      <div class="feature-item">
        ${iconHtml}
        <h3>${feature.title || ''}</h3>
        <p>${feature.description || ''}</p>
      </div>
    `;
    }).join('');
    
    return `
    <section class="section section-features">
      <div class="container">
        ${tagline ? `<p class="tagline text-center">${tagline}</p>` : ''}
        ${heading ? `<h2 class="text-center mb-4">${heading}</h2>` : ''}
        ${description ? `<p class="description text-center mb-4">${description}</p>` : ''}
        <div class="grid grid-cols-${Math.min(features.length || 1, 4)}">
          ${featuresHTML}
        </div>
      </div>
    </section>
    `;
  }
  
  /**
   * Render team section
   */
  private renderTeamSection(content: any, settings: any): string {
    // Handle both old format and page builder format
    const heading = content.heading || content.mainHeading?.text || '';
    
    // Build team members array from either format
    let members = content.members || [];
    
    // If no members array, check for individual member fields (page builder format)
    if (members.length === 0) {
      const memberFields = [];
      // Check for member1, member2, etc.
      for (let i = 1; i <= 4; i++) {
        const memberKey = `member${i}`;
        const nameKey = `${memberKey}Name`;
        const roleKey = `${memberKey}Role`;
        const bioKey = `${memberKey}Bio`;
        const imageKey = `${memberKey}Image`;
        
        if (content[nameKey] || content[roleKey]) {
          memberFields.push({
            name: content[nameKey]?.text || '',
            role: content[roleKey]?.text || '',
            bio: content[bioKey]?.text || '',
            image: content[imageKey]?.src || ''
          });
        }
      }
      if (memberFields.length > 0) {
        members = memberFields;
      }
    }
    
    const membersHTML = members.map((member: any) => `
      <div class="team-member">
        ${member.image ? `<img src="${member.image}" alt="${member.name || 'Team member'}" class="team-member-image">` : ''}
        <h3>${member.name || ''}</h3>
        <p class="team-member-role">${member.role || ''}</p>
        ${member.bio ? `<p class="team-member-bio">${member.bio}</p>` : ''}
      </div>
    `).join('');
    
    return `
    <section class="section section-team">
      <div class="container">
        ${heading ? `<h2 class="text-center mb-4">${heading}</h2>` : ''}
        <div class="grid grid-cols-${Math.min(members.length || 1, 3)}">
          ${membersHTML}
        </div>
      </div>
    </section>
    `;
  }
  
  /**
   * Render services grid section
   */
  private renderServicesGridSection(content: any, settings: any): string {
    // Handle both old format and page builder format
    const heading = content.heading || content.mainHeading?.text || '';
    
    // Build services array from either format
    let services = content.services || [];
    
    // If no services array, check for individual service fields (page builder format)
    if (services.length === 0) {
      const serviceFields = [];
      // Check for service1, service2, etc.
      for (let i = 1; i <= 6; i++) {
        const serviceKey = `service${i}`;
        const iconKey = `${serviceKey}Icon`;
        const titleKey = `${serviceKey}Title`;
        const descKey = `${serviceKey}Description`;
        
        if (content[titleKey] || content[descKey]) {
          serviceFields.push({
            icon: content[iconKey]?.icon || '',
            iconColor: content[iconKey]?.color || '#000',
            title: content[titleKey]?.text || '',
            description: content[descKey]?.text || ''
          });
        }
      }
      if (serviceFields.length > 0) {
        services = serviceFields;
      }
    }
    
    const servicesHTML = services.map((service: any) => {
      const iconHtml = service.icon ? 
        (service.icon.length === 1 || service.icon.startsWith('&') ? 
          `<div class="service-icon" style="color: ${service.iconColor || '#000'}">${service.icon}</div>` :
          `<div class="service-icon"><i class="icon-${service.icon.toLowerCase()}"></i></div>`) 
        : '';
      
      return `
      <div class="service-item card">
        ${iconHtml}
        <h3>${service.title || ''}</h3>
        <p>${service.description || ''}</p>
      </div>
    `;
    }).join('');
    
    return `
    <section class="section section-services-grid">
      <div class="container">
        ${heading ? `<h2 class="text-center mb-4">${heading}</h2>` : ''}
        <div class="grid grid-cols-${Math.min(services.length || 1, 3)}">
          ${servicesHTML}
        </div>
      </div>
    </section>
    `;
  }

  /**
   * Render navigation
   */
  private renderNavigation(siteStyles: SiteStyles): string {
    // This would be enhanced with actual navigation data
    return `
    <nav class="nav">
      <div class="container">
        <div class="nav-content">
          <div class="nav-logo">
            <a href="/">Logo</a>
          </div>
          <ul class="nav-menu">
            <li><a href="/" class="nav-link">Home</a></li>
            <li><a href="/about" class="nav-link">About</a></li>
            <li><a href="/contact" class="nav-link">Contact</a></li>
          </ul>
        </div>
      </div>
    </nav>
    `;
  }

  /**
   * Render footer
   */
  private renderFooter(siteStyles: SiteStyles): string {
    // Try to get footer section from project
    // This is a simplified version - in production, we'd fetch the actual footer section
    const year = new Date().getFullYear();
    return `
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <p>&copy; ${year} All rights reserved.</p>
        </div>
      </div>
    </footer>
    `;
  }

  /**
   * Extract image URLs from a section
   */
  private extractImagesFromSection(section: Section): string[] {
    const images: string[] = [];
    const content = section.content || {};

    // Check common image fields
    if (content.imageUrl) images.push(content.imageUrl);
    if (content.backgroundImage) images.push(content.backgroundImage);
    if (content.image) images.push(content.image);
    
    // Check cards or gallery items
    if (content.cards && Array.isArray(content.cards)) {
      content.cards.forEach((card: any) => {
        if (card.image) images.push(card.image);
      });
    }

    if (content.images && Array.isArray(content.images)) {
      images.push(...content.images);
    }

    return images.filter((url: string) => url && typeof url === 'string');
  }

  /**
   * Basic markdown parser
   */
  private parseMarkdown(text: string): string {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .split('\n\n')
      .map(p => `<p>${p}</p>`)
      .join('');
  }

  /**
   * Generate netlify.toml configuration
   */
  private generateNetlifyConfig(pages: Page[]): string {
    const redirects = pages
      .filter((p: Page) => !p.is_homepage)
      .map((p: Page) => `  [[redirects]]\n    from = "/${p.slug}"\n    to = "/${p.slug}.html"\n    status = 200`)
      .join('\n');

    return `# Netlify Configuration
[build]
  publish = "/"

# Redirects for clean URLs
${redirects}

# Headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
`;
  }
  
  /**
   * Render navigation section
   */
  private renderNavigationSection(content: any, settings: any, type: string, siteStyles?: SiteStyles): string {
    const isMobile = type === 'navigation';
    const navClass = isMobile ? 'navigation-mobile' : 'navigation-desktop';
    
    // Extract navigation items
    const items = content?.items || content?.links || [];
    const logo = content?.logo || { text: 'Logo' };
    const backgroundColor = content?.backgroundColor || '#FFFFFF';
    const textColor = content?.textColor || '#000000';
    
    // Handle navigation items or fallback to basic navigation
    let navItems = '';
    if (items && items.length > 0) {
      navItems = items.map((item: any) => {
        const text = item.text || item.label || item.name || 'Link';
        const href = item.href || item.url || item.link || '#';
        return `<a href="${href}" class="nav-link">${text}</a>`;
      }).join('\n');
    } else {
      // Default navigation items
      navItems = `
        <a href="/" class="nav-link">Home</a>
        <a href="/about" class="nav-link">About</a>
        <a href="/services" class="nav-link">Services</a>
        <a href="/contact" class="nav-link">Contact</a>
      `;
    }
    
    // Handle CTA buttons from PageBuilder
    const ctaButtons = [];
    if (content?.ctaButton1?.text) {
      ctaButtons.push(this.renderButton(content.ctaButton1, siteStyles));
    }
    if (content?.ctaButton2?.text) {
      ctaButtons.push(this.renderButton(content.ctaButton2, siteStyles));
    }
    
    return `
    <nav class="section section-${type} ${navClass}" style="background-color: ${backgroundColor}; color: ${textColor};">
      <div class="container">
        <div class="nav-wrapper">
          <div class="nav-logo">
            ${logo.src || logo.imageUrl ? 
              `<img src="${logo.src || logo.imageUrl}" alt="${logo.alt || logo.text || 'Logo'}" class="logo-image">` : 
              `<span class="logo-text">${logo.text}</span>`
            }
          </div>
          <div class="nav-menu">
            ${navItems}
          </div>
          ${ctaButtons.length > 0 ? `<div class="nav-cta">${ctaButtons.join('')}</div>` : ''}
          ${isMobile ? '<button class="nav-toggle" aria-label="Menu">☰</button>' : ''}
        </div>
      </div>
    </nav>
    `;
  }
  
  /**
   * Render a generic section with its content
   */
  private renderGenericSection(type: string, content: any, settings: any, sectionClasses: string): string {
    // Extract meaningful content from the section
    let innerContent = '';
    
    // If content is an object, try to extract text, html, or other meaningful properties
    if (typeof content === 'object' && content !== null) {
      // Common content patterns
      if (content.html) {
        innerContent = content.html;
      } else if (content.text) {
        innerContent = `<p>${content.text}</p>`;
      } else if (content.title || content.heading) {
        const title = content.title || content.heading;
        const subtitle = content.subtitle || content.subheading || '';
        const description = content.description || content.text || '';
        
        innerContent = `
          ${title ? `<h2>${title}</h2>` : ''}
          ${subtitle ? `<h3>${subtitle}</h3>` : ''}
          ${description ? `<p>${description}</p>` : ''}
        `;
      } else if (content.items && Array.isArray(content.items)) {
        // Handle list-like content
        innerContent = '<div class="items-list">' + content.items.map((item: any) => {
          if (typeof item === 'string') {
            return `<div class="item">${item}</div>`;
          } else if (item.text || item.label || item.name) {
            const text = item.text || item.label || item.name;
            const description = item.description || '';
            return `
              <div class="item">
                <div class="item-text">${text}</div>
                ${description ? `<div class="item-description">${description}</div>` : ''}
              </div>
            `;
          } else if (item.title) {
            return `
              <div class="item">
                <h3>${item.title}</h3>
                ${item.description || item.text || ''}
              </div>
            `;
          }
          return '';
        }).join('\n') + '</div>';
      } else {
        // For complex objects, render key properties
        const keys = Object.keys(content);
        innerContent = '<div class="content-properties">';
        keys.forEach(key => {
          const value = content[key];
          if (typeof value === 'string' && value.length < 200) {
            innerContent += `<div class="property property-${key}">${value}</div>`;
          }
        });
        innerContent += '</div>';
      }
    } else if (typeof content === 'string') {
      innerContent = content;
    }
    
    // Apply background and spacing from settings
    const style = settings ? this.generateSectionStyles(settings) : '';
    
    return `
      <section class="${sectionClasses}" ${style ? `style="${style}"` : ''} data-section-type="${type}">
        <div class="container">
          <div class="section-content">
            ${innerContent}
          </div>
        </div>
      </section>
    `;
  }
  
  /**
   * Generate inline styles from section settings
   */
  private generateSectionStyles(settings: any): string {
    const styles: string[] = [];
    
    if (settings.backgroundColor) {
      styles.push(`background-color: ${settings.backgroundColor}`);
    }
    if (settings.backgroundImage) {
      styles.push(`background-image: url('${settings.backgroundImage}')`);
      styles.push('background-size: cover');
      styles.push('background-position: center');
    }
    if (settings.paddingTop) {
      styles.push(`padding-top: ${settings.paddingTop}px`);
    }
    if (settings.paddingBottom) {
      styles.push(`padding-bottom: ${settings.paddingBottom}px`);
    }
    if (settings.margin) {
      styles.push(`margin: ${settings.margin}`);
    }
    
    return styles.join('; ');
  }

  /**
   * Render a button with proper styling classes
   */
  private renderButton(button: any, siteStyles?: any): string {
    if (!button || !button.text) return '';
    
    const variant = button.variant || 'primary';
    const href = button.href || '#';
    const text = button.text;
    const icon = button.icon;
    
    // Get button settings from site styles or defaults
    const buttonStyle = siteStyles?.button_style || 'default';
    const size = button.size || siteStyles?.[`${variant}_button_size`] || 'medium';
    const radius = button.radius || siteStyles?.[`${variant}_button_radius`] || 'slightly-rounded';
    
    // Build button classes
    const classes = [
      'btn',
      `btn-${variant}`,
      `btn-${size}`,
      `btn-radius-${radius}`,
      `btn-style-${buttonStyle}`
    ].join(' ');
    
    // Handle offset background style
    if (buttonStyle === 'offset-background' && variant !== 'text-link') {
      return `
        <div class="btn-offset-wrapper ${variant}">
          <div class="btn-offset-background btn-radius-${radius}"></div>
          <a href="${href}" class="${classes}">
            ${icon ? `<span class="btn-icon btn-icon-left">${icon}</span>` : ''}
            ${text}
          </a>
        </div>
      `;
    }
    
    // Regular button
    return `<a href="${href}" class="${classes}">
      ${icon ? `<span class="btn-icon btn-icon-left">${icon}</span>` : ''}
      ${text}
    </a>`;
  }
}