import { supabase } from './client';
import type { Type } from '@/types/builder';

export interface CreateTypeInput {
  name: string;
  display_name: string;
  category: 'section' | 'page' | 'site' | 'theme';
  description?: string;
  icon?: string;
  schema?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UpdateTypeInput {
  name?: string;
  display_name?: string;
  description?: string;
  icon?: string;
  schema?: Record<string, any>;
  metadata?: Record<string, any>;
}

class TypesService {
  /**
   * Get all types, optionally filtered by category
   */
  async getAll(category?: string) {
    let query = supabase
      .from('types')
      .select('*')
      .order('category', { ascending: true })
      .order('display_name', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Type[];
  }

  /**
   * Get a single type by ID
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('types')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Type;
  }

  /**
   * Get a type by name
   */
  async getByName(name: string) {
    const { data, error } = await supabase
      .from('types')
      .select('*')
      .eq('name', name)
      .single();

    if (error) throw error;
    return data as Type;
  }

  /**
   * Create a new type
   */
  async create(input: CreateTypeInput) {
    const { data, error } = await supabase
      .from('types')
      .insert({
        ...input,
        metadata: input.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;
    return data as Type;
  }

  /**
   * Update an existing type
   */
  async update(id: string, updates: UpdateTypeInput) {
    const { data, error } = await supabase
      .from('types')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Type;
  }

  /**
   * Delete a type
   */
  async delete(id: string) {
    // First check if type is in use
    const { data: labDrafts } = await supabase
      .from('lab_drafts')
      .select('id')
      .eq('type_id', id)
      .limit(1);

    const { data: libraryItems } = await supabase
      .from('library_items')
      .select('id')
      .eq('type_id', id)
      .limit(1);

    if (labDrafts?.length || libraryItems?.length) {
      throw new Error('Cannot delete type that is in use');
    }

    const { error } = await supabase
      .from('types')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Check if a type name is available
   */
  async isNameAvailable(name: string, excludeId?: string) {
    let query = supabase
      .from('types')
      .select('id')
      .eq('name', name);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data.length === 0;
  }
}

export const typesService = new TypesService();