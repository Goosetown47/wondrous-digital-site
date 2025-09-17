/**
 * Utilities for detecting and configuring editable fields in components
 * This module provides automatic detection of editable fields based on prop names and content structure
 */

import type { EditableFieldConfig, EditableFieldType } from './component-registry';

/**
 * Common prop name patterns mapped to field types
 */
const FIELD_TYPE_PATTERNS: Record<string, EditableFieldType> = {
  // Text fields
  heading: 'text',
  title: 'text',
  label: 'text',
  name: 'text',
  subtitle: 'text',
  caption: 'text',

  // Rich text fields
  description: 'richText',
  content: 'richText',
  body: 'richText',
  text: 'richText',
  subtext: 'richText',
  paragraph: 'richText',
  bio: 'richText',

  // Image fields
  image: 'image',
  imageUrl: 'image',
  imageSrc: 'image',
  src: 'image',
  avatar: 'image',
  photo: 'image',
  picture: 'image',
  thumbnail: 'image',
  cover: 'image',
  backgroundImage: 'image',
  logo: 'image',
  icon: 'image',

  // URL fields
  url: 'url',
  link: 'url',
  href: 'url',
  website: 'url',
  buttonLink: 'url',
  ctaLink: 'url',

  // Button fields
  buttonText: 'button',
  ctaText: 'button',
  actionText: 'button',

  // Boolean fields
  enabled: 'boolean',
  disabled: 'boolean',
  active: 'boolean',
  visible: 'boolean',
  show: 'boolean',
  hide: 'boolean',
  open: 'boolean',
  closed: 'boolean',

  // Number fields
  price: 'number',
  amount: 'number',
  quantity: 'number',
  count: 'number',
  rating: 'number',
  score: 'number',

  // Array fields (detected by plural names)
  items: 'array',
  features: 'array',
  testimonials: 'array',
  reviews: 'array',
  benefits: 'array',
  steps: 'array',
  faqs: 'array',
  menu: 'array',
  navigation: 'array',
  links: 'array',
  images: 'array',
  gallery: 'array',
  team: 'array',
  members: 'array',
  services: 'array',
  products: 'array',
};

/**
 * Label generation from field path
 */
function generateLabel(path: string): string {
  // Handle nested paths (e.g., 'logo.src' -> 'Logo Image')
  const parts = path.split('.');
  const lastPart = parts[parts.length - 1];

  // Convert camelCase to Title Case
  const words = lastPart.replace(/([A-Z])/g, ' $1').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Detect field type from prop name
 */
export function detectFieldType(propName: string): EditableFieldType {
  // Direct match
  if (propName in FIELD_TYPE_PATTERNS) {
    return FIELD_TYPE_PATTERNS[propName];
  }

  // Check for partial matches
  const lowerName = propName.toLowerCase();

  for (const [pattern, type] of Object.entries(FIELD_TYPE_PATTERNS)) {
    if (lowerName.includes(pattern.toLowerCase())) {
      return type;
    }
  }

  // Default to text for unknown fields
  return 'text';
}

/**
 * Analyze content structure to generate field configs
 */
export function analyzeContentStructure(
  content: Record<string, unknown>,
  parentPath = ''
): EditableFieldConfig[] {
  const fields: EditableFieldConfig[] = [];

  for (const [key, value] of Object.entries(content)) {
    const path = parentPath ? `${parentPath}.${key}` : key;

    // Skip internal fields
    if (key.startsWith('_') || key === 'id' || key === 'className') {
      continue;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === 'object') {
        // Array of objects - analyze first item for structure
        const itemFields = analyzeContentStructure(
          value[0] as Record<string, unknown>,
          ''
        );

        fields.push({
          path,
          type: 'array',
          label: generateLabel(key),
          itemFields,
        });
      } else {
        // Simple array
        fields.push({
          path,
          type: 'array',
          label: generateLabel(key),
        });
      }
      continue;
    }

    // Handle nested objects
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Check if it's a specific object pattern (like logo with src, alt)
      const valueObj = value as Record<string, unknown>;
      if ('src' in valueObj || 'url' in valueObj) {
        // Likely an image or link object
        const nestedFields = analyzeContentStructure(valueObj, path);
        nestedFields.forEach(field => fields.push(field));
      } else {
        // General nested object
        fields.push({
          path,
          type: 'object',
          label: generateLabel(key),
          nestedFields: analyzeContentStructure(valueObj, ''),
        });
      }
      continue;
    }

    // Handle primitive values
    const fieldType = detectFieldType(key);
    const field: EditableFieldConfig = {
      path,
      type: fieldType,
      label: generateLabel(key),
    };

    // Add type-specific configurations
    switch (fieldType) {
      case 'text':
        field.maxLength = key.includes('title') || key.includes('heading') ? 100 : 255;
        break;
      case 'richText':
        field.maxLength = 5000;
        break;
      case 'image':
        field.allowedFormats = ['jpg', 'jpeg', 'png', 'webp', 'svg'];
        break;
      case 'url':
        field.placeholder = 'https://example.com';
        break;
      case 'button':
        field.maxLength = 50;
        break;
    }

    fields.push(field);
  }

  return fields;
}

/**
 * Generate editable field configs for a component
 * This combines automatic detection with manual overrides
 */
export function generateEditableFields(
  defaultContent: Record<string, unknown>,
  overrides?: Partial<EditableFieldConfig>[]
): EditableFieldConfig[] {
  // Auto-detect fields from default content
  const detectedFields = analyzeContentStructure(defaultContent);

  // Apply manual overrides if provided
  if (overrides && overrides.length > 0) {
    overrides.forEach(override => {
      const existingField = detectedFields.find(f => f.path === override.path);
      if (existingField) {
        // Merge override with detected field
        Object.assign(existingField, override);
      } else if (override.path) {
        // Add new field from override
        detectedFields.push({
          path: override.path,
          type: override.type || 'text',
          label: override.label || generateLabel(override.path),
          ...override,
        });
      }
    });
  }

  return detectedFields;
}

/**
 * Validate that content matches field configurations
 */
export function validateContent(
  content: Record<string, unknown>,
  fields: EditableFieldConfig[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const field of fields) {
    // Get value at path
    const value = getValueAtPath(content, field.path);

    // Check required fields
    if (field.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field.label} is required`);
      continue;
    }

    // Skip validation for optional empty fields
    if (!field.required && (value === undefined || value === null || value === '')) {
      continue;
    }

    // Type-specific validation
    switch (field.type) {
      case 'text':
      case 'richText':
        if (typeof value !== 'string') {
          errors.push(`${field.label} must be a string`);
        } else if (field.maxLength && value.length > field.maxLength) {
          errors.push(`${field.label} exceeds maximum length of ${field.maxLength}`);
        }
        break;

      case 'number':
        if (typeof value !== 'number') {
          errors.push(`${field.label} must be a number`);
        } else {
          if (field.min !== undefined && value < field.min) {
            errors.push(`${field.label} must be at least ${field.min}`);
          }
          if (field.max !== undefined && value > field.max) {
            errors.push(`${field.label} must be at most ${field.max}`);
          }
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push(`${field.label} must be true or false`);
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          errors.push(`${field.label} must be an array`);
        }
        break;

      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          errors.push(`${field.label} must be an object`);
        }
        break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get value at a nested path
 */
export function getValueAtPath(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Set value at a nested path
 */
export function setValueAtPath(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): Record<string, unknown> {
  const parts = path.split('.');
  const result = { ...obj };
  let current: Record<string, unknown> = result;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];

    if (!(part in current) || typeof current[part] !== 'object' || current[part] === null) {
      current[part] = {};
    }

    current[part] = { ...(current[part] as Record<string, unknown>) };
    current = current[part] as Record<string, unknown>;
  }

  const lastPart = parts[parts.length - 1];
  current[lastPart] = value;

  return result;
}