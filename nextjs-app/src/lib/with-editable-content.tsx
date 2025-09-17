'use client';

import React, { ComponentType, ReactElement, useMemo } from 'react';
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

  return function EditableComponent(props: P & {
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
        current[pathParts[i]] = {};
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

    return interceptor(element as ReactElement, handleUpdate);
  };
}

/**
 * Alternative hook-based approach for more control
 *
 * Usage:
 * ```tsx
 * function MyComponent(props) {
 *   const editableContent = useEditableContent(
 *     <OriginalContent {...props} />,
 *     'ComponentName',
 *     props.editable,
 *     props.onContentUpdate
 *   );
 *
 *   return editableContent;
 * }
 * ```
 */
export function useEditableContent(
  content: ReactElement,
  componentName: string,
  editable = false,
  onContentUpdate?: (updates: Record<string, unknown>) => void
): ReactElement {
  // Get field configs from registry
  const fieldConfigs = useMemo(() => {
    const registryEntry = ComponentRegistry.get(componentName);
    return registryEntry?.editableFields || [];
  }, [componentName]);

  // Create memoized interceptor
  const interceptedContent = useMemo(() => {
    if (!editable || !fieldConfigs.length || !onContentUpdate) {
      return content;
    }

    const handleUpdate = (path: string, value: unknown) => {
      // Build update object from path
      const pathParts = path.split('.');
      const updates: Record<string, unknown> = {};

      let current: Record<string, unknown> = updates;
      for (let i = 0; i < pathParts.length - 1; i++) {
        current[pathParts[i]] = {};
        current = current[pathParts[i]] as Record<string, unknown>;
      }
      current[pathParts[pathParts.length - 1]] = value;

      onContentUpdate(updates);
    };

    return interceptContent(content, fieldConfigs, handleUpdate);
  }, [content, editable, fieldConfigs, onContentUpdate]);

  return interceptedContent;
}

/**
 * Component wrapper that can be used declaratively
 *
 * Usage:
 * ```tsx
 * <EditableContentWrapper
 *   componentName="HeroTwoColumn"
 *   editable={true}
 *   onContentUpdate={handleUpdate}
 * >
 *   <HeroComponent {...props} />
 * </EditableContentWrapper>
 * ```
 */
export function EditableContentWrapper({
  children,
  componentName,
  editable = false,
  onContentUpdate,
}: {
  children: ReactElement;
  componentName: string;
  editable?: boolean;
  onContentUpdate?: (updates: Record<string, unknown>) => void;
}) {
  return useEditableContent(children, componentName, editable, onContentUpdate);
}