'use client';

import React, { useMemo, useCallback, ReactElement, isValidElement } from 'react';
import { useComponentConfig } from '@/hooks/useComponentConfig';
import { setValueAtPath } from '@/lib/editable-field-detector';
import { EditableText } from './EditableText';
import { EditableImage } from './EditableImage';
import { EditableButton } from './EditableButton';

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
 * Runtime wrapper that injects editing capabilities into components.
 *
 * NEW APPROACH (2025-09-30):
 * - Walks React component tree at runtime
 * - Identifies elements that match editable fields in schema
 * - Wraps matched elements with EditableText/Image/Button
 * - No code transformation needed - components stay clean
 *
 * How it works:
 * 1. Receives clean component + schema + content
 * 2. Recursively walks React element tree
 * 3. For each element, checks if it matches a field in schema
 * 4. If match found, wraps with appropriate Editable* component
 * 5. Editable* components handle hover, click, modal display
 */
export function EditableSectionWrapper({
  componentName,
  content,
  editable,
  onContentUpdate,
  children,
}: EditableSectionWrapperProps) {
  console.log('🎬 [EditableSectionWrapper] Component mounted:', {
    componentName,
    editable,
    hasContent: !!content,
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
        console.log('🔄 [EditableSectionWrapper] Field update:', {
          fieldPath,
          newValue: value,
          currentContent: content,
        });

        const updatedContent = setValueAtPath({ ...content }, fieldPath, value);

        console.log('🔄 [EditableSectionWrapper] Content after setValueAtPath:', {
          fieldPath,
          updatedContent,
        });

        // Filter out functions - only pass actual content, not handlers
        const cleanContent = Object.entries(updatedContent).reduce((acc, [key, val]) => {
          if (typeof val !== 'function') {
            acc[key] = val;
          }
          return acc;
        }, {} as Record<string, unknown>);

        console.log('🔄 [EditableSectionWrapper] Calling onContentUpdate with:', cleanContent);
        onContentUpdate(cleanContent);
      };
    },
    [content, onContentUpdate]
  );

  // Build field update handlers
  const fieldHandlers = useMemo(() => {
    const handlers: Record<string, (value: unknown) => void> = {};

    editableFields.forEach(field => {
      handlers[field.path] = createFieldHandler(field.path);
    });

    return handlers;
  }, [editableFields, createFieldHandler]);

  /**
   * Recursively walk React tree and wrap editable elements
   * Combined function to avoid circular dependencies
   */
  const wrapTree = useCallback(
    (element: ReactElement): ReactElement => {
      if (!isValidElement(element)) {
        return element;
      }

      // IMPORTANT: Recurse into children FIRST to match leaf nodes before parents
      let processedElement = element;
      const elementProps = element.props as any;
      if (elementProps && elementProps.children) {
        const wrappedChildren = React.Children.map(elementProps.children, (child) => {
          if (isValidElement(child)) {
            return wrapTree(child);
          }
          return child;
        });

        // If children changed, clone element with new children
        if (wrappedChildren !== elementProps.children) {
          processedElement = React.cloneElement(element, {}, wrappedChildren);
        }
      }

      // Now check if THIS element (with wrapped children) matches a field
      let elementType: string;
      if (typeof processedElement.type === 'string') {
        elementType = processedElement.type;
      } else if (typeof processedElement.type === 'function') {
        // Get the component name for function components
        const funcComponent = processedElement.type as any;
        elementType = funcComponent.name || funcComponent.displayName || 'component';
      } else {
        elementType = 'component';
      }

      // Get props for field matching
      const processedPropsForMatching = processedElement.props as any;

      for (const field of editableFields) {
        const fieldValue = getNestedValue(content, field.path);

        // Match based on field type and element type
        switch (field.type) {
          case 'text':
          case 'richText': {
            // Check if this is an alt text field (special case - attribute, not text content)
            if (field.path.endsWith('Alt') && elementType === 'img') {
              // Match alt attributes on img tags
              if (processedPropsForMatching.alt === fieldValue) {
                console.log('✅ [Wrapper] Match found (alt attribute):', {
                  fieldPath: field.path,
                  fieldType: field.type,
                  elementType,
                });

                // For alt text, wrap the img tag itself with editable text
                return (
                  <EditableText
                    value={String(fieldValue)}
                    onUpdate={fieldHandlers[field.path]}
                    editable={editable}
                    type="heading"
                    richText={false}
                  >
                    {processedElement}
                  </EditableText>
                );
              }
            }

            // Match text elements (h1-h6, p, span, Button, button)
            const isTextElement = /^(h[1-6]|p|span|Button|button)$/.test(elementType);
            if (isTextElement && elementContainsValue(processedElement, fieldValue)) {
              console.log('✅ [Wrapper] Match found:', {
                fieldPath: field.path,
                fieldType: field.type,
                elementType,
              });

              return (
                <EditableText
                  value={String(fieldValue)}
                  onUpdate={fieldHandlers[field.path]}
                  editable={editable}
                  type={field.type === 'richText' ? 'paragraph' : 'heading'}
                  richText={field.type === 'richText'}
                >
                  {processedElement}
                </EditableText>
              );
            }
            break;
          }

          case 'image': {
            // Only match img tags
            if (elementType === 'img' && processedPropsForMatching.src === fieldValue) {
              console.log('✅ [Wrapper] Match found:', {
                fieldPath: field.path,
                fieldType: field.type,
                elementType,
              });

              return (
                <EditableImage
                  src={String(fieldValue)}
                  alt={processedPropsForMatching.alt || ''}
                  className={processedPropsForMatching.className}
                  onUpdate={fieldHandlers[field.path]}
                  editable={editable}
                />
              );
            }
            break;
          }

          case 'button': {
            // Match Button component or button elements
            // Note: shadcn/ui Button is a forwardRef, so it appears as 'component'
            // We need to check for 'component' type when in button field context
            const isButtonElement =
              elementType === 'button' ||
              elementType === 'Button' ||
              elementType === 'component'; // forwardRef components show as 'component'

            console.log('🔍 [Button Debug] Checking button field:', {
              fieldPath: field.path,
              fieldValue,
              elementType,
              isButtonElement,
            });

            if (isButtonElement) {
              // Handle both object format (legacy) and string format (new)
              let buttonText: string;
              let buttonData: { text: string; url: string };

              if (typeof fieldValue === 'object' && fieldValue !== null) {
                // Legacy object format: { text: string, url: string }
                buttonData = fieldValue as { text: string; url: string };
                buttonText = buttonData.text;
              } else {
                // New string format: just the button text
                buttonText = String(fieldValue);
                buttonData = { text: buttonText, url: '' };
              }

              // Extract text from element for comparison
              const elementText = getElementText(processedElement);
              let containsValue = elementContainsValue(processedElement, buttonText);

              // FALLBACK: For forwardRef Button components, extract text from children
              // When elementText is empty, we need to recursively extract text from nested structure
              if (!containsValue && elementType === 'component' && processedPropsForMatching?.children) {
                // Create a temporary wrapper element to extract text from children
                const wrapperElement = React.createElement('div', {}, processedPropsForMatching.children);
                const childrenText = getElementText(wrapperElement as ReactElement);
                containsValue = childrenText === buttonText || childrenText.includes(buttonText);
                console.log('🔍 [Button Debug] Fallback check:', {
                  fieldPath: field.path,
                  childrenText,
                  buttonText,
                  matches: containsValue,
                });
              }

              console.log('🔍 [Button Debug] Matching attempt:', {
                fieldPath: field.path,
                lookingFor: buttonText,
                elementText,
                containsValue,
              });

              if (containsValue) {
                console.log('✅ [Wrapper] Match found:', {
                  fieldPath: field.path,
                  fieldType: field.type,
                  elementType,
                });

                return (
                  <EditableButton
                    buttonData={buttonData}
                    onUpdate={(newButtonData) => {
                      console.log('🔵 [Button Update] onUpdate called:', {
                        fieldPath: field.path,
                        oldValue: buttonData.text,
                        newValue: newButtonData.text,
                      });

                      // Only save the button text as a string
                      // This maintains compatibility with our analyzer/normalizer
                      // which expect button fields to be strings in defaultContent
                      console.log('🔵 [Button Update] Calling fieldHandler for:', field.path);
                      fieldHandlers[field.path](newButtonData.text);
                      console.log('🔵 [Button Update] fieldHandler called successfully');
                    }}
                    editable={editable}
                  >
                    {processedElement}
                  </EditableButton>
                );
              } else {
                console.log('❌ [Button Debug] No match:', {
                  fieldPath: field.path,
                  reason: 'elementContainsValue returned false',
                });
              }
            }
            break;
          }
        }
      }

      // No match found - return element with wrapped children (from above)
      return processedElement;
    },
    [editableFields, content, fieldHandlers, editable]
  );

  // Memoize the wrapped tree to avoid unnecessary re-walks
  const wrappedTree = useMemo(() => {
    // Early exit if not editable
    if (!editable || editableFields.length === 0) {
      console.log('⏭️  [Wrapper] Skipping wrap (not editable or no fields)');
      return React.cloneElement(children, content);
    }

    console.log('🌳 [Wrapper] Walking tree...', {
      fieldsToMatch: editableFields.length,
      contentKeys: Object.keys(content),
    });

    // CRITICAL: If children is a function component (normalized components),
    // we need to render it first to get the actual JSX output
    let elementToWrap = children;
    if (typeof children.type === 'function') {
      console.log('🔄 [Wrapper] Rendering function component to get JSX output...');
      console.log('🔄 [Wrapper] Using content:', content);

      // Render the component with the CURRENT content, not children.props
      // This ensures we always render with the latest state
      // Type assertion needed as TypeScript doesn't know type is callable
      const ComponentFn = children.type as (props: any) => ReactElement;
      elementToWrap = ComponentFn(content);
      console.log('✅ [Wrapper] Component rendered with current content');
    }

    // Walk the tree and wrap matching elements
    const wrapped = wrapTree(elementToWrap);

    console.log('✅ [Wrapper] Tree walk complete');

    return wrapped;
  }, [editable, editableFields, children, content, wrapTree]);

  return wrappedTree;
}

/**
 * Helper: Get nested value from object using dot notation
 * e.g., getNestedValue({ button: { text: "Click" } }, "button.text") => "Click"
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: any = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[part];
  }

  return current;
}

/**
 * Helper: Check if element contains a specific value
 * This is a simple heuristic - checks element's children for the value
 */
function elementContainsValue(element: ReactElement, value: unknown): boolean {
  if (!value) return false;

  // Convert value to string for comparison
  const valueStr = String(value);

  // Check if element's children contain this value
  const childrenText = getElementText(element);

  return childrenText.includes(valueStr);
}

/**
 * Helper: Extract all text content from element tree
 */
function getElementText(element: ReactElement): string {
  let text = '';

  const traverse = (node: React.ReactNode) => {
    if (typeof node === 'string') {
      text += node;
    } else if (typeof node === 'number') {
      text += String(node);
    } else if (isValidElement(node)) {
      const nodeProps = node.props as any;
      if (nodeProps && nodeProps.children) {
        React.Children.forEach(nodeProps.children, traverse);
      }
    } else if (Array.isArray(node)) {
      node.forEach(traverse);
    }
  };

  traverse(element);
  return text;
}
