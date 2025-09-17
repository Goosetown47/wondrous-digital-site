// LAB-specific types that extend the base builder types

import type { SectionContent } from './builder';

// Content for LAB drafts that support multiple sections
export interface LabPageContent {
  // Similar to PageContent but with inline section data instead of references
  sections: Array<{
    id: string;
    component_name: string; // Component from registry
    order: number;
    content: Record<string, unknown>; // Component props/content
    metadata?: Record<string, unknown>;
  }>;
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

// Single section content (for backward compatibility)
export interface LabSectionContent extends SectionContent {
  // Single component configuration
  component_name?: string;
  heroContent?: Record<string, unknown>;
  navigationContent?: Record<string, unknown>;
  [key: string]: unknown;
}

// Union type for LAB content
export type LabContent = LabSectionContent | LabPageContent;

// Helper to check if content is multi-section
export function isMultiSectionContent(content: unknown): content is LabPageContent {
  return (
    typeof content === 'object' &&
    content !== null &&
    'sections' in content &&
    Array.isArray((content as Record<string, unknown>).sections)
  );
}

// Helper to convert single section to multi-section format
export function convertToMultiSection(
  singleContent: LabSectionContent,
  componentName?: string
): LabPageContent {
  return {
    sections: [
      {
        id: `section-${Date.now()}`,
        component_name: componentName || singleContent.component_name || 'HeroTwoColumn',
        order: 0,
        content: singleContent,
        metadata: {}
      }
    ],
    metadata: {}
  };
}