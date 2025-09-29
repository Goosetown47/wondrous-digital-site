import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../dependencies/route';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isAdminServer } from '@/lib/permissions/server-checks';
import fs from 'fs/promises';

// Mock dependencies
vi.mock('@/lib/supabase/server');
vi.mock('@/lib/permissions/server-checks');
vi.mock('fs/promises');

const mockQueryBuilder = {
  select: vi.fn().mockReturnThis(),
  order: vi.fn()
};

const mockSupabase = {
  auth: {
    getUser: vi.fn()
  },
  from: vi.fn(() => mockQueryBuilder)
};

describe('GET /api/admin/components/dependencies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (createSupabaseServerClient as any).mockReturnValue(mockSupabase);
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

    const request = new NextRequest('http://localhost:3000/api/admin/components/dependencies');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Admin access required');
  });

  it('should reject unauthenticated requests', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Not authenticated')
    });

    const request = new NextRequest('http://localhost:3000/api/admin/components/dependencies');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return list of installed components and dependencies', async () => {
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

    // Mock database query for component imports
    mockQueryBuilder.order.mockResolvedValue({
      data: [
        {
          id: 'import-1',
          name: 'button',
          source: 'shadcn',
          source_url: 'https://ui.shadcn.com/registry/button.json',
          dependencies: ['clsx', 'class-variance-authority'],
          transformations: [],
          import_date: '2024-01-20T10:00:00Z',
          imported_by: 'admin-123'
        },
        {
          id: 'import-2',
          name: 'container-text-flip',
          source: 'aceternity',
          source_url: 'https://ui.aceternity.com/registry/container-text-flip.json',
          dependencies: ['framer-motion'],
          transformations: ['motion/react -> framer-motion'],
          import_date: '2024-01-21T10:00:00Z',
          imported_by: 'admin-123'
        }
      ],
      error: null
    });

    // Mock file system for UI components
    (fs.readdir as any).mockResolvedValue([
      'button.tsx',
      'container-text-flip.tsx',
      'card.tsx',
      'dialog.tsx'
    ]);

    // Mock package.json read
    (fs.readFile as any).mockResolvedValue(JSON.stringify({
      dependencies: {
        'react': '^18.0.0',
        'framer-motion': '^11.0.0',
        'clsx': '^2.0.0',
        'class-variance-authority': '^0.7.0',
        '@radix-ui/react-dialog': '^1.0.0'
      },
      devDependencies: {
        'typescript': '^5.0.0',
        'vitest': '^1.0.0'
      }
    }));

    const request = new NextRequest('http://localhost:3000/api/admin/components/dependencies');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.components).toHaveLength(2);
    expect(data.components[0]).toEqual({
      id: 'import-1',
      name: 'button',
      source: 'shadcn',
      sourceUrl: 'https://ui.shadcn.com/registry/button.json',
      dependencies: ['clsx', 'class-variance-authority'],
      transformations: [],
      importDate: '2024-01-20T10:00:00Z'
    });

    expect(data.uiComponents).toContain('button.tsx');
    expect(data.uiComponents).toContain('container-text-flip.tsx');

    expect(data.installedDependencies).toContain('framer-motion');
    expect(data.installedDependencies).toContain('clsx');
    expect(data.installedDependencies).not.toContain('typescript');

    expect(data.stats).toEqual({
      totalComponents: 2,
      totalUiFiles: 4,
      bySource: {
        shadcn: 1,
        aceternity: 1
      },
      uniqueDependencies: 3
    });
  });

  it('should handle empty component list', async () => {
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

    mockQueryBuilder.order.mockResolvedValue({
      data: [],
      error: null
    });

    (fs.readdir as any).mockResolvedValue([]);
    (fs.readFile as any).mockResolvedValue(JSON.stringify({
      dependencies: {}
    }));

    const request = new NextRequest('http://localhost:3000/api/admin/components/dependencies');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.components).toHaveLength(0);
    expect(data.uiComponents).toHaveLength(0);
    expect(data.installedDependencies).toHaveLength(0);
    expect(data.stats.totalComponents).toBe(0);
  });

  it('should handle database errors gracefully', async () => {
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

    mockQueryBuilder.order.mockResolvedValue({
      data: null,
      error: new Error('Database connection failed')
    });

    const request = new NextRequest('http://localhost:3000/api/admin/components/dependencies');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Failed to fetch dependencies');
    expect(data.details).toContain('Database connection failed');
  });

  it('should filter by source when query parameter provided', async () => {
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

    mockQueryBuilder.order.mockResolvedValue({
      data: [
        {
          id: 'import-1',
          name: 'button',
          source: 'shadcn',
          source_url: 'https://ui.shadcn.com/registry/button.json',
          dependencies: ['clsx'],
          import_date: '2024-01-20T10:00:00Z'
        },
        {
          id: 'import-2',
          name: 'sparkles',
          source: 'aceternity',
          source_url: 'https://ui.aceternity.com/registry/sparkles.json',
          dependencies: ['framer-motion'],
          import_date: '2024-01-21T10:00:00Z'
        }
      ],
      error: null
    });

    (fs.readdir as any).mockResolvedValue([]);
    (fs.readFile as any).mockResolvedValue(JSON.stringify({ dependencies: {} }));

    const request = new NextRequest('http://localhost:3000/api/admin/components/dependencies?source=aceternity');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.components).toHaveLength(1);
    expect(data.components[0].source).toBe('aceternity');
    expect(data.components[0].name).toBe('sparkles');
  });

  it('should include import history with user information', async () => {
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

    // Mock query with user information for includeHistory=true
    mockQueryBuilder.order.mockResolvedValue({
      data: [
        {
          id: 'import-1',
          name: 'button',
          source: 'shadcn',
          import_date: '2024-01-20T10:00:00Z',
          imported_by: 'admin-123',
          user: {
            email: 'admin@example.com'
          }
        }
      ],
      error: null
    });

    (fs.readdir as any).mockResolvedValue([]);
    (fs.readFile as any).mockResolvedValue(JSON.stringify({ dependencies: {} }));

    const request = new NextRequest('http://localhost:3000/api/admin/components/dependencies?includeHistory=true');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.components[0].importedBy).toBeDefined();
  });
});