// Section Component Registry
// This file maps section type component names to their React components

import React from 'react';

// Define the content type for sections
export interface SectionContent {
  type?: string;
  [key: string]: unknown;
}

// Define the props interface that all section components should accept
export interface BaseSectionProps {
  content: SectionContent;
  isEditing?: boolean;
  onContentChange?: (updates: Partial<SectionContent>) => void;
}

// NOTE: The SECTION_COMPONENTS registry and getSectionComponent function have been removed
// All components are now registered in ComponentRegistry from /lib/register-components.ts
// This file now only contains adapter components for backwards compatibility

// Generic section component for sections without specific components
export function GenericSection({ content, isEditing }: BaseSectionProps) {
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