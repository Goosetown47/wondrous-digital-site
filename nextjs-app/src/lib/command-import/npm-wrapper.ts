/**
 * NPM Wrapper
 * Executes npm install commands with pre-checks to avoid duplicate installations
 *
 * This module provides:
 * - Package.json pre-checking to detect already installed packages
 * - Safe npm install execution with timeout protection
 * - Detailed result reporting including success/failure status
 *
 * @module npm-wrapper
 */

import { execSync } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface NpmInstallResult {
  success: boolean;
  packagesInstalled: string[];
  alreadyInstalled: string[];
  errors: string[];
  output: string;
}

export interface PackageCheckResult {
  installed: string[];
  missing: string[];
  versions: Record<string, string>;
}

const TIMEOUT_MS = 300000; // 5 minutes
const PACKAGE_JSON_PATH = path.join(process.cwd(), 'package.json');

/**
 * Check which packages are already installed by reading package.json
 *
 * This function reads the project's package.json and checks which of the requested
 * packages are already listed in dependencies or devDependencies.
 *
 * @param packages - Array of package names to check (e.g., ['framer-motion', 'clsx'])
 * @returns Object containing installed, missing, and version information
 *
 * @example
 * ```typescript
 * const result = await checkInstalledPackages(['framer-motion', 'clsx']);
 * // result.installed: ['framer-motion']
 * // result.missing: ['clsx']
 * // result.versions: { 'framer-motion': '^10.16.4' }
 * ```
 */
export async function checkInstalledPackages(packages: string[]): Promise<PackageCheckResult> {
  try {
    const packageJsonContent = await fs.readFile(PACKAGE_JSON_PATH, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);

    const allDependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    const installed: string[] = [];
    const missing: string[] = [];
    const versions: Record<string, string> = {};

    for (const pkg of packages) {
      // Extract base package name (without version specifier)
      const pkgName = pkg.split('@')[0] || pkg;

      if (allDependencies[pkgName]) {
        installed.push(pkg);
        versions[pkg] = allDependencies[pkgName];
      } else {
        missing.push(pkg);
      }
    }

    return { installed, missing, versions };
  } catch {
    // If package.json doesn't exist or is invalid, treat all as missing
    return {
      installed: [],
      missing: packages,
      versions: {},
    };
  }
}

/**
 * Execute npm install for specified packages with automatic duplicate detection
 *
 * This function:
 * 1. Checks which packages are already installed
 * 2. Only installs packages that are missing
 * 3. Returns detailed results including success/failure status
 *
 * @param packages - Array of package names to install (e.g., ['framer-motion', 'clsx@^2.0.0'])
 * @returns Installation result with success status, installed packages, and error messages
 *
 * @example
 * ```typescript
 * const result = await executeNpmInstall(['framer-motion', 'clsx']);
 * if (result.success) {
 *   console.log('Installed:', result.packagesInstalled);
 *   console.log('Already had:', result.alreadyInstalled);
 * }
 * ```
 */
export async function executeNpmInstall(packages: string[]): Promise<NpmInstallResult> {
  // Early return if no packages provided
  if (packages.length === 0) {
    return {
      success: true,
      packagesInstalled: [],
      alreadyInstalled: [],
      errors: [],
      output: '',
    };
  }

  try {
    // Check which packages are already installed
    const packageCheck = await checkInstalledPackages(packages);

    // If all packages are already installed, skip npm install
    if (packageCheck.missing.length === 0) {
      return {
        success: true,
        packagesInstalled: [],
        alreadyInstalled: packageCheck.installed,
        errors: [],
        output: 'All packages already installed',
      };
    }

    // Install only missing packages
    const command = `npm install ${packageCheck.missing.join(' ')}`;
    const rawOutput = execSync(command, {
      encoding: 'utf8',
      cwd: process.cwd(),
      timeout: TIMEOUT_MS,
      stdio: 'pipe',
    });

    // Output is already a string due to encoding: 'utf8'
    const output = rawOutput;

    return {
      success: true,
      packagesInstalled: packageCheck.missing,
      alreadyInstalled: packageCheck.installed,
      errors: [],
      output,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const output = error && typeof error === 'object' && 'stdout' in error
      ? String(error.stdout)
      : errorMessage;

    return {
      success: false,
      packagesInstalled: [],
      alreadyInstalled: [],
      errors: [errorMessage],
      output,
    };
  }
}

/**
 * Extract package version from npm output
 */
export function extractPackageVersion(output: string, packageName: string): string | undefined {
  // Look for "+ package@version" in output
  const escapedName = packageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\+\\s+${escapedName}@([\\d.]+)`, 'm');
  const match = output.match(regex);
  return match ? match[1] : undefined;
}