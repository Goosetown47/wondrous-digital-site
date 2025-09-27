/**
 * Comprehensive Component Delete Service
 *
 * This service ensures components are completely removed from:
 * - Database (handled by caller)
 * - File system (component files)
 * - ComponentRegistry (import and registration)
 * - Name mappings
 */

import fs from 'fs/promises';
import path from 'path';

export interface DeleteResults {
  database: boolean;
  file: boolean;
  registry: boolean;
  mapping: boolean;
  errors: string[];
}

/**
 * Completely removes a component from the codebase
 * @param componentName The code name of the component (e.g., 'Services4')
 * @param source The source of the component ('custom', 'imported', 'shadcn', etc)
 * @returns Results of what was deleted
 */
export async function deleteComponentCompletely(
  componentName: string
): Promise<DeleteResults> {
  const results: DeleteResults = {
    database: true, // Assumed to be handled by caller
    file: false,
    registry: false,
    mapping: false,
    errors: []
  };

  try {
    // 1. Delete component file (always attempt for all components)
    results.file = await deleteComponentFile(componentName);
    if (!results.file) {
      results.errors.push(`Could not delete component file for ${componentName}`);
    }

    // 2. Remove from register-components.ts
    results.registry = await removeFromRegistry(componentName);
    if (!results.registry) {
      results.errors.push(`Could not remove ${componentName} from registry`);
    }

    // 3. Remove from component-name-mapping.ts
    results.mapping = await removeFromNameMapping(componentName);
    if (!results.mapping) {
      results.errors.push(`Could not remove ${componentName} from name mapping`);
    }

  } catch (error) {
    results.errors.push(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
  }

  return results;
}

/**
 * Delete the component file from the file system
 */
async function deleteComponentFile(componentName: string): Promise<boolean> {
  try {
    // Convert component name to file name (e.g., 'Services4' -> 'services4.tsx')
    const fileName = componentName.toLowerCase() + '.tsx';

    // Check multiple possible locations
    const possiblePaths = [
      path.join(process.cwd(), 'src/components/core/sections', fileName),
      path.join(process.cwd(), 'src/components/core/navigation', fileName),
      path.join(process.cwd(), 'src/components/core', fileName),
      path.join(process.cwd(), 'src/components/sections', fileName),
      path.join(process.cwd(), 'src/components', fileName),
    ];

    for (const filePath of possiblePaths) {
      try {
        await fs.access(filePath);
        await fs.unlink(filePath);
        console.log(`✅ Deleted component file: ${filePath}`);
        return true;
      } catch {
        // File doesn't exist at this path, continue
      }
    }

    console.log(`⚠️ Component file not found for ${componentName}`);
    return false;
  } catch (error) {
    console.error(`❌ Error deleting component file:`, error);
    return false;
  }
}

/**
 * Remove component from register-components.tsx
 */
async function removeFromRegistry(componentName: string): Promise<boolean> {
  try {
    const filePath = path.join(process.cwd(), 'src/lib/register-components.tsx');
    let content = await fs.readFile(filePath, 'utf-8');
    const originalContent = content;

    // Remove import statement
    // Match: import { Services4 } from '@/components/...';
    // Escape component name for safe RegExp usage
    const escapedName = componentName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const importRegex = new RegExp(`^import\\s*{[^}]*${escapedName}[^}]*}\\s*from\\s*['"][^'"]+['"];?$`, 'gm');
    content = content.replace(importRegex, '');

    // Remove registration block
    // Match: ComponentRegistry.register('Services4', { ... });
    // This needs to handle multi-line blocks

    const registerRegex = new RegExp(
      `ComponentRegistry\\.register\\(['"]${escapedName}['"],\\s*{[^}]*}\\s*\\);?`,
      'gs'
    );
    content = content.replace(registerRegex, '');

    // Clean up extra blank lines (more than 2 consecutive)
    content = content.replace(/\n{3,}/g, '\n\n');

    if (content !== originalContent) {
      await fs.writeFile(filePath, content, 'utf-8');
      console.log(`✅ Removed ${componentName} from register-components.tsx`);
      return true;
    } else {
      console.log(`⚠️ ${componentName} not found in register-components.tsx`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error updating register-components.tsx:`, error);
    return false;
  }
}

/**
 * Remove component from component-name-mapping.ts
 */
async function removeFromNameMapping(componentName: string): Promise<boolean> {
  try {
    const filePath = path.join(process.cwd(), 'src/lib/component-name-mapping.ts');
    let content = await fs.readFile(filePath, 'utf-8');
    const originalContent = content;

    // Remove any line that maps to this component
    // Match: 'Any Name': 'Services4',
    // Escape component name for safe RegExp usage
    const escapedName = componentName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const mappingRegex = new RegExp(`^\\s*['"][^'"]+['"]\\s*:\\s*['"]${escapedName}['"],?$`, 'gm');
    content = content.replace(mappingRegex, '');

    // Clean up trailing commas in the object
    content = content.replace(/,(\s*\n\s*})/g, '$1');

    // Clean up extra blank lines
    content = content.replace(/\n{3,}/g, '\n\n');

    if (content !== originalContent) {
      await fs.writeFile(filePath, content, 'utf-8');
      console.log(`✅ Removed ${componentName} from component-name-mapping.ts`);
      return true;
    } else {
      console.log(`⚠️ ${componentName} not found in component-name-mapping.ts`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error updating component-name-mapping.ts:`, error);
    return false;
  }
}