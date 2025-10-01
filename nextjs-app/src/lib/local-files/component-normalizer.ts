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
    type: 'text' | 'image' | 'button' | 'array-item' | 'array-relocation';
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
 * 2. Find component function (by componentName - the exported component)
 * 3. Generate TypeScript interface from schema
 * 4. Replace hardcoded JSX text with prop references
 * 5. Replace hardcoded image src with props
 * 6. Add props parameter with defaults
 * 7. Inject interface into code
 * 8. Generate and return normalized code
 *
 * @param code - Original component code
 * @param componentName - Name of the main exported component to normalize
 * @param schema - Detected editable fields
 * @param defaultContent - Default values extracted from component
 * @returns Normalized code and metadata
 */
export function normalizeComponent(
  code: string,
  componentName: string,
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

    let componentNode: (t.ArrowFunctionExpression | t.FunctionDeclaration) | null = null;

    // Step 1: Find the SPECIFIC component function (by name)
    traverse(ast, {
      VariableDeclaration(path) {
        const declaration = path.node.declarations[0];
        if (!declaration) return;

        if (
          t.isVariableDeclarator(declaration) &&
          t.isIdentifier(declaration.id) &&
          declaration.id.name === componentName && // Match the specific component name
          t.isArrowFunctionExpression(declaration.init)
        ) {
          componentNode = declaration.init as t.ArrowFunctionExpression;
        }
      },

      FunctionDeclaration(path) {
        if (
          path.node.id &&
          t.isIdentifier(path.node.id) &&
          path.node.id.name === componentName // Match the specific component name
        ) {
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
    (componentNode as any).params = [propsParam];

    // Step 4: Transform JSX - Replace hardcoded values with prop references
    // Track arrays that need to be moved inside component
    const arraysToMove: t.VariableDeclaration[] = [];

    traverse(ast, {
      // Handle array declarations for mapped content
      // Example: const features = [{title: "...", description: "..."}]
      // → Move inside component and replace values with prop references
      VariableDeclaration(path) {
        const declaration = path.node.declarations[0];
        if (!declaration || !t.isVariableDeclarator(declaration)) return;
        if (!t.isIdentifier(declaration.id)) return;
        if (!t.isArrayExpression(declaration.init)) return;

        const arrayName = declaration.id.name;

        // Check if this array has corresponding props in schema (e.g., features1Title, features2Title)
        const arrayProps = schema.filter(f => f.path.startsWith(arrayName) && /\d/.test(f.path));
        if (arrayProps.length === 0) return;

        // Get array elements
        const arrayElements = declaration.init.elements;

        // Replace hardcoded values with prop references
        arrayElements.forEach((element, index) => {
          if (!t.isObjectExpression(element)) return;

          const itemNum = index + 1;

          element.properties.forEach((prop) => {
            if (!t.isObjectProperty(prop)) return;
            if (!t.isIdentifier(prop.key)) return;

            const propKey = prop.key.name; // e.g., "title" or "description"
            const propPath = `${arrayName}${itemNum}${propKey.charAt(0).toUpperCase()}${propKey.slice(1)}`;
            // e.g., "features1Title", "features1Description"

            // Check if this prop exists in schema
            const field = schema.find(f => f.path === propPath);
            if (field) {
              // Save original value before replacing
              const originalValue = t.isStringLiteral(prop.value) ? prop.value.value : 'unknown';

              // Replace hardcoded value with prop reference
              prop.value = t.identifier(propPath);

              changes.push({
                type: 'array-item',
                field: propPath,
                originalValue,
              });
            }
          });
        });

        // Store the modified array declaration for later insertion
        arraysToMove.push(path.node as t.VariableDeclaration);

        // Remove from current location (module scope)
        path.remove();
      },

      // Handle JSX text nodes: <h1>text</h1> → <h1>{propName}</h1>
      JSXText(path) {
        const rawText = path.node.value.trim();
        if (!rawText) return;

        // Normalize whitespace for comparison (collapse multiple spaces/newlines to single space)
        const normalizedText = rawText.replace(/\s+/g, ' ');

        // Try to find matching text/richText field
        let field = schema.find((f) => {
          if (f.type !== 'text' && f.type !== 'richText') return false;

          const fieldValue = String(defaultContent[f.path]);
          const normalizedFieldValue = fieldValue.replace(/\s+/g, ' ');

          return normalizedFieldValue === normalizedText;
        });

        // If no text field match, try button fields
        if (!field) {
          field = schema.find((f) => {
            if (f.type !== 'button') return false;

            // Handle button object: button.text
            const buttonData = defaultContent[f.path];
            if (typeof buttonData === 'object' && buttonData !== null) {
              const buttonText = String((buttonData as Record<string, unknown>).text || '');
              const normalizedButtonText = buttonText.replace(/\s+/g, ' ');
              return normalizedButtonText === normalizedText;
            }

            // Handle flat button text field: buttonText
            const buttonText = String(defaultContent[f.path]);
            const normalizedButtonText = buttonText.replace(/\s+/g, ' ');
            return normalizedButtonText === normalizedText;
          });

          // If button field found, use button.text or buttonText as the prop path
          if (field) {
            // For button objects, use button.text
            const buttonData = defaultContent[field.path];
            const propPath = typeof buttonData === 'object' && buttonData !== null
              ? `${field.path}.text`
              : field.path;

            // Replace text with {button.text} or {buttonText}
            path.replaceWith(
              t.jsxExpressionContainer(
                propPath.includes('.')
                  ? t.memberExpression(
                      t.identifier(propPath.split('.')[0]),
                      t.identifier(propPath.split('.')[1])
                    )
                  : t.identifier(propPath)
              )
            );

            changes.push({
              type: 'button',
              field: propPath,
              originalValue: normalizedText,
            });

            return; // Exit early for button fields
          }
        }

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

    // Step 4.5: Move arrays inside component function body
    if (arraysToMove.length > 0 && componentNode) {
      // Get the component's function body
      let functionBody: t.BlockStatement | null = null;

      if (t.isArrowFunctionExpression(componentNode)) {
        const arrowFunc = componentNode as t.ArrowFunctionExpression;
        // For arrow functions, body might be BlockStatement or JSXElement
        if (t.isBlockStatement(arrowFunc.body)) {
          functionBody = arrowFunc.body;
        } else {
          // Convert JSX return to BlockStatement: () => <jsx> → () => { return <jsx>; }
          const returnStatement = t.returnStatement(arrowFunc.body);
          functionBody = t.blockStatement([returnStatement]);
          arrowFunc.body = functionBody;
        }
      } else if (t.isFunctionDeclaration(componentNode)) {
        const funcDecl = componentNode as t.FunctionDeclaration;
        functionBody = funcDecl.body;
      }

      // Insert arrays at the start of the function body
      if (functionBody && t.isBlockStatement(functionBody)) {
        // Insert all arrays at the beginning
        functionBody.body.unshift(...arraysToMove);

        changes.push({
          type: 'array-relocation',
          field: `${arraysToMove.length} array(s)`,
          originalValue: 'Moved from module scope to component scope',
        });
      }
    }

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
      // Buttons are stored as strings (just the button text)
      // URL is stored separately as a 'url' type field (e.g., button1Url)
      return t.tsStringKeyword();

    case 'array':
      // For now, return any[] - we'll improve this later
      return t.tsArrayType(t.tsAnyKeyword());

    case 'object':
      return t.tsTypeLiteral([]);

    default:
      return t.tsAnyKeyword();
  }
}
