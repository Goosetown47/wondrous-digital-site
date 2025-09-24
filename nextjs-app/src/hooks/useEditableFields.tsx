import { useMemo, useCallback, ReactElement } from 'react';
import { ComponentRegistry } from '@/lib/component-registry';
import { getValueAtPath, setValueAtPath } from '@/lib/editable-field-detector';
import { EditableText } from '@/components/shared/content-editor/EditableText';
import { EditableImage } from '@/components/shared/content-editor/EditableImage';

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

  const fields = useMemo(() => {
    return componentConfig?.editableFields || [];
  }, [componentConfig]);

  const handlers = useMemo(() => {
    const handlerMap = new Map<string, (value: unknown) => void>();

    fields.forEach(field => {
      handlerMap.set(field.path, (value: unknown) => {
        const updated = setValueAtPath({ ...content }, field.path, value);
        onUpdate(updated);
      });
    });

    return handlerMap;
  }, [fields, content, onUpdate]);

  const wrapField = useCallback(
    (fieldPath: string, element: ReactElement) => {
      const field = fields.find(f => f.path === fieldPath);
      if (!field) return element;

      const value = getValueAtPath(content, fieldPath);
      const handler = handlers.get(fieldPath);

      if (!handler) return element;

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

  return { fields, wrapField };
}