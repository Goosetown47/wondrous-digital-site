import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs/promises';
import {
  executeNpmInstall,
  checkInstalledPackages,
  extractPackageVersion,
  type NpmInstallResult,
} from '../npm-wrapper';

// Mock child_process
vi.mock('child_process');

// Mock fs/promises
vi.mock('fs/promises');

describe('npm-wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('checkInstalledPackages', () => {
    it('should detect installed packages from package.json', async () => {
      const mockPackageJson = {
        dependencies: {
          'framer-motion': '^12.23.6',
          'lucide-react': '^0.525.0',
        },
        devDependencies: {
          'typescript': '^5.8.3',
        },
      };

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));

      const result = await checkInstalledPackages(['framer-motion', 'lucide-react', 'clsx']);

      expect(result.installed).toContain('framer-motion');
      expect(result.installed).toContain('lucide-react');
      expect(result.missing).toContain('clsx');
    });

    it('should check both dependencies and devDependencies', async () => {
      const mockPackageJson = {
        dependencies: {
          'react': '^19.1.0',
        },
        devDependencies: {
          'vitest': '^3.2.4',
        },
      };

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));

      const result = await checkInstalledPackages(['react', 'vitest']);

      expect(result.installed).toContain('react');
      expect(result.installed).toContain('vitest');
      expect(result.missing).toHaveLength(0);
    });

    it('should handle scoped packages', async () => {
      const mockPackageJson = {
        dependencies: {
          '@radix-ui/react-dialog': '^1.1.15',
          '@radix-ui/react-dropdown-menu': '^2.1.15',
        },
      };

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));

      const result = await checkInstalledPackages([
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
      ]);

      expect(result.installed).toHaveLength(2);
      expect(result.missing).toHaveLength(0);
    });

    it('should return versions for installed packages', async () => {
      const mockPackageJson = {
        dependencies: {
          'framer-motion': '^12.23.6',
        },
      };

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));

      const result = await checkInstalledPackages(['framer-motion']);

      expect(result.versions['framer-motion']).toBe('^12.23.6');
    });

    it('should handle package.json read errors', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT: file not found'));

      const result = await checkInstalledPackages(['framer-motion']);

      expect(result.installed).toHaveLength(0);
      expect(result.missing).toContain('framer-motion');
    });

    it('should handle malformed package.json', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('{ invalid json }');

      const result = await checkInstalledPackages(['framer-motion']);

      expect(result.installed).toHaveLength(0);
      expect(result.missing).toContain('framer-motion');
    });
  });

  describe('executeNpmInstall', () => {
    it('should execute npm install successfully', async () => {
      const mockPackageJson = {
        dependencies: {
          'lucide-react': '^0.525.0',
        },
      };

      const mockOutput = `added 1 package in 2s
+ framer-motion@12.23.6`;

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));
      vi.mocked(execSync).mockReturnValue(Buffer.from(mockOutput));

      const result = await executeNpmInstall(['framer-motion']);

      expect(result.success).toBe(true);
      expect(result.packagesInstalled).toContain('framer-motion');
      expect(result.alreadyInstalled).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should skip packages that are already installed', async () => {
      const mockPackageJson = {
        dependencies: {
          'framer-motion': '^12.23.6',
          'lucide-react': '^0.525.0',
        },
      };

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));

      const result = await executeNpmInstall(['framer-motion', 'lucide-react']);

      expect(result.success).toBe(true);
      expect(result.packagesInstalled).toHaveLength(0);
      expect(result.alreadyInstalled).toContain('framer-motion');
      expect(result.alreadyInstalled).toContain('lucide-react');
      expect(execSync).not.toHaveBeenCalled();
    });

    it('should only install missing packages', async () => {
      const mockPackageJson = {
        dependencies: {
          'framer-motion': '^12.23.6',
        },
      };

      const mockOutput = 'added 1 package in 2s';

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));
      vi.mocked(execSync).mockReturnValue(Buffer.from(mockOutput));

      const result = await executeNpmInstall(['framer-motion', 'lucide-react', 'clsx']);

      expect(result.packagesInstalled).toContain('lucide-react');
      expect(result.packagesInstalled).toContain('clsx');
      expect(result.alreadyInstalled).toContain('framer-motion');
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('npm install lucide-react clsx'),
        expect.any(Object)
      );
    });

    it('should handle npm install failures', async () => {
      const mockPackageJson = { dependencies: {} };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));

      const error = new Error('npm ERR! 404 Package not found');
      vi.mocked(execSync).mockImplementation(() => {
        throw error;
      });

      const result = await executeNpmInstall(['nonexistent-package']);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('404 Package not found');
    });

    it('should capture npm output', async () => {
      const mockPackageJson = { dependencies: {} };
      const mockOutput = `added 3 packages, and audited 975 packages in 5s
+ framer-motion@12.23.6
+ lucide-react@0.525.0
+ clsx@2.1.1`;

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));
      vi.mocked(execSync).mockReturnValue(Buffer.from(mockOutput));

      const result = await executeNpmInstall(['framer-motion', 'lucide-react', 'clsx']);

      expect(result.output).toContain('added 3 packages');
      expect(result.output).toContain('framer-motion@12.23.6');
    });

    it('should handle timeout errors', async () => {
      const mockPackageJson = { dependencies: {} };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));

      const error = new Error('Command timed out after 300000ms');
      vi.mocked(execSync).mockImplementation(() => {
        throw error;
      });

      const result = await executeNpmInstall(['large-package']);

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('timed out');
    });

    it('should use correct working directory', async () => {
      const mockPackageJson = { dependencies: {} };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));
      vi.mocked(execSync).mockReturnValue(Buffer.from('Success'));

      await executeNpmInstall(['framer-motion']);

      expect(execSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          cwd: process.cwd(),
        })
      );
    });

    it('should handle network errors', async () => {
      const mockPackageJson = { dependencies: {} };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));

      const error = new Error('npm ERR! network request failed');
      vi.mocked(execSync).mockImplementation(() => {
        throw error;
      });

      const result = await executeNpmInstall(['framer-motion']);

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('network');
    });

    it('should install packages with version specifiers', async () => {
      const mockPackageJson = { dependencies: {} };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));
      vi.mocked(execSync).mockReturnValue(Buffer.from('Success'));

      await executeNpmInstall(['framer-motion@12.0.0', 'lucide-react@^0.525.0']);

      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('framer-motion@12.0.0 lucide-react@^0.525.0'),
        expect.any(Object)
      );
    });

    it('should return empty arrays when no packages provided', async () => {
      const result = await executeNpmInstall([]);

      expect(result.success).toBe(true);
      expect(result.packagesInstalled).toHaveLength(0);
      expect(result.alreadyInstalled).toHaveLength(0);
      expect(execSync).not.toHaveBeenCalled();
    });
  });

  describe('extractPackageVersion', () => {
    it('should extract version from npm output', () => {
      const output = '+ framer-motion@12.23.6';
      const version = extractPackageVersion(output, 'framer-motion');

      expect(version).toBe('12.23.6');
    });

    it('should extract version from scoped package', () => {
      const output = '+ @radix-ui/react-dialog@1.1.15';
      const version = extractPackageVersion(output, '@radix-ui/react-dialog');

      expect(version).toBe('1.1.15');
    });

    it('should return undefined if package not found in output', () => {
      const output = '+ framer-motion@12.23.6';
      const version = extractPackageVersion(output, 'lucide-react');

      expect(version).toBeUndefined();
    });

    it('should handle output with multiple packages', () => {
      const output = `+ framer-motion@12.23.6
+ lucide-react@0.525.0
+ clsx@2.1.1`;

      const version1 = extractPackageVersion(output, 'framer-motion');
      const version2 = extractPackageVersion(output, 'lucide-react');
      const version3 = extractPackageVersion(output, 'clsx');

      expect(version1).toBe('12.23.6');
      expect(version2).toBe('0.525.0');
      expect(version3).toBe('2.1.1');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete workflow with mixed installed/new packages', async () => {
      const mockPackageJson = {
        dependencies: {
          'react': '^19.1.0',
          'framer-motion': '^12.23.6',
        },
      };

      const mockOutput = `added 2 packages in 3s
+ lucide-react@0.525.0
+ clsx@2.1.1`;

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));
      vi.mocked(execSync).mockReturnValue(Buffer.from(mockOutput));

      const result = await executeNpmInstall([
        'react',
        'framer-motion',
        'lucide-react',
        'clsx',
      ]);

      expect(result.success).toBe(true);
      expect(result.alreadyInstalled).toHaveLength(2);
      expect(result.alreadyInstalled).toContain('react');
      expect(result.alreadyInstalled).toContain('framer-motion');
      expect(result.packagesInstalled).toHaveLength(2);
      expect(result.packagesInstalled).toContain('lucide-react');
      expect(result.packagesInstalled).toContain('clsx');
    });

    it('should handle scenario where all packages are already installed', async () => {
      const mockPackageJson = {
        dependencies: {
          'framer-motion': '^12.23.6',
          'lucide-react': '^0.525.0',
          'clsx': '^2.1.1',
        },
      };

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));

      const result = await executeNpmInstall(['framer-motion', 'lucide-react', 'clsx']);

      expect(result.success).toBe(true);
      expect(result.packagesInstalled).toHaveLength(0);
      expect(result.alreadyInstalled).toHaveLength(3);
      expect(result.output).toContain('All packages already installed');
      expect(execSync).not.toHaveBeenCalled();
    });

    it('should handle scenario where all packages need installation', async () => {
      const mockPackageJson = {
        dependencies: {
          'react': '^19.1.0',
        },
      };

      const mockOutput = `added 5 packages in 8s
+ framer-motion@12.23.6
+ lucide-react@0.525.0
+ clsx@2.1.1`;

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));
      vi.mocked(execSync).mockReturnValue(Buffer.from(mockOutput));

      const result = await executeNpmInstall(['framer-motion', 'lucide-react', 'clsx']);

      expect(result.success).toBe(true);
      expect(result.packagesInstalled).toHaveLength(3);
      expect(result.alreadyInstalled).toHaveLength(0);
    });
  });
});