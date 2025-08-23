import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProject, updateProject } from '../projects';
import { supabase } from '@/lib/supabase/client';

// Mock Supabase
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock permission checks
vi.mock('@/lib/permissions', () => ({
  isAdmin: vi.fn().mockResolvedValue(false),
  isStaff: vi.fn().mockResolvedValue(false),
}));

describe('Project XSS Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { 
        user: { 
          id: 'test-user-id', 
          email: 'test@example.com',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
        } as import('@supabase/supabase-js').User 
      },
      error: null,
    });
  });

  describe('createProject', () => {
    it('should reject project names with HTML tags', async () => {
      // Mock account owner check
      const fromMock = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { role: 'account_owner' }, error: null }),
              }),
            }),
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(fromMock);

      const projectData = {
        name: '<script>alert("XSS")</script>',
        account_id: 'test-account-id',
      };

      await expect(createProject(projectData)).rejects.toThrow(
        'Project name cannot contain HTML or special characters'
      );
    });

    it('should reject project names with event handlers', async () => {
      // Mock account owner check
      const fromMock = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { role: 'account_owner' }, error: null }),
              }),
            }),
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(fromMock);

      const projectData = {
        name: '<img src=x onerror="alert(1)">',
        account_id: 'test-account-id',
      };

      await expect(createProject(projectData)).rejects.toThrow(
        'Project name cannot contain HTML or special characters'
      );
    });

    it('should allow clean project names', async () => {
      // Mock successful creation flow
      const fromMock = vi.fn();
      
      // First call for account owner check
      fromMock.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { role: 'account_owner' }, error: null }),
              }),
            }),
          }),
        }),
      });
      
      // Second call for project insertion
      fromMock.mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'new-project-id', name: 'My Safe Project' },
              error: null,
            }),
          }),
        }),
      });
      
      // Third call for audit log (if it happens)
      fromMock.mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      });
      
      vi.mocked(supabase.from).mockImplementation(fromMock);

      const projectData = {
        name: 'My Safe Project',
        account_id: 'test-account-id',
      };

      const result = await createProject(projectData);
      expect(result).toEqual({ id: 'new-project-id', name: 'My Safe Project' });
    });

    it('should validate slug format properly', async () => {
      // Mock successful creation flow
      const fromMock = vi.fn();
      
      // Account owner check
      fromMock.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { role: 'account_owner' }, error: null }),
              }),
            }),
          }),
        }),
      });
      
      // Project insertion - capture the insert call
      const insertMock = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'new-project-id', name: 'Test', slug: 'test-slug' },
            error: null,
          }),
        }),
      });
      
      fromMock.mockReturnValueOnce({
        insert: insertMock,
      });
      
      // Audit log
      fromMock.mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      });
      
      vi.mocked(supabase.from).mockImplementation(fromMock);

      const projectData = {
        name: 'Test',
        account_id: 'test-account-id',
        slug: 'test-slug', // Valid slug
      };

      await createProject(projectData);
      
      // Verify the slug was passed through
      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'test-slug',
        })
      );
    });
  });

  describe('updateProject', () => {
    it('should reject project names with HTML tags in updates', async () => {
      const updates = {
        name: '<b>Bold Name</b>',
      };

      await expect(updateProject('project-id', updates)).rejects.toThrow(
        'Project name cannot contain HTML or special characters'
      );
    });

    it('should reject descriptions containing HTML', async () => {
      const updates = {
        description: '<script>alert("XSS")</script>Safe description',
      };

      await expect(updateProject('project-id', updates)).rejects.toThrow(
        'Description cannot contain HTML or special characters'
      );
    });

    it('should allow safe updates', async () => {
      // Mock successful update
      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'project-id', name: 'Updated Name' },
              error: null,
            }),
          }),
        }),
      });
      
      const fromMock = vi.fn();
      fromMock.mockReturnValueOnce({
        update: updateMock,
      });
      // Mock for audit log lookup
      fromMock.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { account_id: 'test-account' }, error: null }),
          }),
        }),
      });
      // Mock for audit log insert
      fromMock.mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      });
      
      vi.mocked(supabase.from).mockImplementation(fromMock);

      const updates = {
        name: 'Updated Name',
        description: 'A simple description without HTML',
      };

      const result = await updateProject('project-id', updates);
      expect(result).toEqual({ id: 'project-id', name: 'Updated Name' });
    });

    it('should enforce length limits', async () => {
      const longName = 'a'.repeat(150); // Over 100 char limit
      
      const updates = {
        name: longName,
      };

      // Should throw error because the name would be truncated by sanitization
      await expect(updateProject('project-id', updates)).rejects.toThrow(
        'Project name cannot contain HTML or special characters'
      );
    });
  });
});