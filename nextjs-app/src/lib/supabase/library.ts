import { supabase } from './client';
import type { LibraryItem, LibraryItemType } from '@/types/builder';

interface LibraryFilters {
  type?: LibraryItemType;
  published?: boolean;
  category?: string;
  search?: string;
  typeId?: string;
}

class LibraryService {
  /**
   * Get library items with optional filters
   */
  async getItems(filters: LibraryFilters = {}) {
    let query = supabase
      .from('library_items')
      .select('*')
      .order('updated_at', { ascending: false });

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.published !== undefined) {
      query = query.eq('published', filters.published);
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    if (filters.typeId) {
      query = query.eq('type_id', filters.typeId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as LibraryItem[];
  }

  /**
   * Get a single library item by ID
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('library_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as LibraryItem;
  }

  /**
   * Create a new library item (usually from Lab promotion)
   */
  async create(item: Omit<LibraryItem, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'usage_count'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('library_items')
      .insert({
        ...item,
        created_by: user.id,
        usage_count: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data as LibraryItem;
  }

  /**
   * Update a library item
   */
  async update(id: string, updates: Partial<Omit<LibraryItem, 'id' | 'created_at' | 'updated_at' | 'created_by'>>) {
    const { data, error } = await supabase
      .from('library_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as LibraryItem;
  }

  /**
   * Publish or unpublish a library item
   */
  async setPublished(id: string, published: boolean) {
    const { data, error } = await supabase
      .from('library_items')
      .update({ published })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as LibraryItem;
  }

  /**
   * Delete a library item
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('library_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Increment usage count for a library item
   */
  async incrementUsage(id: string) {
    const { data: item } = await this.getById(id);
    if (!item) throw new Error('Library item not found');

    const { error } = await supabase
      .from('library_items')
      .update({ usage_count: (item.usage_count || 0) + 1 })
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Get categories for a specific type
   */
  async getCategories(type?: LibraryItemType) {
    let query = supabase
      .from('library_items')
      .select('category')
      .not('category', 'is', null);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Extract unique categories
    const categories = [...new Set(data.map(item => item.category))].filter(Boolean);
    return categories as string[];
  }

  /**
   * Create a new version of a library item
   */
  async createVersion(itemId: string, changeNotes?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get current item
    const item = await this.getById(itemId);
    if (!item) throw new Error('Library item not found');

    // Create version record
    const { error: versionError } = await supabase
      .from('library_versions')
      .insert({
        library_item_id: itemId,
        version: item.version,
        content: item.content,
        change_notes: changeNotes,
        created_by: user.id,
      });

    if (versionError) throw versionError;

    // Increment version on main item
    const { data, error } = await supabase
      .from('library_items')
      .update({ version: item.version + 1 })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data as LibraryItem;
  }

  /**
   * Get version history for a library item
   */
  async getVersions(itemId: string) {
    const { data, error } = await supabase
      .from('library_versions')
      .select('*')
      .eq('library_item_id', itemId)
      .order('version', { ascending: false });

    if (error) throw error;
    return data;
  }
}

export const libraryService = new LibraryService();