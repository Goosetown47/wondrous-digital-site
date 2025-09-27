import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NavigationMenu } from '@/types/navigation';

// Fetch navigation menus for a project
export function useNavigationMenus(projectId: string | null) {
  return useQuery({
    queryKey: ['navigation', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const response = await fetch(`/api/navigation?projectId=${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch navigation menus');
      }
      return response.json() as Promise<NavigationMenu[]>;
    },
    enabled: !!projectId,
  });
}

// Get a single navigation menu
export function useNavigationMenu(id: string | null) {
  return useQuery({
    queryKey: ['navigation', id],
    queryFn: async () => {
      if (!id) return null;
      
      const response = await fetch(`/api/navigation/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch navigation menu');
      }
      return response.json() as Promise<NavigationMenu>;
    },
    enabled: !!id,
  });
}

// Create a navigation menu
export function useCreateNavigationMenu() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (menu: Omit<NavigationMenu, 'id' | 'created_at' | 'updated_at'>) => {
      const response = await fetch('/api/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menu),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create navigation menu');
      }
      
      return response.json() as Promise<NavigationMenu>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['navigation', data.project_id] });
    },
  });
}

// Update a navigation menu
export function useUpdateNavigationMenu() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<Omit<NavigationMenu, 'id' | 'created_at' | 'updated_at'>> 
    }) => {
      const response = await fetch(`/api/navigation/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update navigation menu');
      }
      
      return response.json() as Promise<NavigationMenu>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['navigation', data.id] });
      queryClient.invalidateQueries({ queryKey: ['navigation', data.project_id] });
    },
  });
}

// Delete a navigation menu
export function useDeleteNavigationMenu() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const response = await fetch(`/api/navigation/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete navigation menu');
      }
      
      return { id, projectId };
    },
    onSuccess: ({ projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['navigation', projectId] });
    },
  });
}

// Activate a navigation menu
export function useActivateNavigationMenu() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const response = await fetch(`/api/navigation/${id}/activate`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to activate navigation menu');
      }
      
      return { id, projectId };
    },
    onSuccess: ({ projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['navigation', projectId] });
    },
  });
}

// Get active navigation for a project
export function useActiveNavigation(projectId: string | null, type?: 'header' | 'footer' | 'sidebar') {
  const { data: menus } = useNavigationMenus(projectId);
  
  const [activeMenus, setActiveMenus] = useState<NavigationMenu[]>([]);
  
  useEffect(() => {
    if (menus) {
      const active = menus.filter(menu => {
        if (type) {
          return menu.is_active && menu.type === type;
        }
        return menu.is_active;
      });
      setActiveMenus(active);
    }
  }, [menus, type]);
  
  return activeMenus;
}