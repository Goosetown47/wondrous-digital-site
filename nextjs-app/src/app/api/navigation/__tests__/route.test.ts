import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from '../route';
import { NextRequest } from 'next/server';
import { navigationService } from '@/lib/services/navigation';

// Mock dependencies
vi.mock('@/lib/services/navigation', () => ({
  navigationService: {
    getByProject: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
  })),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    getAll: vi.fn(() => []),
    set: vi.fn(),
  })),
}));

vi.mock('@/env.mjs', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'http://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  },
}));

describe('Navigation API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/navigation', () => {
    it('should return navigation menus for a project', async () => {
      const mockMenus = [
        {
          id: 'menu-1',
          project_id: 'project-1',
          type: 'header' as const,
          library_item_id: null,
          items: [],
          settings: {},
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];

      vi.mocked(navigationService.getByProject).mockResolvedValue(mockMenus);

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'test-user' } },
            error: null,
          }),
        },
      };

      const { createServerClient } = await import('@supabase/ssr');
      vi.mocked(createServerClient).mockReturnValue(mockSupabase as ReturnType<typeof createServerClient>);

      const request = new NextRequest('http://localhost:3000/api/navigation?projectId=project-1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockMenus);
      expect(navigationService.getByProject).toHaveBeenCalledWith('project-1');
    });

    it('should return 401 if not authenticated', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Not authenticated' },
          }),
        },
      };

      const { createServerClient } = await import('@supabase/ssr');
      vi.mocked(createServerClient).mockReturnValue(mockSupabase as ReturnType<typeof createServerClient>);

      const request = new NextRequest('http://localhost:3000/api/navigation?projectId=project-1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return 400 if projectId is missing', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'test-user' } },
            error: null,
          }),
        },
      };

      const { createServerClient } = await import('@supabase/ssr');
      vi.mocked(createServerClient).mockReturnValue(mockSupabase as ReturnType<typeof createServerClient>);

      const request = new NextRequest('http://localhost:3000/api/navigation');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Project ID is required' });
    });
  });

  describe('POST /api/navigation', () => {
    it('should create a new navigation menu', async () => {
      const newMenu = {
        project_id: 'project-1',
        type: 'header' as const,
        library_item_id: null,
        items: [],
        settings: {},
      };

      const createdMenu = {
        ...newMenu,
        id: 'menu-1',
        is_active: false,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      vi.mocked(navigationService.create).mockResolvedValue(createdMenu);

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'test-user' } },
            error: null,
          }),
        },
      };

      const { createServerClient } = await import('@supabase/ssr');
      vi.mocked(createServerClient).mockReturnValue(mockSupabase as ReturnType<typeof createServerClient>);

      const request = new NextRequest('http://localhost:3000/api/navigation', {
        method: 'POST',
        body: JSON.stringify(newMenu),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(createdMenu);
      expect(navigationService.create).toHaveBeenCalledWith({
        ...newMenu,
        is_active: false,
      });
    });
  });
});