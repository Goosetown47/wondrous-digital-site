/**
 * ContentExtractor
 *
 * Extracts hardcoded JSX content from the MAIN EXPORTED component.
 * This fixes the bug where helper component props were being detected instead.
 *
 * KEY FIX: Uses componentName to target specific exported component,
 * ignoring helper components like DashedLine.
 */

import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import type { ExtractedContent, TextNode } from './types';

/**
 * Extract hardcoded content from main component's JSX
 *
 * @param code - Component source code
 * @param componentName - Name of main component to extract from (e.g., "Hero186")
 * @returns Extracted content (text, images, buttons, urls)
 */
export function extractContent(
  code: string,
  componentName: string
): ExtractedContent {
  const result: ExtractedContent = {
    textNodes: [],
    images: [],
    buttons: [],
    urls: [],
  };

  // Step 0: Find array variables defined in the file
  const arrayVariables = new Map<string, any[]>();

  try {
    // Parse code to AST
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });

    // Step 0.5: Find array variable declarations (e.g., const features = [...])
    traverse(ast, {
      VariableDeclaration(path) {
        for (const declaration of path.node.declarations) {
          if (
            t.isVariableDeclarator(declaration) &&
            t.isIdentifier(declaration.id) &&
            t.isArrayExpression(declaration.init)
          ) {
            const arrayName = declaration.id.name;
            const arrayItems: any[] = [];

            // Extract array literal values
            for (const element of declaration.init.elements) {
              if (t.isObjectExpression(element)) {
                const obj: Record<string, any> = {};
                for (const prop of element.properties) {
                  if (
                    t.isObjectProperty(prop) &&
                    t.isIdentifier(prop.key) &&
                    (t.isStringLiteral(prop.value) || t.isNumericLiteral(prop.value))
                  ) {
                    obj[prop.key.name] = prop.value.value;
                  }
                }
                arrayItems.push(obj);
              }
            }

            if (arrayItems.length > 0) {
              arrayVariables.set(arrayName, arrayItems);
            }
          }
        }
      },
    });

    // Step 1: Find the target component definition
    let targetComponentPath: any = null;

    traverse(ast, {
      // Look for: const ComponentName = () => { ... }
      VariableDeclaration(path) {
        for (const declaration of path.node.declarations) {
          if (
            t.isVariableDeclarator(declaration) &&
            t.isIdentifier(declaration.id) &&
            declaration.id.name === componentName
          ) {
            targetComponentPath = path;
            break;
          }
        }
      },

      // Look for: function ComponentName() { ... }
      FunctionDeclaration(path) {
        if (
          path.node.id &&
          t.isIdentifier(path.node.id) &&
          path.node.id.name === componentName
        ) {
          targetComponentPath = path;
        }
      },
    });

    if (!targetComponentPath) {
      // Component not found, return empty
      return result;
    }

    // Step 2: Walk ONLY the target component's JSX
    const textCounts = new Map<string, number>();
    const imageCounts = new Map<string, number>();
    const buttonCounts = new Map<string, number>();

    targetComponentPath.traverse({
      // Extract text from JSX elements
      JSXText(path: any) {
        const text = path.node.value.trim();
        if (!text) return;

        // Normalize whitespace
        const normalizedText = text.replace(/\s+/g, ' ');

        // Determine element type from parent
        const parentElement = path.parent;
        let elementType: TextNode['type'] = 'span';

        // SKIP text inside Button elements (including nested) - buttons have their own handler
        if (isInsideButton(path)) {
          return;
        }

        if (t.isJSXElement(parentElement)) {
          const openingElement = parentElement.openingElement;
          if (t.isJSXIdentifier(openingElement.name)) {
            const tagName = openingElement.name.name;

            // Check for heading/paragraph tags
            const tagNameLower = tagName.toLowerCase();
            if (tagNameLower === 'h1') elementType = 'h1';
            else if (tagNameLower === 'h2') elementType = 'h2';
            else if (tagNameLower === 'h3') elementType = 'h3';
            else if (tagNameLower === 'h4') elementType = 'h4';
            else if (tagNameLower === 'h5') elementType = 'h5';
            else if (tagNameLower === 'h6') elementType = 'h6';
            else if (tagNameLower === 'p') elementType = 'p';
          }
        }

        // Generate unique path
        const basePath = generatePathName(elementType);
        const count = textCounts.get(basePath) || 0;
        textCounts.set(basePath, count + 1);
        const path_name = count === 0 ? basePath : `${basePath}${count + 1}`;

        result.textNodes.push({
          type: elementType,
          value: normalizedText,
          path: path_name,
        });
      },

      // Extract Button text
      JSXElement(path: any) {
        const openingElement = path.node.openingElement;

        // Check if it's a Button component
        if (
          t.isJSXIdentifier(openingElement.name) &&
          openingElement.name.name === 'Button'
        ) {
          // Extract button text from children (handles multiple formats)
          const buttonText = extractButtonText(path.node.children);

          if (buttonText) {
            const count = buttonCounts.get('button') || 0;
            buttonCounts.set('button', count + 1);
            const pathName = count === 0 ? 'button1' : `button${count + 1}`;

            result.buttons.push({
              text: buttonText,
              path: pathName,
            });
          }
        }

        // Check if it's an img element
        if (
          t.isJSXIdentifier(openingElement.name) &&
          openingElement.name.name === 'img'
        ) {
          let src = '';
          let alt = '';

          // Extract src and alt attributes
          for (const attr of openingElement.attributes) {
            if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
              const attrName = attr.name.name;
              const attrValue = attr.value;

              if (attrName === 'src' && t.isStringLiteral(attrValue)) {
                src = attrValue.value;
              }

              if (attrName === 'alt' && t.isStringLiteral(attrValue)) {
                alt = attrValue.value;
              }
            }
          }

          if (src) {
            const count = imageCounts.get('image') || 0;
            imageCounts.set('image', count + 1);
            const pathName = count === 0 ? 'heroImage' : `image${count + 1}`;

            result.images.push({
              src,
              alt,
              path: pathName,
            });
          }
        }
      },

      // Extract href URLs
      JSXAttribute(path: any) {
        if (
          t.isJSXIdentifier(path.node.name) &&
          path.node.name.name === 'href' &&
          t.isStringLiteral(path.node.value)
        ) {
          const url = path.node.value.value;
          if (url && !result.urls.includes(url)) {
            result.urls.push(url);
          }
        }
      },

      // Extract content from array.map() calls
      CallExpression(path: any) {
        // Check if it's a .map() call
        if (
          t.isMemberExpression(path.node.callee) &&
          t.isIdentifier(path.node.callee.property) &&
          path.node.callee.property.name === 'map'
        ) {
          // Get the array being mapped
          const arrayObj = path.node.callee.object;
          let arrayName: string | null = null;

          if (t.isIdentifier(arrayObj)) {
            arrayName = arrayObj.name;
          }

          // Check if we have data for this array
          if (arrayName && arrayVariables.has(arrayName)) {
            const arrayData = arrayVariables.get(arrayName)!;
            const callback = path.node.arguments[0];

            // Extract parameter name (e.g., 'feature' in features.map(feature => ...))
            let paramName: string | null = null;
            if (t.isArrowFunctionExpression(callback) || t.isFunctionExpression(callback)) {
              const param = callback.params[0];
              if (t.isIdentifier(param)) {
                paramName = param.name;
              }
            }

            if (paramName) {
              // Walk the callback body to find JSX elements
              const callbackBody = t.isArrowFunctionExpression(callback) ? callback.body : callback.body;

              // Helper to extract text from JSX elements that reference the param
              const extractFromCallback = (node: any) => {
                if (t.isJSXElement(node)) {
                  const openingElement = node.openingElement;

                  // Check for h2, h3, p tags
                  if (t.isJSXIdentifier(openingElement.name)) {
                    const tagName = openingElement.name.name.toLowerCase();

                    if (['h2', 'h3', 'h4', 'p'].includes(tagName)) {
                      // Check if children contain a MemberExpression (e.g., feature.title)
                      for (const child of node.children) {
                        if (t.isJSXExpressionContainer(child)) {
                          const expr = child.expression;

                          if (
                            t.isMemberExpression(expr) &&
                            t.isIdentifier(expr.object) &&
                            expr.object.name === paramName &&
                            t.isIdentifier(expr.property)
                          ) {
                            const propertyName = expr.property.name;

                            // Extract values from each array item
                            arrayData.forEach((item, index) => {
                              if (item[propertyName]) {
                                const elementType = tagName as TextNode['type'];
                                const value = String(item[propertyName]);

                                // Use array name + property + index for uniqueness
                                const path_name = `${arrayName}${index + 1}${propertyName.charAt(0).toUpperCase() + propertyName.slice(1)}`;

                                result.textNodes.push({
                                  type: elementType,
                                  value,
                                  path: path_name,
                                });
                              }
                            });
                          }
                        }
                      }
                    }
                  }
                }

                // Recurse into children
                if (node && typeof node === 'object') {
                  for (const key in node) {
                    if (node[key] && typeof node[key] === 'object') {
                      extractFromCallback(node[key]);
                    }
                  }
                }
              };

              extractFromCallback(callbackBody);
            }
          }
        }
      },
    });

    return result;
  } catch (error) {
    console.error('Error extracting content:', error);
    return result;
  }
}

/**
 * Check if a path is inside a Button element (recursively checks ancestors)
 */
function isInsideButton(path: any): boolean {
  let current = path.parentPath;

  while (current) {
    if (t.isJSXElement(current.node)) {
      const openingElement = current.node.openingElement;
      if (t.isJSXIdentifier(openingElement.name) && openingElement.name.name === 'Button') {
        return true;
      }
    }
    current = current.parentPath;
  }

  return false;
}

/**
 * Extract button text from Button children (handles multiple formats)
 *
 * Formats supported:
 * 1. Direct text: <Button>Click me</Button>
 * 2. JSX expression: <Button>{buttonText}</Button>
 * 3. Nested element: <Button><span>{buttonText}</span></Button>
 */
function extractButtonText(children: any[]): string | null {
  for (const child of children) {
    // Case 1: Direct JSXText
    if (t.isJSXText(child)) {
      const text = child.value.trim();
      if (text) return text;
    }

    // Case 2: JSXExpressionContainer (e.g., {buttonText})
    if (t.isJSXExpressionContainer(child)) {
      const expression = child.expression;

      // Extract identifier name (becomes the prop name)
      if (t.isIdentifier(expression)) {
        return expression.name; // Returns "text" or "text2" etc.
      }
    }

    // Case 3: Nested JSXElement (e.g., <span>{buttonText}</span>)
    if (t.isJSXElement(child)) {
      // Recursively extract text from nested element
      const nestedText = extractButtonText(child.children);
      if (nestedText) return nestedText;
    }
  }

  return null;
}

/**
 * Generate semantic path name from element type and content
 */
function generatePathName(elementType: string): string {
  // Heading types
  if (elementType.startsWith('h')) {
    return 'heading';
  }

  // Paragraph
  if (elementType === 'p') {
    return 'description';
  }

  // Default
  return 'text';
}
