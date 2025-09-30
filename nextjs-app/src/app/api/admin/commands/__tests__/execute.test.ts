import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../execute/route';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isAdminServer } from '@/lib/permissions/server-checks';
import * as commandParser from '@/lib/command-import/command-parser';
import * as npmWrapper from '@/lib/command-import/npm-wrapper';
import * as shadcnWrapper from '@/lib/command-import/shadcn-cli-wrapper';

// Mock dependencies
vi.mock('@/lib/supabase/server');
vi.mock('@/lib/permissions/server-checks');
vi.mock('@/lib/command-import/command-parser');
vi.mock('@/lib/command-import/npm-wrapper');
vi.mock('@/lib/command-import/shadcn-cli-wrapper');

describe('/api/admin/commands/execute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authentication', () => {
    it('should return 401 if user is not authenticated', async () => {
      vi.mocked(createSupabaseServerClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: new Error('Not authenticated'),
          }),
        },
      } as any);

      const request = new Request('http://localhost:3000/api/admin/commands/execute', {
        method: 'POST',
        body: JSON.stringify({ commands: 'npm install framer-motion' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      vi.mocked(createSupabaseServerClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
      } as any);

      vi.mocked(isAdminServer).mockResolvedValue(false);

      const request = new Request('http://localhost:3000/api/admin/commands/execute', {
        method: 'POST',
        body: JSON.stringify({ commands: 'npm install framer-motion' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(403);
    });
  });

  describe('npm install execution', () => {
    beforeEach(() => {
      vi.mocked(createSupabaseServerClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'admin-123' } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ data: null, error: null }),
      } as any);
      vi.mocked(isAdminServer).mockResolvedValue(true);
    });

    it('should execute npm install command successfully', async () => {
      vi.mocked(commandParser.parseCommands).mockReturnValue({
        commands: [
          {
            type: 'npm',
            originalCommand: 'npm install framer-motion',
            packages: ['framer-motion'],
            warnings: [],
          },
        ],
        hasWarnings: false,
        totalCommands: 1,
      });

      vi.mocked(npmWrapper.executeNpmInstall).mockResolvedValue({
        success: true,
        packagesInstalled: ['framer-motion'],
        alreadyInstalled: [],
        errors: [],
        output: 'added 1 package in 2s',
      });

      const request = new Request('http://localhost:3000/api/admin/commands/execute', {
        method: 'POST',
        body: JSON.stringify({ commands: 'npm install framer-motion' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.results).toHaveLength(1);
      expect(data.results[0].success).toBe(true);
      expect(data.summary.succeeded).toBe(1);
      expect(data.summary.failed).toBe(0);
    });

    it('should handle npm install failures', async () => {
      vi.mocked(commandParser.parseCommands).mockReturnValue({
        commands: [
          {
            type: 'npm',
            originalCommand: 'npm install nonexistent-package',
            packages: ['nonexistent-package'],
            warnings: [],
          },
        ],
        hasWarnings: false,
        totalCommands: 1,
      });

      vi.mocked(npmWrapper.executeNpmInstall).mockResolvedValue({
        success: false,
        packagesInstalled: [],
        alreadyInstalled: [],
        errors: ['Package not found'],
        output: 'npm ERR! 404 Package not found',
      });

      const request = new Request('http://localhost:3000/api/admin/commands/execute', {
        method: 'POST',
        body: JSON.stringify({ commands: 'npm install nonexistent-package' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true); // Overall request succeeded
      expect(data.results[0].success).toBe(false); // But command failed
      expect(data.results[0].errors).toContain('Package not found');
      expect(data.summary.failed).toBe(1);
    });
  });

  describe('shadcn add execution', () => {
    beforeEach(() => {
      vi.mocked(createSupabaseServerClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'admin-123' } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ data: null, error: null }),
      } as any);
      vi.mocked(isAdminServer).mockResolvedValue(true);
    });

    it('should execute shadcn add component command', async () => {
      vi.mocked(commandParser.parseCommands).mockReturnValue({
        commands: [
          {
            type: 'shadcn-component',
            originalCommand: 'npx shadcn add button',
            component: 'button',
            warnings: [],
          },
        ],
        hasWarnings: false,
        totalCommands: 1,
      });

      vi.mocked(shadcnWrapper.executeShadcnAddComponent).mockResolvedValue({
        success: true,
        component: 'button',
        filesCreated: ['button.tsx'],
        dependenciesInstalled: [],
        errors: [],
        output: 'Component button installed successfully',
      });

      const request = new Request('http://localhost:3000/api/admin/commands/execute', {
        method: 'POST',
        body: JSON.stringify({ commands: 'npx shadcn add button' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.results[0].success).toBe(true);
      expect(data.results[0].output).toContain('button installed successfully');
    });

    it('should execute shadcn add registry command', async () => {
      const url = 'https://ui.aceternity.com/registry/container-text-flip.json';

      vi.mocked(commandParser.parseCommands).mockReturnValue({
        commands: [
          {
            type: 'shadcn-registry',
            originalCommand: `npx shadcn add ${url}`,
            registryUrl: url,
            warnings: [],
          },
        ],
        hasWarnings: false,
        totalCommands: 1,
      });

      vi.mocked(shadcnWrapper.executeShadcnAddRegistry).mockResolvedValue({
        success: true,
        component: 'container-text-flip',
        filesCreated: ['container-text-flip.tsx', 'text-flip-utils.ts'],
        dependenciesInstalled: ['framer-motion'],
        errors: [],
        output: 'Component container-text-flip installed successfully',
      });

      const request = new Request('http://localhost:3000/api/admin/commands/execute', {
        method: 'POST',
        body: JSON.stringify({ commands: `npx shadcn add ${url}` }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.results[0].success).toBe(true);
      expect(data.results[0].output).toContain('container-text-flip installed successfully');
    });
  });

  describe('batch execution', () => {
    beforeEach(() => {
      vi.mocked(createSupabaseServerClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'admin-123' } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ data: null, error: null }),
      } as any);
      vi.mocked(isAdminServer).mockResolvedValue(true);
    });

    it('should execute multiple commands sequentially', async () => {
      const commands = `npm install framer-motion
npx shadcn add button`;

      vi.mocked(commandParser.parseCommands).mockReturnValue({
        commands: [
          {
            type: 'npm',
            originalCommand: 'npm install framer-motion',
            packages: ['framer-motion'],
            warnings: [],
          },
          {
            type: 'shadcn-component',
            originalCommand: 'npx shadcn add button',
            component: 'button',
            warnings: [],
          },
        ],
        hasWarnings: false,
        totalCommands: 2,
      });

      vi.mocked(npmWrapper.executeNpmInstall).mockResolvedValue({
        success: true,
        packagesInstalled: ['framer-motion'],
        alreadyInstalled: [],
        errors: [],
        output: 'added 1 package',
      });

      vi.mocked(shadcnWrapper.executeShadcnAddComponent).mockResolvedValue({
        success: true,
        component: 'button',
        filesCreated: ['button.tsx'],
        dependenciesInstalled: [],
        errors: [],
        output: 'Component button installed',
      });

      const request = new Request('http://localhost:3000/api/admin/commands/execute', {
        method: 'POST',
        body: JSON.stringify({ commands }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.results).toHaveLength(2);
      expect(data.summary.total).toBe(2);
      expect(data.summary.succeeded).toBe(2);
      expect(data.summary.failed).toBe(0);
    });

    it('should continue execution even if one command fails', async () => {
      const commands = `npm install nonexistent-package
npx shadcn add button`;

      vi.mocked(commandParser.parseCommands).mockReturnValue({
        commands: [
          {
            type: 'npm',
            originalCommand: 'npm install nonexistent-package',
            packages: ['nonexistent-package'],
            warnings: [],
          },
          {
            type: 'shadcn-component',
            originalCommand: 'npx shadcn add button',
            component: 'button',
            warnings: [],
          },
        ],
        hasWarnings: false,
        totalCommands: 2,
      });

      vi.mocked(npmWrapper.executeNpmInstall).mockResolvedValue({
        success: false,
        packagesInstalled: [],
        alreadyInstalled: [],
        errors: ['Package not found'],
        output: 'npm ERR! 404',
      });

      vi.mocked(shadcnWrapper.executeShadcnAddComponent).mockResolvedValue({
        success: true,
        component: 'button',
        filesCreated: ['button.tsx'],
        dependenciesInstalled: [],
        errors: [],
        output: 'Component button installed',
      });

      const request = new Request('http://localhost:3000/api/admin/commands/execute', {
        method: 'POST',
        body: JSON.stringify({ commands }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.results).toHaveLength(2);
      expect(data.results[0].success).toBe(false);
      expect(data.results[1].success).toBe(true);
      expect(data.summary.succeeded).toBe(1);
      expect(data.summary.failed).toBe(1);
    });
  });

  describe('database logging', () => {
    it('should log command execution to database', async () => {
      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockResolvedValue({ data: { id: 'log-123' }, error: null });

      vi.mocked(createSupabaseServerClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'admin-123' } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          insert: mockInsert,
          select: mockSelect,
        }),
      } as any);

      vi.mocked(isAdminServer).mockResolvedValue(true);

      vi.mocked(commandParser.parseCommands).mockReturnValue({
        commands: [
          {
            type: 'npm',
            originalCommand: 'npm install framer-motion',
            packages: ['framer-motion'],
            warnings: [],
          },
        ],
        hasWarnings: false,
        totalCommands: 1,
      });

      vi.mocked(npmWrapper.executeNpmInstall).mockResolvedValue({
        success: true,
        packagesInstalled: ['framer-motion'],
        alreadyInstalled: [],
        errors: [],
        output: 'added 1 package',
      });

      const request = new Request('http://localhost:3000/api/admin/commands/execute', {
        method: 'POST',
        body: JSON.stringify({ commands: 'npm install framer-motion' }),
      });

      await POST(request);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          command_text: 'npm install framer-motion',
          command_type: 'npm',
          success: true,
          user_id: 'admin-123',
        })
      );
    });

    it('should continue even if database logging fails', async () => {
      vi.mocked(createSupabaseServerClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'admin-123' } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
        }),
      } as any);

      vi.mocked(isAdminServer).mockResolvedValue(true);

      vi.mocked(commandParser.parseCommands).mockReturnValue({
        commands: [
          {
            type: 'npm',
            originalCommand: 'npm install framer-motion',
            packages: ['framer-motion'],
            warnings: [],
          },
        ],
        hasWarnings: false,
        totalCommands: 1,
      });

      vi.mocked(npmWrapper.executeNpmInstall).mockResolvedValue({
        success: true,
        packagesInstalled: ['framer-motion'],
        alreadyInstalled: [],
        errors: [],
        output: 'added 1 package',
      });

      const request = new Request('http://localhost:3000/api/admin/commands/execute', {
        method: 'POST',
        body: JSON.stringify({ commands: 'npm install framer-motion' }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Command should still succeed even if logging failed
      expect(data.success).toBe(true);
    });
  });

  describe('unknown command types', () => {
    beforeEach(() => {
      vi.mocked(createSupabaseServerClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'admin-123' } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ data: null, error: null }),
      } as any);
      vi.mocked(isAdminServer).mockResolvedValue(true);
    });

    it('should skip unknown command types', async () => {
      vi.mocked(commandParser.parseCommands).mockReturnValue({
        commands: [
          {
            type: 'unknown',
            originalCommand: 'yarn add framer-motion',
            warnings: ['Unknown command type'],
          },
        ],
        hasWarnings: true,
        totalCommands: 1,
      });

      const request = new Request('http://localhost:3000/api/admin/commands/execute', {
        method: 'POST',
        body: JSON.stringify({ commands: 'yarn add framer-motion' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.results[0].success).toBe(false);
      expect(data.results[0].errors).toContain('Unknown command type');
      expect(data.summary.failed).toBe(1);
    });
  });
});