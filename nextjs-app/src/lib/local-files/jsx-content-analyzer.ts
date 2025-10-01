/**
 * JSX Content Analyzer
 *
 * Automatically detects editable fields from component code using hybrid approach:
 * 1. Parse TypeScript interfaces (for prop-based components)
 * 2. Scan JSX content (for hardcoded content)
 * 3. Merge results
 *
 * @module jsx-content-analyzer
 */

import type { EditableFieldConfig, EditableFieldType } from '@/lib/component-registry';
import {
  parseTypeScriptInterface,
  extractDefaultProps,
  generateEditableConfig
} from '@/lib/component-import-pipeline';

/**
 * Result of JSX content analysis
 */
export interface JSXAnalysisResult {
  editableFields: EditableFieldConfig[];
  defaultContent: Record<string, unknown>;
}

/**
 * Detected field from JSX
 */
interface DetectedField {
  type: EditableFieldType;
  content: string;
  attributes?: Record<string, string>;
}

/**
 * Analyze component code to detect editable fields
 * Uses hybrid approach: TypeScript interface parsing + JSX content scanning
 */
export function analyzeJSXContent(code: string): JSXAnalysisResult {
  try {
    // Strategy 1: Try TypeScript interface parsing (for prop-based components)
    const parsedInterface = parseTypeScriptInterface(code);
    const extractedDefaults = extractDefaultProps(code);

    if (parsedInterface && parsedInterface.properties.length > 0) {
      // Generate field configs from interface
      const interfaceFields = generateEditableConfig(parsedInterface);

      // Use extracted defaults as default content
      // IMPORTANT: Only include values we successfully extracted
      // Don't fill in missing values - let component defaults work
      const defaultContent = { ...extractedDefaults };

      return {
        editableFields: interfaceFields,
        defaultContent,
      };
    }

    // Strategy 2: Fall back to JSX content scanning (for hardcoded components)
    return analyzeJSXContentDirect(code);

  } catch {
    // Return empty results on error - component will still work, just not editable
    return { editableFields: [], defaultContent: {} };
  }
}

/**
 * Direct JSX content analysis (for components without TypeScript interfaces)
 */
function analyzeJSXContentDirect(code: string): JSXAnalysisResult {
  const fields: EditableFieldConfig[] = [];
  const content: Record<string, unknown> = {};
  const fieldCounts: Record<string, number> = {};

  try {
    // Detect headings (h1-h6)
    const headings = detectHeadings(code);
    headings.forEach(heading => {
      const fieldName = generateUniqueFieldName('heading', fieldCounts);
      fields.push({
        path: fieldName,
        type: 'text',
        label: `Heading ${fieldCounts[fieldName]}`,
        maxLength: 100,
      });
      content[fieldName] = heading.content;
    });

    // Detect paragraphs and text content
    const paragraphs = detectParagraphs(code);
    paragraphs.forEach(para => {
      const fieldName = generateUniqueFieldName('description', fieldCounts);
      fields.push({
        path: fieldName,
        type: 'richText',
        label: `Description ${fieldCounts[fieldName]}`,
        maxLength: 5000,
      });
      content[fieldName] = para.content;
    });

    // Detect images
    const images = detectImages(code);
    images.forEach(img => {
      const fieldName = generateUniqueFieldName('image', fieldCounts);
      fields.push({
        path: fieldName,
        type: 'image',
        label: `Image ${fieldCounts[fieldName]}`,
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
      });
      content[fieldName] = img.attributes?.src || '';

      // Add alt text field if present
      if (img.attributes?.alt) {
        const altFieldName = `${fieldName}Alt`;
        fields.push({
          path: altFieldName,
          type: 'text',
          label: `Image ${fieldCounts[fieldName]} Alt Text`,
          maxLength: 200,
        });
        content[altFieldName] = img.attributes.alt;
      }
    });

    // Detect buttons
    const buttons = detectButtons(code);
    buttons.forEach(button => {
      const fieldName = generateUniqueFieldName('buttonText', fieldCounts);
      fields.push({
        path: fieldName,
        type: 'text',
        label: `Button ${fieldCounts[fieldName]} Text`,
        maxLength: 50,
      });
      content[fieldName] = button.content;
    });

    // Detect links
    const links = detectLinks(code);
    links.forEach(link => {
      const fieldName = generateUniqueFieldName('link', fieldCounts);
      fields.push({
        path: `${fieldName}Url`,
        type: 'url',
        label: `Link ${fieldCounts[fieldName]} URL`,
        placeholder: 'https://example.com',
      });
      content[`${fieldName}Url`] = link.attributes?.href || '';

      if (link.content) {
        fields.push({
          path: `${fieldName}Text`,
          type: 'text',
          label: `Link ${fieldCounts[fieldName]} Text`,
          maxLength: 100,
        });
        content[`${fieldName}Text`] = link.content;
      }
    });

    return { editableFields: fields, defaultContent: content };
  } catch (error) {
    console.error('JSX content scanning error:', error);
    return { editableFields: [], defaultContent: {} };
  }
}


/**
 * Detect heading elements (h1-h6)
 * FIXED: Use [\s\S]*? to match content across newlines
 */
function detectHeadings(code: string): DetectedField[] {
  const headings: DetectedField[] = [];
  const headingPattern = /<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi;

  let match;
  while ((match = headingPattern.exec(code)) !== null) {
    const content = extractTextContent(match[2]);
    if (content && content.length > 0) {
      headings.push({ type: 'text', content });
    }
  }

  return headings;
}

/**
 * Detect paragraph and span elements with text content
 * FIXED: Use [\s\S]*? to match content across newlines
 */
function detectParagraphs(code: string): DetectedField[] {
  const paragraphs: DetectedField[] = [];

  // Detect <p> tags
  const pPattern = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = pPattern.exec(code)) !== null) {
    const content = extractTextContent(match[1]);
    if (content && content.length > 20) { // Only paragraphs with substantial content
      paragraphs.push({ type: 'richText', content });
    }
  }

  return paragraphs;
}

/**
 * Detect image elements
 */
function detectImages(code: string): DetectedField[] {
  const images: DetectedField[] = [];
  const imgPattern = /<img([^>]*)>/gi;

  let match;
  while ((match = imgPattern.exec(code)) !== null) {
    const attributes = extractAttributes(match[1]);
    if (attributes.src) {
      images.push({
        type: 'image',
        content: attributes.src,
        attributes,
      });
    }
  }

  return images;
}

/**
 * Detect Button components
 * FIXED: Use [\s\S]*? to match content across newlines
 */
function detectButtons(code: string): DetectedField[] {
  const buttons: DetectedField[] = [];

  // Detect <Button> components
  const buttonPattern = /<Button[^>]*>([\s\S]*?)<\/Button>/gi;
  let match;
  while ((match = buttonPattern.exec(code)) !== null) {
    const content = extractTextContent(match[1]);
    if (content && content.length > 0) {
      buttons.push({ type: 'button', content });
    }
  }

  // Also detect <button> HTML elements
  const htmlButtonPattern = /<button[^>]*>([\s\S]*?)<\/button>/gi;
  while ((match = htmlButtonPattern.exec(code)) !== null) {
    const content = extractTextContent(match[1]);
    if (content && content.length > 0) {
      buttons.push({ type: 'button', content });
    }
  }

  return buttons;
}

/**
 * Detect link elements
 * FIXED: Use [\s\S]*? to match content across newlines
 */
function detectLinks(code: string): DetectedField[] {
  const links: DetectedField[] = [];
  const linkPattern = /<a([^>]*)>([\s\S]*?)<\/a>/gi;

  let match;
  while ((match = linkPattern.exec(code)) !== null) {
    const attributes = extractAttributes(match[1]);
    const content = extractTextContent(match[2]);

    if (attributes.href) {
      links.push({
        type: 'url',
        content,
        attributes,
      });
    }
  }

  return links;
}

/**
 * Extract text content from JSX, removing nested tags
 */
function extractTextContent(jsx: string): string {
  // Remove JSX expressions like {variable}
  let text = jsx.replace(/\{[^}]*\}/g, '');

  // Remove HTML/JSX tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');

  // Trim and normalize whitespace
  text = text.trim().replace(/\s+/g, ' ');

  return text;
}

/**
 * Extract attributes from an element's attribute string
 */
function extractAttributes(attrString: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const attrPattern = /(\w+)=["']([^"']*)["']/g;

  let match;
  while ((match = attrPattern.exec(attrString)) !== null) {
    attributes[match[1]] = match[2];
  }

  return attributes;
}

/**
 * Generate unique field name with counter
 */
function generateUniqueFieldName(
  baseName: string,
  counts: Record<string, number>
): string {
  if (!(baseName in counts)) {
    counts[baseName] = 1;
  } else {
    counts[baseName]++;
  }

  const count = counts[baseName];
  return count === 1 ? baseName : `${baseName}${count}`;
}

/**
 * Generate human-readable label from field path
 */
export function generateFieldLabel(path: string): string {
  // Handle numbered fields (e.g., heading2 -> Heading 2)
  const match = path.match(/^([a-z]+)(\d+)$/i);
  if (match) {
    const base = match[1].charAt(0).toUpperCase() + match[1].slice(1);
    return `${base} ${match[2]}`;
  }

  // Handle camelCase (e.g., buttonText -> Button Text)
  const words = path.replace(/([A-Z])/g, ' $1').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}
