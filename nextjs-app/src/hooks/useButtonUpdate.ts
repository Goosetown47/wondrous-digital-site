import { useCallback } from 'react';
import type { ButtonData } from '@/components/shared/content-editor';

/**
 * Standardized hook for handling button updates
 *
 * Prevents race conditions when updating multiple button fields (text, URL, variant, size)
 * by using batch updates when available, or falling back to sequential updates.
 *
 * @param onUpdate - Single field update handler (current pattern)
 * @param onBatchUpdate - Batch field update handler (future pattern)
 * @param baseFieldName - Field name prefix (e.g., 'button', 'signIn', 'ctaButton')
 *
 * @example
 * ```typescript
 * const handleButtonUpdate = useButtonUpdate(onUpdate, onBatchUpdate, 'signIn');
 *
 * <EditableButton
 *   buttonData={{ text, url, variant, size }}
 *   onUpdate={handleButtonUpdate}
 *   editable={editable}
 * >
 *   <Button variant={variant} size={size}>
 *     <Link href={url}>{text}</Link>
 *   </Button>
 * </EditableButton>
 * ```
 */
export function useButtonUpdate(
  onUpdate?: (fieldPath: string, value: unknown) => void,
  onBatchUpdate?: (updates: Record<string, unknown>) => void,
  baseFieldName: string = 'button'
) {
  return useCallback(
    (data: ButtonData) => {
      // Prepare field updates
      const updates: Record<string, unknown> = {
        [`${baseFieldName}Text`]: data.text,
        [`${baseFieldName}Href`]: data.url,
      };

      // Add optional fields if provided
      if (data.variant !== undefined) {
        updates[`${baseFieldName}Variant`] = data.variant;
      }
      if (data.size !== undefined) {
        updates[`${baseFieldName}Size`] = data.size;
      }
      if (data.openInNewTab !== undefined) {
        updates[`${baseFieldName}OpenInNewTab`] = data.openInNewTab;
      }

      // Use batch update if available (prevents race conditions)
      if (onBatchUpdate) {
        onBatchUpdate(updates);
      } else if (onUpdate) {
        // Fallback: sequential updates (current pattern)
        // Note: This can cause race conditions with auto-save
        Object.entries(updates).forEach(([key, value]) => {
          onUpdate(key, value);
        });
      }
    },
    [onUpdate, onBatchUpdate, baseFieldName]
  );
}
