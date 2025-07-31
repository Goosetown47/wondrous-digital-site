import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { typesService, type CreateTypeInput, type UpdateTypeInput } from '@/lib/supabase/types';

export function useTypes(category?: string) {
  return useQuery({
    queryKey: ['types', category],
    queryFn: () => typesService.getAll(category),
  });
}

export function useTypesByCategory(category: 'section' | 'page' | 'site' | 'theme') {
  return useQuery({
    queryKey: ['types', 'category', category],
    queryFn: () => typesService.getAll(category),
    enabled: !!category,
  });
}

export function useType(id: string | null) {
  return useQuery({
    queryKey: ['type', id],
    queryFn: () => id ? typesService.getById(id) : null,
    enabled: !!id,
  });
}

export function useCreateType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTypeInput) => typesService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['types'] });
    },
  });
}

export function useUpdateType(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: UpdateTypeInput) => typesService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['types'] });
      queryClient.invalidateQueries({ queryKey: ['type', id] });
    },
  });
}

export function useDeleteType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => typesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['types'] });
    },
  });
}

export function useCheckTypeName() {
  return useMutation({
    mutationFn: ({ name, excludeId }: { name: string; excludeId?: string }) =>
      typesService.isNameAvailable(name, excludeId),
  });
}