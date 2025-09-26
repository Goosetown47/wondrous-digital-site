// Section Component Registry
// This file maps section type component names to their React components

import React from 'react';
import { HeroSection } from './HeroSection';
import { HeroTwoColumn } from './hero-two-column';
import { Services1, Services4 } from '../core/sections/services1';
import { Services4 as ServicesComponent4 } from '../core/sections/services4';
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

  return <HeroSection content={props.content as SectionContent} isEditing={props.isEditing} onContentChange={props.onContentChange as ((updates: Partial<SectionContent>) => void) | undefined} />;
};

const HeroTwoColumnAdapter: ComponentType<BaseSectionProps> = (props) => {
  const content = props.content || {};
  // Check if content is nested in heroContent (from lab) or at root level
  const heroContent = (content.heroContent || content) as {
    heading?: string;
    subtext?: string;
    buttonText?: string;
    secondaryButtonText?: string;
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
        secondaryButtonText={heroContent.secondaryButtonText as string}
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
        onSecondaryButtonTextChange={(value) => {
          if (content.heroContent) {
            props.onContentChange?.({ heroContent: { ...content.heroContent, secondaryButtonText: value } });
          } else {
            props.onContentChange?.({ secondaryButtonText: value });
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
      secondaryButtonText={heroContent.secondaryButtonText as string}
      imageUrl={heroContent.imageUrl as string}
      imageAlt={heroContent.imageAlt as string}
      editable={false}
    />
  );
};

// Adapter for Services components (they don't need props adaptation as they're static)
const ServicesAdapter: ComponentType<BaseSectionProps> = () => {
  return <Services4 />;
};

const Services1Adapter: ComponentType<BaseSectionProps> = () => {
  return <Services1 />;
};

const Services4Adapter: ComponentType<BaseSectionProps> = () => {
  return <ServicesComponent4 />;
};

// Registry of section components
// NOTE: This registry is deprecated - use ComponentRegistry from /lib/register-components.ts instead

const SECTION_COMPONENTS: Record<string, ComponentType<BaseSectionProps>> = {
  'HeroSection': HeroSectionAdapter,
  'HeroTwoColumn': HeroTwoColumnAdapter,
  'Hero-Two-Col-Image': HeroTwoColumnAdapter, // Alias for the component name used in the lab
  'Services': ServicesAdapter,
  'Services1': Services1Adapter,
  'Services4': Services4Adapter,
  'ServicesComponent4': Services4Adapter, // Alias in case it's stored with this name
  // Add more section components here as they are created
  // e.g., 'NavbarSection': NavbarSection,
  //       'FooterSection': FooterSection,
};

// Helper function to get a section component by name
// NOTE: This function is deprecated - use ComponentRegistry from /lib/register-components.ts instead
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getSectionComponent(componentName?: string | null): ComponentType<BaseSectionProps> {
  if (!componentName) return GenericSection;

  // Validate component exists to prevent object injection
  // Use Object.entries to find the component without bracket notation
  const entry = Object.entries(SECTION_COMPONENTS).find(([key]) => key === componentName);
  return entry ? entry[1] : GenericSection;
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