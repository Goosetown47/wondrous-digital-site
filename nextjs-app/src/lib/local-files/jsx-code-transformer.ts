/**
 * JSX Code Transformer
 *
 * ⚠️ DEPRECATED - This file is no longer used in the component pipeline.
 *
 * As of 2025-09-30, we've moved to a runtime wrapper approach instead of
 * code transformation. Components are now stored as-is (clean, readable code)
 * and editing capabilities are injected at runtime by EditableSectionWrapper.
 *
 * This file is kept for reference but is not called during component creation.
 * See /docs/In_Progress/SYSTEM_Editable_Sections.md for new architecture.
 *
 * OLD APPROACH (no longer used):
 * - Transforms component source code to inject EditableText/EditableImage wrappers
 * - Strategy: String-based regex transformation
 *
 * NEW APPROACH (current):
 * - Components stored as original code
 * - Schema detected from TypeScript interface
 * - EditableSectionWrapper injects wrappers at runtime based on schema
 * - Industry-standard pattern (Framer, Builder.io, Prismic)
 *
 * @deprecated Use runtime wrapper approach via EditableSectionWrapper instead
 * @module jsx-code-transformer
 */

import type { EditableFieldConfig } from '@/lib/component-registry';

export interface TransformResult {
  transformedCode: string;
  success: boolean;
  errors: string[];
}

/**
 * Transform component source code to inject editing wrappers
 */
export function transformComponentCode(
  code: string,
  fieldConfigs: EditableFieldConfig[]
): TransformResult {
  try {
    let transformedCode = code;
    const errors: string[] = [];

    // Step 1: Add imports
    transformedCode = addEditingImports(transformedCode);

    // Step 2: Add handler props to function signature
    transformedCode = addHandlerProps(transformedCode, fieldConfigs);

    // Step 3: Wrap JSX elements with editing components
    transformedCode = wrapJSXElements(transformedCode, fieldConfigs, errors);

    return {
      transformedCode,
      success: errors.length === 0,
      errors,
    };
  } catch (error) {
    return {
      transformedCode: code,
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown transformation error'],
    };
  }
}

/**
 * Add imports for EditableText and EditableImage at the top of the file
 */
function addEditingImports(code: string): string {
  // Check if imports already exist
  if (code.includes("from '@/components/shared/content-editor'")) {
    return code;
  }

  // Find the first import statement or 'use client' directive
  const importRegex = /^(('use client'|"use client");?\s*\n)?/m;
  const match = code.match(importRegex);

  if (match) {
    const position = match[0].length;
    const importStatement = "import { EditableText, EditableImage, EditableButton } from '@/components/shared/content-editor';\n\n";
    return code.slice(0, position) + importStatement + code.slice(position);
  }

  // Fallback: add at the very beginning
  return "import { EditableText, EditableImage, EditableButton } from '@/components/shared/content-editor';\n\n" + code;
}

/**
 * Add handler props to the TypeScript interface and function signature
 */
function addHandlerProps(code: string, fieldConfigs: EditableFieldConfig[]): string {
  let updatedCode = code;

  // Step 1: Update TypeScript interface
  updatedCode = updateTypeScriptInterface(updatedCode, fieldConfigs);

  // Step 2: Update function parameters
  updatedCode = updateFunctionParameters(updatedCode, fieldConfigs);

  return updatedCode;
}

/**
 * Add handler prop types to the TypeScript interface
 */
function updateTypeScriptInterface(code: string, fieldConfigs: EditableFieldConfig[]): string {
  // Find the Props interface - match across multiple lines
  const interfaceRegex = /interface\s+(\w+Props)\s*\{([\s\S]*?)\n\}/;
  const match = code.match(interfaceRegex);

  if (!match) {
    return code; // No interface found
  }

  const interfaceName = match[1];
  const interfaceBody = match[2];

  // Build handler prop declarations - use Set to prevent duplicates
  const handlerProps: string[] = [];
  const addedHandlers = new Set<string>();

  fieldConfigs.forEach(field => {
    const handlerName = `on${capitalize(field.path)}Change`;

    // Skip if already in interface body or already added in this run
    if (interfaceBody.includes(handlerName) || addedHandlers.has(handlerName)) {
      return;
    }

    handlerProps.push(`  ${handlerName}?: (value: unknown) => void;`);
    addedHandlers.add(handlerName);
  });

  // Add editable prop if not present
  if (!interfaceBody.includes('editable')) {
    handlerProps.push(`  editable?: boolean;`);
  }

  if (handlerProps.length === 0) {
    return code; // All props already exist
  }

  // Insert new props before the closing brace
  const newInterface = `interface ${interfaceName} {${interfaceBody}\n${handlerProps.join('\n')}\n}`;

  return code.replace(interfaceRegex, newInterface);
}

/**
 * Add handler props to function parameters
 */
function updateFunctionParameters(code: string, fieldConfigs: EditableFieldConfig[]): string {
  // Find function with destructured parameters - handle multi-line
  // Pattern: const Component = ({ ...params }: PropsType) =>
  const functionRegex = /\(\s*\{([\s\S]*?)\}\s*:\s*(\w+Props)\s*\)/;
  const match = code.match(functionRegex);

  if (!match) {
    return code; // Can't find parameters
  }

  const existingParams = match[1];
  const propsType = match[2];

  // Build handler param names - use Set to prevent duplicates
  const handlerParams: string[] = [];
  const addedHandlers = new Set<string>();

  fieldConfigs.forEach(field => {
    const handlerName = `on${capitalize(field.path)}Change`;

    // Skip if already in params or already added in this run
    if (existingParams.includes(handlerName) || addedHandlers.has(handlerName)) {
      return;
    }

    handlerParams.push(`  ${handlerName}`);
    addedHandlers.add(handlerName);
  });

  // Add editable param if not present
  if (!existingParams.includes('editable')) {
    handlerParams.push(`  editable = false`);
  }

  if (handlerParams.length === 0) {
    return code; // All params already exist
  }

  // Check if existing params already have trailing comma
  const hasTrailingComma = existingParams.trim().endsWith(',');
  const separator = hasTrailingComma ? '\n' : ',\n';

  // Add new params
  const newParams = existingParams + separator + handlerParams.join(',\n');

  return code.replace(functionRegex, `({\n${newParams}\n}: ${propsType})`);
}

/**
 * Wrap JSX elements with EditableText or EditableImage
 */
function wrapJSXElements(
  code: string,
  fieldConfigs: EditableFieldConfig[],
  errors: string[]
): string {
  let transformedCode = code;

  // Sort fields by type to handle in correct order
  const textFields = fieldConfigs.filter(f => f.type === 'text' || f.type === 'richText');
  const imageFields = fieldConfigs.filter(f => f.type === 'image');
  const buttonFields = fieldConfigs.filter(f => f.type === 'button');

  // Wrap heading/text elements
  textFields.forEach(field => {
    try {
      transformedCode = wrapTextElement(transformedCode, field);
    } catch (error) {
      errors.push(`Failed to wrap ${field.path}: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  });

  // Wrap image elements
  imageFields.forEach(field => {
    try {
      transformedCode = wrapImageElement(transformedCode, field);
    } catch (error) {
      errors.push(`Failed to wrap ${field.path}: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  });

  // Wrap button elements
  buttonFields.forEach(field => {
    try {
      transformedCode = wrapButtonElement(transformedCode, field);
    } catch (error) {
      errors.push(`Failed to wrap ${field.path}: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  });

  return transformedCode;
}

/**
 * Wrap a text element with EditableText
 * Handles: {fieldName}, {obj.fieldName}, {fieldName && <div>...}
 */
function wrapTextElement(code: string, field: EditableFieldConfig): string {
  const fieldName = field.path;
  const handlerName = `on${capitalize(fieldName)}Change`;

  // Check if already wrapped
  if (code.includes(`<EditableText`) && code.includes(`value={${fieldName}}`)) {
    return code;
  }

  // Determine element type
  let elementTag = 'h2|h1|h3';
  if (fieldName.toLowerCase().includes('heading') || fieldName.toLowerCase() === 'title') {
    elementTag = 'h1|h2';
  } else if (field.type === 'richText' || fieldName.toLowerCase().includes('description')) {
    elementTag = 'p';
  } else if (fieldName.toLowerCase().includes('button') || fieldName.toLowerCase() === 'text') {
    elementTag = 'Button|button|a';
  } else if (fieldName.toLowerCase().includes('trust')) {
    elementTag = 'div';
  }

  const elementType = field.type === 'richText' ? 'paragraph' :
                      fieldName.toLowerCase().includes('button') ? 'button' : 'heading';
  const richTextProp = field.type === 'richText' ? ' richText={true}' : '';

  // Try multiple patterns
  let updatedCode = code;

  // Pattern 1: Simple {fieldName}
  const simpleRegex = new RegExp(
    `<(${elementTag})([^>]*)>([^{]*)?\\{${fieldName}\\}([^<]*)<\\/(${elementTag})>`,
    'gi'
  );
  updatedCode = updatedCode.replace(simpleRegex, (match) => {
    return `<EditableText value={${fieldName}} onUpdate={${handlerName}} editable={editable} type="${elementType}"${richTextProp}>${match}</EditableText>`;
  });

  // Pattern 2: Nested property {obj.fieldName}
  const nestedRegex = new RegExp(
    `<(${elementTag})([^>]*)>([^{]*)?\\{\\w+\\.${fieldName}\\}([^<]*)<\\/(${elementTag})>`,
    'gi'
  );
  updatedCode = updatedCode.replace(nestedRegex, (match) => {
    // Extract the full nested path
    const nestedMatch = match.match(/\{(\w+\.\w+)\}/);
    if (nestedMatch) {
      const fullPath = nestedMatch[1];
      return `<EditableText value={${fullPath}} onUpdate={${handlerName}} editable={editable} type="${elementType}"${richTextProp}>${match}</EditableText>`;
    }
    return match;
  });

  // Pattern 3: Conditional {fieldName && <element>...</element>}
  const conditionalRegex = new RegExp(
    `\\{${fieldName}\\s*&&\\s*\\(([^}]+)\\)\\}`,
    'g'
  );
  updatedCode = updatedCode.replace(conditionalRegex, (match, content) => {
    return `{${fieldName} && (<EditableText value={${fieldName}} onUpdate={${handlerName}} editable={editable} type="${elementType}"${richTextProp}>${content}</EditableText>)}`;
  });

  return updatedCode;
}

/**
 * Wrap an image element with EditableImage
 * Example: <img src={imageSrc} alt={imageAlt} />
 * Becomes: <EditableImage src={imageSrc} alt={imageAlt} onUpdate={onImageSrcChange} editable={editable} />
 */
function wrapImageElement(code: string, field: EditableFieldConfig): string {
  const fieldName = field.path;
  const handlerName = `on${capitalize(fieldName)}Change`;

  // Find <img> tags with src={fieldName}
  const regex = new RegExp(
    `<img([^>]*)src=\\{${fieldName}\\}([^>]*)\\/>`,
    'g'
  );

  return code.replace(regex, (match) => {
    // Don't wrap if already wrapped
    if (code.includes(`<EditableImage`) && code.includes(`src={${fieldName}}`)) {
      return match;
    }

    // Extract alt attribute if present
    const altMatch = match.match(/alt=\{([^}]+)\}/);
    const altProp = altMatch ? ` alt={${altMatch[1]}}` : '';

    return `<EditableImage src={${fieldName}}${altProp} onUpdate={${handlerName}} editable={editable} />`;
  });
}

/**
 * Wrap a button element with EditableButton
 * Handles button objects with text and url properties
 * Example: <Button asChild><Link href={button.url}>{button.text}</Link></Button>
 * Becomes: <EditableButton buttonData={button} onUpdate={onButtonChange} editable={editable}>...</EditableButton>
 */
function wrapButtonElement(code: string, field: EditableFieldConfig): string {
  const fieldName = field.path;
  const handlerName = `on${capitalize(fieldName)}Change`;

  // Check if already wrapped
  if (code.includes(`<EditableButton`) && code.includes(`buttonData={${fieldName}}`)) {
    return code;
  }

  let updatedCode = code;

  // Pattern 1: <Button ...><Link href={button.url}>...{button.text}...</Link></Button>
  const buttonWithLinkRegex = new RegExp(
    `<Button([^>]*)>\\s*<Link\\s+href=\\{${fieldName}\\.url\\}([^>]*)>([^<]*\\{${fieldName}\\.text\\}[^<]*)</Link>\\s*</Button>`,
    'g'
  );
  updatedCode = updatedCode.replace(buttonWithLinkRegex, (match) => {
    return `<EditableButton buttonData={${fieldName}} onUpdate={${handlerName}} editable={editable}>${match}</EditableButton>`;
  });

  // Pattern 2: <Button ...><a href={button.url}>...{button.text}...</a></Button>
  const buttonWithAnchorRegex = new RegExp(
    `<Button([^>]*)>\\s*<a\\s+href=\\{${fieldName}\\.url\\}([^>]*)>([^<]*\\{${fieldName}\\.text\\}[^<]*)</a>\\s*</Button>`,
    'g'
  );
  updatedCode = updatedCode.replace(buttonWithAnchorRegex, (match) => {
    return `<EditableButton buttonData={${fieldName}} onUpdate={${handlerName}} editable={editable}>${match}</EditableButton>`;
  });

  // Pattern 3: <Button>...{button.text}...</Button> (simple button without link)
  const simpleButtonRegex = new RegExp(
    `<Button([^>]*)>([^<]*\\{${fieldName}\\.text\\}[^<]*)</Button>`,
    'g'
  );
  updatedCode = updatedCode.replace(simpleButtonRegex, (match) => {
    return `<EditableButton buttonData={${fieldName}} onUpdate={${handlerName}} editable={editable}>${match}</EditableButton>`;
  });

  // Pattern 4: Button with conditional {button.text && ...}
  const conditionalButtonRegex = new RegExp(
    `\\{${fieldName}\\.text\\s*&&\\s*\\(([^}]+)\\)\\}`,
    'g'
  );
  updatedCode = updatedCode.replace(conditionalButtonRegex, (match, content) => {
    return `{${fieldName}.text && (<EditableButton buttonData={${fieldName}} onUpdate={${handlerName}} editable={editable}>${content}</EditableButton>)}`;
  });

  return updatedCode;
}

/**
 * Capitalize first letter of string and handle nested paths
 * Examples:
 * - "heading" -> "Heading"
 * - "button.text" -> "ButtonText"
 * - "user.profile.name" -> "UserProfileName"
 */
function capitalize(str: string): string {
  return str
    .split('.')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}
