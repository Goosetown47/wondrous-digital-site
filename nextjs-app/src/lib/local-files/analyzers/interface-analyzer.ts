/**
 * InterfaceAnalyzer
 *
 * Finds and parses TypeScript interfaces for a specific component.
 * Returns structured interface data or null if no interface exists.
 */

import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import type { InterfaceProps, InterfaceProperty } from './types';

/**
 * Analyze TypeScript interface for a component
 *
 * @param code - Component source code
 * @param componentName - Name of component to find interface for (e.g., "Hero186")
 * @returns InterfaceProps if found, null otherwise
 */
export function analyzeInterface(
  code: string,
  componentName: string
): InterfaceProps | null {
  try {
    // Parse code to AST
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });

    const interfaceName = `${componentName}Props`;
    let foundInterface: InterfaceProps | null = null;

    // Find the interface matching componentName
    traverse(ast, {
      TSInterfaceDeclaration(path) {
        if (t.isIdentifier(path.node.id) && path.node.id.name === interfaceName) {
          // Found matching interface
          const properties: InterfaceProperty[] = [];

          // Extract properties from interface body
          if (path.node.body && path.node.body.body) {
            for (const member of path.node.body.body) {
              if (t.isTSPropertySignature(member)) {
                const property = extractProperty(member);
                if (property) {
                  properties.push(property);
                }
              }
            }
          }

          foundInterface = {
            interfaceName,
            properties,
          };
        }
      },
    });

    return foundInterface;
  } catch {
    return null;
  }
}

/**
 * Extract property information from a TSPropertySignature node
 */
function extractProperty(node: t.TSPropertySignature): InterfaceProperty | null {
  try {
    // Get property name
    let name = '';
    if (t.isIdentifier(node.key)) {
      name = node.key.name;
    } else if (t.isStringLiteral(node.key)) {
      name = node.key.value;
    } else {
      return null;
    }

    // Get property type
    const type = getTypeString(node.typeAnnotation?.typeAnnotation);

    // Check if optional
    const optional = node.optional || false;

    return {
      name,
      type,
      optional,
    };
  } catch {
    return null;
  }
}

/**
 * Convert TypeScript type annotation to string representation
 */
function getTypeString(typeNode: t.TSType | undefined): string {
  if (!typeNode) return 'any';

  if (t.isTSStringKeyword(typeNode)) return 'string';
  if (t.isTSNumberKeyword(typeNode)) return 'number';
  if (t.isTSBooleanKeyword(typeNode)) return 'boolean';
  if (t.isTSAnyKeyword(typeNode)) return 'any';
  if (t.isTSVoidKeyword(typeNode)) return 'void';
  if (t.isTSNullKeyword(typeNode)) return 'null';
  if (t.isTSUndefinedKeyword(typeNode)) return 'undefined';

  // Array types
  if (t.isTSArrayType(typeNode)) {
    const elementType = getTypeString(typeNode.elementType);
    return `${elementType}[]`;
  }

  // Union types (e.g., 'primary' | 'secondary')
  if (t.isTSUnionType(typeNode)) {
    const types = typeNode.types.map(t => getTypeString(t));
    return types.join(' | ');
  }

  // Literal types
  if (t.isTSLiteralType(typeNode)) {
    if (t.isStringLiteral(typeNode.literal)) {
      return `'${typeNode.literal.value}'`;
    }
    if (t.isNumericLiteral(typeNode.literal)) {
      return String(typeNode.literal.value);
    }
    if (t.isBooleanLiteral(typeNode.literal)) {
      return String(typeNode.literal.value);
    }
  }

  // Type references (e.g., React.ReactNode, Array<T>)
  if (t.isTSTypeReference(typeNode)) {
    if (t.isIdentifier(typeNode.typeName)) {
      return typeNode.typeName.name;
    }
  }

  // Object types
  if (t.isTSTypeLiteral(typeNode)) {
    return 'object';
  }

  // Default fallback
  return 'any';
}
