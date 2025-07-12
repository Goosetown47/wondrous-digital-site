import { GOOGLE_FONTS, getPopularFonts } from '../data/google-fonts';

// Global font loading state
class FontPreloader {
  private loadedFonts = new Set<string>();
  private loadingFonts = new Set<string>();
  private preloadedFonts = new Set<string>();

  // Preload popular fonts when the app starts
  async preloadPopularFonts(): Promise<void> {
    const popularFonts = getPopularFonts();
    const fontPromises = popularFonts.map(font => this.preloadFont(font.name));
    
    try {
      await Promise.all(fontPromises);
      console.log(`Preloaded ${popularFonts.length} popular fonts`);
    } catch (error) {
      console.warn('Some fonts failed to preload:', error);
    }
  }

  // Preload fonts for a specific category
  async preloadCategoryFonts(category: string): Promise<void> {
    const categoryFonts = GOOGLE_FONTS.filter(font => font.category === category);
    
    // Load popular fonts first for immediate display, then load the rest progressively
    const popularFonts = categoryFonts.filter(font => font.popular);
    const otherFonts = categoryFonts.filter(font => !font.popular);
    
    try {
      // Load popular fonts first with high priority
      if (popularFonts.length > 0) {
        await Promise.all(popularFonts.map(font => this.preloadFont(font.name)));
      }
      
      // Load remaining fonts progressively (don't wait for all to complete)
      if (otherFonts.length > 0) {
        // Load in batches to avoid overwhelming the browser
        const batchSize = 5;
        for (let i = 0; i < otherFonts.length; i += batchSize) {
          const batch = otherFonts.slice(i, i + batchSize);
          // Don't await here - let them load in background
          Promise.all(batch.map(font => this.preloadFont(font.name))).catch(error => {
            console.warn(`Batch ${i / batchSize + 1} of ${category} fonts failed to preload:`, error);
          });
          
          // Small delay between batches to prevent overwhelming
          if (i + batchSize < otherFonts.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }
    } catch (error) {
      console.warn(`Some ${category} fonts failed to preload:`, error);
    }
  }

  // Preload a single font
  async preloadFont(fontName: string): Promise<void> {
    if (this.preloadedFonts.has(fontName) || this.loadingFonts.has(fontName)) {
      return;
    }

    this.loadingFonts.add(fontName);

    return new Promise((resolve, reject) => {
      const formattedName = fontName.replace(/\s+/g, '+');
      
      // Check if already loaded in DOM
      const existingLink = document.querySelector(`link[href*="${formattedName}"]`);
      if (existingLink) {
        this.preloadedFonts.add(fontName);
        this.loadingFonts.delete(fontName);
        resolve();
        return;
      }

      // Create preload link for faster loading
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'style';
      preloadLink.href = `https://fonts.googleapis.com/css2?family=${formattedName}:wght@400;700&display=swap`;
      preloadLink.crossOrigin = 'anonymous';
      
      // Create the actual stylesheet link
      const styleLink = document.createElement('link');
      styleLink.rel = 'stylesheet';
      styleLink.href = `https://fonts.googleapis.com/css2?family=${formattedName}:wght@400;700&display=swap`;
      styleLink.crossOrigin = 'anonymous';

      styleLink.onload = () => {
        this.preloadedFonts.add(fontName);
        this.loadingFonts.delete(fontName);
        resolve();
      };

      styleLink.onerror = () => {
        this.loadingFonts.delete(fontName);
        reject(new Error(`Failed to load font: ${fontName}`));
      };

      // Add preconnect links if not already present
      this.ensurePreconnectLinks();

      // Add both links to head
      document.head.appendChild(preloadLink);
      document.head.appendChild(styleLink);
    });
  }

  // Load a font with full weight range (for actual use)
  async loadFont(fontName: string): Promise<void> {
    if (this.loadedFonts.has(fontName) || this.loadingFonts.has(fontName)) {
      return;
    }

    this.loadingFonts.add(fontName);

    return new Promise((resolve, reject) => {
      const formattedName = fontName.replace(/\s+/g, '+');
      
      // Check if full font is already loaded
      const existingLink = document.querySelector(`link[href*="${formattedName}:wght@300;400;500;600;700;800;900"]`);
      if (existingLink) {
        this.loadedFonts.add(fontName);
        this.loadingFonts.delete(fontName);
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${formattedName}:wght@300;400;500;600;700;800;900&display=swap`;
      link.crossOrigin = 'anonymous';

      link.onload = () => {
        this.loadedFonts.add(fontName);
        this.loadingFonts.delete(fontName);
        resolve();
      };

      link.onerror = () => {
        this.loadingFonts.delete(fontName);
        reject(new Error(`Failed to load font: ${fontName}`));
      };

      this.ensurePreconnectLinks();
      document.head.appendChild(link);
    });
  }

  // Check if a font is preloaded
  isFontPreloaded(fontName: string): boolean {
    return this.preloadedFonts.has(fontName);
  }

  // Check if a font is fully loaded
  isFontLoaded(fontName: string): boolean {
    return this.loadedFonts.has(fontName);
  }

  // Check if a font is currently loading
  isFontLoading(fontName: string): boolean {
    return this.loadingFonts.has(fontName);
  }

  // Get all preloaded fonts
  getPreloadedFonts(): string[] {
    return Array.from(this.preloadedFonts);
  }

  // Ensure preconnect links exist
  private ensurePreconnectLinks(): void {
    const preconnectExists = document.querySelector('link[href="https://fonts.googleapis.com"]');
    if (!preconnectExists) {
      const preconnect1 = document.createElement('link');
      preconnect1.rel = 'preconnect';
      preconnect1.href = 'https://fonts.googleapis.com';
      document.head.appendChild(preconnect1);

      const preconnect2 = document.createElement('link');
      preconnect2.rel = 'preconnect';
      preconnect2.href = 'https://fonts.gstatic.com';
      preconnect2.crossOrigin = 'anonymous';
      document.head.appendChild(preconnect2);
    }
  }
}

// Create singleton instance
export const fontPreloader = new FontPreloader();

// Auto-start preloading popular fonts when module loads
fontPreloader.preloadPopularFonts();

export default fontPreloader;