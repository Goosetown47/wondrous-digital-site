'use client';

import React from 'react';
import type { ComponentType } from 'react';

/**
 * Adapter to bridge between the old prop interface (content/onContentChange)
 * and ComponentRegistry components that expect individual props
 */

interface AdapterProps {
  content: Record<string, unknown>;
  isEditing?: boolean;
  onContentChange?: (updates: Record<string, unknown>) => void;
}

/**
 * Creates an adapter component that translates between the two prop interfaces
 * Note: This function is not currently used but kept for future reference
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createComponentAdapter(Component: ComponentType<Record<string, unknown>>): ComponentType<AdapterProps> {
  return function ComponentAdapter({ content, isEditing = false, onContentChange }: AdapterProps) {
    // Build props object from content
    const componentProps: Record<string, unknown> = {
      ...content,
      editable: isEditing,
    };

    // If editing is enabled, create change handlers
    if (isEditing && onContentChange) {
      // Create change handlers for each content property
      Object.keys(content).forEach((key) => {
        const handlerName = `on${key.charAt(0).toUpperCase()}${key.slice(1)}Change`;
        componentProps[handlerName] = (value: unknown) => {
          onContentChange({ [key]: value });
        };
      });
    }

    return <Component {...componentProps} />;
  };
}

/**
 * Special adapter for HeroTwoColumn component
 * Handles the specific prop mappings for this component
 */
export function HeroTwoColumnAdapter({ content, isEditing = false, onContentChange }: AdapterProps) {
  // Dynamic import to avoid circular dependencies
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Component = require('@/components/sections/hero-two-column').HeroTwoColumn;

  const props: Record<string, unknown> = {
    heading: content.heading as string,
    subtext: content.subtext as string,
    buttonText: content.buttonText as string,
    secondaryButtonText: content.secondaryButtonText as string,
    imageUrl: content.imageUrl as string,
    imageAlt: content.imageAlt as string,
    editable: isEditing,
  };

  if (isEditing && onContentChange) {
    props.onHeadingChange = (value: string) => onContentChange({ heading: value });
    props.onSubtextChange = (value: string) => onContentChange({ subtext: value });
    props.onButtonTextChange = (value: string) => onContentChange({ buttonText: value });
    props.onSecondaryButtonTextChange = (value: string) => onContentChange({ secondaryButtonText: value });
    props.onImageChange = (file: File) => {
      // Handle image upload - this would need actual upload logic
      // For now, just update with a placeholder
      onContentChange({ imageUrl: URL.createObjectURL(file) });
    };
  }

  return <Component {...props} />;
}

/**
 * Generic adapter for static components (like Services)
 * These components don't need content or change handlers
 */
export function StaticComponentAdapter(Component: ComponentType<Record<string, unknown>>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return function Adapter({ content, isEditing, onContentChange }: AdapterProps) {
    // Static components don't use props, just render them
    return <Component />;
  };
}