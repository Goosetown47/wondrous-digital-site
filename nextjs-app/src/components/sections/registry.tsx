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
  // Check if content is nested in heroContent (from lab) or at root level
  const heroContent = (content.heroContent || content) as {
    heading?: string;
    subtext?: string;
    buttonText?: string;
    imageUrl?: string;
    imageAlt?: string;
  };
  
  // Only pass event handlers when in editing mode
  if (props.isEditing) {
    return (
      <HeroTwoColumn
        heading={heroContent.heading as string}
        subtext={heroContent.subtext as string}
        buttonText={heroContent.buttonText as string}
        imageUrl={heroContent.imageUrl as string}
        imageAlt={heroContent.imageAlt as string}
        editable={true}
        onHeadingChange={(value) => {
          if (content.heroContent) {
            props.onContentChange?.({ heroContent: { ...content.heroContent, heading: value } });
          } else {
            props.onContentChange?.({ heading: value });
          }
        }}
        onSubtextChange={(value) => {
          if (content.heroContent) {
            props.onContentChange?.({ heroContent: { ...content.heroContent, subtext: value } });
          } else {
            props.onContentChange?.({ subtext: value });
          }
        }}
        onButtonTextChange={(value) => {
          if (content.heroContent) {
            props.onContentChange?.({ heroContent: { ...content.heroContent, buttonText: value } });
          } else {
            props.onContentChange?.({ buttonText: value });
          }
        }}
        onImageChange={() => {
          // Handle file upload and update imageUrl
          // This would need actual file upload logic
        }}
      />
    );
  }
  
  // For non-editing mode (public site), don't pass event handlers
  return (
    <HeroTwoColumn
      heading={heroContent.heading as string}
      subtext={heroContent.subtext as string}
      buttonText={heroContent.buttonText as string}
      imageUrl={heroContent.imageUrl as string}
      imageAlt={heroContent.imageAlt as string}
      editable={false}
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