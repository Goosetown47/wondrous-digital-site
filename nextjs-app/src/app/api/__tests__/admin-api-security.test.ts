import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    getAll: vi.fn(() => []),
    set: vi.fn(),
  })),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}));

vi.mock('@/lib/permissions/server-checks', () => ({
  isAdminServer: vi.fn(),
  isStaffServer: vi.fn(),
}));

import { createServerClient } from '@supabase/ssr';
import { isAdminServer, isStaffServer } from '@/lib/permissions/server-checks';

describe('Admin API Security Tests', () => {
  const setupMocks = (userRole: 'admin' | 'staff' | 'user' | null) => {
    if (userRole === null) {
      const mockAuthClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ 
            data: { user: null }, 
            error: { message: 'Not authenticated' } 
          }),
        },
      };
      vi.mocked(createServerClient).mockReturnValue(mockAuthClient as unknown as ReturnType<typeof createServerClient>);
    } else {
      const mockAuthClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ 
            data: { user: { id: `${userRole}-id`, email: `${userRole}@example.com` } }, 
            error: null 
          }),
        },
      };
      vi.mocked(createServerClient).mockReturnValue(mockAuthClient as unknown as ReturnType<typeof createServerClient>);
      vi.mocked(isAdminServer).mockResolvedValue(userRole === 'admin');
      vi.mocked(isStaffServer).mockResolvedValue(userRole === 'admin' || userRole === 'staff');
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const testEndpoints = [
    { name: 'Themes API', path: '/api/themes', module: () => import('../themes/route') },
    { name: 'Core Components API', path: '/api/core-components', module: () => import('../core-components/route') },
    { name: 'Library API', path: '/api/library', module: () => import('../library/route') },
    { name: 'Lab API', path: '/api/lab', module: () => import('../lab/route') },
  ];

  describe('Unauthenticated Access', () => {
    testEndpoints.forEach(({ name, path, module }) => {
      it(`${name} GET should return 401 when not authenticated`, async () => {
        setupMocks(null);
        const { GET } = await module();
        const request = new NextRequest(`http://localhost:3000${path}`);
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Not authenticated');
      });

      it(`${name} POST should return 401 when not authenticated`, async () => {
        setupMocks(null);
        const { POST } = await module();
        const request = new NextRequest(`http://localhost:3000${path}`, {
          method: 'POST',
          body: JSON.stringify({ name: 'Test', type: 'test', content: {} }),
        });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Not authenticated');
      });
    });
  });

  describe('Regular User Access', () => {
    testEndpoints.forEach(({ name, path, module }) => {
      it(`${name} GET should return 403 for regular users`, async () => {
        setupMocks('user');
        
        // Mock successful database response for themes (which allows regular users)
        if (name === 'Themes API') {
          const mockServiceClient = {
            from: vi.fn(() => ({
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  order: vi.fn(() => Promise.resolve({ data: [], error: null })),
                })),
              })),
            })),
          };
          
          const { createAdminClient } = await import('@/lib/supabase/admin');
          vi.mocked(createAdminClient).mockReturnValue(mockServiceClient as unknown as ReturnType<typeof createAdminClient>);
        }
        
        const { GET } = await module();
        const request = new NextRequest(`http://localhost:3000${path}`);
        const response = await GET(request);
        const data = await response.json();

        // Themes API allows regular authenticated users for GET
        if (name === 'Themes API') {
          expect(response.status).toBe(200);
        } else {
          expect(response.status).toBe(403);
          expect(data.error).toBe('Access denied. Admin or staff role required.');
        }
      });

      it(`${name} POST should return 403 for regular users`, async () => {
        setupMocks('user');
        const { POST } = await module();
        const request = new NextRequest(`http://localhost:3000${path}`, {
          method: 'POST',
          body: JSON.stringify({ name: 'Test', type: 'test', content: {} }),
        });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.error).toBe('Access denied. Admin or staff role required.');
      });
    });
  });

  describe('Staff Access', () => {
    it('should allow staff users to access admin APIs', async () => {
      setupMocks('staff');
      
      // Mock successful database response
      const mockServiceClient = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
            order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      };
      
      const { createAdminClient } = await import('@/lib/supabase/admin');
      vi.mocked(createAdminClient).mockReturnValue(mockServiceClient as unknown as ReturnType<typeof createAdminClient>);

      // Test each endpoint
      for (const { module, path } of testEndpoints) {
        const { GET } = await module();
        const request = new NextRequest(`http://localhost:3000${path}`);
        const response = await GET(request);
        
        expect(response.status).toBe(200);
      }
    });
  });

  describe('Admin Access', () => {
    it('should allow admin users to access all APIs', async () => {
      setupMocks('admin');
      
      // Mock successful database response
      const mockServiceClient = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
            order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      };
      
      const { createAdminClient } = await import('@/lib/supabase/admin');
      vi.mocked(createAdminClient).mockReturnValue(mockServiceClient as unknown as ReturnType<typeof createAdminClient>);

      // Test each endpoint
      for (const { module, path } of testEndpoints) {
        const { GET } = await module();
        const request = new NextRequest(`http://localhost:3000${path}`);
        const response = await GET(request);
        
        expect(response.status).toBe(200);
      }
    });
  });

  describe('Permission Check Calls', () => {
    it('should check both isAdmin and isStaff for POST requests', async () => {
      setupMocks('user');
      
      const { POST } = await import('../themes/route');
      const request = new NextRequest('http://localhost:3000/api/themes', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test', variables: {} }),
      });
      await POST(request);

      expect(isAdminServer).toHaveBeenCalledWith('user-id');
      expect(isStaffServer).toHaveBeenCalledWith('user-id');
    });

    it('should not query database if user lacks permissions for non-Themes endpoints', async () => {
      setupMocks('user');
      
      const mockServiceClient = {
        from: vi.fn(),
      };
      
      const { createAdminClient } = await import('@/lib/supabase/admin');
      vi.mocked(createAdminClient).mockReturnValue(mockServiceClient as unknown as ReturnType<typeof createAdminClient>);

      // Test Core Components endpoint which requires admin/staff
      const { GET } = await import('../core-components/route');
      const request = new NextRequest('http://localhost:3000/api/core-components');
      await GET(request);

      // Should not create admin client or query database
      expect(mockServiceClient.from).not.toHaveBeenCalled();
    });
  });
});