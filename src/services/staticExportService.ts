import { supabase } from '../utils/supabase';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import JSZip from 'jszip';
import { NetlifyDeploymentEngine } from './netlifyDeploymentEngine';

// Types
interface ExportedPage {
  filename: string;
  content: string;
  slug: string;
  is_homepage: boolean;
}

interface ExportedAsset {
  path: string;
  content: string;
  type: 'css' | 'image' | 'font' | 'other';
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
  [key: string]: any;
}

interface Section {
  id: string;
  type: string;
  content: any;
}

interface Page {
  id: string;
  page_name: string;
  slug: string;
  is_homepage: boolean;
  status: string;
  sections: Section[];
}

interface NavigationLink {
  id: string;
  link_text: string;
  link_type: 'page' | 'external' | 'dropdown';
  link_url?: string;
  page_id?: string;
  children?: NavigationLink[];
}

class StaticExportService {
  private deploymentEngine: NetlifyDeploymentEngine;

  constructor() {
    this.deploymentEngine = new NetlifyDeploymentEngine();
  }

  /**
   * Main export function - converts entire project to static HTML
   * Now uses NetlifyDeploymentEngine for better HTML/CSS generation
   */
  async exportProject(projectId: string): Promise<ExportResult> {
    console.log(`Starting static export for project ${projectId}`);
    
    try {
      // Use the new deployment engine for proper static site generation
      return await this.deploymentEngine.generateStaticSite(projectId);
    } catch (error) {
      console.error('Error in static export:', error);
      // Fallback to legacy method if needed
      return this.exportProjectLegacy(projectId);
    }
  }

  /**
   * Legacy export function - kept for backward compatibility
   */
  async exportProjectLegacy(projectId: string): Promise<ExportResult> {
    console.log(`Using legacy export for project ${projectId}`);
    
    try {
      // 1. Fetch project data
      const { project, pages, siteStyles, globalNav, globalFooter, navigationLinks } = 
        await this.fetchProjectData(projectId);
      
      // 2. Generate HTML for each page
      const exportedPages = await this.generateAllPages(
        pages, 
        project, 
        siteStyles, 
        globalNav, 
        globalFooter,
        navigationLinks
      );
      
      // 3. Generate CSS file from site styles
      const cssAssets = this.generateSiteStylesCSS(siteStyles);
      
      // 4. Collect other assets (images, fonts)
      const otherAssets = await this.collectProjectAssets(pages, globalNav, globalFooter);
      
      // 5. Create manifest
      const manifest = {
        projectId,
        projectName: project.project_name,
        exportedAt: new Date().toISOString(),
        pageCount: exportedPages.length,
        assetCount: cssAssets.length + otherAssets.length
      };
      
      return {
        pages: exportedPages,
        assets: [...cssAssets, ...otherAssets],
        manifest
      };
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error(`Failed to export project: ${error.message}`);
    }
  }
  
  /**
   * Fetch all project data needed for export
   */
  private async fetchProjectData(projectId: string) {
    // Fetch project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
      
    if (projectError) throw projectError;
    
    // Fetch pages
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'published')
      .order('order_index', { ascending: true });
      
    if (pagesError) throw pagesError;
    
    // Fetch site styles
    const { data: siteStyles, error: stylesError } = await supabase
      .from('site_styles')
      .select('*')
      .eq('project_id', projectId)
      .maybeSingle();
      
    if (stylesError) throw stylesError;
    
    // Fetch global sections
    let globalNav = null;
    let globalFooter = null;
    let navigationLinks: NavigationLink[] = [];
    
    if (project.global_nav_section_id) {
      const { data: navData } = await supabase
        .from('page_sections')
        .select('*')
        .eq('id', project.global_nav_section_id)
        .single();
        
      if (navData) {
        globalNav = {
          id: navData.id,
          type: navData.section_type,
          content: navData.content || {}
        };
        
        // Fetch navigation links
        const { data: linksData } = await supabase
          .from('navigation_links')
          .select('*')
          .eq('section_id', navData.id)
          .order('position', { ascending: true });
          
        if (linksData) {
          navigationLinks = this.organizeLinksHierarchy(linksData);
        }
      }
    }
    
    if (project.global_footer_section_id) {
      const { data: footerData } = await supabase
        .from('page_sections')
        .select('*')
        .eq('id', project.global_footer_section_id)
        .single();
        
      if (footerData) {
        globalFooter = {
          id: footerData.id,
          type: footerData.section_type,
          content: footerData.content || {}
        };
      }
    }
    
    return { project, pages, siteStyles, globalNav, globalFooter, navigationLinks };
  }
  
  /**
   * Organize navigation links into hierarchy
   */
  private organizeLinksHierarchy(flatLinks: any[]): NavigationLink[] {
    const linkMap = new Map<string, NavigationLink>();
    const rootLinks: NavigationLink[] = [];

    // First pass: create map of all links
    flatLinks.forEach(link => {
      linkMap.set(link.id, { ...link, children: [] });
    });

    // Second pass: organize hierarchy
    flatLinks.forEach(link => {
      const linkWithChildren = linkMap.get(link.id)!;
      
      if (link.parent_link_id) {
        const parent = linkMap.get(link.parent_link_id);
        if (parent) {
          parent.children!.push(linkWithChildren);
        }
      } else {
        rootLinks.push(linkWithChildren);
      }
    });

    return rootLinks;
  }
  
  /**
   * Generate HTML for all pages
   */
  private async generateAllPages(
    pages: Page[], 
    project: any,
    siteStyles: SiteStyles,
    globalNav: Section | null,
    globalFooter: Section | null,
    navigationLinks: NavigationLink[]
  ): Promise<ExportedPage[]> {
    const exportedPages: ExportedPage[] = [];
    
    for (const page of pages) {
      const html = await this.generatePageHTML(
        page, 
        project,
        siteStyles, 
        globalNav, 
        globalFooter,
        navigationLinks,
        pages
      );
      
      exportedPages.push({
        filename: page.is_homepage ? 'index.html' : `${page.slug}.html`,
        content: html,
        slug: page.slug,
        is_homepage: page.is_homepage
      });
    }
    
    return exportedPages;
  }
  
  /**
   * Generate static HTML for a single page
   */
  private async generatePageHTML(
    page: Page,
    project: any,
    siteStyles: SiteStyles,
    globalNav: Section | null,
    globalFooter: Section | null,
    navigationLinks: NavigationLink[],
    allPages: Page[]
  ): Promise<string> {
    // Convert navigation links to use static HTML paths
    const staticNavigationLinks = this.convertNavigationLinksToStatic(navigationLinks, allPages);
    
    // Generate the page HTML structure
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.page_name} - ${project.project_name}</title>
    <meta name="description" content="${project.project_name} - ${page.page_name}">
    
    <!-- Site Styles -->
    <link rel="stylesheet" href="/assets/css/site-styles.css">
    
    <!-- Google Fonts -->
    ${this.generateFontLinks(siteStyles)}
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
</head>
<body>
    ${globalNav ? this.renderNavigationSection(globalNav, staticNavigationLinks, siteStyles) : ''}
    
    <main>
        ${this.renderPageSections(page.sections, siteStyles)}
    </main>
    
    ${globalFooter ? this.renderFooterSection(globalFooter, siteStyles) : ''}
    
    <!-- Mobile Menu Script -->
    <script>
        // Simple mobile menu toggle
        document.addEventListener('DOMContentLoaded', function() {
            const menuButton = document.querySelector('.mobile-menu-button');
            const mobileMenu = document.querySelector('.mobile-menu');
            
            if (menuButton && mobileMenu) {
                menuButton.addEventListener('click', function() {
                    mobileMenu.classList.toggle('hidden');
                });
            }
        });
    </script>
</body>
</html>`;
    
    return html;
  }
  
  /**
   * Convert navigation links to use static HTML paths
   */
  private convertNavigationLinksToStatic(
    links: NavigationLink[], 
    allPages: Page[]
  ): NavigationLink[] {
    return links.map(link => {
      const staticLink = { ...link };
      
      if (link.link_type === 'page' && link.page_id) {
        const targetPage = allPages.find(p => p.id === link.page_id);
        if (targetPage) {
          staticLink.link_url = targetPage.is_homepage ? '/' : `/${targetPage.slug}.html`;
        }
      }
      
      if (link.children && link.children.length > 0) {
        staticLink.children = this.convertNavigationLinksToStatic(link.children, allPages);
      }
      
      return staticLink;
    });
  }
  
  /**
   * Generate font link tags
   */
  private generateFontLinks(siteStyles: SiteStyles): string {
    const fonts: string[] = [];
    
    if (siteStyles?.primary_font) {
      fonts.push(siteStyles.primary_font);
    }
    if (siteStyles?.secondary_font && siteStyles.secondary_font !== siteStyles?.primary_font) {
      fonts.push(siteStyles.secondary_font);
    }
    
    // Default fonts if none specified
    if (fonts.length === 0) {
      fonts.push('Inter', 'Playfair Display');
    }
    
    return fonts.map(font => 
      `<link href="https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap" rel="stylesheet">`
    ).join('\n    ');
  }
  
  /**
   * Render navigation section as static HTML
   */
  private renderNavigationSection(
    section: Section, 
    navigationLinks: NavigationLink[],
    siteStyles: SiteStyles
  ): string {
    // This is a simplified version - in production, we'd render the actual component
    // For now, return a basic navigation structure
    const logo = section.content?.logo || { type: 'text', text: 'Logo', href: '/' };
    
    return `
    <header class="navigation-section">
        <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" class="logo">
                ${logo.type === 'text' ? logo.text : `<img src="${logo.src}" alt="${logo.alt || 'Logo'}">`}
            </a>
            
            <div class="desktop-nav hidden md:flex items-center space-x-6">
                ${navigationLinks.map(link => this.renderNavLink(link)).join('')}
            </div>
            
            <button class="mobile-menu-button md:hidden">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
            </button>
        </nav>
        
        <div class="mobile-menu hidden md:hidden">
            ${navigationLinks.map(link => this.renderNavLink(link, true)).join('')}
        </div>
    </header>`;
  }
  
  /**
   * Render a navigation link
   */
  private renderNavLink(link: NavigationLink, isMobile: boolean = false): string {
    if (link.link_type === 'dropdown' && link.children) {
      return `
        <div class="dropdown">
            <button class="dropdown-toggle">${link.link_text}</button>
            <div class="dropdown-menu">
                ${link.children.map(child => 
                  `<a href="${child.link_url || '#'}" class="dropdown-item">${child.link_text}</a>`
                ).join('')}
            </div>
        </div>`;
    }
    
    return `<a href="${link.link_url || '#'}" class="nav-link">${link.link_text}</a>`;
  }
  
  /**
   * Render page sections
   */
  private renderPageSections(sections: Section[], siteStyles: SiteStyles): string {
    // This would need to be expanded to handle all section types
    // For now, return a placeholder
    return sections.map(section => `
        <section class="page-section ${section.type}">
            <!-- ${section.type} section content -->
        </section>
    `).join('');
  }
  
  /**
   * Render footer section
   */
  private renderFooterSection(section: Section, siteStyles: SiteStyles): string {
    return `
    <footer class="footer-section">
        <div class="container mx-auto px-4 py-8">
            <!-- Footer content -->
        </div>
    </footer>`;
  }
  
  /**
   * Generate CSS file from site styles
   */
  private generateSiteStylesCSS(siteStyles: SiteStyles): ExportedAsset[] {
    const cssVariables = this.convertStylesToCSS(siteStyles || {});
    
    const css = `:root {
${cssVariables}
}

/* Base styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: var(--primary-font, 'Inter'), sans-serif;
    line-height: 1.6;
    color: var(--text-color, #333);
    background-color: var(--background-color, #fff);
}

/* Container */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

/* Navigation styles */
.navigation-section {
    background-color: var(--nav-background, #fff);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
}

/* Add more base styles as needed */
`;
    
    return [{
      path: '/assets/css/site-styles.css',
      content: css,
      type: 'css'
    }];
  }
  
  /**
   * Convert site styles object to CSS variables
   */
  private convertStylesToCSS(styles: SiteStyles): string {
    const cssVars: string[] = [];
    
    // Map database fields to CSS variables
    const styleMapping: Record<string, string> = {
      primary_color: '--primary-color',
      secondary_color: '--secondary-color',
      accent_color: '--accent-color',
      neutral_color: '--neutral-color',
      background_color: '--background-color',
      surface_color: '--surface-color',
      text_color: '--text-color',
      primary_font: '--primary-font',
      secondary_font: '--secondary-font',
      // Add more mappings as needed
    };
    
    Object.entries(styleMapping).forEach(([dbField, cssVar]) => {
      if (styles[dbField]) {
        const value = dbField.includes('font') ? `'${styles[dbField]}'` : styles[dbField];
        cssVars.push(`    ${cssVar}: ${value};`);
      }
    });
    
    return cssVars.join('\n');
  }
  
  /**
   * Collect all assets from the project
   */
  private async collectProjectAssets(
    pages: Page[], 
    globalNav: Section | null,
    globalFooter: Section | null
  ): Promise<ExportedAsset[]> {
    const assets: ExportedAsset[] = [];
    const collectedUrls = new Set<string>();
    
    // Helper function to extract image URLs from content
    const extractImageUrls = (content: any): string[] => {
      const urls: string[] = [];
      
      if (!content) return urls;
      
      // Check common image fields
      if (content.image && typeof content.image === 'string') urls.push(content.image);
      if (content.backgroundImage && typeof content.backgroundImage === 'string') urls.push(content.backgroundImage);
      if (content.logo?.src && typeof content.logo.src === 'string') urls.push(content.logo.src);
      if (content.heroImage && typeof content.heroImage === 'string') urls.push(content.heroImage);
      
      // Check arrays of images (galleries, features, etc.)
      if (Array.isArray(content.images)) {
        content.images.forEach((img: any) => {
          if (typeof img === 'string') urls.push(img);
          else if (img.src && typeof img.src === 'string') urls.push(img.src);
          else if (img.url && typeof img.url === 'string') urls.push(img.url);
        });
      }
      
      if (Array.isArray(content.features)) {
        content.features.forEach((feature: any) => {
          if (feature.image && typeof feature.image === 'string') urls.push(feature.image);
          if (feature.icon && typeof feature.icon === 'string') urls.push(feature.icon);
        });
      }
      
      return urls.filter(url => url && !collectedUrls.has(url));
    };
    
    // Collect from all sections
    const allSections: Section[] = [];
    
    // Add global sections
    if (globalNav) allSections.push(globalNav);
    if (globalFooter) allSections.push(globalFooter);
    
    // Add page sections
    pages.forEach(page => {
      if (page.sections) {
        allSections.push(...page.sections);
      }
    });
    
    // Extract images from all sections
    for (const section of allSections) {
      const imageUrls = extractImageUrls(section.content);
      
      for (const url of imageUrls) {
        // Validate URL is a string
        if (!url || typeof url !== 'string') {
          console.warn('Invalid image URL found:', url);
          continue;
        }
        
        if (collectedUrls.has(url)) continue;
        collectedUrls.add(url);
        
        try {
          // Determine if it's an external URL or Supabase storage
          if (url.startsWith('http')) {
            // For now, we'll reference external images directly
            // In production, we might want to download and serve them
            console.log('External image found:', url);
          } else if (url.includes('supabase')) {
            // Handle Supabase storage URLs
            const filename = url.split('/').pop() || 'image';
            assets.push({
              path: `/assets/images/${filename}`,
              content: url, // For now, store the URL; we'll download later
              type: 'image'
            });
          }
        } catch (error) {
          console.error('Error processing image URL:', url, error);
        }
      }
    }
    
    // Add favicon
    assets.push({
      path: '/favicon.ico',
      content: 'data:image/x-icon;base64,', // Placeholder favicon
      type: 'other'
    });
    
    return assets;
  }
  
  /**
   * Generate a ZIP file containing all exported files
   */
  async generateDeploymentZip(exportResult: ExportResult): Promise<Blob> {
    const zip = new JSZip();
    
    // Add HTML pages
    exportResult.pages.forEach(page => {
      zip.file(page.filename, page.content);
    });
    
    // Add CSS and other assets
    exportResult.assets.forEach(asset => {
      // Remove leading slash from path
      const path = asset.path.startsWith('/') ? asset.path.slice(1) : asset.path;
      zip.file(path, asset.content);
    });
    
    // Add _redirects file for Netlify (SPA support)
    const redirects = `# Netlify redirects
/* /index.html 200`;
    zip.file('_redirects', redirects);
    
    // Add netlify.toml for build settings
    const netlifyConfig = `[build]
  publish = "/"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"`;
    zip.file('netlify.toml', netlifyConfig);
    
    // Generate the ZIP file
    const blob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });
    
    return blob;
  }
}

// Export singleton instance
export const staticExportService = new StaticExportService();

// Export types
export type { ExportResult, ExportedPage, ExportedAsset };