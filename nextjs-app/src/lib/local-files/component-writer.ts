import fs from 'fs/promises';
import path from 'path';
import type { CoreComponent } from '@/types/builder';

/**
 * Represents a file operation result
 */
export interface FileWriteResult {
  path: string;
  success: boolean;
  message?: string;
}

/**
 * Service for writing component files to local filesystem
 * Handles file creation and registry updates for local development
 */
export class LocalComponentWriter {
  private projectRoot: string;

  constructor() {
    // Get project root (nextjs-app directory)
    this.projectRoot = path.resolve(process.cwd());
  }

  /**
   * Write component file to local filesystem
   */
  async createComponentFile(component: CoreComponent): Promise<FileWriteResult> {
    if (!component.code_name) {
      throw new Error('Component must have code_name');
    }

    const componentType = this.getComponentType(component);
    const fileName = component.code_name.toLowerCase();
    const relativePath = `src/components/core/${componentType}/${fileName}.tsx`;
    const fullPath = path.join(this.projectRoot, relativePath);
    const content = this.generateComponentFile(component);

    try {
      // Ensure directory exists
      const dir = path.dirname(fullPath);
      await fs.mkdir(dir, { recursive: true });

      // Write file
      await fs.writeFile(fullPath, content, 'utf-8');

      return {
        path: relativePath,
        success: true,
        message: `Created component file: ${relativePath}`
      };
    } catch (error) {
      console.error('Failed to write component file:', error);
      throw new Error(
        `Failed to write component file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Update registry file with all components
   */
  async updateRegistryFile(components: CoreComponent[]): Promise<FileWriteResult> {
    const relativePath = 'src/lib/register-components-generated.tsx';
    const fullPath = path.join(this.projectRoot, relativePath);
    const content = this.generateRegistryFile(components);

    try {
      await fs.writeFile(fullPath, content, 'utf-8');

      return {
        path: relativePath,
        success: true,
        message: `Updated registry file: ${relativePath}`
      };
    } catch (error) {
      console.error('Failed to write registry file:', error);
      throw new Error(
        `Failed to write registry file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Determine directory based on component type
   */
  private getComponentType(component: CoreComponent): string {
    const baseType = component.base_type?.toLowerCase();

    if (baseType?.includes('nav')) return 'navigation';
    if (baseType?.includes('footer')) return 'sections';
    if (baseType?.includes('header')) return 'sections';

    // Default to sections for most components
    return 'sections';
  }

  /**
   * Generate component file content with wrapper
   */
  private generateComponentFile(component: CoreComponent): string {
    const componentName = component.code_name;
    const configName = componentName!.toLowerCase() + 'Config';
    // Escape special characters in component name for comments
    const safeName = component.name.replace(/&/g, 'and').replace(/</g, '').replace(/>/g, '');

    // Detect the actual component name from the submitted code
    let actualComponentName = componentName; // default fallback

    // Try multiple patterns to find component definitions
    const patterns = [
      /(?:const|let|var)\s+(\w+)\s*=\s*\(\)/,  // const ComponentName = ()
      /(?:const|let|var)\s+(\w+)\s*=\s*function/,  // const ComponentName = function
      /function\s+(\w+)\s*\(/,  // function ComponentName(
      /export\s+(?:default\s+)?function\s+(\w+)/,  // export function ComponentName
      /export\s+\{\s*(\w+)\s*\}/,  // export { ComponentName }
      /class\s+(\w+)\s+extends/,  // class ComponentName extends
    ];

    for (const pattern of patterns) {
      const match = component.code.match(pattern);
      if (match && match[1]) {
        actualComponentName = match[1];
        break;
      }
    }

    return `// Component: ${safeName}
// Created: ${new Date().toISOString()}
// Edit in Core UI: /core

'use client';

import type { EditableFieldConfig } from '@/lib/component-registry';

// Original component code
${component.code}

// Base component (renamed for wrapping)
const ${componentName}Base = ${actualComponentName};

// Export for use in LAB/BUILDER
// LabCanvas will wrap this with EditableSectionWrapper based on editableFields config
export function ${componentName}(props: Record<string, unknown>) {
  return <${componentName}Base {...props} />;
}

// Export configuration for registry
export const ${configName} = {
  editableFields: ${JSON.stringify(component.editable_fields || [], null, 2)} as EditableFieldConfig[],
  defaultContent: ${JSON.stringify(component.default_content || {}, null, 2)}
};
`;
  }

  /**
   * Generate registry file with all component imports and registrations
   */
  private generateRegistryFile(components: CoreComponent[]): string {
    const timestamp = new Date().toISOString();
    const imports = components
      .filter(c => c.code_name)
      .map(c => {
        const fileName = c.code_name!.toLowerCase();
        const configName = fileName + 'Config';
        const componentType = this.getComponentType(c);
        return `import { ${c.code_name}, ${configName} } from '@/components/core/${componentType}/${fileName}';`;
      })
      .join('\n');

    const registrations = components
      .filter(c => c.code_name)
      .map(c => {
        const configName = c.code_name!.toLowerCase() + 'Config';
        return `  ComponentRegistry.register('${c.code_name}', {
    component: ${c.code_name},
    type: '${c.type}',
    defaultContent: ${configName}.defaultContent,
    editableFields: ${configName}.editableFields,
    source: '${c.source}'
  });`;
      })
      .join('\n\n');

    return `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.
// Generated at: ${timestamp}
// Components: ${components.length}

import { ComponentRegistry } from '@/lib/component-registry';

${imports}

export function registerGeneratedComponents() {
${registrations || '  // No components to register'}
}
`;
  }
}