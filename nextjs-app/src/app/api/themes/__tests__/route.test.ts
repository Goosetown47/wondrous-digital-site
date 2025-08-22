import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

// Mock dependencies
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    getAll: vi.fn(() => []),
    set: vi.fn(),
  })),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
  })),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: { 
              id: 'test-theme-id',
              name: 'Test Theme',
              content: { variables: {} },
              metadata: {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              published: false,
              usage_count: 0,
            }, 
            error: null 
          })),
        })),
      })),
    })),
  })),
}));

vi.mock('@/lib/permissions/server-checks', () => ({
  isAdminServer: vi.fn(),
  isStaffServer: vi.fn(),
}));

import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminServer, isStaffServer } from '@/lib/permissions/server-checks';

describe('Theme API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/themes', () => {
    it('should return 401 when user is not authenticated', async () => {
      const mockAuthClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ 
            data: { user: null }, 
            error: { message: 'Not authenticated' } 
          }),
        },
      };
      vi.mocked(createServerClient).mockReturnValue(mockAuthClient as unknown as ReturnType<typeof createServerClient>);

      const request = new NextRequest('http://localhost:3000/api/themes');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Not authenticated');
    });

    it('should return themes when user is authenticated (regular users allowed)', async () => {
      const mockAuthClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ 
            data: { user: { id: 'regular-user-id', email: 'user@example.com' } }, 
            error: null 
          }),
        },
      };
      vi.mocked(createServerClient).mockReturnValue(mockAuthClient as unknown as ReturnType<typeof createServerClient>);
      vi.mocked(isAdminServer).mockResolvedValue(false);
      vi.mocked(isStaffServer).mockResolvedValue(false);

      const mockServiceClient = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        })),
      };
      vi.mocked(createAdminClient).mockReturnValue(mockServiceClient as unknown as ReturnType<typeof createAdminClient>);

      const request = new NextRequest('http://localhost:3000/api/themes');
      const response = await GET(request);
      const data = await response.json();

      // Themes GET allows all authenticated users
      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should return themes when user is admin', async () => {
      const mockAuthClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ 
            data: { user: { id: 'admin-user-id', email: 'admin@example.com' } }, 
            error: null 
          }),
        },
      };
      vi.mocked(createServerClient).mockReturnValue(mockAuthClient as unknown as ReturnType<typeof createServerClient>);
      vi.mocked(isAdminServer).mockResolvedValue(true);
      vi.mocked(isStaffServer).mockResolvedValue(false);

      const mockThemes = [
        {
          id: 'theme-1',
          name: 'Theme 1',
          content: { variables: { primary: '#000' } },
          metadata: {},
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          published: true,
          usage_count: 5,
        },
      ];

      const mockServiceClient = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: mockThemes, error: null })),
            })),
          })),
        })),
      };
      vi.mocked(createAdminClient).mockReturnValue(mockServiceClient as unknown as ReturnType<typeof createAdminClient>);

      const request = new NextRequest('http://localhost:3000/api/themes');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].name).toBe('Theme 1');
    });

    it('should return themes when user is staff', async () => {
      const mockAuthClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ 
            data: { user: { id: 'staff-user-id', email: 'staff@example.com' } }, 
            error: null 
          }),
        },
      };
      vi.mocked(createServerClient).mockReturnValue(mockAuthClient as unknown as ReturnType<typeof createServerClient>);
      vi.mocked(isAdminServer).mockResolvedValue(false);
      vi.mocked(isStaffServer).mockResolvedValue(true);

      const mockServiceClient = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        })),
      };
      vi.mocked(createAdminClient).mockReturnValue(mockServiceClient as unknown as ReturnType<typeof createAdminClient>);

      const request = new NextRequest('http://localhost:3000/api/themes');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/themes', () => {
    it('should return 403 when user is not admin or staff', async () => {
      const mockAuthClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ 
            data: { user: { id: 'regular-user-id', email: 'user@example.com' } }, 
            error: null 
          }),
        },
      };
      vi.mocked(createServerClient).mockReturnValue(mockAuthClient as unknown as ReturnType<typeof createServerClient>);
      vi.mocked(isAdminServer).mockResolvedValue(false);
      vi.mocked(isStaffServer).mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/themes', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Theme',
          variables: { primary: '#000' },
        }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Access denied. Admin or staff role required.');
    });

    it('should create theme when user is admin', async () => {
      const mockAuthClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ 
            data: { user: { id: 'admin-user-id', email: 'admin@example.com' } }, 
            error: null 
          }),
        },
      };
      vi.mocked(createServerClient).mockReturnValue(mockAuthClient as unknown as ReturnType<typeof createServerClient>);
      vi.mocked(isAdminServer).mockResolvedValue(true);
      vi.mocked(isStaffServer).mockResolvedValue(false);

      const mockServiceClient = {
        from: vi.fn((table: string) => {
          if (table === 'library_items') {
            return {
              insert: vi.fn(() => ({
                select: vi.fn(() => ({
                  single: vi.fn(() => Promise.resolve({ 
                    data: { 
                      id: 'test-theme-id',
                      name: 'New Theme',
                      content: { variables: { primary: '#000' } },
                      metadata: {},
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                      published: false,
                      usage_count: 0,
                    }, 
                    error: null 
                  })),
                })),
              })),
            };
          }
          if (table === 'audit_logs') {
            return {
              insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
            };
          }
          return {
            select: vi.fn(() => Promise.resolve({ data: [], error: null })),
          };
        }),
      };
      vi.mocked(createAdminClient).mockReturnValue(mockServiceClient as unknown as ReturnType<typeof createAdminClient>);

      const request = new NextRequest('http://localhost:3000/api/themes', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Theme',
          variables: { primary: '#000' },
        }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('New Theme');
    });
  });
});