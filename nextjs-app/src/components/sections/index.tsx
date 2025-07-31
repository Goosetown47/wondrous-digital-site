// Section Component Registry
// This file maps section type component names to their React components

import { HeroSection } from './HeroSection';
import { HeroTwoColumn } from './hero-two-column';
import type { ComponentType } from 'react';

// Define the props interface that all section components should accept
export interface BaseSectionProps {
  content: any;
  isEditing?: boolean;
  onContentChange?: (updates: any) => void;
}

// Registry of section components
export const SECTION_COMPONENTS: Record<string, ComponentType<BaseSectionProps>> = {
  'HeroSection': HeroSection,
  'HeroTwoColumn': HeroTwoColumn,
  'Hero-Two-Col-Image': HeroTwoColumn, // Alias for the component name used in the lab
  // Add more section components here as they are created
  // e.g., 'NavbarSection': NavbarSection,
  //       'FooterSection': FooterSection,
};

// Generic section component for sections without specific components
export function GenericSection({ content, isEditing, onContentChange }: BaseSectionProps) {
  return (
    <div className="py-12 px-4 bg-gray-100 border-2 border-dashed border-gray-300">
      <div className="max-w-4xl mx-auto text-center">
        <h3 className="text-lg font-semibold text-gray-700">Generic Section</h3>
        <p className="text-gray-500 mt-2">
          This section type doesn't have a custom component yet.
        </p>
        {isEditing && (
          <p className="text-sm text-gray-400 mt-4">
            Section type: {content?.type || 'Unknown'}
          </p>
        )}
      </div>
    </div>
  );
}

// Helper function to get a section component by name
export function getSectionComponent(componentName?: string | null): ComponentType<BaseSectionProps> {
  if (!componentName) return GenericSection;
  return SECTION_COMPONENTS[componentName] || GenericSection;
}