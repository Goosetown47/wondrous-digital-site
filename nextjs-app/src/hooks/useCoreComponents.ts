import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coreComponentsService, type ComponentFilters, type CreateComponentInput, type UpdateComponentInput } from '@/lib/supabase/core-components';

// Query keys
const COMPONENTS_KEY = 'core-components';

// Hooks
export function useCoreComponents(filters?: ComponentFilters) {
  return useQuery({
    queryKey: [COMPONENTS_KEY, filters],
    queryFn: () => coreComponentsService.getComponents(filters),
  });
}

export function useCoreComponent(id: string) {
  return useQuery({
    queryKey: [COMPONENTS_KEY, id],
    queryFn: () => coreComponentsService.getComponent(id),
    enabled: !!id,
  });
}

export function useCreateComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateComponentInput) => coreComponentsService.createComponent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMPONENTS_KEY] });
    },
  });
}

export function useUpdateComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateComponentInput) => coreComponentsService.updateComponent(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [COMPONENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [COMPONENTS_KEY, data.id] });
    },
  });
}

export function useDeleteComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => coreComponentsService.deleteComponent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMPONENTS_KEY] });
    },
  });
}

export function useSearchComponents(searchTerm: string) {
  return useQuery({
    queryKey: [COMPONENTS_KEY, 'search', searchTerm],
    queryFn: () => coreComponentsService.searchComponents(searchTerm),
    enabled: searchTerm.length > 0,
  });
}