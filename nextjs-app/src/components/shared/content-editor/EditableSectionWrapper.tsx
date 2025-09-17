'use client';

import React, { ReactElement, useCallback, useMemo, useState, useEffect } from 'react';
import { ComponentRegistry } from '@/lib/register-components';
import { getValueAtPath, setValueAtPath } from '@/lib/editable-field-detector';
import type { EditableFieldConfig } from '@/lib/component-registry';
import { EditableText } from './EditableText';
import { EditableImage } from './EditableImage';

interface EditableSectionWrapperProps {
  /** Name of the component in the registry */
  componentName: string;
  /** Current content state */
  content: Record<string, unknown>;
  /** Whether editing is enabled */
  editable: boolean;
  /** Callback when content is updated */
  onContentUpdate: (updates: Record<string, unknown>) => void;
  /** The component to render */
  children: ReactElement;
}

/**
 * Smart wrapper that automatically enables editing for registered components
 * based on their editable field configurations
 */
export function EditableSectionWrapper({
  componentName,
  content,
  editable,
  onContentUpdate,
  children,
}: EditableSectionWrapperProps) {
  const [localContent, setLocalContent] = useState(content);

  // Get component configuration from registry
  const componentConfig = useMemo(() => {
    return ComponentRegistry.get(componentName);
  }, [componentName]);

  // Get editable fields configuration
  const editableFields = useMemo(() => {
    return componentConfig?.editableFields || [];
  }, [componentConfig]);

  // Sync local content with props
  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  // Create update handler factory
  const createUpdateHandler = useCallback(
    (fieldPath: string) => {
      return (value: unknown) => {
        const updatedContent = setValueAtPath({ ...localContent }, fieldPath, value);
        setLocalContent(updatedContent);
        onContentUpdate(updatedContent);
      };
    },
    [localContent, onContentUpdate]
  );

  // If not editable or no field configs, render as-is
  if (!editable || editableFields.length === 0) {
    return React.cloneElement(children, content);
  }

  // Process the component to inject editable wrappers
  const enhanceComponent = (
    element: ReactElement,
    fields: EditableFieldConfig[]
  ): ReactElement => {
    // Clone the element with enhanced props
    const enhancedProps: Record<string, unknown> = { ...(element.props || {}) };

    // For each editable field, create appropriate handlers
    fields.forEach(field => {
      const updateHandler = createUpdateHandler(field.path);

      // Add handler props based on field type
      switch (field.type) {
        case 'text':
        case 'richText': {
          // For text fields, add onChange handlers
          const pathParts = field.path.split('.');
          const propName = pathParts[pathParts.length - 1];
          enhancedProps[`on${propName.charAt(0).toUpperCase() + propName.slice(1)}Change`] = updateHandler;
          break;
        }

        case 'image': {
          // For image fields, add onImageChange handlers
          if (field.path.includes('.')) {
            const basePath = field.path.split('.')[0];
            enhancedProps[`on${basePath.charAt(0).toUpperCase() + basePath.slice(1)}Change`] = updateHandler;
          } else {
            enhancedProps[`on${field.path.charAt(0).toUpperCase() + field.path.slice(1)}Change`] = updateHandler;
          }
          break;
        }

        case 'button': {
          // For button fields, typically handle text changes
          enhancedProps[`on${field.path.charAt(0).toUpperCase() + field.path.slice(1)}Change`] = updateHandler;
          break;
        }
      }
    });

    // Mark component as editable
    enhancedProps.editable = true;

    // Pass through the current content
    enhancedProps.content = localContent;

    // Clone with enhanced props
    return React.cloneElement(element, enhancedProps);
  };

  // Render the enhanced component
  const enhancedChild = enhanceComponent(children, editableFields);

  return (
    <div className="editable-section-wrapper relative">
      {enhancedChild}
    </div>
  );
}

/**
 * Hook to automatically wrap content with editable fields
 * This provides a more flexible approach for complex components
 */
export function useEditableFields(
  componentName: string,
  content: Record<string, unknown>,
  onUpdate: (updates: Record<string, unknown>) => void
) {
  const componentConfig = ComponentRegistry.get(componentName);
  const fields = componentConfig?.editableFields || [];

  const handlers = useMemo(() => {
    const handlerMap: Record<string, (value: unknown) => void> = {};

    fields.forEach(field => {
      handlerMap[field.path] = (value: unknown) => {
        const updated = setValueAtPath({ ...content }, field.path, value);
        onUpdate(updated);
      };
    });

    return handlerMap;
  }, [fields, content, onUpdate]);

  const wrapField = useCallback(
    (fieldPath: string, element: ReactElement) => {
      const field = fields.find(f => f.path === fieldPath);
      if (!field) return element;

      const value = getValueAtPath(content, fieldPath);
      const handler = handlers[fieldPath];

      switch (field.type) {
        case 'text':
          return (
            <EditableText
              value={value as string}
              type="plain"
              onUpdate={handler}
              editable={true}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
            >
              {element}
            </EditableText>
          );

        case 'richText':
          return (
            <EditableText
              value={value as string}
              type="rich"
              onUpdate={handler}
              editable={true}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              richText={true}
            >
              {element}
            </EditableText>
          );

        case 'image':
          return (
            <EditableImage
              src={value as string | null}
              alt={field.label}
              onUpdate={handler}
              editable={true}
              className={(element.props as { className?: string })?.className || ''}
            />
          );

        default:
          return element;
      }
    },
    [fields, content, handlers]
  );

  return { fields, handlers, wrapField };
}