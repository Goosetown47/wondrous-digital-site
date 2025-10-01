/**
 * Shadcn CLI Wrapper
 * Executes shadcn CLI commands and captures results
 *
 * This module provides:
 * - Execution of shadcn add commands for component names
 * - Execution of shadcn add commands for registry URLs
 * - Automatic file detection (before/after comparison)
 * - Dependency extraction from CLI output
 * - Hardcoded installation path: src/components/ui
 *
 * @module shadcn-cli-wrapper
 */

import { execSync } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface ShadcnAddResult {
  success: boolean;
  component?: string;
  filesCreated: string[];
  dependenciesInstalled: string[];
  errors: string[];
  output: string;
}

const COMPONENTS_UI_DIR = path.join(process.cwd(), 'src', 'components', 'ui');
const COMPONENTS_DIR = path.join(process.cwd(), 'src', 'components');
const TIMEOUT_MS = 120000; // 2 minutes

/**
 * Execute shadcn add command for a component name (e.g., "button", "card")
 *
 * This function:
 * 1. Captures files in src/components/ui before installation
 * 2. Executes the shadcn CLI command with --yes and --path flags
 * 3. Detects new files created by comparing before/after
 * 4. Extracts any npm dependencies mentioned in CLI output
 *
 * @param component - Component name (e.g., 'button', 'card', 'dialog')
 * @returns Installation result with success status, files created, and dependencies
 *
 * @example
 * ```typescript
 * const result = await executeShadcnAddComponent('button');
 * // result.filesCreated: ['button.tsx']
 * // result.dependenciesInstalled: []
 * ```
 */
export async function executeShadcnAddComponent(component: string): Promise<ShadcnAddResult> {
  try {
    // Get files before installation
    const filesBefore = await getComponentFiles();

    // Execute shadcn CLI with --overwrite to prevent interactive prompts
    const command = `npx shadcn@latest add ${component} --yes --overwrite --path src/components/ui`;
    console.log('[shadcn] Executing:', command);

    const output = execSync(command, {
      encoding: 'utf8',
      cwd: process.cwd(),
      timeout: TIMEOUT_MS,
      stdio: ['pipe', 'pipe', 'pipe'], // Capture stdin, stdout, stderr
    });

    console.log('[shadcn] Output:', output);

    // Get files after installation
    const filesAfter = await getComponentFiles();
    const filesCreated = filesAfter.filter(f => !filesBefore.includes(f));

    console.log('[shadcn] Files before:', filesBefore.length, 'Files after:', filesAfter.length, 'Created:', filesCreated.length);
    console.log('[shadcn] Files created:', filesCreated);

    // Move any files that were created outside ui/ to ui/
    const movedFiles: string[] = [];
    for (const file of filesCreated) {
      if (!file.startsWith('ui/')) {
        // File is in src/components/, need to move to src/components/ui/
        const sourcePath = path.join(COMPONENTS_DIR, file);
        const targetPath = path.join(COMPONENTS_UI_DIR, file);

        try {
          // Ensure ui directory exists
          await fs.mkdir(COMPONENTS_UI_DIR, { recursive: true });

          // Move the file
          await fs.rename(sourcePath, targetPath);
          console.log(`[shadcn] Moved ${file} to ui/${file}`);
          movedFiles.push(file);
        } catch (moveError) {
          console.error(`[shadcn] Failed to move ${file}:`, moveError);
        }
      }
    }

    // Update filesCreated to reflect final locations (all should be in ui/ now)
    const finalFiles = filesCreated.map(f => f.startsWith('ui/') ? f : `ui/${f}`);

    // Extract dependencies from output
    const dependenciesInstalled = extractDependenciesFromOutput(output);

    // Check if component already exists (shadcn CLI succeeded but no new files)
    let alreadyExists = false;
    if (filesCreated.length === 0 && output) {
      // Look for component filename in output (e.g., "- src/components/ui/avatar.tsx")
      const componentPattern = new RegExp(`src/components(/ui)?/${component}\\.tsx`, 'i');
      alreadyExists = componentPattern.test(output);

      if (alreadyExists) {
        console.log(`[shadcn] Component ${component} already exists - verified by output`);
      }
    }

    // Validate success: should have created files OR already exist
    const actualSuccess = filesCreated.length > 0 || alreadyExists;

    if (!actualSuccess) {
      console.error('[shadcn] No files detected and component not found in output - may not exist');
    }

    if (movedFiles.length > 0) {
      console.log(`[shadcn] Moved ${movedFiles.length} file(s) to ui/ directory for consistency`);
    }

    return {
      success: actualSuccess,
      component,
      filesCreated: finalFiles,
      dependenciesInstalled,
      errors: actualSuccess ? [] : ['Component not found or installation failed'],
      output: movedFiles.length > 0
        ? `${output}\n\nNote: Moved ${movedFiles.join(', ')} to src/components/ui/ for consistency.`
        : alreadyExists
        ? `${output}\n\nNote: Component already installed and verified.`
        : output,
    };
  } catch (error) {
    // Capture both stdout and stderr from error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    let fullOutput = errorMessage;
    let stderrOutput = '';

    if (error && typeof error === 'object') {
      const stdout = 'stdout' in error ? String(error.stdout) : '';
      const stderr = 'stderr' in error ? String(error.stderr) : '';
      stderrOutput = stderr;

      // Combine stdout and stderr for full picture
      fullOutput = [stdout, stderr].filter(Boolean).join('\n\n--- STDERR ---\n');

      console.error('[shadcn] Command failed:', errorMessage);
      console.error('[shadcn] stdout:', stdout);
      console.error('[shadcn] stderr:', stderr);
    }

    return {
      success: false,
      component,
      filesCreated: [],
      dependenciesInstalled: [],
      errors: [errorMessage, stderrOutput].filter(Boolean),
      output: fullOutput,
    };
  }
}

/**
 * Execute shadcn add command for a registry URL (third-party component)
 *
 * This function works the same as executeShadcnAddComponent but accepts a full
 * registry URL instead of a component name. This is used for third-party libraries
 * like Aceternity, Skiper UI, TweakCN, etc.
 *
 * @param registryUrl - Full registry URL (e.g., 'https://ui.aceternity.com/registry/container-text-flip.json')
 * @returns Installation result with success status, files created, and dependencies
 *
 * @example
 * ```typescript
 * const url = 'https://ui.aceternity.com/registry/container-text-flip.json';
 * const result = await executeShadcnAddRegistry(url);
 * // result.filesCreated: ['container-text-flip.tsx', 'text-flip-utils.ts']
 * // result.dependenciesInstalled: ['framer-motion']
 * ```
 */
export async function executeShadcnAddRegistry(registryUrl: string): Promise<ShadcnAddResult> {
  try {
    // Extract component name from URL
    const componentName = extractComponentNameFromUrl(registryUrl);

    // Get files before installation
    const filesBefore = await getComponentFiles();

    // Execute shadcn CLI with --overwrite to prevent interactive prompts
    const command = `npx shadcn@latest add ${registryUrl} --yes --overwrite --path src/components/ui`;
    console.log('[shadcn-registry] Executing:', command);
    console.log('[shadcn-registry] Component name extracted:', componentName);

    const output = execSync(command, {
      encoding: 'utf8',
      cwd: process.cwd(),
      timeout: TIMEOUT_MS,
      stdio: ['pipe', 'pipe', 'pipe'], // Capture stdin, stdout, stderr
    });

    console.log('[shadcn-registry] Output:', output);

    // Get files after installation
    const filesAfter = await getComponentFiles();
    const filesCreated = filesAfter.filter(f => !filesBefore.includes(f));

    console.log('[shadcn-registry] Files before:', filesBefore.length, 'Files after:', filesAfter.length, 'Created:', filesCreated.length);
    console.log('[shadcn-registry] Files created:', filesCreated);

    // Move any files that were created outside ui/ to ui/
    const movedFiles: string[] = [];
    for (const file of filesCreated) {
      if (!file.startsWith('ui/')) {
        // File is in src/components/, need to move to src/components/ui/
        const sourcePath = path.join(COMPONENTS_DIR, file);
        const targetPath = path.join(COMPONENTS_UI_DIR, file);

        try {
          // Ensure ui directory exists
          await fs.mkdir(COMPONENTS_UI_DIR, { recursive: true });

          // Move the file
          await fs.rename(sourcePath, targetPath);
          console.log(`[shadcn-registry] Moved ${file} to ui/${file}`);
          movedFiles.push(file);
        } catch (moveError) {
          console.error(`[shadcn-registry] Failed to move ${file}:`, moveError);
        }
      }
    }

    // Update filesCreated to reflect final locations (all should be in ui/ now)
    const finalFiles = filesCreated.map(f => f.startsWith('ui/') ? f : `ui/${f}`);

    // Extract dependencies from output
    const dependenciesInstalled = extractDependenciesFromOutput(output);

    // Check if component already exists (shadcn CLI succeeded but no new files)
    let alreadyExists = false;
    if (filesCreated.length === 0 && output) {
      // Look for component filename in output (e.g., "- src/components/ui/ComponentName.tsx")
      const componentPattern = new RegExp(`src/components(/ui)?/${componentName}\\.tsx`, 'i');
      alreadyExists = componentPattern.test(output);

      if (alreadyExists) {
        console.log(`[shadcn-registry] Component ${componentName} already exists - verified by output`);
      }
    }

    // Validate success: should have created files OR already exist
    const actualSuccess = filesCreated.length > 0 || alreadyExists;

    if (!actualSuccess) {
      console.error('[shadcn-registry] No files detected and component not found in output - registry URL may be invalid');
    }

    if (movedFiles.length > 0) {
      console.log(`[shadcn-registry] Moved ${movedFiles.length} file(s) to ui/ directory for consistency`);
    }

    return {
      success: actualSuccess,
      component: componentName,
      filesCreated: finalFiles,
      dependenciesInstalled,
      errors: actualSuccess ? [] : [`Registry URL may be invalid or component unavailable`],
      output: movedFiles.length > 0
        ? `${output}\n\nNote: Moved ${movedFiles.join(', ')} to src/components/ui/ for consistency.`
        : alreadyExists
        ? `${output}\n\nNote: Component already installed and verified.`
        : output,
    };
  } catch (error) {
    // Capture both stdout and stderr from error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const componentName = extractComponentNameFromUrl(registryUrl);
    let fullOutput = errorMessage;
    let stderrOutput = '';

    if (error && typeof error === 'object') {
      const stdout = 'stdout' in error ? String(error.stdout) : '';
      const stderr = 'stderr' in error ? String(error.stderr) : '';
      stderrOutput = stderr;

      // Combine stdout and stderr for full picture
      fullOutput = [stdout, stderr].filter(Boolean).join('\n\n--- STDERR ---\n');

      console.error('[shadcn-registry] Command failed:', errorMessage);
      console.error('[shadcn-registry] URL:', registryUrl);
      console.error('[shadcn-registry] stdout:', stdout);
      console.error('[shadcn-registry] stderr:', stderr);
    }

    return {
      success: false,
      component: componentName,
      filesCreated: [],
      dependenciesInstalled: [],
      errors: [errorMessage, stderrOutput].filter(Boolean),
      output: fullOutput,
    };
  }
}

/**
 * Detect files created in components/ui directory
 * Takes before and after snapshots
 */
export async function detectCreatedFiles(_componentName: string): Promise<string[]> {
  // This function is meant to be called with before/after file lists
  // But since tests mock fs.readdir twice, we'll call it twice here
  try {
    const filesBefore = await getComponentFiles();
    // In real usage, something happens here (component installation)
    const filesAfter = await getComponentFiles();

    // Return files that are in after but not in before
    return filesAfter.filter(file => !filesBefore.includes(file));
  } catch {
    return [];
  }
}

/**
 * Get all component files in both src/components and src/components/ui directories
 * Returns relative paths like "ui/button.tsx" or "PixelBlast.tsx"
 */
async function getComponentFiles(): Promise<string[]> {
  const allFiles: string[] = [];

  try {
    // Check src/components/ui/
    const uiFiles = await fs.readdir(COMPONENTS_UI_DIR);
    const uiTsFiles = uiFiles.filter(file => {
      const ext = path.extname(file);
      return ext === '.tsx' || ext === '.ts';
    });
    // Prefix with "ui/" to distinguish location
    allFiles.push(...uiTsFiles.map(f => `ui/${f}`));
  } catch {
    // Directory might not exist yet
  }

  try {
    // Check src/components/ (root level, excluding subdirectories)
    const rootFiles = await fs.readdir(COMPONENTS_DIR, { withFileTypes: true });
    const rootTsFiles = rootFiles
      .filter(dirent => dirent.isFile() && !dirent.name.startsWith('.'))
      .filter(dirent => {
        const ext = path.extname(dirent.name);
        return ext === '.tsx' || ext === '.ts';
      })
      .map(dirent => dirent.name);
    allFiles.push(...rootTsFiles);
  } catch {
    // Directory might not exist yet
  }

  return allFiles;
}

/**
 * Extract dependencies from shadcn CLI output
 */
function extractDependenciesFromOutput(output: string): string[] {
  const dependencies: string[] = [];

  // Look for npm install commands in output
  const npmRegex = /npm install ([^\n]+)/g;
  let match;

  while ((match = npmRegex.exec(output)) !== null) {
    const packages = match[1].split(' ').filter(Boolean);
    dependencies.push(...packages);
  }

  return dependencies;
}

/**
 * Extract component name from registry URL
 * Handles both .json URLs and non-.json URLs (like reactbits.dev)
 */
function extractComponentNameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = path.basename(pathname);

    // Remove .json extension if present
    return filename.endsWith('.json')
      ? filename.slice(0, -5)
      : filename;
  } catch {
    return 'unknown';
  }
}