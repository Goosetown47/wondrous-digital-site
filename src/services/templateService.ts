import { supabase } from '@/utils/supabase';

export interface SectionTemplate {
  id: string;
  section_type: string;
  template_name: string;
  html_template: string | null;
  customizable_fields: any;
  template_engine?: string;
}

// Cache templates to avoid repeated fetches
const templateCache = new Map<string, SectionTemplate>();

/**
 * Fetch a section template by type and optional template name
 */
export async function fetchSectionTemplate(
  sectionType: string, 
  templateName?: string
): Promise<SectionTemplate | null> {
  const cacheKey = `${sectionType}:${templateName || 'default'}`;
  
  // Check cache first
  if (templateCache.has(cacheKey)) {
    return templateCache.get(cacheKey)!;
  }
  
  try {
    let query = supabase
      .from('section_templates')
      .select('*')
      .eq('section_type', sectionType)
      .eq('status', 'active');
    
    if (templateName) {
      query = query.eq('template_name', templateName);
    }
    
    const { data, error } = await query.single();
    
    if (error || !data) {
      console.warn(`No template found for ${sectionType}${templateName ? ` with name ${templateName}` : ''}`);
      return null;
    }
    
    // Cache the result
    templateCache.set(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error('Error fetching section template:', error);
    return null;
  }
}

/**
 * Clear the template cache (useful when templates are updated)
 */
export function clearTemplateCache() {
  templateCache.clear();
}

/**
 * Check if a template has an HTML template defined
 */
export function hasHtmlTemplate(template: SectionTemplate | null): boolean {
  return !!(template?.html_template);
}