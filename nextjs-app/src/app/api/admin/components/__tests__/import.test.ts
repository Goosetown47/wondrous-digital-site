import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../import/route';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isAdminServer } from '@/lib/permissions/server-checks';
import * as smartImport from '@/lib/component-import/smart-import';
import fs from 'fs/promises';

// Mock dependencies
vi.mock('@/lib/supabase/server');
vi.mock('@/lib/permissions/server-checks');
vi.mock('@/lib/component-import/smart-import');
vi.mock('fs/promises');
vi.mock('child_process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('child_process')>();
  return {
    ...actual,
    execSync: vi.fn()
  };
});

const mockSupabase = {
  auth: {
    getUser: vi.fn()
  },
  from: vi.fn(() => ({
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn()
  }))
};

describe('POST /api/admin/components/import', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (createSupabaseServerClient as any).mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should reject requests from non-admin users', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'user@example.com'
        }
      },
      error: null
    });

    (isAdminServer as any).mockResolvedValue(false);

    const request = new NextRequest('http://localhost:3000/api/admin/components/import', {
      method: 'POST',
      body: JSON.stringify({
        url: 'https://ui.shadcn.com/registry/button.json'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Admin access required');
  });

  it('should reject requests from unauthenticated users', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Not authenticated')
    });

    const request = new NextRequest('http://localhost:3000/api/admin/components/import', {
      method: 'POST',
      body: JSON.stringify({
        url: 'https://ui.shadcn.com/registry/button.json'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should validate registry URL format', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'admin-123',
          email: 'admin@example.com'
        }
      },
      error: null
    });

    (isAdminServer as any).mockResolvedValue(true);

    const request = new NextRequest('http://localhost:3000/api/admin/components/import', {
      method: 'POST',
      body: JSON.stringify({
        url: 'not-a-valid-url'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Registry domain not whitelisted');
  });

  it('should validate whitelisted domains', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'admin-123',
          email: 'admin@example.com'
        }
      },
      error: null
    });

    (isAdminServer as any).mockResolvedValue(true);

    const request = new NextRequest('http://localhost:3000/api/admin/components/import', {
      method: 'POST',
      body: JSON.stringify({
        url: 'https://malicious-site.com/registry/evil.json'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Registry domain not whitelisted');
  });

  it('should successfully import a component', async () => {
    // Mock admin user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'admin-123',
          email: 'admin@example.com'
        }
      },
      error: null
    });

    (isAdminServer as any).mockResolvedValue(true);

    // Mock smart import processing
    const mockProcessResult = {
      name: 'button',
      source: 'shadcn',
      dependencies: ['clsx', 'class-variance-authority'],
      transformations: [],
      files: [
        {
          name: 'button.tsx',
          originalContent: 'export function Button() {}',
          transformedContent: 'export function Button() {}',
          targetPath: '/components/ui/button.tsx'
        }
      ],
      sourceUrl: 'https://ui.shadcn.com/registry/button.json'
    };

    (smartImport.processComponentImport as any).mockResolvedValue(mockProcessResult);
    (fs.writeFile as any).mockResolvedValue(undefined);
    (fs.access as any).mockRejectedValue(new Error('File not found')); // Simulate file doesn't exist

    // Mock database insert
    mockSupabase.from().insert().select().single.mockResolvedValue({
      data: {
        id: 'import-123',
        name: 'button',
        source: 'shadcn',
        import_date: new Date().toISOString()
      },
      error: null
    });

    const request = new NextRequest('http://localhost:3000/api/admin/components/import', {
      method: 'POST',
      body: JSON.stringify({
        url: 'https://ui.shadcn.com/registry/button.json',
        autoFix: true,
        installDeps: true
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.component).toEqual({
      name: 'button',
      source: 'shadcn',
      dependencies: ['clsx', 'class-variance-authority'],
      transformations: [],
      filesWritten: 1
    });

    // Verify file was written
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('button.tsx'),
      'export function Button() {}',
      'utf-8'
    );

    // Verify database record was created
    expect(mockSupabase.from).toHaveBeenCalledWith('component_imports');
  });

  it('should handle component with multiple files', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'admin-123',
          email: 'admin@example.com'
        }
      },
      error: null
    });

    (isAdminServer as any).mockResolvedValue(true);

    const mockProcessResult = {
      name: 'complex-component',
      source: 'aceternity',
      dependencies: ['framer-motion'],
      transformations: ['motion/react -> framer-motion'],
      files: [
        {
          name: 'complex-component.tsx',
          originalContent: 'export function ComplexComponent() {}',
          transformedContent: 'export function ComplexComponent() {}',
          targetPath: '/components/ui/complex-component.tsx'
        },
        {
          name: 'complex-component.css',
          originalContent: '.complex {}',
          transformedContent: '.complex {}',
          targetPath: '/components/ui/complex-component.css'
        }
      ],
      sourceUrl: 'https://ui.aceternity.com/registry/complex-component.json'
    };

    (smartImport.processComponentImport as any).mockResolvedValue(mockProcessResult);
    (fs.writeFile as any).mockResolvedValue(undefined);
    (fs.access as any).mockRejectedValue(new Error('File not found'));

    mockSupabase.from().insert().select().single.mockResolvedValue({
      data: { id: 'import-123' },
      error: null
    });

    const request = new NextRequest('http://localhost:3000/api/admin/components/import', {
      method: 'POST',
      body: JSON.stringify({
        url: 'https://ui.aceternity.com/registry/complex-component.json'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.component.filesWritten).toBe(2);
    expect(fs.writeFile).toHaveBeenCalledTimes(2);
  });

  it('should install missing dependencies when installDeps is true', async () => {
    const { execSync } = await import('child_process');

    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'admin-123',
          email: 'admin@example.com'
        }
      },
      error: null
    });

    (isAdminServer as any).mockResolvedValue(true);

    const mockProcessResult = {
      name: 'animated-component',
      source: 'aceternity',
      dependencies: ['framer-motion', 'clsx'],
      missingDependencies: ['framer-motion'],
      transformations: [],
      files: [
        {
          name: 'animated-component.tsx',
          originalContent: 'export function AnimatedComponent() {}',
          transformedContent: 'export function AnimatedComponent() {}',
          targetPath: '/components/ui/animated-component.tsx'
        }
      ],
      sourceUrl: 'https://ui.aceternity.com/registry/animated-component.json'
    };

    (smartImport.processComponentImport as any).mockResolvedValue(mockProcessResult);
    (fs.writeFile as any).mockResolvedValue(undefined);
    (fs.access as any).mockRejectedValue(new Error('File not found'));

    mockSupabase.from().insert().select().single.mockResolvedValue({
      data: { id: 'import-123' },
      error: null
    });

    const request = new NextRequest('http://localhost:3000/api/admin/components/import', {
      method: 'POST',
      body: JSON.stringify({
        url: 'https://ui.aceternity.com/registry/animated-component.json',
        installDeps: true
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(execSync).toHaveBeenCalledWith(
      'npm install framer-motion',
      expect.objectContaining({ encoding: 'utf8' })
    );
    expect(data.component.dependenciesInstalled).toEqual(['framer-motion']);
  });

  it('should handle import errors gracefully', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'admin-123',
          email: 'admin@example.com'
        }
      },
      error: null
    });

    (isAdminServer as any).mockResolvedValue(true);

    (smartImport.processComponentImport as any).mockRejectedValue(
      new Error('Failed to fetch component from registry')
    );

    const request = new NextRequest('http://localhost:3000/api/admin/components/import', {
      method: 'POST',
      body: JSON.stringify({
        url: 'https://ui.shadcn.com/registry/nonexistent.json'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Failed to import component');
    expect(data.details).toContain('Failed to fetch component from registry');
  });

  it('should prevent duplicate imports', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'admin-123',
          email: 'admin@example.com'
        }
      },
      error: null
    });

    (isAdminServer as any).mockResolvedValue(true);

    const mockProcessResult = {
      name: 'button',
      source: 'shadcn',
      dependencies: [],
      transformations: [],
      files: [
        {
          name: 'button.tsx',
          originalContent: 'export function Button() {}',
          transformedContent: 'export function Button() {}',
          targetPath: '/components/ui/button.tsx'
        }
      ],
      sourceUrl: 'https://ui.shadcn.com/registry/button.json'
    };

    (smartImport.processComponentImport as any).mockResolvedValue(mockProcessResult);
    (fs.access as any).mockResolvedValue(undefined); // File exists

    const request = new NextRequest('http://localhost:3000/api/admin/components/import', {
      method: 'POST',
      body: JSON.stringify({
        url: 'https://ui.shadcn.com/registry/button.json'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toContain('Component already exists');
    expect(data.existingFile).toContain('button.tsx');
  });
});