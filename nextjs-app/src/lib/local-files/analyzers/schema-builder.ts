/**
 * SchemaBuilder
 *
 * Merges interface props with extracted content to create final schema.
 * Infers field types, generates labels, builds defaultContent object.
 */

import type { InterfaceProps, ExtractedContent, Schema } from './types';
import type { EditableFieldConfig } from '@/lib/component-registry';

/**
 * Build final schema from interface + extracted content
 *
 * @param interfaceProps - Props from TypeScript interface (or null)
 * @param extractedContent - Extracted JSX content
 * @returns Complete schema with editableFields and defaultContent
 */
export function buildSchema(
  interfaceProps: InterfaceProps | null,
  extractedContent: ExtractedContent
): Schema {
  const editableFields: EditableFieldConfig[] = [];
  const defaultContent: Record<string, unknown> = {};

  // Step 1: Add fields from interface (if exists)
  if (interfaceProps) {
    for (const prop of interfaceProps.properties) {
      const fieldType = mapInterfaceTypeToFieldType(prop.type);

      editableFields.push({
        path: prop.name,
        type: fieldType,
        label: formatLabel(prop.name),
        required: !prop.optional,
      });

      // Add default value if available
      if (prop.defaultValue !== undefined) {
        defaultContent[prop.name] = prop.defaultValue;
      }
    }
  }

  // Step 2: Add fields from extracted text nodes
  for (const textNode of extractedContent.textNodes) {
    // Skip if already exists from interface
    if (editableFields.some(f => f.path === textNode.path)) {
      continue;
    }

    const fieldType = textNode.type === 'p' ? 'richText' : 'text';

    editableFields.push({
      path: textNode.path,
      type: fieldType,
      label: formatLabel(textNode.path),
      required: false,
    });

    defaultContent[textNode.path] = textNode.value;
  }

  // Step 3: Add fields from extracted images
  for (const image of extractedContent.images) {
    // Skip if already exists
    if (editableFields.some(f => f.path === image.path)) {
      continue;
    }

    editableFields.push({
      path: image.path,
      type: 'image',
      label: formatLabel(image.path),
      required: false,
    });

    defaultContent[image.path] = image.src;

    // Add alt text as separate field if exists
    if (image.alt) {
      const altPath = `${image.path}Alt`;
      editableFields.push({
        path: altPath,
        type: 'text',
        label: formatLabel(altPath),
        required: false,
      });

      defaultContent[altPath] = image.alt;
    }
  }

  // Step 4: Add fields from extracted buttons
  for (const button of extractedContent.buttons) {
    // Skip if already exists
    if (editableFields.some(f => f.path === button.path)) {
      continue;
    }

    editableFields.push({
      path: button.path,
      type: 'button',
      label: formatLabel(button.path),
      required: false,
    });

    defaultContent[button.path] = button.text;

    // Add URL if exists
    if (button.url) {
      const urlPath = `${button.path}Url`;  // button1 → button1Url
      editableFields.push({
        path: urlPath,
        type: 'url',
        label: formatLabel(urlPath),
        required: false,
      });

      defaultContent[urlPath] = button.url;
    }
  }

  return {
    editableFields,
    defaultContent,
  };
}

/**
 * Map TypeScript interface type to EditableFieldConfig type
 */
function mapInterfaceTypeToFieldType(interfaceType: string): EditableFieldConfig['type'] {
  const type = interfaceType.toLowerCase();

  if (type === 'string') return 'text';
  if (type === 'number') return 'number';
  if (type === 'boolean') return 'boolean';
  if (type.includes('[]') || type.startsWith('array')) return 'array';

  // Default
  return 'text';
}

/**
 * Format path name into human-readable label
 *
 * Example: "heroImage" → "Hero Image"
 *          "button1Text" → "Button 1 Text"
 */
function formatLabel(path: string): string {
  // Split on capital letters and numbers
  const words = path
    .replace(/([A-Z])/g, ' $1')
    .replace(/(\d+)/g, ' $1')
    .trim()
    .split(/\s+/);

  // Capitalize first letter of each word
  return words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
