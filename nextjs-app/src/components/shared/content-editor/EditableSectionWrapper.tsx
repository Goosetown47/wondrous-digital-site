'use client';

import React, { useState, useEffect, useMemo, useCallback, ReactElement } from 'react';
import type { EditableFieldConfig } from '@/lib/component-registry';
import { useEditableContent } from '@/lib/with-editable-content-utils';
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
  /** Use interceptor mode for automatic field detection (experimental) */
  useInterceptor?: boolean;
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
  useInterceptor = false,
}: EditableSectionWrapperProps) {
  const [localContent, setLocalContent] = useState(content);

  // Get component configuration from registry AND database
  const componentConfig = useComponentConfig(componentName);

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

  // If using interceptor mode, use the HOC approach
  const interceptedContent = useEditableContent(
    componentName,
    localContent,
    {
      editable: editable && useInterceptor,
      onContentUpdate
    }
  );

  // If not editable or no field configs, render as-is
  if (!editable || editableFields.length === 0) {
    return React.cloneElement(children, content);
  }

  // If using interceptor mode, return the component with intercepted props
  if (useInterceptor) {
    return (
      <div className="editable-section-wrapper relative">
        {React.cloneElement(children, interceptedContent)}
      </div>
    );
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