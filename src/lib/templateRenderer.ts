/**
 * Simple Handlebars-like template renderer for Phase 2 unified rendering
 * This will be used by both React preview and deployment engine
 */

interface TemplateContext {
  [key: string]: any;
}

export class TemplateRenderer {
  /**
   * Render a template with the given context
   */
  static render(template: string, context: TemplateContext): string {
    if (!template) return '';
    
    let result = template;
    
    // Add computed variables to context
    const enrichedContext = this.enrichContext(context);
    
    // Replace {{#if}} blocks
    result = this.processIfBlocks(result, enrichedContext);
    
    // Replace {{#each}} blocks
    result = this.processEachBlocks(result, enrichedContext);
    
    // Replace simple variables {{variable}}
    result = this.processVariables(result, enrichedContext);
    
    return result;
  }
  
  /**
   * Add computed variables based on context
   */
  private static enrichContext(context: TemplateContext): TemplateContext {
    const enriched = { ...context };
    
    // Add button-related computed variables
    if (context._siteStyles) {
      enriched._buttonStyle = context._siteStyles.button_style || 'default';
      enriched._buttonSize = context._siteStyles.primary_button_size || 'medium';
      enriched._buttonRadius = context._siteStyles.primary_button_radius || 'slightly-rounded';
    }
    
    // Add feature count
    let featureCount = 0;
    if (context.feature1Heading?.text) featureCount++;
    if (context.feature2Heading?.text) featureCount++;
    if (context.feature3Heading?.text) featureCount++;
    if (context.feature4Heading?.text) featureCount++;
    enriched._featureCount = Math.max(1, featureCount);
    
    // Add emoji icons - for now, always use emoji since we don't have icon fonts
    const defaultIcons = ['⭐', '⚙️', '📞', '❤️'];
    for (let i = 1; i <= 4; i++) {
      const iconKey = `feature${i}Icon`;
      const iconData = context[iconKey] || {};
      
      // If icon is already emoji type, use its emoji value
      if (iconData.icon === 'emoji' && iconData.emoji) {
        enriched[iconKey] = {
          ...iconData,
          color: iconData.color || context._siteStyles?.primary_color || '#000000'
        };
      } else {
        // Default to emoji for now
        enriched[iconKey] = {
          ...iconData,
          icon: 'emoji',
          emoji: iconData.emoji || defaultIcons[i - 1],
          color: iconData.color || context._siteStyles?.primary_color || '#000000'
        };
      }
    }
    
    // Add section type helpers
    enriched._sectionType = context._sectionType || 'unknown';
    enriched._navClass = context._sectionType === 'navigation' ? 'navigation-mobile' : 'navigation-desktop';
    enriched._isMobile = context._sectionType === 'navigation';
    
    // Add navigation items
    if (context.items || context.links) {
      enriched._navItems = context.items || context.links || [];
    } else {
      // Default navigation items
      enriched._navItems = [
        { href: '/', text: 'Home' },
        { href: '/about', text: 'About' },
        { href: '/services', text: 'Services' },
        { href: '/contact', text: 'Contact' }
      ];
    }
    
    return enriched;
  }
  
  /**
   * Process {{#if condition}} blocks
   */
  private static processIfBlocks(template: string, context: TemplateContext): string {
    const ifRegex = /\{\{#if\s+(.+?)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    
    return template.replace(ifRegex, (match, condition, content) => {
      const value = this.getValueFromPath(condition.trim(), context);
      return this.isTruthy(value) ? content : '';
    });
  }
  
  /**
   * Process {{#each array}} blocks
   */
  private static processEachBlocks(template: string, context: TemplateContext): string {
    const eachRegex = /\{\{#each\s+(.+?)\}\}([\s\S]*?)\{\{\/each\}\}/g;
    
    return template.replace(eachRegex, (match, arrayPath, content) => {
      const array = this.getValueFromPath(arrayPath.trim(), context);
      if (!Array.isArray(array)) return '';
      
      return array.map((item, index) => {
        const itemContext = {
          ...context,
          this: item,
          '@index': index
        };
        return this.processVariables(content, itemContext);
      }).join('');
    });
  }
  
  /**
   * Process {{variable}} replacements
   */
  private static processVariables(template: string, context: TemplateContext): string {
    // First, handle special icon replacements
    let result = template;
    
    // Replace icon patterns with emoji when appropriate
    for (let i = 1; i <= 4; i++) {
      const iconKey = `feature${i}Icon`;
      const iconData = context[iconKey];
      
      if (iconData && iconData.icon === 'emoji' && iconData.emoji) {
        // Replace the entire icon element with emoji
        const iconPattern = new RegExp(
          `<i class="icon-\\{\\{${iconKey}\\.icon\\}\\}"></i>`,
          'g'
        );
        result = result.replace(iconPattern, 
          `<i class="icon-emoji" data-emoji="${iconData.emoji}">${iconData.emoji}</i>`
        );
      }
    }
    
    // Then handle regular variable replacements
    const varRegex = /\{\{([^}]+)\}\}/g;
    
    return result.replace(varRegex, (match, path) => {
      const trimmedPath = path.trim();
      
      // Handle 'this' context in loops
      if (trimmedPath.startsWith('this.')) {
        const subPath = trimmedPath.substring(5);
        return String(this.getValueFromPath(subPath, context.this || {}));
      }
      
      const value = this.getValueFromPath(trimmedPath, context);
      return value !== undefined && value !== null ? String(value) : '';
    });
  }
  
  /**
   * Get value from nested object path
   */
  private static getValueFromPath(path: string, context: any): any {
    const parts = path.split('.');
    let current = context;
    
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = current[part];
    }
    
    return current;
  }
  
  /**
   * Check if a value is truthy for template conditions
   */
  private static isTruthy(value: any): boolean {
    if (value === false || value === null || value === undefined) return false;
    if (value === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    if (typeof value === 'object' && Object.keys(value).length === 0) return false;
    return true;
  }
}

/**
 * Helper function for React components to render templates
 */
export function renderTemplate(
  template: string | null | undefined, 
  content: any, 
  siteStyles?: any,
  sectionType?: string
): string {
  if (!template) return '<div>No template available</div>';
  
  const context = {
    ...content,
    _siteStyles: siteStyles,
    _sectionType: sectionType
  };
  
  return TemplateRenderer.render(template, context);
}