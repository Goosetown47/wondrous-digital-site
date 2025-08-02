// Section Component Registry
// This file maps section type component names to their React components

import React from 'react';
import { HeroSection } from './HeroSection';
import { HeroTwoColumn } from './hero-two-column';
import type { ComponentType } from 'react';

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

// Adapter components to match BaseSectionProps interface
const HeroSectionAdapter: ComponentType<BaseSectionProps> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <HeroSection content={props.content as any} isEditing={props.isEditing} onContentChange={props.onContentChange as any} />;
};

const HeroTwoColumnAdapter: ComponentType<BaseSectionProps> = (props) => {
  const content = props.content || {};
  return (
    <HeroTwoColumn
      heading={content.heading as string}
      subtext={content.subtext as string}
      buttonText={content.buttonText as string}
      imageUrl={content.imageUrl as string}
      imageAlt={content.imageAlt as string}
      editable={props.isEditing}
      onHeadingChange={(value) => props.onContentChange?.({ heading: value })}
      onSubtextChange={(value) => props.onContentChange?.({ subtext: value })}
      onButtonTextChange={(value) => props.onContentChange?.({ buttonText: value })}
      onImageChange={() => {
        // Handle file upload and update imageUrl
        // This would need actual file upload logic
      }}
    />
  );
};

// Registry of section components
export const SECTION_COMPONENTS: Record<string, ComponentType<BaseSectionProps>> = {
  'HeroSection': HeroSectionAdapter,
  'HeroTwoColumn': HeroTwoColumnAdapter,
  'Hero-Two-Col-Image': HeroTwoColumnAdapter, // Alias for the component name used in the lab
  // Add more section components here as they are created
  // e.g., 'NavbarSection': NavbarSection,
  //       'FooterSection': FooterSection,
};

// Helper function to get a section component by name
export function getSectionComponent(componentName?: string | null): ComponentType<BaseSectionProps> {
  if (!componentName) return GenericSection;
  // eslint-disable-next-line security/detect-object-injection
  return SECTION_COMPONENTS[componentName] || GenericSection;
}

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