import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { libraryService } from '@/lib/supabase/library';
import type { LibraryItem, LibraryItemType } from '@/types/builder';

interface UseLibraryItemsOptions {
  type?: LibraryItemType;
  published?: boolean;
  category?: string;
  search?: string;
  typeId?: string;
}

export function useLibraryItems(options: UseLibraryItemsOptions = {}) {
  return useQuery({
    queryKey: ['library-items', options],
    queryFn: () => libraryService.getItems(options),
  });
}

export function useLibraryItem(id: string) {
  return useQuery({
    queryKey: ['library-item', id],
    queryFn: () => libraryService.getById(id),
    enabled: !!id,
  });
}

export function useLibraryCategories(type?: LibraryItemType) {
  return useQuery({
    queryKey: ['library-categories', type],
    queryFn: () => libraryService.getCategories(type),
  });
}

export function useCreateLibraryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: Omit<LibraryItem, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'usage_count'>) => 
      libraryService.create(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-items'] });
    },
  });
}

export function useUpdateLibraryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { 
      id: string; 
      updates: Partial<Omit<LibraryItem, 'id' | 'created_at' | 'updated_at' | 'created_by'>> 
    }) => libraryService.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['library-items'] });
      queryClient.invalidateQueries({ queryKey: ['library-item', data.id] });
    },
  });
}

export function usePublishLibraryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) => 
      libraryService.setPublished(id, published),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['library-items'] });
      queryClient.invalidateQueries({ queryKey: ['library-item', data.id] });
    },
  });
}

export function useDeleteLibraryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => libraryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-items'] });
    },
  });
}

export function useIncrementUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => libraryService.incrementUsage(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['library-items'] });
      queryClient.invalidateQueries({ queryKey: ['library-item', id] });
    },
  });
}

export function useLibraryVersions(itemId: string) {
  return useQuery({
    queryKey: ['library-versions', itemId],
    queryFn: () => libraryService.getVersions(itemId),
    enabled: !!itemId,
  });
}

export function useCreateVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, changeNotes }: { itemId: string; changeNotes?: string }) => 
      libraryService.createVersion(itemId, changeNotes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['library-items'] });
      queryClient.invalidateQueries({ queryKey: ['library-item', data.id] });
      queryClient.invalidateQueries({ queryKey: ['library-versions', data.id] });
    },
  });
}