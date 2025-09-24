/**
 * Component Usage Service
 *
 * Tracks how Core components are used throughout the platform
 * Prevents deletion of components that are in use
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { getAllVariations } from './naming-service';

export interface ComponentUsage {
  componentName: string;
  totalUsage: number;
  draftCount: number;
  libraryCount: number;
  isInUse: boolean;
}

export interface DetailedComponentUsage extends ComponentUsage {
  drafts: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
  }>;
  libraryItems: Array<{
    id: string;
    name: string;
    type: string;
    published: boolean;
  }>;
}

// Simple in-memory cache with 5 second TTL
const usageCache = new Map<string, { data: ComponentUsage; timestamp: number }>();
const CACHE_TTL = 5000; // 5 seconds

/**
 * Get usage statistics for a single component
 */
export async function getComponentUsage(componentName: string): Promise<ComponentUsage> {
  // Check cache first
  const cached = usageCache.get(componentName);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const serviceClient = createAdminClient();

  try {
    // Get all possible variations of this component name for matching
    const variations = getAllVariations(componentName);
    console.log(`[Usage] Checking usage for "${componentName}"`);
    console.log(`[Usage] Variations to check:`, variations);

    // Build query conditions for all variations
    const labDraftConditions = variations
      .map(name => `metadata->>component_name.eq.${name}`)
      .join(',');

    console.log(`[Usage] Lab draft query conditions:`, labDraftConditions);

    // Query lab_drafts for usage in metadata.component_name
    const { data: drafts, error: draftsError } = await serviceClient
      .from('lab_drafts')
      .select('id, name, metadata')
      .or(labDraftConditions);

    if (draftsError) {
      console.error('[Usage] Error querying lab_drafts:', draftsError);
      throw draftsError;
    }

    interface DraftMetadata {
      component_name?: string;
    }

    console.log(`[Usage] Found ${drafts?.length || 0} drafts using component`);
    if (drafts && drafts.length > 0) {
      console.log(`[Usage] Draft examples:`, drafts.slice(0, 2).map(d => ({
        name: d.name,
        component_name: (d.metadata as DraftMetadata)?.component_name
      })));
    }

    // Query library_items for usage in component_name field
    // Check all variations
    const { data: libraryItems, error: libraryError } = await serviceClient
      .from('library_items')
      .select('id, name, component_name')
      .in('component_name', variations);

    if (libraryError) {
      console.error('[Usage] Error querying library_items:', libraryError);
      throw libraryError;
    }

    console.log(`[Usage] Found ${libraryItems?.length || 0} library items using component`);
    if (libraryItems && libraryItems.length > 0) {
      console.log(`[Usage] Library examples:`, libraryItems.slice(0, 2));
    }

    const draftCount = drafts?.length || 0;
    const libraryCount = libraryItems?.length || 0;
    const totalUsage = draftCount + libraryCount;

    const usage: ComponentUsage = {
      componentName,
      totalUsage,
      draftCount,
      libraryCount,
      isInUse: totalUsage > 0
    };

    // Cache the result
    usageCache.set(componentName, { data: usage, timestamp: Date.now() });

    return usage;
  } catch (error) {
    console.error('Failed to get component usage:', error);
    // Return safe defaults on error
    return {
      componentName,
      totalUsage: 0,
      draftCount: 0,
      libraryCount: 0,
      isInUse: false
    };
  }
}

/**
 * Get detailed usage information for a component
 */
export async function getDetailedComponentUsage(componentName: string): Promise<DetailedComponentUsage> {
  const serviceClient = createAdminClient();

  try {
    // Get all possible variations of this component name for matching
    const variations = getAllVariations(componentName);

    // Build query conditions for all variations
    const labDraftConditions = variations
      .map(name => `metadata->>component_name.eq.${name}`)
      .join(',');

    // Get detailed draft information
    const { data: drafts, error: draftsError } = await serviceClient
      .from('lab_drafts')
      .select('id, name, type, status')
      .or(labDraftConditions);

    if (draftsError) {
      console.error('Error querying lab_drafts:', draftsError);
      throw draftsError;
    }

    // Get detailed library item information
    const { data: libraryItems, error: libraryError } = await serviceClient
      .from('library_items')
      .select('id, name, type, published')
      .in('component_name', variations);

    if (libraryError) {
      console.error('Error querying library_items:', libraryError);
      throw libraryError;
    }

    const draftCount = drafts?.length || 0;
    const libraryCount = libraryItems?.length || 0;
    const totalUsage = draftCount + libraryCount;

    return {
      componentName,
      totalUsage,
      draftCount,
      libraryCount,
      isInUse: totalUsage > 0,
      drafts: drafts || [],
      libraryItems: libraryItems || []
    };
  } catch (error) {
    console.error('Failed to get detailed component usage:', error);
    // Return safe defaults on error
    return {
      componentName,
      totalUsage: 0,
      draftCount: 0,
      libraryCount: 0,
      isInUse: false,
      drafts: [],
      libraryItems: []
    };
  }
}

/**
 * Get usage statistics for multiple components
 */
export async function getMultipleComponentUsage(componentNames: string[]): Promise<Map<string, ComponentUsage>> {
  const results = new Map<string, ComponentUsage>();

  // Check cache first for all components
  const uncachedComponents: string[] = [];

  for (const name of componentNames) {
    const cached = usageCache.get(name);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      results.set(name, cached.data);
    } else {
      uncachedComponents.push(name);
    }
  }

  // If all components were cached, return early
  if (uncachedComponents.length === 0) {
    return results;
  }

  const serviceClient = createAdminClient();

  try {
    // Get all variations for all uncached components
    const allVariations: string[] = [];
    const componentToVariationsMap = new Map<string, string[]>();

    for (const name of uncachedComponents) {
      const variations = getAllVariations(name);
      componentToVariationsMap.set(name, variations);
      allVariations.push(...variations);
    }

    // Build query for all variations
    const componentConditions = allVariations
      .map(name => `metadata->>component_name.eq.${name}`)
      .join(',');

    // Query lab_drafts for all components at once
    const { data: allDrafts, error: draftsError } = await serviceClient
      .from('lab_drafts')
      .select('id, metadata')
      .or(componentConditions);

    if (draftsError) {
      console.error('Error querying lab_drafts:', draftsError);
      throw draftsError;
    }

    // Query library_items for all components at once
    const { data: allLibraryItems, error: libraryError } = await serviceClient
      .from('library_items')
      .select('id, component_name')
      .in('component_name', allVariations);

    if (libraryError) {
      console.error('Error querying library_items:', libraryError);
      throw libraryError;
    }

    // Count usage for each component
    for (const name of uncachedComponents) {
      const variations = componentToVariationsMap.get(name) || [name];

      const draftCount = allDrafts?.filter(draft => {
        const metadata = draft.metadata as Record<string, unknown> | null;
        const componentName = metadata?.component_name as string;
        return variations.includes(componentName);
      }).length || 0;

      const libraryCount = allLibraryItems?.filter(item =>
        variations.includes(item.component_name)
      ).length || 0;

      const totalUsage = draftCount + libraryCount;

      const usage: ComponentUsage = {
        componentName: name,
        totalUsage,
        draftCount,
        libraryCount,
        isInUse: totalUsage > 0
      };

      results.set(name, usage);
      // Cache the result
      usageCache.set(name, { data: usage, timestamp: Date.now() });
    }

    return results;
  } catch (error) {
    console.error('Failed to get multiple component usage:', error);
    // Return safe defaults for uncached components
    for (const name of uncachedComponents) {
      results.set(name, {
        componentName: name,
        totalUsage: 0,
        draftCount: 0,
        libraryCount: 0,
        isInUse: false
      });
    }
    return results;
  }
}

/**
 * Clear the usage cache (useful after mutations)
 */
export function clearUsageCache(componentName?: string) {
  if (componentName) {
    usageCache.delete(componentName);
  } else {
    usageCache.clear();
  }
}