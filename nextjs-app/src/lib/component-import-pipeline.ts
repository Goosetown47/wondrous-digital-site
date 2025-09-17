/**
 * Component Import Pipeline
 *
 * Automated system for importing shadcn/ui components into the Lab/Library.
 * Analyzes component code to automatically generate editable field configurations.
 */

import type { EditableFieldConfig, EditableFieldType } from '@/types/builder';

/**
 * Result of parsing a TypeScript interface
 */
export interface ParsedInterface {
  name: string;
  properties: Array<{
    name: string;
    type: string;
    required: boolean;
  }>;
}

/**
 * Result of validating a component
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Component import result
 */
export interface ComponentImportResult {
  success: boolean;
  component?: {
    name: string;
    type: string;
    editableFields: EditableFieldConfig[];
    defaultContent: Record<string, unknown>;
    validation: ValidationResult;
  };
  error?: string;
}

/**
 * Component import configuration
 */
export interface ComponentImportConfig {
  name?: string;
  code: string;
  path: string;
}

/**
 * Detects the component type from the file path or component name
 */
export function detectComponentType(code: string, filePath: string): string {
  // Check folder structure first
  if (filePath.includes('/sections/') || filePath.includes('/section/')) {
    return 'section';
  }
  if (filePath.includes('/navigation/') || filePath.includes('/nav/')) {
    return 'navigation';
  }
  if (filePath.includes('/layout/') || filePath.includes('/layouts/')) {
    return 'layout';
  }

  // Check component name patterns
  const lowerCode = code.toLowerCase();
  if (lowerCode.includes('section') || lowerCode.includes('hero') || lowerCode.includes('testimonial')) {
    return 'section';
  }
  if (lowerCode.includes('navbar') || lowerCode.includes('header') || lowerCode.includes('menu')) {
    return 'navigation';
  }
  if (lowerCode.includes('footer') || lowerCode.includes('sidebar')) {
    return 'layout';
  }

  // Default to generic component
  return 'component';
}

/**
 * Parses TypeScript interface or type definitions from component code
 */
export function parseTypeScriptInterface(code: string): ParsedInterface | null {
  // Look for interface definitions - handle extends case separately
  let interfaceMatch = code.match(/(?:interface|type)\s+(\w+Props)\s*extends\s+\w+\s*\{([^}]+)\}/);

  if (!interfaceMatch) {
    // Try without extends
    interfaceMatch = code.match(/(?:interface|type)\s+(\w+Props)\s*[={]([^}]+)[}]/);
  }

  if (!interfaceMatch) {
    return null;
  }

  const [, name, content] = interfaceMatch;
  const properties: ParsedInterface['properties'] = [];

  // Parse properties from the interface content
  const propMatches = content.matchAll(/(\w+)(\?)?\s*:\s*([^;,\n]+)/g);

  for (const match of propMatches) {
    const [, propName, optional, propType] = match;
    properties.push({
      name: propName,
      type: propType.trim(),
      required: !optional
    });
  }

  return { name, properties };
}

/**
 * Extracts default props from component definition
 */
export function extractDefaultProps(code: string): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};

  // Check for destructured default values in function parameters
  // Handle multiline function signatures - match the entire parameter block
  // Support both regular function and export function syntax, with TypeScript types
  const paramMatch = code.match(/(?:export\s+)?function\s+\w+\s*\(\s*\{([\s\S]*?)\}\s*(?::\s*\w+)?\s*\)/);
  if (paramMatch) {
    const params = paramMatch[1];

    // Split by commas not inside braces/brackets, handling nested structures
    const paramParts: string[] = [];
    let current = '';
    let depth = 0;
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < params.length; i++) {
      const char = params[i];

      // Track string boundaries
      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar && params[i - 1] !== '\\') {
        inString = false;
      }

      // Track nesting depth when not in a string
      if (!inString) {
        if (char === '{' || char === '[') depth++;
        else if (char === '}' || char === ']') depth--;
        else if (char === ',' && depth === 0) {
          if (current.trim()) paramParts.push(current.trim());
          current = '';
          continue;
        }
      }

      current += char;
    }
    if (current.trim()) paramParts.push(current.trim());

    // Parse each parameter
    for (const param of paramParts) {
      const defaultMatch = param.match(/^\s*(\w+)\s*=\s*([\s\S]+)$/);
      if (defaultMatch) {
        const [, key, value] = defaultMatch;
        const trimmedValue = value.trim();

        // Parse the value
        try {
          if (trimmedValue.startsWith('"') || trimmedValue.startsWith("'")) {
            defaults[key] = trimmedValue.slice(1, -1);
          } else if (trimmedValue === 'true') {
            defaults[key] = true;
          } else if (trimmedValue === 'false') {
            defaults[key] = false;
          } else if (trimmedValue === 'null') {
            defaults[key] = null;
          } else if (trimmedValue.startsWith('{')) {
            // Object literal - use JSON.parse for safer parsing
            // First convert JS object literal to JSON format
            const jsonStr = trimmedValue
              .replace(/(\w+):/g, '"$1":') // Quote keys
              .replace(/'/g, '"'); // Replace single quotes with double
            try {
              defaults[key] = JSON.parse(jsonStr);
            } catch {
              // Fallback to Function constructor if JSON parse fails
              defaults[key] = new Function(`return ${trimmedValue}`)();
            }
          } else if (trimmedValue.startsWith('[')) {
            // Array literal - replace single quotes and parse
            const jsonStr = trimmedValue.replace(/'/g, '"');
            try {
              defaults[key] = JSON.parse(jsonStr);
            } catch {
              // Fallback to Function constructor if JSON parse fails
              defaults[key] = new Function(`return ${trimmedValue}`)();
            }
          } else if (!isNaN(Number(trimmedValue))) {
            defaults[key] = Number(trimmedValue);
          } else {
            defaults[key] = trimmedValue;
          }
        } catch {
          // If parsing fails, store as string
          defaults[key] = trimmedValue;
        }
      }
    }
  }

  // Check for defaultProps static property
  const defaultPropsMatch = code.match(/\w+\.defaultProps\s*=\s*\{([^}]+)\}/);
  if (defaultPropsMatch) {
    const propsContent = defaultPropsMatch[1];
    const propMatches = propsContent.matchAll(/(\w+)\s*:\s*([^,}]+)/g);

    for (const match of propMatches) {
      const [, key, value] = match;
      try {
        if (value.trim().startsWith("'") || value.trim().startsWith('"')) {
          defaults[key] = value.trim().slice(1, -1);
        } else {
          defaults[key] = value.trim();
        }
      } catch {
        defaults[key] = value.trim();
      }
    }
  }

  return defaults;
}

/**
 * Generates editable field configuration from parsed interface
 */
export function generateEditableConfig(parsedInterface: ParsedInterface): EditableFieldConfig[] {
  const configs: EditableFieldConfig[] = [];

  for (const prop of parsedInterface.properties) {
    const config: EditableFieldConfig = {
      path: prop.name,
      type: 'text' as EditableFieldType, // Default type
      label: prop.name.charAt(0).toUpperCase() + prop.name.slice(1).replace(/([A-Z])/g, ' $1').trim(),
      required: prop.required
    };

    // Determine field type based on property name and TypeScript type
    const lowerName = prop.name.toLowerCase();
    const lowerType = prop.type.toLowerCase();

    // Check for specific field types based on naming patterns
    if (lowerName.includes('description') || lowerName.includes('content') || lowerName.includes('body')) {
      config.type = 'richText';
    } else if (lowerName.includes('image') || lowerName.includes('img') || lowerName.includes('src') || lowerName.includes('url')) {
      config.type = 'image';
    } else if (lowerName.includes('button') || lowerName.includes('btn')) {
      config.type = 'text';
    } else if (lowerType.includes('boolean')) {
      config.type = 'boolean';
    } else if (lowerType.includes('number')) {
      config.type = 'number';
    } else if (lowerType.includes('array')) {
      config.type = 'array';
    } else if (lowerType.includes('|')) {
      // Union type - likely a select
      config.type = 'select';
    }

    configs.push(config);
  }

  return configs;
}

/**
 * Validates a component for compatibility
 */
export function validateComponent(code: string, componentName: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if component is exported
  if (!code.includes(`export function ${componentName}`) &&
      !code.includes(`export const ${componentName}`) &&
      !code.includes(`export default ${componentName}`) &&
      !code.includes(`export class ${componentName}`)) {
    errors.push('Component is not exported');
  }

  // Check for React import
  if (!code.includes('import React') && !code.includes("from 'react'")) {
    warnings.push('Missing React import');
  }

  // Check for class components (not recommended)
  if (code.includes(`class ${componentName}`) && code.includes('extends React.Component')) {
    warnings.push('Class components are not recommended');
  }

  // Check for 'any' types in props
  const interfaceMatch = code.match(/interface.*Props[\s\S]*?}/);
  if (interfaceMatch) {
    const propMatches = interfaceMatch[0].matchAll(/(\w+)\s*:\s*any/g);
    for (const match of propMatches) {
      warnings.push(`Prop "${match[1]}" uses "any" type`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Imports a single component
 */
export async function importComponent(config: ComponentImportConfig): Promise<ComponentImportResult> {
  try {
    // Auto-detect component name if not provided
    let componentName = config.name;
    if (!componentName) {
      // Try to find the main export
      const exportMatch = config.code.match(/export\s+(?:function|const|class)\s+(\w+)/);
      if (exportMatch) {
        componentName = exportMatch[1];
      } else if (config.code.includes('export default')) {
        const defaultMatch = config.code.match(/(?:function|const|class)\s+(\w+)/);
        if (defaultMatch) {
          componentName = defaultMatch[1];
        }
      }
    }

    if (!componentName) {
      return {
        success: false,
        error: 'Could not detect component name'
      };
    }

    // Validate the component
    const validation = validateComponent(config.code, componentName);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      };
    }

    // Parse TypeScript interface
    const parsedInterface = parseTypeScriptInterface(config.code);

    // Extract default props
    const extractedDefaults = extractDefaultProps(config.code);

    // Generate editable field configuration
    const editableFields = parsedInterface
      ? generateEditableConfig(parsedInterface)
      : [];

    // Detect component type
    const type = detectComponentType(config.code, config.path);

    // Create default content by merging extracted defaults with field types
    const defaultContent: Record<string, unknown> = { ...extractedDefaults };

    // Fill in missing default values
    for (const field of editableFields) {
      if (!(field.path in defaultContent)) {
        // Provide sensible defaults based on field type
        if (field.type === 'text' || field.type === 'richText') {
          defaultContent[field.path] = '';
        } else if (field.type === 'boolean') {
          defaultContent[field.path] = false;
        } else if (field.type === 'number') {
          defaultContent[field.path] = 0;
        } else if (field.type === 'array') {
          defaultContent[field.path] = [];
        }
      }
    }

    return {
      success: true,
      component: {
        name: componentName,
        type,
        editableFields,
        defaultContent,
        validation
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Imports multiple components in bulk
 */
export async function bulkImportComponents(
  configs: ComponentImportConfig[],
  onProgress?: (current: number, total: number, componentName: string) => void
): Promise<ComponentImportResult[]> {
  const results: ComponentImportResult[] = [];

  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];

    // Notify progress
    if (onProgress) {
      const componentName = config.name || 'Component ' + (i + 1);
      onProgress(i + 1, configs.length, componentName);
    }

    // Import the component
    const result = await importComponent(config);
    results.push(result);
  }

  return results;
}