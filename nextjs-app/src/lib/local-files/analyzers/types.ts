/**
 * Shared TypeScript types for the analyzer services
 */

import type { EditableFieldConfig } from '@/lib/component-registry';

// ============================================================================
// InterfaceAnalyzer Types
// ============================================================================

/**
 * Represents a single property in a TypeScript interface
 */
export interface InterfaceProperty {
  name: string;
  type: string;
  optional: boolean;
  defaultValue?: unknown;
}

/**
 * Result from analyzing a TypeScript interface
 */
export interface InterfaceProps {
  interfaceName: string;
  properties: InterfaceProperty[];
}

// ============================================================================
// ContentExtractor Types
// ============================================================================

/**
 * Represents a text node extracted from JSX
 */
export interface TextNode {
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  value: string;
  path: string;
}

/**
 * Represents an image extracted from JSX
 */
export interface ImageNode {
  src: string;
  alt?: string;
  path: string;
}

/**
 * Represents a button extracted from JSX
 */
export interface ButtonNode {
  text: string;
  url?: string;
  path: string;
}

/**
 * Result from extracting content from a component's JSX
 */
export interface ExtractedContent {
  textNodes: TextNode[];
  images: ImageNode[];
  buttons: ButtonNode[];
  urls: string[];
}

// ============================================================================
// SchemaBuilder Types
// ============================================================================

/**
 * Final schema result combining interface + extracted content
 */
export interface Schema {
  editableFields: EditableFieldConfig[];
  defaultContent: Record<string, unknown>;
}
