import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../route';

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock('@/lib/services/domains.server', () => ({
  addDomainToVercel: vi.fn(),
  removeDomainFromVercel: vi.fn(),
  checkDomainStatus: vi.fn(),
}));

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { addDomainToVercel, checkDomainStatus } from '@/lib/services/domains.server';

describe('Domain Route - Reserved Subdomain Protection', () => {
  let mockSupabase: ReturnType<typeof vi.fn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    };

    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSupabase);
    vi.mocked(addDomainToVercel).mockResolvedValue(undefined);
    vi.mocked(checkDomainStatus).mockResolvedValue({ verified: false });
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('Reserved subdomain validation', () => {
    it('should reject reserved subdomains for regular users', async () => {
      // Mock user is NOT a platform admin
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } }); // No platform access
      mockSupabase.single.mockResolvedValueOnce({ 
        data: { id: 'project-123', account_id: 'account-123' }, 
        error: null 
      }); // Project found

      const request = new NextRequest('http://localhost:3000/api/projects/project-123/domains', {
        method: 'POST',
        body: JSON.stringify({ domain: 'app.example.com' }),
      });

      const response = await POST(request, { params: Promise.resolve({ id: 'project-123' }) });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('This name is reserved, please choose a different name. Reach out to support at hello@wondrousdigital.com if you need help.');
    });

    it('should reject single letter subdomains for regular users', async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });
      mockSupabase.single.mockResolvedValueOnce({ 
        data: { id: 'project-123', account_id: 'account-123' }, 
        error: null 
      });

      const request = new NextRequest('http://localhost:3000/api/projects/project-123/domains', {
        method: 'POST',
        body: JSON.stringify({ domain: 'a.example.com' }),
      });

      const response = await POST(request, { params: Promise.resolve({ id: 'project-123' }) });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('This name is reserved, please choose a different name. Reach out to support at hello@wondrousdigital.com if you need help.');
    });

    it('should reject numeric subdomains for regular users', async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });
      mockSupabase.single.mockResolvedValueOnce({ 
        data: { id: 'project-123', account_id: 'account-123' }, 
        error: null 
      });

      const request = new NextRequest('http://localhost:3000/api/projects/project-123/domains', {
        method: 'POST',
        body: JSON.stringify({ domain: '404.example.com' }),
      });

      const response = await POST(request, { params: Promise.resolve({ id: 'project-123' }) });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('This name is reserved, please choose a different name. Reach out to support at hello@wondrousdigital.com if you need help.');
    });

    it('should allow reserved subdomains for platform admins', async () => {
      // Mock user IS a platform admin
      mockSupabase.single
        .mockResolvedValueOnce({ data: { role: 'admin' }, error: null }) // Platform admin
        .mockResolvedValueOnce({ 
          data: { id: 'project-123', account_id: 'account-123' }, 
          error: null 
        }) // Project found
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } }) // No existing domain
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } }) // No existing companion
        .mockResolvedValueOnce({ 
          data: { 
            id: 'domain-123', 
            domain: 'app.example.com',
            project_id: 'project-123',
            verified: false,
            include_www: false,
            is_primary: true
          }, 
          error: null 
        }); // Insert successful

      // Mock no existing domains
      mockSupabase.limit.mockResolvedValueOnce({ data: [], error: null });

      const request = new NextRequest('http://localhost:3000/api/projects/project-123/domains', {
        method: 'POST',
        body: JSON.stringify({ domain: 'app.example.com' }),
      });

      const response = await POST(request, { params: Promise.resolve({ id: 'project-123' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.domain).toBe('app.example.com');
    });

    it('should allow non-reserved subdomains for all users', async () => {
      mockSupabase.single
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } }) // No platform access
        .mockResolvedValueOnce({ 
          data: { id: 'project-123', account_id: 'account-123' }, 
          error: null 
        }) // Project found
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } }) // No existing domain
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } }) // No existing companion
        .mockResolvedValueOnce({ 
          data: { 
            id: 'domain-123', 
            domain: 'my-awesome-site.example.com',
            project_id: 'project-123',
            verified: false,
            include_www: false,
            is_primary: true
          }, 
          error: null 
        }); // Insert successful

      // Mock no existing domains
      mockSupabase.limit.mockResolvedValueOnce({ data: [], error: null });

      const request = new NextRequest('http://localhost:3000/api/projects/project-123/domains', {
        method: 'POST',
        body: JSON.stringify({ domain: 'my-awesome-site.example.com' }),
      });

      const response = await POST(request, { params: Promise.resolve({ id: 'project-123' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.domain).toBe('my-awesome-site.example.com');
    });

    it('should check companion domain validation', async () => {
      // When adding example.com, it should also check www.example.com
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });
      mockSupabase.single.mockResolvedValueOnce({ 
        data: { id: 'project-123', account_id: 'account-123' }, 
        error: null 
      });

      const request = new NextRequest('http://localhost:3000/api/projects/project-123/domains', {
        method: 'POST',
        body: JSON.stringify({ domain: 'example.com' }), // This will create www.example.com companion
      });

      const response = await POST(request, { params: Promise.resolve({ id: 'project-123' }) });
      
      // Should pass because neither example.com nor www.example.com have reserved subdomains
      expect(response.status).not.toBe(403);
    });

    it('should reject auth subdomain for regular users', async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });
      mockSupabase.single.mockResolvedValueOnce({ 
        data: { id: 'project-123', account_id: 'account-123' }, 
        error: null 
      });

      const request = new NextRequest('http://localhost:3000/api/projects/project-123/domains', {
        method: 'POST',
        body: JSON.stringify({ domain: 'auth.example.com' }), // auth is reserved
      });

      const response = await POST(request, { params: Promise.resolve({ id: 'project-123' }) });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('This name is reserved, please choose a different name. Reach out to support at hello@wondrousdigital.com if you need help.');
    });
  });

  describe('Special wondrousdigital.com handling', () => {
    it('should check reserved_domain_permissions for wondrousdigital.com', async () => {
      mockSupabase.single
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } }) // No platform access
        .mockResolvedValueOnce({ 
          data: { id: 'project-123', account_id: 'account-123' }, 
          error: null 
        }) // Project found
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } }); // No permission

      const request = new NextRequest('http://localhost:3000/api/projects/project-123/domains', {
        method: 'POST',
        body: JSON.stringify({ domain: 'wondrousdigital.com' }),
      });

      const response = await POST(request, { params: Promise.resolve({ id: 'project-123' }) });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('This name is reserved, please choose a different name. Reach out to support at hello@wondrousdigital.com if you need help.');
    });

    it.skip('should allow wondrousdigital.com for platform admins', async () => {
      // Mock user IS a platform admin - they can bypass reserved domain permissions
      mockSupabase.single
        .mockResolvedValueOnce({ data: { role: 'admin' }, error: null }) // Platform admin
        .mockResolvedValueOnce({ 
          data: { id: 'project-123', account_id: 'account-123' }, 
          error: null 
        }) // Project found
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } }) // No existing domain
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } }) // No existing www
        .mockResolvedValueOnce({ 
          data: { 
            id: 'domain-123', 
            domain: 'wondrousdigital.com',
            project_id: 'project-123',
            verified: false,
            include_www: true,
            is_primary: true
          }, 
          error: null 
        }) // Insert wondrousdigital.com
        .mockResolvedValueOnce({ 
          data: { 
            id: 'domain-124', 
            domain: 'www.wondrousdigital.com',
            project_id: 'project-123',
            verified: false,
            include_www: false,
            is_primary: false
          }, 
          error: null 
        }); // Insert www.wondrousdigital.com

      // Mock no existing domains
      mockSupabase.limit.mockResolvedValueOnce({ data: [], error: null });

      const request = new NextRequest('http://localhost:3000/api/projects/project-123/domains', {
        method: 'POST',
        body: JSON.stringify({ domain: 'wondrousdigital.com' }),
      });

      const response = await POST(request, { params: Promise.resolve({ id: 'project-123' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.domain).toBe('wondrousdigital.com');
    });
  });
});