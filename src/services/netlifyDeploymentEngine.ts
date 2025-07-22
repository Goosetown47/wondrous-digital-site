import { supabase } from '../utils/supabase';
import JSZip from 'jszip';
import { renderTemplate } from '../lib/templateRenderer';
import { fetchSectionTemplate, hasHtmlTemplate } from './templateService';
import { generateTemplateCSS } from '../styles/templateStyles';

// Types
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
  sections: Section[];
}

interface Project {
  id: string;
  project_name: string;
  site_styles: SiteStyles;
}

export class NetlifyDeploymentEngine {
  /**
   * Generate a complete static site from project data
   */
  async generateStaticSite(projectId: string): Promise<ExportResult> {
    // Fetch project data
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      throw new Error('Project not found');
    }

    // Fetch site styles from the separate site_styles table
    const { data: siteStyles, error: stylesError } = await supabase
      .from('site_styles')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (stylesError) {
      console.error('Failed to fetch site styles:', stylesError);
    }

    // Add site_styles to project object for backward compatibility
    project.site_styles = siteStyles || {};

    // Fetch all published pages
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'published')
      .order('order_index', { ascending: true });

    if (pagesError || !pages || pages.length === 0) {
      throw new Error('No published pages found');
    }

    // Fetch sections for all pages
    const pageIds = pages.map(p => p.id);
    const { data: sections, error: sectionsError } = await supabase
      .from('page_sections')
      .select('*')
      .in('page_id', pageIds)
      .order('order_index', { ascending: true });

    if (sectionsError) {
      throw new Error('Failed to fetch page sections');
    }

    // Group sections by page
    const sectionsByPage = sections?.reduce((acc: any, section: any) => {
      if (!acc[section.page_id]) acc[section.page_id] = [];
      acc[section.page_id].push(section);
      return acc;
    }, {}) || {};

    // Generate CSS from site styles using shared module
    const templateCss = generateTemplateCSS(project.site_styles || {});

    // Collect all assets from sections
    const allAssets: ExportedAsset[] = [];
    const imageUrls = new Set<string>();

    // Generate HTML for each page
    const pagePromises = pages.map(async page => {
      // Check for embedded sections first (from PageBuilder)
      let pageSections: Section[] = [];
      
      if (page.sections && Array.isArray(page.sections) && page.sections.length > 0) {
        // Use embedded sections from page builder
        console.log(`Using ${page.sections.length} embedded sections for page ${page.page_name}`);
        pageSections = page.sections.map((section: any, index: number) => ({
          id: section.id || `embedded-${index}`,
          type: section.type,
          content: section.content,
          settings: section.settings || {}
        }));
      } else {
        // Fall back to page_sections table
        pageSections = sectionsByPage[page.id] || [];
      }
      
      // Collect images from this page
      pageSections.forEach(section => {
        const images = this.extractImagesFromSection(section);
        images.forEach(url => imageUrls.add(url));
      });

      const htmlContent = await this.generatePageHTML(
        page,
        pageSections,
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
      content: templateCss,
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
   * Generate HTML for a complete page
   */
  private async generatePageHTML(
    page: Page,
    sections: Section[],
    siteStyles: SiteStyles,
    projectName: string
  ): Promise<string> {
    const title = page.page_name || projectName;
    const sectionPromises = sections.map(section => 
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
    
    // Try to fetch template first
    const template = await fetchSectionTemplate(type);
    if (template && hasHtmlTemplate(template)) {
      // Use template renderer
      return renderTemplate(template.html_template, content, siteStyles, type);
    }
    
    // Fall back to manual rendering
    const sectionClasses = ['section', `section-${type}`].join(' ');
    
    switch (type) {
      case 'hero':
        return this.renderHeroSection(content, settings);
      
      case 'text':
        return this.renderTextSection(content, settings);
      
      case 'image':
        return this.renderImageSection(content, settings);
      
      case 'cards':
        return this.renderCardsSection(content, settings);
      
      case 'cta':
        return this.renderCTASection(content, settings);
      
      case 'features':
        return this.renderFeaturesSection(content, settings);
      
      default:
        // Fallback for unknown section types
        return `
          <section class="${sectionClasses}">
            <div class="container">
              <div class="section-content">
                ${JSON.stringify(content)}
              </div>
            </div>
          </section>
        `;
    }
  }

  /**
   * Render hero section
   */
  private renderHeroSection(content: any, settings: any): string {
    const { 
      heading = 'Welcome', 
      subheading = '', 
      buttonText = 'Get Started',
      buttonLink = '#',
      backgroundImage = ''
    } = content;

    const backgroundStyle = backgroundImage 
      ? `style="background-image: url('${backgroundImage}'); background-size: cover; background-position: center;"`
      : '';

    return `
    <section class="section section-hero hero" ${backgroundStyle}>
      <div class="container">
        <div class="hero-content">
          <h1>${heading}</h1>
          ${subheading ? `<p>${subheading}</p>` : ''}
          ${buttonText ? `<a href="${buttonLink}" class="btn btn-primary">${buttonText}</a>` : ''}
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
  private renderCardsSection(content: any, settings: any): string {
    const { 
      heading = '',
      cards = []
    } = content;

    const cardsHTML = cards.map((card: any) => `
      <div class="card">
        ${card.image ? `<img src="${card.image}" alt="${card.title || 'Card image'}" class="card-image mb-3">` : ''}
        ${card.title ? `<h3>${card.title}</h3>` : ''}
        ${card.description ? `<p class="mt-2">${card.description}</p>` : ''}
        ${card.buttonText ? `<a href="${card.buttonLink || '#'}" class="btn btn-primary mt-3">${card.buttonText}</a>` : ''}
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
  private renderCTASection(content: any, settings: any): string {
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
          <a href="${buttonLink}" class="btn btn-primary">${buttonText}</a>
        </div>
      </div>
    </section>
    `;
  }

  /**
   * Render features section
   */
  private renderFeaturesSection(content: any, settings: any): string {
    const { 
      tagline = {},
      mainHeading = { text: 'Features' },
      description = { text: '' },
      feature1Heading = { text: 'Feature 1' },
      feature1Description = { text: '' },
      feature2Heading = { text: 'Feature 2' },
      feature2Description = { text: '' },
      feature3Heading = { text: 'Feature 3' },
      feature3Description = { text: '' },
      feature4Heading = { text: 'Feature 4' },
      feature4Description = { text: '' }
    } = content;

    return `
    <section class="section section-features">
      <div class="container">
        ${tagline?.text ? `<p class="tagline">${tagline.text}</p>` : ''}
        ${mainHeading?.text ? `<h2>${mainHeading.text}</h2>` : ''}
        ${description?.text ? `<p class="description">${description.text}</p>` : ''}
        
        <div class="grid grid-cols-4">
          <div class="feature-item">
            <div class="feature-icon">📌</div>
            <h3>${feature1Heading.text}</h3>
            <p>${feature1Description.text}</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📌</div>
            <h3>${feature2Heading.text}</h3>
            <p>${feature2Description.text}</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📌</div>
            <h3>${feature3Heading.text}</h3>
            <p>${feature3Description.text}</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📌</div>
            <h3>${feature4Heading.text}</h3>
            <p>${feature4Description.text}</p>
          </div>
        </div>
      </div>
    </section>
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

    return images.filter(url => url && typeof url === 'string');
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
      .filter(p => !p.is_homepage)
      .map(p => `  [[redirects]]\n    from = "/${p.slug}"\n    to = "/${p.slug}.html"\n    status = 200`)
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
   * Create a deployment ZIP file
   */
  async createDeploymentZip(exportResult: ExportResult): Promise<Blob> {
    const zip = new JSZip();

    // Add all pages
    exportResult.pages.forEach(page => {
      zip.file(page.filename, page.content);
    });

    // Add all assets
    exportResult.assets.forEach(asset => {
      zip.file(asset.path, asset.content);
    });

    // Add manifest
    zip.file('manifest.json', JSON.stringify(exportResult.manifest, null, 2));

    // Generate ZIP as Blob
    return await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
  }
}