'use client';

import React, { useMemo, useCallback, ReactElement } from 'react';
import { useComponentConfig } from '@/hooks/useComponentConfig';
import { setValueAtPath } from '@/lib/editable-field-detector';

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
 * Smart wrapper that passes editing handlers to components with EditableText/EditableImage.
 *
 * This wrapper creates `on{Field}Change` handler props for each editable field
 * and passes them to the component along with `editable: true`.
 *
 * The component must already have EditableText/EditableImage wrappers in its source code.
 */
export function EditableSectionWrapper({
  componentName,
  content,
  editable,
  onContentUpdate,
  children,
}: EditableSectionWrapperProps) {
  console.log('🎬 [EditableSectionWrapper] Component mounted/updated:', {
    componentName,
    hasOnContentUpdate: !!onContentUpdate,
    onContentUpdateType: typeof onContentUpdate,
  });

  // Get component configuration from registry/database
  const componentConfig = useComponentConfig(componentName);

  // Get editable fields configuration
  const editableFields = useMemo(() => {
    return componentConfig?.editableFields || [];
  }, [componentConfig]);

  // Create update handler for a specific field
  const createFieldHandler = useCallback(
    (fieldPath: string) => {
      return (value: unknown) => {
        console.log('🔄 [EditableSectionWrapper] Field handler called:', {
          fieldPath,
          newValue: value,
          currentContent: content,
          hasOnContentUpdate: !!onContentUpdate,
        });

        const updatedContent = setValueAtPath({ ...content }, fieldPath, value);

        // Filter out functions - only pass actual content, not handlers
        const cleanContent = Object.entries(updatedContent).reduce((acc, [key, val]) => {
          if (typeof val !== 'function') {
            acc[key] = val;
          }
          return acc;
        }, {} as Record<string, unknown>);

        console.log('💾 [EditableSectionWrapper] About to call onContentUpdate:', {
          cleanContent,
          onContentUpdateExists: !!onContentUpdate,
          onContentUpdateType: typeof onContentUpdate,
        });

        try {
          onContentUpdate(cleanContent);
          console.log('✅ [EditableSectionWrapper] onContentUpdate called successfully');
        } catch (error) {
          console.error('❌ [EditableSectionWrapper] onContentUpdate threw error:', error);
        }
      };
    },
    [content, onContentUpdate]
  );

  // If not editable or no field configs, render as-is
  if (!editable || editableFields.length === 0) {
    return React.cloneElement(children, content);
  }

  // Build handler props object
  // For field "heading", create "onHeadingChange" handler
  // For nested field "button.text", create "onButtonTextChange" handler
  const handlers: Record<string, (value: unknown) => void> = {};

  editableFields.forEach(field => {
    const fieldPath = field.path;

    // Convert path to camelCase handler name
    // "heading" -> "onHeadingChange"
    // "button.text" -> "onButtonTextChange"
    const handlerName = 'on' + fieldPath
      .split('.')
      .map((part) => {
        // Capitalize first letter of each part
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('') + 'Change';

    handlers[handlerName] = createFieldHandler(fieldPath);
  });

  console.log('🎯 [EditableSectionWrapper] Created handlers:', {
    handlerNames: Object.keys(handlers),
    contentKeys: Object.keys(content),
  });

  // Pass content + handlers + editable flag to component
  const propsWithHandlers = {
    ...content,
    ...handlers,
    editable: true,
  };

  console.log('📦 [EditableSectionWrapper] Passing props to component:', {
    propKeys: Object.keys(propsWithHandlers),
  });

  return React.cloneElement(children, propsWithHandlers);
}
