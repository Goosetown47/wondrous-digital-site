import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export interface SectionCategory {
  id: string;
  category_key: string;
  display_name: string;
  description: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useSectionCategories() {
  const [categories, setCategories] = useState<SectionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('section_categories')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (fetchError) throw fetchError;

      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching section categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch section categories');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (newCategory: Omit<SectionCategory, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('section_categories')
        .insert([newCategory])
        .select()
        .single();

      if (insertError) throw insertError;

      setCategories(prev => [...prev, data]);
      return { data, error: null };
    } catch (err) {
      console.error('Error creating section category:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Failed to create section category' 
      };
    }
  };

  const updateCategory = async (id: string, updates: Partial<SectionCategory>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('section_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setCategories(prev => prev.map(cat => cat.id === id ? data : cat));
      return { data, error: null };
    } catch (err) {
      console.error('Error updating section category:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Failed to update section category' 
      };
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('section_categories')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setCategories(prev => prev.filter(cat => cat.id !== id));
      return { error: null };
    } catch (err) {
      console.error('Error deleting section category:', err);
      return { 
        error: err instanceof Error ? err.message : 'Failed to delete section category' 
      };
    }
  };

  const reorderCategories = async (reorderedCategories: SectionCategory[]) => {
    try {
      // Update local state immediately for optimistic UI
      setCategories(reorderedCategories);

      // Prepare batch updates
      const updates = reorderedCategories.map((category, index) => ({
        id: category.id,
        order_index: index + 1
      }));

      // Update all order indexes in parallel
      const updatePromises = updates.map(({ id, order_index }) =>
        supabase
          .from('section_categories')
          .update({ order_index })
          .eq('id', id)
      );

      const results = await Promise.all(updatePromises);
      
      // Check for errors
      const hasError = results.some(result => result.error);
      if (hasError) {
        throw new Error('Failed to update order');
      }

      return { error: null };
    } catch (err) {
      console.error('Error reordering categories:', err);
      // Revert on error
      fetchCategories();
      return { 
        error: err instanceof Error ? err.message : 'Failed to reorder categories' 
      };
    }
  };

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories
  };
}