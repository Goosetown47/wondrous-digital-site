import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs/promises';
import {
  executeShadcnAddComponent,
  executeShadcnAddRegistry,
  detectCreatedFiles,
  type ShadcnAddResult,
} from '../shadcn-cli-wrapper';

// Mock child_process
vi.mock('child_process');

// Mock fs/promises
vi.mock('fs/promises');

describe('shadcn-cli-wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('executeShadcnAddComponent', () => {
    it('should execute shadcn add command successfully', async () => {
      const mockOutput = `✔ Component button installed successfully
Created: src/components/ui/button.tsx`;

      vi.mocked(execSync).mockReturnValue(Buffer.from(mockOutput));
      vi.mocked(fs.readdir).mockResolvedValue(['button.tsx'] as any);

      const result = await executeShadcnAddComponent('button');

      expect(result.success).toBe(true);
      expect(result.component).toBe('button');
      expect(result.filesCreated).toContain('button.tsx');
      expect(result.errors).toHaveLength(0);
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('npx shadcn@latest add button'),
        expect.any(Object)
      );
    });

    it('should use --yes flag for non-interactive execution', async () => {
      vi.mocked(execSync).mockReturnValue(Buffer.from('Success'));
      vi.mocked(fs.readdir).mockResolvedValue([] as any);

      await executeShadcnAddComponent('button');

      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('--yes'),
        expect.any(Object)
      );
    });

    it('should use --path flag to target src/components/ui', async () => {
      vi.mocked(execSync).mockReturnValue(Buffer.from('Success'));
      vi.mocked(fs.readdir).mockResolvedValue([] as any);

      await executeShadcnAddComponent('button');

      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('--path src/components/ui'),
        expect.any(Object)
      );
    });

    it('should handle execution errors', async () => {
      const error = new Error('Command failed: npx shadcn add button\nComponent not found');
      vi.mocked(execSync).mockImplementation(() => {
        throw error;
      });

      const result = await executeShadcnAddComponent('button');

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Component not found');
    });

    it('should capture stdout from command execution', async () => {
      const mockOutput = 'Installing component button...';
      vi.mocked(execSync).mockReturnValue(Buffer.from(mockOutput));
      vi.mocked(fs.readdir).mockResolvedValue([] as any);

      const result = await executeShadcnAddComponent('button');

      expect(result.output).toContain('Installing component button');
    });

    it('should detect files created after execution', async () => {
      vi.mocked(execSync).mockReturnValue(Buffer.from('Success'));
      vi.mocked(fs.readdir).mockResolvedValue([
        'button.tsx',
        'button-variants.ts',
        'card.tsx', // Existing file
      ] as any);

      const result = await executeShadcnAddComponent('button');

      // Should detect button-related files
      expect(result.filesCreated.some(f => f.includes('button'))).toBe(true);
    });

    it('should extract dependencies from output', async () => {
      const mockOutput = `Installing dependencies...
npm install class-variance-authority
npm install @radix-ui/react-slot
Component button installed successfully`;

      vi.mocked(execSync).mockReturnValue(Buffer.from(mockOutput));
      vi.mocked(fs.readdir).mockResolvedValue(['button.tsx'] as any);

      const result = await executeShadcnAddComponent('button');

      expect(result.dependenciesInstalled).toContain('class-variance-authority');
      expect(result.dependenciesInstalled).toContain('@radix-ui/react-slot');
    });

    it('should handle timeout for long-running commands', async () => {
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error('Command timed out after 120000ms');
      });

      const result = await executeShadcnAddComponent('button');

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('timed out');
    });

    it('should handle component already exists error', async () => {
      const error = new Error('Component button already exists. Use --overwrite to replace.');
      vi.mocked(execSync).mockImplementation(() => {
        throw error;
      });

      const result = await executeShadcnAddComponent('button');

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('already exists');
    });
  });

  describe('executeShadcnAddRegistry', () => {
    it('should execute shadcn add with registry URL', async () => {
      const url = 'https://ui.aceternity.com/registry/container-text-flip.json';
      const mockOutput = 'Component container-text-flip installed successfully';

      vi.mocked(execSync).mockReturnValue(Buffer.from(mockOutput));
      vi.mocked(fs.readdir).mockResolvedValue(['container-text-flip.tsx'] as any);

      const result = await executeShadcnAddRegistry(url);

      expect(result.success).toBe(true);
      expect(result.filesCreated).toContain('container-text-flip.tsx');
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining(url),
        expect.any(Object)
      );
    });

    it('should handle registry fetch failures', async () => {
      const url = 'https://ui.aceternity.com/registry/nonexistent.json';
      const error = new Error('Failed to fetch registry: 404 Not Found');
      vi.mocked(execSync).mockImplementation(() => {
        throw error;
      });

      const result = await executeShadcnAddRegistry(url);

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('404 Not Found');
    });

    it('should detect multiple files created from registry component', async () => {
      vi.mocked(execSync).mockReturnValue(Buffer.from('Success'));
      vi.mocked(fs.readdir).mockResolvedValue([
        'container-text-flip.tsx',
        'text-flip-utils.ts',
        'text-flip-types.ts',
      ] as any);

      const result = await executeShadcnAddRegistry(
        'https://ui.aceternity.com/registry/container-text-flip.json'
      );

      expect(result.filesCreated).toHaveLength(3);
      expect(result.filesCreated).toContain('container-text-flip.tsx');
      expect(result.filesCreated).toContain('text-flip-utils.ts');
      expect(result.filesCreated).toContain('text-flip-types.ts');
    });

    it('should extract component name from registry URL', async () => {
      const url = 'https://ui.aceternity.com/registry/container-text-flip.json';
      vi.mocked(execSync).mockReturnValue(Buffer.from('Success'));
      vi.mocked(fs.readdir).mockResolvedValue(['container-text-flip.tsx'] as any);

      const result = await executeShadcnAddRegistry(url);

      expect(result.component).toBe('container-text-flip');
    });

    it('should handle network errors', async () => {
      const error = new Error('ECONNREFUSED: Connection refused');
      vi.mocked(execSync).mockImplementation(() => {
        throw error;
      });

      const result = await executeShadcnAddRegistry(
        'https://ui.aceternity.com/registry/component.json'
      );

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('ECONNREFUSED');
    });
  });

  describe('detectCreatedFiles', () => {
    it('should detect new files in components/ui directory', async () => {
      const beforeFiles = ['card.tsx', 'button.tsx'];
      const afterFiles = ['card.tsx', 'button.tsx', 'dialog.tsx', 'dropdown-menu.tsx'];

      vi.mocked(fs.readdir)
        .mockResolvedValueOnce(beforeFiles as any)
        .mockResolvedValueOnce(afterFiles as any);

      const newFiles = await detectCreatedFiles('dialog');

      expect(newFiles).toContain('dialog.tsx');
      expect(newFiles).toContain('dropdown-menu.tsx');
      expect(newFiles).not.toContain('card.tsx');
      expect(newFiles).not.toContain('button.tsx');
    });

    it('should return empty array if no new files', async () => {
      const files = ['card.tsx', 'button.tsx'];

      vi.mocked(fs.readdir)
        .mockResolvedValueOnce(files as any)
        .mockResolvedValueOnce(files as any);

      const newFiles = await detectCreatedFiles('dialog');

      expect(newFiles).toHaveLength(0);
    });

    it('should handle readdir errors gracefully', async () => {
      vi.mocked(fs.readdir).mockRejectedValue(new Error('Directory not found'));

      const newFiles = await detectCreatedFiles('button');

      expect(newFiles).toHaveLength(0);
    });

    it('should filter out non-component files', async () => {
      const beforeFiles = ['card.tsx'];
      const afterFiles = ['card.tsx', 'button.tsx', '.DS_Store', 'README.md'];

      vi.mocked(fs.readdir)
        .mockResolvedValueOnce(beforeFiles as any)
        .mockResolvedValueOnce(afterFiles as any);

      const newFiles = await detectCreatedFiles('button');

      // Should only include .tsx and .ts files
      expect(newFiles).toContain('button.tsx');
      expect(newFiles).not.toContain('.DS_Store');
      expect(newFiles).not.toContain('README.md');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete workflow for adding button component', async () => {
      const mockOutput = `✔ Checking registry...
✔ Installing dependencies...
✔ Created src/components/ui/button.tsx`;

      vi.mocked(execSync).mockReturnValue(Buffer.from(mockOutput));
      vi.mocked(fs.readdir)
        .mockResolvedValueOnce(['card.tsx'] as any)
        .mockResolvedValueOnce(['card.tsx', 'button.tsx'] as any);

      const result = await executeShadcnAddComponent('button');

      expect(result.success).toBe(true);
      expect(result.component).toBe('button');
      expect(result.filesCreated).toContain('button.tsx');
      expect(result.output).toContain('Created src/components/ui/button.tsx');
    });

    it('should handle complete workflow for registry component', async () => {
      const url = 'https://ui.aceternity.com/registry/container-text-flip.json';
      const mockOutput = `✔ Fetching component...
✔ Installing dependencies...
✔ Created src/components/ui/container-text-flip.tsx
✔ Created src/components/ui/text-flip-utils.ts`;

      vi.mocked(execSync).mockReturnValue(Buffer.from(mockOutput));
      vi.mocked(fs.readdir)
        .mockResolvedValueOnce(['card.tsx'] as any)
        .mockResolvedValueOnce([
          'card.tsx',
          'container-text-flip.tsx',
          'text-flip-utils.ts',
        ] as any);

      const result = await executeShadcnAddRegistry(url);

      expect(result.success).toBe(true);
      expect(result.component).toBe('container-text-flip');
      expect(result.filesCreated).toHaveLength(2);
    });
  });
});