import type { ComponentType } from 'react';

/**
 * Type definitions for the component registry
 */
export type ComponentTypeCategory = 'section' | 'navigation' | 'page' | 'theme';
// Subcategory will be dynamic from database - using string type
export type ComponentSubCategory = string;

/**
 * Types of editable fields
 */
export type EditableFieldType =
  | 'text'              // Plain text (headings, labels)
  | 'richText'          // Rich text with formatting
  | 'image'             // Image with upload
  | 'url'               // URL/link
  | 'button'            // Button with text and link
  | 'array'             // Array of items
  | 'array-item'        // Individual array item field
  | 'array-relocation'  // Array relocation marker
  | 'object'            // Nested object
  | 'select'            // Dropdown selection
  | 'boolean'           // Checkbox/toggle
  | 'number';           // Numeric input

/**
 * Configuration for an editable field
 */
export interface EditableFieldConfig {
  /** Path to the field in the content object (e.g., 'heading' or 'logo.src') */
  path: string;

  /** Type of the editable field */
  type: EditableFieldType;

  /** User-friendly label for the field */
  label: string;

  /** Optional description or help text */
  description?: string;

  /** Whether the field is required */
  required?: boolean;

  /** Placeholder text for inputs */
  placeholder?: string;

  /** Maximum length for text fields */
  maxLength?: number;

  /** Minimum value for number fields */
  min?: number;

  /** Maximum value for number fields */
  max?: number;

  /** Options for select fields */
  options?: Array<{ label: string; value: string }>;

  /** For array fields - configuration for each item */
  itemFields?: EditableFieldConfig[];

  /** For object fields - nested field configurations */
  nestedFields?: EditableFieldConfig[];

  /** Allowed file types for image fields */
  allowedFormats?: string[];

  /** Default value if not provided */
  defaultValue?: unknown;
}

export interface ComponentRegistryEntry {

  component: ComponentType<any>;
  type: ComponentTypeCategory;

  defaultContent?: Record<string, any>;

  contentSchema?: Record<string, any>;
  category?: ComponentSubCategory;
  description?: string;
  source?: import('@/types/builder').CoreComponentSource;
  dependencies?: string[];
  imports?: string[];

  /** Configuration for editable fields - enables automatic editing */
  editableFields?: EditableFieldConfig[];
}

interface RegisterOptions {
  force?: boolean;
}

interface FilterOptions {
  type?: ComponentTypeCategory;
  category?: ComponentSubCategory;
  source?: string;
}

/**
 * Singleton registry for managing all components in the system
 */
class ComponentRegistryClass {
  private static instance: ComponentRegistryClass;
  private registry: Map<string, ComponentRegistryEntry>;

  private constructor() {
    this.registry = new Map();
  }

  static getInstance(): ComponentRegistryClass {
    if (!ComponentRegistryClass.instance) {
      ComponentRegistryClass.instance = new ComponentRegistryClass();
    }
    return ComponentRegistryClass.instance;
  }

  /**
   * Register a single component
   */
  register(name: string, entry: ComponentRegistryEntry, options: RegisterOptions = {}): void {
    if (this.registry.has(name) && !options.force) {
      throw new Error(`Component "${name}" is already registered. Use force: true to overwrite.`);
    }
    this.registry.set(name, entry);
  }

  /**
   * Register multiple components at once
   */
  registerBatch(components: Record<string, ComponentRegistryEntry>, options: RegisterOptions = {}): void {
    Object.entries(components).forEach(([name, entry]) => {
      this.register(name, entry, options);
    });
  }

  /**
   * Get a specific component
   */
  get(name: string): ComponentRegistryEntry | undefined {
    return this.registry.get(name);
  }

  /**
   * Get all components with optional filtering
   */
  getAll(filter?: FilterOptions): Record<string, ComponentRegistryEntry> {
    const result: Record<string, ComponentRegistryEntry> = {};

    this.registry.forEach((entry, name) => {
      if (filter) {
        if (filter.type && entry.type !== filter.type) return;
        if (filter.category && entry.category !== filter.category) return;
        if (filter.source && entry.source !== filter.source) return;
      }
      // Use Object.assign to avoid direct injection
      Object.assign(result, { [name]: entry });
    });

    return result;
  }

  /**
   * Check if a component exists
   */
  has(name: string): boolean {
    return this.registry.has(name);
  }

  /**
   * Clear all registered components
   */
  clear(): void {
    this.registry.clear();
  }

  /**
   * Get list of all component names
   */
  getComponentNames(): string[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Get components by type
   */
  getByType(type: ComponentTypeCategory): Record<string, ComponentRegistryEntry> {
    return this.getAll({ type });
  }

  /**
   * Get components by category
   */
  getByCategory(category: ComponentSubCategory): Record<string, ComponentRegistryEntry> {
    return this.getAll({ category });
  }
}

// Create singleton instance
export const ComponentRegistry = ComponentRegistryClass.getInstance();

// Export convenience functions that use the singleton
export const registerComponent = (
  name: string,
  entry: ComponentRegistryEntry,
  options?: RegisterOptions
): void => {
  ComponentRegistry.register(name, entry, options);
};

export const getComponent = (name: string): ComponentRegistryEntry | undefined => {
  return ComponentRegistry.get(name);
};

export const getAllComponents = (filter?: FilterOptions): Record<string, ComponentRegistryEntry> => {
  return ComponentRegistry.getAll(filter);
};

export const hasComponent = (name: string): boolean => {
  return ComponentRegistry.has(name);
};

// Static methods for class-based access
ComponentRegistry.register = ComponentRegistry.register.bind(ComponentRegistry);
ComponentRegistry.registerBatch = ComponentRegistry.registerBatch.bind(ComponentRegistry);
ComponentRegistry.get = ComponentRegistry.get.bind(ComponentRegistry);
ComponentRegistry.getAll = ComponentRegistry.getAll.bind(ComponentRegistry);
ComponentRegistry.has = ComponentRegistry.has.bind(ComponentRegistry);
ComponentRegistry.clear = ComponentRegistry.clear.bind(ComponentRegistry);
ComponentRegistry.getComponentNames = ComponentRegistry.getComponentNames.bind(ComponentRegistry);