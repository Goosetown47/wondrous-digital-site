import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

export interface ParsedComponent {
  name: string;
  code: string;
  dependencies: string[];
  imports: string[];
  type: 'component' | 'section';
  metadata: {
    description?: string;
    category?: string;
    variants?: string[];
    displayName?: string;
  };
}

export class ComponentParser {
  /**
   * Parse a component file and extract all relevant information
   */
  parseComponentFile(filePath: string): ParsedComponent {
    const code = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath, path.extname(filePath));
    
    const sourceFile = ts.createSourceFile(
      filePath,
      code,
      ts.ScriptTarget.Latest,
      true
    );

    const dependencies = this.extractDependencies(sourceFile);
    const imports = this.extractLocalImports(sourceFile);
    const componentInfo = this.extractComponentInfo(sourceFile, fileName);

    return {
      name: componentInfo.name,
      code,
      dependencies,
      imports,
      type: this.determineComponentType(code, fileName),
      metadata: {
        displayName: componentInfo.displayName,
        variants: componentInfo.variants,
      },
    };
  }

  /**
   * Extract NPM package dependencies from import statements
   */
  private extractDependencies(sourceFile: ts.SourceFile): string[] {
    const dependencies = new Set<string>();

    ts.forEachChild(sourceFile, (node) => {
      if (ts.isImportDeclaration(node)) {
        const moduleSpecifier = node.moduleSpecifier;
        if (ts.isStringLiteral(moduleSpecifier)) {
          const importPath = moduleSpecifier.text;
          
          // Check if it's an npm package (not relative import)
          if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
            // Handle scoped packages
            if (importPath.startsWith('@')) {
              const parts = importPath.split('/');
              if (parts.length >= 2) {
                dependencies.add(`${parts[0]}/${parts[1]}`);
              }
            } else {
              // Regular packages
              const packageName = importPath.split('/')[0];
              dependencies.add(packageName);
            }
          }
        }
      }
    });

    // Filter out built-in imports
    const builtIns = ['react', 'next', 'next/image', 'next/link', 'next/router'];
    return Array.from(dependencies).filter(dep => !builtIns.includes(dep));
  }

  /**
   * Extract local imports (like cn, utils, etc.)
   */
  private extractLocalImports(sourceFile: ts.SourceFile): string[] {
    const imports = new Set<string>();

    ts.forEachChild(sourceFile, (node) => {
      if (ts.isImportDeclaration(node)) {
        const moduleSpecifier = node.moduleSpecifier;
        if (ts.isStringLiteral(moduleSpecifier)) {
          const importPath = moduleSpecifier.text;
          
          // Check for local imports
          if (importPath.startsWith('@/lib/utils')) {
            // Extract what's being imported
            if (node.importClause && node.importClause.namedBindings) {
              if (ts.isNamedImports(node.importClause.namedBindings)) {
                node.importClause.namedBindings.elements.forEach(element => {
                  imports.add(element.name.text);
                });
              }
            }
          }
        }
      }
    });

    return Array.from(imports);
  }

  /**
   * Extract component name and other info
   */
  private extractComponentInfo(sourceFile: ts.SourceFile, fileName: string): {
    name: string;
    displayName?: string;
    variants?: string[];
  } {
    let componentName = this.kebabToCamel(fileName);
    let displayName: string | undefined;
    let variants: string[] = [];

    // Look for export statements and displayName assignments
    ts.forEachChild(sourceFile, (node) => {
      // Check for displayName assignment
      if (ts.isExpressionStatement(node)) {
        const expression = node.expression;
        if (ts.isBinaryExpression(expression) && 
            expression.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
          const left = expression.left;
          if (ts.isPropertyAccessExpression(left) && 
              left.name.text === 'displayName') {
            displayName = this.extractStringValue(expression.right);
          }
        }
      }

      // Check for const componentVariants = cva(...)
      if (ts.isVariableStatement(node)) {
        node.declarationList.declarations.forEach(decl => {
          if (ts.isIdentifier(decl.name) && decl.name.text.includes('Variants')) {
            // This is a variants definition
            const variantName = decl.name.text.replace('Variants', '');
            if (variantName) {
              variants.push(variantName);
            }
          }
        });
      }
    });

    return {
      name: fileName.toLowerCase().replace(/-/g, ''),
      displayName: displayName || componentName,
      variants,
    };
  }

  /**
   * Determine if this is a component or section
   */
  private determineComponentType(code: string, fileName: string): 'component' | 'section' {
    // Sections typically have more complex layouts
    const sectionIndicators = [
      'section',
      'hero',
      'footer',
      'header',
      'navbar',
      'landing',
      'pricing',
      'testimonial',
      'feature',
    ];

    const isSection = sectionIndicators.some(indicator => 
      fileName.toLowerCase().includes(indicator) ||
      code.toLowerCase().includes(`${indicator} component`)
    );

    return isSection ? 'section' : 'component';
  }

  /**
   * Convert kebab-case to CamelCase
   */
  private kebabToCamel(str: string): string {
    return str.split('-')
      .map((word, index) => {
        if (index === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join('');
  }

  /**
   * Extract string value from AST node
   */
  private extractStringValue(node: ts.Node): string | undefined {
    if (ts.isStringLiteral(node)) {
      return node.text;
    }
    return undefined;
  }

  /**
   * Parse multiple component files
   */
  parseComponentFiles(filePaths: string[]): ParsedComponent[] {
    return filePaths.map(filePath => this.parseComponentFile(filePath));
  }
}