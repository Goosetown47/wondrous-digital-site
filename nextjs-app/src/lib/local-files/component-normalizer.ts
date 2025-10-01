/**
 * Component Normalizer
 *
 * Transforms hardcoded shadcnblocks components to prop-based components at import time.
 *
 * Problem: Many shadcnblocks components are hardcoded with no props:
 *   const Hero166 = () => { return <h1>Hardcoded text</h1>; }
 *
 * Solution: Transform to prop-based with TypeScript interface:
 *   interface Hero166Props { heading?: string; }
 *   const Hero166 = ({ heading = "Hardcoded text" }: Hero166Props) => { ... }
 *
 * Benefits:
 * - Makes ALL shadcnblocks components editable
 * - Improves component reusability
 * - Adds TypeScript type safety
 * - Works seamlessly with runtime wrapper
 *
 * @module component-normalizer
 */

import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import type { EditableFieldConfig } from '@/lib/component-registry';

/**
 * Result of component normalization
 */
export interface NormalizeResult {
  normalizedCode: string;
  changes: Array<{
    type: 'text' | 'image' | 'button';
    field: string;
    originalValue: string;
  }>;
  interfaceAdded: boolean;
  propsAdded: boolean;
}

/**
 * Check if a component needs normalization
 *
 * Returns true if:
 * - Component has no props parameter (hardcoded)
 * - Component is a valid React component (exported)
 *
 * @param code - Component source code
 * @returns true if normalization needed
 */
export function shouldNormalize(code: string): boolean {
  try {
    // Parse code to AST
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });

    let needsNormalization = false;

    // Find exported component declaration
    traverse(ast, {
      // Check arrow functions: const Hero = () => { ... }
      VariableDeclaration(path) {
        const declaration = path.node.declarations[0];
        if (!declaration) return;

        // Check if it's an arrow function
        if (
          t.isVariableDeclarator(declaration) &&
          t.isArrowFunctionExpression(declaration.init)
        ) {
          const arrowFunc = declaration.init;

          // Check if function has zero parameters (hardcoded)
          if (arrowFunc.params.length === 0) {
            // Verify this is exported (likely a component)
            const parentPath = path.parentPath;
            if (parentPath?.isExportNamedDeclaration() || path.node.kind === 'const') {
              needsNormalization = true;
            }
          }
        }
      },

      // Check function declarations: function Hero() { ... }
      FunctionDeclaration(path) {
        const func = path.node;

        // Check if function has zero parameters
        if (func.params.length === 0) {
          // Check if exported
          const parentPath = path.parentPath;
          if (parentPath?.isExportNamedDeclaration() || parentPath?.isProgram()) {
            needsNormalization = true;
          }
        }
      },
    });

    return needsNormalization;
  } catch (error) {
    console.error('Error in shouldNormalize:', error);
    return false; // If we can't parse, don't normalize
  }
}

/**
 * Normalize a hardcoded component to prop-based
 *
 * Transformation steps:
 * 1. Parse code to AST
 * 2. Find component function
 * 3. Generate TypeScript interface from schema
 * 4. Replace hardcoded JSX text with prop references
 * 5. Replace hardcoded image src with props
 * 6. Add props parameter with defaults
 * 7. Inject interface into code
 * 8. Generate and return normalized code
 *
 * @param code - Original component code
 * @param schema - Detected editable fields
 * @param defaultContent - Default values extracted from component
 * @returns Normalized code and metadata
 */
export function normalizeComponent(
  code: string,
  schema: EditableFieldConfig[],
  defaultContent: Record<string, unknown>
): NormalizeResult {
  const changes: NormalizeResult['changes'] = [];

  try {
    // Parse code to AST
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });

    let componentName = '';
    let componentNode: (t.ArrowFunctionExpression | t.FunctionDeclaration) | null = null;

    // Step 1: Find the component function
    traverse(ast, {
      VariableDeclaration(path) {
        const declaration = path.node.declarations[0];
        if (!declaration) return;

        if (
          t.isVariableDeclarator(declaration) &&
          t.isIdentifier(declaration.id) &&
          t.isArrowFunctionExpression(declaration.init)
        ) {
          componentName = declaration.id.name;
          componentNode = declaration.init as t.ArrowFunctionExpression;
        }
      },

      FunctionDeclaration(path) {
        if (path.node.id && t.isIdentifier(path.node.id)) {
          componentName = path.node.id.name;
          componentNode = path.node as t.FunctionDeclaration;
        }
      },
    });

    if (!componentNode || !componentName) {
      throw new Error('Could not find component function');
    }

    // Step 2: Generate TypeScript interface
    const interfaceDeclaration = generateInterface(componentName, schema);

    // Step 3: Add props parameter (do this before JSX transformation)
    const propsParam = generatePropsParameter(componentName, schema, defaultContent);

    // Update component params directly
    // Both ArrowFunctionExpression and FunctionDeclaration have params property
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (componentNode as any).params = [propsParam];

    // Step 4: Transform JSX - Replace hardcoded values with prop references
    traverse(ast, {
      // Handle JSX text nodes: <h1>text</h1> → <h1>{propName}</h1>
      JSXText(path) {
        const rawText = path.node.value.trim();
        if (!rawText) return;

        // Normalize whitespace for comparison (collapse multiple spaces/newlines to single space)
        const normalizedText = rawText.replace(/\s+/g, ' ');

        // Find matching field in schema
        const field = schema.find((f) => {
          if (f.type !== 'text' && f.type !== 'richText') return false;

          const fieldValue = String(defaultContent[f.path]);
          const normalizedFieldValue = fieldValue.replace(/\s+/g, ' ');

          return normalizedFieldValue === normalizedText;
        });

        if (field) {
          // Replace text with {propName}
          path.replaceWith(
            t.jsxExpressionContainer(t.identifier(field.path))
          );

          changes.push({
            type: 'text',
            field: field.path,
            originalValue: normalizedText,
          });
        }
      },

      // Handle image src and alt attributes
      JSXAttribute(path) {
        if (!t.isJSXIdentifier(path.node.name)) return;
        if (!t.isStringLiteral(path.node.value)) return;

        const attrName = path.node.name.name;
        const attrValue = path.node.value.value;

        // Handle src attributes: src="url" → src={propName}
        if (attrName === 'src') {
          const field = schema.find(
            (f) => f.type === 'image' && String(defaultContent[f.path]) === attrValue
          );

          if (field) {
            path.node.value = t.jsxExpressionContainer(
              t.identifier(field.path)
            );

            changes.push({
              type: 'image',
              field: field.path,
              originalValue: attrValue,
            });
          }
        }

        // Handle alt attributes: alt="text" → alt={propNameAlt}
        if (attrName === 'alt') {
          // Look for corresponding imageAlt, image2Alt, etc.
          const field = schema.find(
            (f) => f.type === 'text' &&
                   f.path.endsWith('Alt') &&
                   String(defaultContent[f.path]) === attrValue
          );

          if (field) {
            path.node.value = t.jsxExpressionContainer(
              t.identifier(field.path)
            );

            changes.push({
              type: 'text',
              field: field.path,
              originalValue: attrValue,
            });
          }
        }
      },
    });

    // Step 5: Inject interface at the top (after imports)
    let lastImportIndex = -1;
    ast.program.body.forEach((node, index) => {
      if (t.isImportDeclaration(node)) {
        lastImportIndex = index;
      }
    });

    // Insert interface after imports
    ast.program.body.splice(lastImportIndex + 1, 0, interfaceDeclaration);

    // Step 6: Generate normalized code
    const output = generate(ast, {
      retainLines: false,
      comments: true,
    });

    return {
      normalizedCode: output.code,
      changes,
      interfaceAdded: true,
      propsAdded: true,
    };
  } catch (error) {
    console.error('Error in normalizeComponent:', error);
    throw new Error(`Normalization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate TypeScript interface from schema
 *
 * Example output:
 *   interface Hero166Props {
 *     heading?: string;
 *     description?: string;
 *     image?: string;
 *   }
 */
function generateInterface(
  componentName: string,
  schema: EditableFieldConfig[]
): t.TSInterfaceDeclaration {
  const interfaceName = `${componentName}Props`;

  const properties = schema.map((field) => {
    const tsType = getTypeScriptType(field.type);

    return t.tsPropertySignature(
      t.identifier(field.path),
      t.tsTypeAnnotation(tsType)
    );
  });

  // Make all properties optional
  properties.forEach((prop) => {
    if (t.isTSPropertySignature(prop)) {
      prop.optional = true;
    }
  });

  return t.tsInterfaceDeclaration(
    t.identifier(interfaceName),
    null,
    null,
    t.tsInterfaceBody(properties)
  );
}

/**
 * Generate props parameter with destructuring and defaults
 *
 * Example output:
 *   {
 *     heading = "Default text",
 *     description = "Default description",
 *     image = "url"
 *   }: Hero166Props
 */
function generatePropsParameter(
  componentName: string,
  schema: EditableFieldConfig[],
  defaultContent: Record<string, unknown>
): t.ObjectPattern {
  const properties = schema.map((field) => {
    const key = t.identifier(field.path);
    const defaultValue = defaultContent[field.path];

    // Create default value AST node
    let defaultNode: t.Expression;
    if (typeof defaultValue === 'string') {
      defaultNode = t.stringLiteral(defaultValue);
    } else if (typeof defaultValue === 'number') {
      defaultNode = t.numericLiteral(defaultValue);
    } else if (typeof defaultValue === 'boolean') {
      defaultNode = t.booleanLiteral(defaultValue);
    } else {
      // For objects/arrays, use JSON representation
      defaultNode = t.stringLiteral('');
    }

    return t.objectProperty(
      key,
      t.assignmentPattern(key, defaultNode),
      false,
      true // shorthand
    );
  });

  const objectPattern = t.objectPattern(properties);

  // Add type annotation: Hero166Props
  objectPattern.typeAnnotation = t.tsTypeAnnotation(
    t.tsTypeReference(t.identifier(`${componentName}Props`))
  );

  return objectPattern;
}

/**
 * Map EditableFieldConfig type to TypeScript type
 */
function getTypeScriptType(fieldType: EditableFieldConfig['type']): t.TSType {
  switch (fieldType) {
    case 'text':
    case 'richText':
    case 'url':
    case 'image':
      return t.tsStringKeyword();

    case 'number':
      return t.tsNumberKeyword();

    case 'boolean':
      return t.tsBooleanKeyword();

    case 'button':
      // button: { text: string; url: string; variant?: string; size?: string }
      return t.tsTypeLiteral([
        t.tsPropertySignature(
          t.identifier('text'),
          t.tsTypeAnnotation(t.tsStringKeyword())
        ),
        t.tsPropertySignature(
          t.identifier('url'),
          t.tsTypeAnnotation(t.tsStringKeyword())
        ),
      ]);

    case 'array':
      // For now, return any[] - we'll improve this later
      return t.tsArrayType(t.tsAnyKeyword());

    case 'object':
      return t.tsTypeLiteral([]);

    default:
      return t.tsAnyKeyword();
  }
}
