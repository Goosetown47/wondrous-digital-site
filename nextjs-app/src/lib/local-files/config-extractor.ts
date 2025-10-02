/**
 * Config Extractor
 *
 * Simple utility to extract config exports from custom component source code.
 *
 * Replaces complex analyzer/normalizer system with straightforward regex extraction.
 * Custom components MUST include a config export with editableFields and defaultContent.
 *
 * @module config-extractor
 */

import type { EditableFieldConfig } from '@/lib/component-registry';

/**
 * Extracted config structure
 */
export interface ExtractedConfig {
  configName: string;
  editableFields: EditableFieldConfig[];
  defaultContent: Record<string, unknown>;
}

/**
 * Extract config export from component source code
 *
 * Looks for pattern: export const [name]Config = { editableFields: [...], defaultContent: {...} }
 *
 * @param code - Component source code
 * @returns Extracted config with name, fields, and default content
 * @throws Error if no config found or config is invalid
 *
 * @example
 * ```typescript
 * const source = `
 *   export default function Hero({ heading = "Default" }: HeroProps) { ... }
 *   export const heroConfig = {
 *     editableFields: [{ path: 'heading', type: 'text', label: 'Heading' }],
 *     defaultContent: { heading: 'Default' }
 *   };
 * `;
 *
 * const config = extractConfigFromSource(source);
 * // Returns: { configName: 'heroConfig', editableFields: [...], defaultContent: {...} }
 * ```
 */
export function extractConfigFromSource(code: string): ExtractedConfig {
  // Find config export pattern: export const [name]Config = { ... };
  // Using multiline regex to capture config body
  const configMatch = code.match(/export const (\w+Config) = \{([\s\S]*?)\};(?:\s*$|\s*\n)/m);

  if (!configMatch) {
    throw new Error(
      'No config export found. Custom components must export a config.\n\n' +
      'Required format:\n' +
      'export const componentnameConfig = {\n' +
      '  editableFields: [...],\n' +
      '  defaultContent: {...}\n' +
      '};\n\n' +
      'See: /docs/In_Progress/SYSTEM_UPDATE_Section_Intake_Process.md'
    );
  }

  const configName = configMatch[1];
  const configBody = configMatch[2];

  // Extract editableFields array (strip TypeScript type annotation)
  // eslint-disable-next-line security/detect-unsafe-regex
  const fieldsMatch = configBody.match(/editableFields:\s*(\[[\s\S]*?\])\s*(?:as\s+[\w[\]]+)?\s*,/);
  if (!fieldsMatch) {
    throw new Error(
      `Config "${configName}" is missing editableFields array.\n\n` +
      'Required: editableFields: [{ path: "...", type: "...", label: "..." }]'
    );
  }

  // Extract defaultContent object
  const contentMatch = configBody.match(/defaultContent:\s*(\{[\s\S]*?\})\s*$/);
  if (!contentMatch) {
    throw new Error(
      `Config "${configName}" is missing defaultContent object.\n\n` +
      'Required: defaultContent: { fieldName: "value" }'
    );
  }

  // Parse extracted values
  // Using eval in controlled context - source is from trusted developers
  // Alternative: Use @babel/parser for AST-based parsing (more complex, not needed here)
  let editableFields: EditableFieldConfig[];
  let defaultContent: Record<string, unknown>;

  try {
    // Evaluate editableFields array
    // eslint-disable-next-line security/detect-eval-with-expression, @typescript-eslint/no-implied-eval
    editableFields = eval(`(${fieldsMatch[1]})`);

    // Evaluate defaultContent object
    // eslint-disable-next-line security/detect-eval-with-expression, @typescript-eslint/no-implied-eval
    defaultContent = eval(`(${contentMatch[1]})`);
  } catch (parseError) {
    throw new Error(
      `Failed to parse config "${configName}".\n` +
      `Error: ${parseError instanceof Error ? parseError.message : 'Unknown error'}\n\n` +
      'Check for syntax errors in your config export.'
    );
  }

  // Validate structure
  if (!Array.isArray(editableFields)) {
    throw new Error(
      `Config "${configName}": editableFields must be an array.\n` +
      `Got: ${typeof editableFields}`
    );
  }

  if (typeof defaultContent !== 'object' || defaultContent === null || Array.isArray(defaultContent)) {
    throw new Error(
      `Config "${configName}": defaultContent must be an object.\n` +
      `Got: ${Array.isArray(defaultContent) ? 'array' : typeof defaultContent}`
    );
  }

  // Validate each field has required properties
  for (let i = 0; i < editableFields.length; i++) {
    // eslint-disable-next-line security/detect-object-injection
    const field = editableFields[i];

    if (!field.path) {
      throw new Error(
        `Config "${configName}": Field at index ${i} is missing required "path" property`
      );
    }

    if (!field.type) {
      throw new Error(
        `Config "${configName}": Field "${field.path}" is missing required "type" property`
      );
    }

    if (!field.label) {
      throw new Error(
        `Config "${configName}": Field "${field.path}" is missing required "label" property`
      );
    }

    // Validate type is one of the allowed values
    const validTypes = ['text', 'richText', 'image', 'button', 'url', 'number', 'boolean', 'select', 'array'];
    if (!validTypes.includes(field.type)) {
      throw new Error(
        `Config "${configName}": Field "${field.path}" has invalid type "${field.type}".\n` +
        `Valid types: ${validTypes.join(', ')}`
      );
    }
  }

  // Optional: Validate defaultContent keys match editableFields paths
  const warnings: string[] = [];
  const fieldPaths = new Set(editableFields.map(f => f.path));
  const contentKeys = Object.keys(defaultContent);

  for (const key of contentKeys) {
    if (!fieldPaths.has(key)) {
      warnings.push(`defaultContent has "${key}" but no matching editableField`);
    }
  }

  if (warnings.length > 0) {
    console.warn(
      `⚠️  Config "${configName}" has potential issues:\n` +
      warnings.map(w => `  - ${w}`).join('\n')
    );
  }

  return {
    configName,
    editableFields,
    defaultContent
  };
}

/**
 * Validate that a component has a config export (quick check)
 *
 * @param code - Component source code
 * @returns true if config export found, false otherwise
 */
export function hasConfigExport(code: string): boolean {
  return /export const \w+Config = \{/.test(code);
}

/**
 * Get config name from source code without full extraction
 *
 * @param code - Component source code
 * @returns Config name or null if not found
 */
export function getConfigName(code: string): string | null {
  const match = code.match(/export const (\w+Config) = \{/);
  return match ? match[1] : null;
}
