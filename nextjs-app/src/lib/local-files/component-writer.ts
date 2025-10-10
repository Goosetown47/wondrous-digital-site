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
   * Generate component file content
   *
   * NEW APPROACH (2025-10-02): Paste source code as-is - no transformation
   * Custom components include their own config export, no need to generate
   */
  private generateComponentFile(component: CoreComponent): string {
    // Escape special characters for comments
    const safeName = component.name
      .replace(/&/g, 'and')
      .replace(/</g, '')
      .replace(/>/g, '');

    // Check if source already has 'use client' directive
    const hasUseClient = component.code.trim().startsWith("'use client'") ||
                         component.code.trim().startsWith('"use client"');

    return `// Component: ${safeName}
// Created: ${new Date().toISOString()}
// Edit in Core UI: /core
//
// This is a custom component with manual config.
// Config is defined in the source code below.

${hasUseClient ? '' : "'use client';\n\n"}${component.code}
`;
  }

  /**
   * Generate registry file with all component imports and registrations
   *
   * NEW APPROACH (2025-10-02): Extract config and component names from source
   * No hardcoded naming conventions - use actual export names from files
   */
  private generateRegistryFile(components: CoreComponent[]): string {
    const timestamp = new Date().toISOString();

    const imports = components
      .filter(c => c.code_name)
      .map(c => {
        const fileName = c.code_name!.toLowerCase();
        const componentType = this.getComponentType(c);

        // Extract config name from source code
        const configMatch = c.code.match(/export const (\w+Config) = \{/);
        if (!configMatch) {
          console.warn(`⚠️  No config export found for ${c.code_name}, using fallback name`);
        }
        const configName = configMatch ? configMatch[1] : `${fileName}Config`;

        // Extract component export name (default export)
        // Handles: export default function ComponentName
        const defaultFnMatch = c.code.match(/export default function (\w+)/);
        // Handles: export default ComponentName
        const defaultMatch = c.code.match(/export default (\w+)/);

        let componentExport = c.code_name; // fallback
        if (defaultFnMatch) {
          componentExport = defaultFnMatch[1];
        } else if (defaultMatch) {
          componentExport = defaultMatch[1];
        }

        return `import ${componentExport}, { ${configName} } from '@/components/core/${componentType}/${fileName}';`;
      })
      .join('\n');

    const registrations = components
      .filter(c => c.code_name)
      .map(c => {
        // Extract config name from source
        const configMatch = c.code.match(/export const (\w+Config) = \{/);
        const configName = configMatch ? configMatch[1] : `${c.code_name!.toLowerCase()}Config`;

        // Extract component export name to use as variable
        const defaultFnMatch = c.code.match(/export default function (\w+)/);
        const defaultMatch = c.code.match(/export default (\w+)/);

        let componentVar = c.code_name; // fallback
        if (defaultFnMatch) {
          componentVar = defaultFnMatch[1];
        } else if (defaultMatch) {
          componentVar = defaultMatch[1];
        }

        return `  ComponentRegistry.register('${c.code_name}', {
    component: ${componentVar},
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