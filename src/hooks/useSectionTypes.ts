import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export interface SectionType {
  id: string;
  type_key: string;
  display_name: string;
  icon_name: string;
  description: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useSectionTypes() {
  const [sectionTypes, setSectionTypes] = useState<SectionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSectionTypes();
  }, []);

  const fetchSectionTypes = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('section_types')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (fetchError) throw fetchError;

      setSectionTypes(data || []);
    } catch (err) {
      console.error('Error fetching section types:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch section types');
    } finally {
      setLoading(false);
    }
  };

  const createSectionType = async (newType: Omit<SectionType, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('section_types')
        .insert([newType])
        .select()
        .single();

      if (insertError) throw insertError;

      setSectionTypes(prev => [...prev, data]);
      return { data, error: null };
    } catch (err) {
      console.error('Error creating section type:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Failed to create section type' 
      };
    }
  };

  const updateSectionType = async (id: string, updates: Partial<SectionType>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('section_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setSectionTypes(prev => prev.map(type => type.id === id ? data : type));
      return { data, error: null };
    } catch (err) {
      console.error('Error updating section type:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Failed to update section type' 
      };
    }
  };

  const deleteSectionType = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('section_types')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setSectionTypes(prev => prev.filter(type => type.id !== id));
      return { error: null };
    } catch (err) {
      console.error('Error deleting section type:', err);
      return { 
        error: err instanceof Error ? err.message : 'Failed to delete section type' 
      };
    }
  };

  const reorderSectionTypes = async (reorderedTypes: SectionType[]) => {
    try {
      // Update local state immediately for optimistic UI
      setSectionTypes(reorderedTypes);

      // Prepare batch updates
      const updates = reorderedTypes.map((type, index) => ({
        id: type.id,
        order_index: index + 1
      }));

      // Update all order indexes in parallel
      const updatePromises = updates.map(({ id, order_index }) =>
        supabase
          .from('section_types')
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
      console.error('Error reordering section types:', err);
      // Revert on error
      fetchSectionTypes();
      return { 
        error: err instanceof Error ? err.message : 'Failed to reorder section types' 
      };
    }
  };

  return {
    sectionTypes,
    loading,
    error,
    refetch: fetchSectionTypes,
    createSectionType,
    updateSectionType,
    deleteSectionType,
    reorderSectionTypes
  };
}