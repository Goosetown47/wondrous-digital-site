import { ComponentRegistry } from './component-registry';
import type { ComponentRegistryEntry } from './component-registry';

/**
 * Helper to get components filtered by database type_id
 * This allows the registry to work with your dynamic database types
 */
export async function getComponentsByDatabaseType(typeId: string): Promise<Record<string, ComponentRegistryEntry>> {
  // Filter components by their category which maps to database type_id
  return ComponentRegistry.getAll({ category: typeId });
}

/**
 * Register a component with database type mapping
 * @param name Component name
 * @param component The React component
 * @param type Main type (section, navigation, page, theme)
 * @param typeId Database type_id for subcategory
 * @param defaultContent Optional default content structure
 */
export function registerComponentWithType(
  name: string,

  component: React.ComponentType<any>,
  type: 'section' | 'navigation' | 'page' | 'theme',
  typeId?: string,

  defaultContent?: Record<string, any>
) {
  ComponentRegistry.register(name, {
    component,
    type,
    category: typeId, // Maps to database type_id
    defaultContent
  });
}