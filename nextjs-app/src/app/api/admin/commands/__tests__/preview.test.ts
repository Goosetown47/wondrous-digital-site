import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../preview/route';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isAdminServer } from '@/lib/permissions/server-checks';
import * as commandParser from '@/lib/command-import/command-parser';
import * as npmWrapper from '@/lib/command-import/npm-wrapper';

// Mock dependencies
vi.mock('@/lib/supabase/server');
vi.mock('@/lib/permissions/server-checks');
vi.mock('@/lib/command-import/command-parser');
vi.mock('@/lib/command-import/npm-wrapper');

describe('/api/admin/commands/preview', () => {
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

      const request = new Request('http://localhost:3000/api/admin/commands/preview', {
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

      const request = new Request('http://localhost:3000/api/admin/commands/preview', {
        method: 'POST',
        body: JSON.stringify({ commands: 'npm install framer-motion' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(403);
    });

    it('should proceed if user is authenticated admin', async () => {
      vi.mocked(createSupabaseServerClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'admin-123' } },
            error: null,
          }),
        },
      } as any);

      vi.mocked(isAdminServer).mockResolvedValue(true);
      vi.mocked(commandParser.parseCommands).mockReturnValue({
        commands: [],
        hasWarnings: false,
        totalCommands: 0,
      });
      vi.mocked(npmWrapper.checkInstalledPackages).mockResolvedValue({
        installed: [],
        missing: [],
        versions: {},
      });

      const request = new Request('http://localhost:3000/api/admin/commands/preview', {
        method: 'POST',
        body: JSON.stringify({ commands: '' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });

  describe('request validation', () => {
    beforeEach(() => {
      // Setup authenticated admin for all these tests
      vi.mocked(createSupabaseServerClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'admin-123' } },
            error: null,
          }),
        },
      } as any);
      vi.mocked(isAdminServer).mockResolvedValue(true);
    });

    it('should return 400 if commands is missing', async () => {
      const request = new Request('http://localhost:3000/api/admin/commands/preview', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('commands');
    });

    it('should return 400 if commands is not a string', async () => {
      const request = new Request('http://localhost:3000/api/admin/commands/preview', {
        method: 'POST',
        body: JSON.stringify({ commands: 123 }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should accept empty commands string', async () => {
      vi.mocked(commandParser.parseCommands).mockReturnValue({
        commands: [],
        hasWarnings: false,
        totalCommands: 0,
      });

      const request = new Request('http://localhost:3000/api/admin/commands/preview', {
        method: 'POST',
        body: JSON.stringify({ commands: '' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });

  describe('npm install preview', () => {
    beforeEach(() => {
      vi.mocked(createSupabaseServerClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'admin-123' } },
            error: null,
          }),
        },
      } as any);
      vi.mocked(isAdminServer).mockResolvedValue(true);
    });

    it('should preview npm install command', async () => {
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

      vi.mocked(npmWrapper.checkInstalledPackages).mockResolvedValue({
        installed: [],
        missing: ['framer-motion'],
        versions: {},
      });

      const request = new Request('http://localhost:3000/api/admin/commands/preview', {
        method: 'POST',
        body: JSON.stringify({ commands: 'npm install framer-motion' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.parsed.commands).toHaveLength(1);
      expect(data.preview.npmPackages).toHaveLength(1);
      expect(data.preview.npmPackages[0]).toEqual({
        name: 'framer-motion',
        alreadyInstalled: false,
        version: undefined,
      });
    });

    it('should detect already installed packages', async () => {
      vi.mocked(commandParser.parseCommands).mockReturnValue({
        commands: [
          {
            type: 'npm',
            originalCommand: 'npm install framer-motion lucide-react',
            packages: ['framer-motion', 'lucide-react'],
            warnings: [],
          },
        ],
        hasWarnings: false,
        totalCommands: 1,
      });

      vi.mocked(npmWrapper.checkInstalledPackages).mockResolvedValue({
        installed: ['framer-motion'],
        missing: ['lucide-react'],
        versions: { 'framer-motion': '^12.23.6' },
      });

      const request = new Request('http://localhost:3000/api/admin/commands/preview', {
        method: 'POST',
        body: JSON.stringify({ commands: 'npm install framer-motion lucide-react' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.preview.npmPackages).toHaveLength(2);
      expect(data.preview.npmPackages.find((p: any) => p.name === 'framer-motion')).toEqual({
        name: 'framer-motion',
        alreadyInstalled: true,
        version: '^12.23.6',
      });
      expect(data.preview.npmPackages.find((p: any) => p.name === 'lucide-react')).toEqual({
        name: 'lucide-react',
        alreadyInstalled: false,
        version: undefined,
      });
    });
  });

  describe('shadcn add preview', () => {
    beforeEach(() => {
      vi.mocked(createSupabaseServerClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'admin-123' } },
            error: null,
          }),
        },
      } as any);
      vi.mocked(isAdminServer).mockResolvedValue(true);
      vi.mocked(npmWrapper.checkInstalledPackages).mockResolvedValue({
        installed: [],
        missing: [],
        versions: {},
      });
    });

    it('should preview shadcn add component command', async () => {
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

      const request = new Request('http://localhost:3000/api/admin/commands/preview', {
        method: 'POST',
        body: JSON.stringify({ commands: 'npx shadcn add button' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.preview.shadcnComponents).toHaveLength(1);
      expect(data.preview.shadcnComponents[0]).toEqual({
        name: 'button',
        type: 'component',
      });
    });

    it('should preview shadcn add registry command', async () => {
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

      const request = new Request('http://localhost:3000/api/admin/commands/preview', {
        method: 'POST',
        body: JSON.stringify({ commands: `npx shadcn add ${url}` }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.preview.shadcnComponents).toHaveLength(1);
      expect(data.preview.shadcnComponents[0]).toEqual({
        name: url,
        type: 'registry',
      });
    });
  });

  describe('batch commands preview', () => {
    beforeEach(() => {
      vi.mocked(createSupabaseServerClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'admin-123' } },
            error: null,
          }),
        },
      } as any);
      vi.mocked(isAdminServer).mockResolvedValue(true);
    });

    it('should preview multiple commands', async () => {
      const commands = `npm install framer-motion
npx shadcn add button
npx shadcn add https://ui.aceternity.com/registry/container-text-flip.json`;

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
          {
            type: 'shadcn-registry',
            originalCommand: 'npx shadcn add https://ui.aceternity.com/registry/container-text-flip.json',
            registryUrl: 'https://ui.aceternity.com/registry/container-text-flip.json',
            warnings: [],
          },
        ],
        hasWarnings: false,
        totalCommands: 3,
      });

      vi.mocked(npmWrapper.checkInstalledPackages).mockResolvedValue({
        installed: [],
        missing: ['framer-motion'],
        versions: {},
      });

      const request = new Request('http://localhost:3000/api/admin/commands/preview', {
        method: 'POST',
        body: JSON.stringify({ commands }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.parsed.totalCommands).toBe(3);
      expect(data.preview.npmPackages).toHaveLength(1);
      expect(data.preview.shadcnComponents).toHaveLength(2);
    });

    it('should include warnings in preview', async () => {
      vi.mocked(commandParser.parseCommands).mockReturnValue({
        commands: [
          {
            type: 'npm',
            originalCommand: 'npm install',
            packages: [],
            warnings: ['Missing package names after npm install'],
          },
        ],
        hasWarnings: true,
        totalCommands: 1,
      });

      vi.mocked(npmWrapper.checkInstalledPackages).mockResolvedValue({
        installed: [],
        missing: [],
        versions: {},
      });

      const request = new Request('http://localhost:3000/api/admin/commands/preview', {
        method: 'POST',
        body: JSON.stringify({ commands: 'npm install' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.parsed.hasWarnings).toBe(true);
      expect(data.parsed.commands[0].warnings).toContain('Missing package names after npm install');
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      vi.mocked(createSupabaseServerClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'admin-123' } },
            error: null,
          }),
        },
      } as any);
      vi.mocked(isAdminServer).mockResolvedValue(true);
    });

    it('should handle command parser errors', async () => {
      vi.mocked(commandParser.parseCommands).mockImplementation(() => {
        throw new Error('Parser error');
      });

      const request = new Request('http://localhost:3000/api/admin/commands/preview', {
        method: 'POST',
        body: JSON.stringify({ commands: 'npm install framer-motion' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toContain('Failed to parse commands');
    });

    it('should handle package check errors', async () => {
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

      vi.mocked(npmWrapper.checkInstalledPackages).mockRejectedValue(
        new Error('Failed to read package.json')
      );

      const request = new Request('http://localhost:3000/api/admin/commands/preview', {
        method: 'POST',
        body: JSON.stringify({ commands: 'npm install framer-motion' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(500);
    });
  });
});