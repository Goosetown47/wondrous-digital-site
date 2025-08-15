import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables
vi.stubEnv('NODE_ENV', 'test');

// Mock scrollIntoView for Radix UI components
Element.prototype.scrollIntoView = vi.fn();

// Add global test utilities
(global as Record<string, unknown>).vi = vi;

// Auto-mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
      limit: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    })),
    rpc: vi.fn().mockResolvedValue({ data: {}, error: null }),
  }
}));