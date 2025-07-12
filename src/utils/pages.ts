import { supabase } from './supabase';

// Define Page interface
export interface Page {
  id?: string;
  project_id: string;
  page_name: string;
  slug: string;
  page_type?: string | null;
  status: 'draft' | 'published';
  sections?: any[] | null;
  created_at?: string;
  updated_at?: string;
  meta_title?: string;
  meta_description?: string;
}

// Pages Service object
export const pagesService = {
  // Get all pages for a project
  async getPages(projectId: string) {
    const { data, error, count } = await supabase
      .from('pages')
      .select('*', { count: 'exact' })
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false });
      
    if (error) throw error;
    
    return {
      pages: data || [],
      totalCount: count || 0
    };
  },
  
  // Get a single page by ID
  async getPageById(id: string) {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  // Get a single page by slug for a specific project
  async getPageBySlug(projectId: string, slug: string) {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('project_id', projectId)
      .eq('slug', slug)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  // Create a new page
  async createPage(page: Omit<Page, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('pages')
      .insert([page])
      .select('*')
      .single();
      
    if (error) throw error;
    return data;
  },
  
  // Update a page
  async updatePage(id: string, page: Partial<Page>) {
    const { data, error } = await supabase
      .from('pages')
      .update(page)
      .eq('id', id)
      .select('*')
      .single();
      
    if (error) throw error;
    return data;
  },
  
  // Delete a page
  async deletePage(id: string) {
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  },
  
  // Check if a slug is unique for a project
  async isSlugUnique(projectId: string, slug: string, excludePageId?: string) {
    let query = supabase
      .from('pages')
      .select('id')
      .eq('project_id', projectId)
      .eq('slug', slug);
      
    if (excludePageId) {
      query = query.neq('id', excludePageId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data.length === 0;
  },
  
  // Generate a unique slug
  async generateUniqueSlug(projectId: string, baseName: string) {
    const slug = baseName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim(); // Remove leading/trailing spaces
      
    const isUnique = await this.isSlugUnique(projectId, slug);
    
    if (isUnique) {
      return slug;
    }
    
    // Try appending numbers until we find a unique slug
    let counter = 1;
    let newSlug = `${slug}-${counter}`;
    
    while (!(await this.isSlugUnique(projectId, newSlug))) {
      counter++;
      newSlug = `${slug}-${counter}`;
    }
    
    return newSlug;
  }
};