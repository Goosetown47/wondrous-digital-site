'use client';

import React, { ComponentType, useMemo } from 'react';
import { interceptContent, createInterceptor } from './content-interceptor';
import { ComponentRegistry } from './component-registry';

/**
 * Higher-order component that adds automatic editability to any component
 * based on its registered editable field configuration.
 *
 * Usage:
 * ```tsx
 * const EditableHero = withEditableContent(HeroComponent, 'HeroTwoColumn');
 * ```
 */
export function withEditableContent<P extends Record<string, unknown>>(
  Component: ComponentType<P>,
  componentName: string
): ComponentType<P & { editable?: boolean; onContentUpdate?: (updates: Record<string, unknown>) => void }> {

  const EditableComponent = function(props: P & {
    editable?: boolean;
    onContentUpdate?: (updates: Record<string, unknown>) => void;
  }) {
    const { editable = false, onContentUpdate, ...componentProps } = props;

    // Get the editable field configuration from registry
    const fieldConfigs = useMemo(() => {
      const registryEntry = ComponentRegistry.get(componentName);
      return registryEntry?.editableFields || [];
    }, []);

    // Memoize the interceptor for this component
    const interceptor = useMemo(() => {
      if (!editable || fieldConfigs.length === 0) {
        return null;
      }
      return createInterceptor(fieldConfigs);
    }, [editable, fieldConfigs]);

    // Render the original component
    const element = React.createElement(Component, componentProps as P);

    // If not editable or no field configs, return as-is
    if (!interceptor || !onContentUpdate) {
      return element;
    }

    // Apply the interceptor to make content editable
    const handleUpdate = (path: string, value: unknown) => {
      // Convert path to object update
      const pathParts = path.split('.');
      const updates: Record<string, unknown> = {};

      // Build nested object from path
      let current: Record<string, unknown> = updates;
      for (let i = 0; i < pathParts.length - 1; i++) {
        // eslint-disable-next-line security/detect-object-injection
        current[pathParts[i]] = {};
        // eslint-disable-next-line security/detect-object-injection
        current = current[pathParts[i]] as Record<string, unknown>;
      }
      current[pathParts[pathParts.length - 1]] = value;

      // Merge with existing props and notify
      const mergedUpdates = {
        ...componentProps,
        ...updates
      };

      onContentUpdate(mergedUpdates);
    };

    // Intercept the component tree to make fields editable
    return interceptContent(element, fieldConfigs, handleUpdate);
  };

  // Set display name for debugging
  EditableComponent.displayName = `EditableContent(${componentName})`;

  return EditableComponent;
}

/**
 * Hook that provides content interception functionality
 * for components that need more control over the editing process.
 *
 * @param componentName The name of the component in the registry
 * @param props The component props to process
 * @param options Options for content interception
 * @returns Processed props with intercepted content
 */
export function useEditableContent<P extends Record<string, unknown>>(
  _componentName: string,
  props: P,
  _options?: {
    editable?: boolean;
    onContentUpdate?: (updates: Record<string, unknown>) => void;
  }
): P {
  // For the hook version, we can't intercept the component tree
  // So we return the props as-is
  // The actual interception happens in EditableSectionWrapper which uses this hook
  // The parameters are kept for API compatibility but not used in this simplified version
  void _componentName;
  void _options;
  return props;
}