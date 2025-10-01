/**
 * Main Analyzer Entry Point
 *
 * Provides backward compatible API while orchestrating the three services:
 * 1. InterfaceAnalyzer - Find TypeScript interfaces
 * 2. ContentExtractor - Extract JSX content from main component
 * 3. SchemaBuilder - Merge and build final schema
 *
 * This replaces the monolithic jsx-content-analyzer.ts
 */

import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { analyzeInterface } from './interface-analyzer';
import { extractContent } from './content-extractor';
import { buildSchema } from './schema-builder';

// Re-export types for external use
export type { InterfaceProps, ExtractedContent, Schema } from './types';

// Re-export services for direct use
export { analyzeInterface } from './interface-analyzer';
export { extractContent } from './content-extractor';
export { buildSchema } from './schema-builder';

// detectMainComponentName is exported via function declaration below

/**
 * Analyze JSX component code and extract schema
 *
 * BACKWARD COMPATIBLE API - same signature as old analyzer
 *
 * @param code - Component source code
 * @returns Schema with editableFields and defaultContent
 */
export function analyzeJSXContent(code: string) {
  try {
    // Step 1: Detect main component name from exports
    const componentName = detectMainComponentName(code);

    if (!componentName) {
      console.warn('Could not detect main component name from exports');
      return {
        editableFields: [],
        defaultContent: {},
      };
    }

    // Step 2: Analyze TypeScript interface (optional)
    const interfaceProps = analyzeInterface(code, componentName);

    // Step 3: Extract hardcoded content from main component
    const extractedContent = extractContent(code, componentName);

    // Step 4: Build final schema
    const schema = buildSchema(interfaceProps, extractedContent);

    return {
      editableFields: schema.editableFields,
      defaultContent: schema.defaultContent,
    };
  } catch (error) {
    console.error('Error analyzing JSX content:', error);
    return {
      editableFields: [],
      defaultContent: {},
    };
  }
}

/**
 * Detect main component name from export statements
 *
 * Looks for:
 * - export { ComponentName }
 * - export default ComponentName
 *
 * @param code - Component source code
 * @returns Component name or null
 */
export function detectMainComponentName(code: string): string | null {
  try {
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });

    let componentName: string | null = null;

    traverse(ast, {
      // Look for: export { ComponentName }
      ExportNamedDeclaration(path) {
        if (path.node.specifiers && path.node.specifiers.length > 0) {
          const firstSpecifier = path.node.specifiers[0];
          if (t.isExportSpecifier(firstSpecifier)) {
            if (t.isIdentifier(firstSpecifier.exported)) {
              componentName = firstSpecifier.exported.name;
            }
          }
        }

        // Look for: export const ComponentName = ...
        if (path.node.declaration) {
          if (t.isVariableDeclaration(path.node.declaration)) {
            const firstDeclaration = path.node.declaration.declarations[0];
            if (
              firstDeclaration &&
              t.isVariableDeclarator(firstDeclaration) &&
              t.isIdentifier(firstDeclaration.id)
            ) {
              componentName = firstDeclaration.id.name;
            }
          }

          // Look for: export function ComponentName() { ... }
          if (
            t.isFunctionDeclaration(path.node.declaration) &&
            path.node.declaration.id &&
            t.isIdentifier(path.node.declaration.id)
          ) {
            componentName = path.node.declaration.id.name;
          }
        }
      },

      // Look for: export default ComponentName
      ExportDefaultDeclaration(path) {
        if (t.isIdentifier(path.node.declaration)) {
          componentName = path.node.declaration.name;
        }

        // Look for: export default function ComponentName() { ... }
        if (
          t.isFunctionDeclaration(path.node.declaration) &&
          path.node.declaration.id &&
          t.isIdentifier(path.node.declaration.id)
        ) {
          componentName = path.node.declaration.id.name;
        }
      },
    });

    return componentName;
  } catch (error) {
    console.error('Error detecting component name:', error);
    return null;
  }
}
