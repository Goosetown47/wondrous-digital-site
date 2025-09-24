'use client';

import { useQuery } from '@tanstack/react-query';
import { ComponentRegistry } from '@/lib/component-registry';
import type { CoreComponent } from '@/types/builder';
import type { EditableFieldConfig } from '@/lib/component-registry';

/**
 * Hook to get component configuration, first from registry, then from database
 */
export function useComponentConfig(componentName: string) {
  // First check the registry for hardcoded config
  const registryConfig = ComponentRegistry.get(componentName);

  // Query database for component config if not in registry or missing editable_fields
  const { data: dbComponent } = useQuery<CoreComponent | null>({
    queryKey: ['component-config', componentName],
    queryFn: async () => {
      // If we have full config in registry, no need to query DB
      if (registryConfig?.editableFields && registryConfig.editableFields.length > 0) {
        return null;
      }

      try {
        const response = await fetch(`/api/core-components/by-name/${componentName}`);
        if (!response.ok) return null;
        return response.json();
      } catch {
        return null;
      }
    },
    enabled: !registryConfig?.editableFields || registryConfig.editableFields.length === 0,
    staleTime: Infinity, // Component config doesn't change often
  });

  // Merge registry and database config
  const mergedConfig = {
    ...registryConfig,
    // Cast database fields to proper type
    editableFields: (dbComponent?.editable_fields as EditableFieldConfig[] || registryConfig?.editableFields || []),
    defaultContent: dbComponent?.default_content || registryConfig?.defaultContent || {},
  };

  return mergedConfig;
}