'use client';

import React, { ReactNode } from 'react';
import { useEditableContent } from './with-editable-content-utils';

/**
 * Component wrapper that provides editable content functionality
 * for its children components.
 *
 * This component serves as a React component alternative to the HOC pattern,
 * useful when you need to add editability to a component at runtime.
 */
export function EditableContentWrapper({
  componentName,
  props,
  editable = false,
  onContentUpdate,
  children
}: {
  componentName: string;
  props: Record<string, unknown>;
  editable?: boolean;
  onContentUpdate?: (updates: Record<string, unknown>) => void;
  children: (processedProps: Record<string, unknown>) => ReactNode;
}) {
  const processedProps = useEditableContent(componentName, props, {
    editable,
    onContentUpdate
  });

  return <>{children(processedProps)}</>;
}