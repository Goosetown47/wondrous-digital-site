/**
 * AppButton Component
 *
 * Button component for app/editor UI that uses fixed module radius.
 * Unaffected by user theme settings.
 *
 * For user content buttons (sections, pages), use the regular Button component.
 *
 * Architecture:
 * - Renders inside iframe where theme's --radius is applied
 * - Uses inline style to override theme radius with module radius
 * - Inline styles have highest CSS specificity
 *
 * Usage:
 * ```tsx
 * import { AppButton } from '@/components/ui/app-button';
 *
 * <AppButton variant="outline" size="sm">
 *   Add Item
 * </AppButton>
 * ```
 */

'use client';

import { forwardRef } from 'react';
import { Button, type ButtonProps } from './button';

export const AppButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ style, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        style={{
          borderRadius: 'calc(var(--module-radius) - 2px)',
          ...style,
        }}
        {...props}
      />
    );
  }
);

AppButton.displayName = 'AppButton';
