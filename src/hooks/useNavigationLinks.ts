import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useProject } from '../contexts/ProjectContext';

export interface NavigationLink {
  id: string;
  section_id: string;
  project_id?: string;
  parent_link_id?: string;
  link_type: 'page' | 'external' | 'dropdown';
  link_text: string;
  link_url?: string;
  page_id?: string;
  external_new_tab?: boolean;
  show_external_icon?: boolean;
  external_icon_color?: string;
  dropdown_behavior?: 'link' | 'passthrough';
  position: number;
  created_at: string;
  updated_at: string;
  children?: NavigationLink[];
}

export const organizeLinksHierarchy = (flatLinks: NavigationLink[]): NavigationLink[] => {
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
      // This is a child link
      const parent = linkMap.get(link.parent_link_id);
      if (parent) {
        parent.children!.push(linkWithChildren);
      }
    } else {
      // This is a root link
      rootLinks.push(linkWithChildren);
    }
  });

  return rootLinks;
};

export function useNavigationLinks(sectionId?: string) {
  const { selectedProject } = useProject();
  const [links, setLinks] = useState<NavigationLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sectionId && selectedProject?.id) {
      fetchNavigationLinks();
    } else {
      setLoading(false);
    }
  }, [sectionId, selectedProject?.id]);

  const fetchNavigationLinks = async () => {
    if (!sectionId || !selectedProject?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('navigation_links')
        .select('*')
        .eq('section_id', sectionId)
        .eq('project_id', selectedProject.id)
        .order('position', { ascending: true });

      if (fetchError) throw fetchError;

      // Organize links into hierarchy (parent-child relationships)
      const organizedLinks = organizeLinksHierarchy(data || []);
      setLinks(organizedLinks);
    } catch (err) {
      console.error('Error fetching navigation links:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch navigation links');
    } finally {
      setLoading(false);
    }
  };

  const createNavigationLink = async (newLink: Omit<NavigationLink, 'id' | 'created_at' | 'updated_at'>) => {
    if (!selectedProject?.id) {
      console.error('Cannot create navigation link: No selected project');
      return { 
        data: null, 
        error: 'No project selected' 
      };
    }

    try {
      const linkWithProject = {
        ...newLink,
        project_id: selectedProject.id
      };
      
      
      const { data, error: insertError } = await supabase
        .from('navigation_links')
        .insert([linkWithProject])
        .select()
        .single();

      if (insertError) {
        console.error('Supabase insert error details:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        });
        throw insertError;
      }

      await fetchNavigationLinks(); // Refresh the list
      return { data, error: null };
    } catch (err) {
      console.error('Error creating navigation link:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Failed to create navigation link' 
      };
    }
  };

  const updateNavigationLink = async (id: string, updates: Partial<NavigationLink>) => {
    try {
      // Filter out read-only fields that shouldn't be updated
      const { id: _, created_at, updated_at, children, ...updateData } = updates;
      
      const { data, error: updateError } = await supabase
        .from('navigation_links')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Supabase update error details:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        });
        throw updateError;
      }

      await fetchNavigationLinks(); // Refresh the list
      return { data, error: null };
    } catch (err) {
      console.error('Error updating navigation link:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Failed to update navigation link' 
      };
    }
  };

  const deleteNavigationLink = async (id: string) => {
    console.log('🔍 DELETE NAV LINK START:', { id, projectId: selectedProject?.id });
    
    if (!selectedProject?.id) {
      console.error('Cannot delete navigation link: No selected project');
      return { 
        error: 'No project selected' 
      };
    }

    try {
      // First, delete any child links (with project_id filtering for security)
      console.log('🔍 Deleting child links for parent:', id);
      const { data: deletedChildren, error: childDeleteError } = await supabase
        .from('navigation_links')
        .delete()
        .eq('parent_link_id', id)
        .eq('project_id', selectedProject.id)
        .select();

      console.log('🔍 Child delete result:', { deletedChildren, childDeleteError });

      if (childDeleteError) {
        console.error('Error deleting child links:', childDeleteError);
        throw childDeleteError;
      }

      // Then delete the parent link (with project_id filtering for security)
      console.log('🔍 Deleting main link:', id);
      const { data: deletedLink, error: deleteError } = await supabase
        .from('navigation_links')
        .delete()
        .eq('id', id)
        .eq('project_id', selectedProject.id)
        .select();

      console.log('🔍 Main delete result:', { deletedLink, deleteError });

      if (deleteError) {
        console.error('Error deleting parent link:', deleteError);
        throw deleteError;
      }

      console.log('🔍 Refreshing navigation links...');
      await fetchNavigationLinks(); // Refresh the list
      return { error: null };
    } catch (err) {
      console.error('Error deleting navigation link:', err);
      return { 
        error: err instanceof Error ? err.message : 'Failed to delete navigation link' 
      };
    }
  };

  const reorderNavigationLinks = async (reorderedLinks: NavigationLink[]) => {
    try {
      // Flatten the hierarchy and assign new positions
      const flatLinks: { id: string; position: number; parent_link_id?: string }[] = [];
      let position = 1;

      const flattenLinks = (links: NavigationLink[], parentId?: string) => {
        links.forEach(link => {
          flatLinks.push({
            id: link.id,
            position: position++,
            parent_link_id: parentId
          });

          if (link.children && link.children.length > 0) {
            flattenLinks(link.children, link.id);
          }
        });
      };

      flattenLinks(reorderedLinks);

      // Update all positions in parallel
      const updatePromises = flatLinks.map(({ id, position, parent_link_id }) =>
        supabase
          .from('navigation_links')
          .update({ position, parent_link_id })
          .eq('id', id)
      );

      const results = await Promise.all(updatePromises);
      
      // Check for errors
      const hasError = results.some(result => result.error);
      if (hasError) {
        throw new Error('Failed to update positions');
      }

      await fetchNavigationLinks(); // Refresh the list
      return { error: null };
    } catch (err) {
      console.error('Error reordering navigation links:', err);
      return { 
        error: err instanceof Error ? err.message : 'Failed to reorder navigation links' 
      };
    }
  };

  return {
    links,
    loading,
    error,
    refetch: fetchNavigationLinks,
    createNavigationLink,
    updateNavigationLink,
    deleteNavigationLink,
    reorderNavigationLinks
  };
}