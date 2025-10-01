import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getCodeNameWithAutoNumber,
  extractComponentType,
  extractExistingNumbers
} from '../naming-service';
import type { SupabaseClient } from '@supabase/supabase-js';

// Mock Supabase client with proper typing
interface MockSupabase {
  from: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  or: ReturnType<typeof vi.fn>;
}

const createMockSupabase = (): SupabaseClient => {
  const mock: MockSupabase = {
    from: vi.fn(),
    select: vi.fn(),
    eq: vi.fn(),
    or: vi.fn(),
  };

  // Make chainable
  mock.from.mockReturnValue(mock);
  mock.select.mockReturnValue(mock);
  mock.eq.mockReturnValue(mock);
  mock.or.mockReturnValue(mock);

  return mock as unknown as SupabaseClient;
};

describe('Auto-Numbering System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCodeNameWithAutoNumber', () => {
    it('should generate Hero12 when Hero1-11 exist', async () => {
      const mockSupabase = createMockSupabase();
      const mock = mockSupabase as unknown as MockSupabase;

      // Mock types table query
      mock.eq.mockResolvedValueOnce({
        data: [
          { name: 'hero', display_name: 'Hero Section' },
          { name: 'footer', display_name: 'Footer' },
        ],
        error: null
      });

      // Mock existing components
      const existingComponents = [
        { code_name: 'Hero1' },
        { code_name: 'Hero2' },
        { code_name: 'Hero3' },
        { code_name: 'Hero4' },
        { code_name: 'Hero5' },
        { code_name: 'Hero6' },
        { code_name: 'Hero7' },
        { code_name: 'Hero8' },
        { code_name: 'Hero9' },
        { code_name: 'Hero10' },
        { code_name: 'Hero11' },
      ];

      // Mock components query
      mock.or.mockResolvedValueOnce({
        data: existingComponents,
        error: null
      });

      const result = await getCodeNameWithAutoNumber('Epic Hero', mockSupabase);
      expect(result).toBe('Hero12');
    });

    it('should generate Footer1 for first footer component', async () => {
      const mockSupabase = createMockSupabase();
      const mock = mockSupabase as unknown as MockSupabase;

      // Mock types table
      mock.eq.mockResolvedValueOnce({
        data: [
          { name: 'hero', display_name: 'Hero Section' },
          { name: 'footer', display_name: 'Footer' },
        ],
        error: null
      });

      // No existing footer components
      mock.or.mockResolvedValueOnce({
        data: [],
        error: null
      });

      const result = await getCodeNameWithAutoNumber('Dark Footer', mockSupabase);
      expect(result).toBe('Footer1');
    });

    it('should generate Bentobox1 for bentobox type from database', async () => {
      const mockSupabase = createMockSupabase();
      const mock = mockSupabase as unknown as MockSupabase;

      // Mock types table with bentobox type
      mock.eq.mockResolvedValueOnce({
        data: [
          { name: 'hero', display_name: 'Hero Section' },
          { name: 'bentobox', display_name: 'Bento Box' },
        ],
        error: null
      });

      // No existing bentobox components
      mock.or.mockResolvedValueOnce({
        data: [],
        error: null
      });

      const result = await getCodeNameWithAutoNumber('Awesome Bento Box', mockSupabase);
      expect(result).toBe('Bentobox1');
    });

    it('should handle signup_form type with underscores', async () => {
      const mockSupabase = createMockSupabase();
      const mock = mockSupabase as unknown as MockSupabase;

      // Mock types table with signup_form type
      mock.eq.mockResolvedValueOnce({
        data: [
          { name: 'signup_form', display_name: 'Signup Form' },
        ],
        error: null
      });

      // Mock existing signup forms
      mock.or.mockResolvedValueOnce({
        data: [
          { code_name: 'SignupForm1' },
          { code_name: 'SignupForm2' },
        ],
        error: null
      });

      const result = await getCodeNameWithAutoNumber('Newsletter Signup Form', mockSupabase);
      expect(result).toBe('SignupForm3');
    });

    it('should handle special characters in component names', async () => {
      const mockSupabase = createMockSupabase();
      const mock = mockSupabase as unknown as MockSupabase;

      // Mock types table
      mock.eq.mockResolvedValueOnce({
        data: [
          { name: 'hero', display_name: 'Hero Section' },
        ],
        error: null
      });

      // Mock existing components
      mock.or.mockResolvedValueOnce({
        data: [
          { code_name: 'Hero1' },
          { code_name: 'Hero2' }
        ],
        error: null
      });

      const result = await getCodeNameWithAutoNumber('Hero & Featured @2024!', mockSupabase);
      expect(result).toBe('Hero3');
    });

    it('should handle gaps in numbering sequence', async () => {
      const mockSupabase = createMockSupabase();
      const mock = mockSupabase as unknown as MockSupabase;

      // Mock types table
      mock.eq.mockResolvedValueOnce({
        data: [
          { name: 'hero', display_name: 'Hero Section' },
        ],
        error: null
      });

      // Missing Hero2 and Hero4
      const existingComponents = [
        { code_name: 'Hero1' },
        { code_name: 'Hero3' },
        { code_name: 'Hero5' },
      ];

      mock.or.mockResolvedValueOnce({
        data: existingComponents,
        error: null
      });

      const result = await getCodeNameWithAutoNumber('Hero Section', mockSupabase);
      expect(result).toBe('Hero6'); // Should use next number after highest
    });

    it('should fallback to Section for unknown types', async () => {
      const mockSupabase = createMockSupabase();
      const mock = mockSupabase as unknown as MockSupabase;

      // Mock empty types table
      mock.eq.mockResolvedValueOnce({
        data: [],
        error: null
      });

      // No existing Section components
      mock.or.mockResolvedValueOnce({
        data: [],
        error: null
      });

      const result = await getCodeNameWithAutoNumber('Random Widget', mockSupabase);
      expect(result).toBe('Section1');
    });

    it('should handle database query errors gracefully', async () => {
      const mockSupabase = createMockSupabase();
      const mock = mockSupabase as unknown as MockSupabase;

      // Types query succeeds
      mock.eq.mockResolvedValueOnce({
        data: [],
        error: null
      });

      // Components query fails
      mock.or.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error', code: 'DB_ERROR' }
      });

      await expect(
        getCodeNameWithAutoNumber('Hero Section', mockSupabase)
      ).rejects.toThrow('Failed to query existing components');
    });

    it('should continue with fallback if types table query fails', async () => {
      const mockSupabase = createMockSupabase();
      const mock = mockSupabase as unknown as MockSupabase;

      // Types query fails - should not throw, just log
      mock.eq.mockResolvedValueOnce({
        data: null,
        error: { message: 'Types table error', code: 'DB_ERROR' }
      });

      // Components query succeeds
      mock.or.mockResolvedValueOnce({
        data: [],
        error: null
      });

      // Should still work with fallback
      const result = await getCodeNameWithAutoNumber('Hero Section', mockSupabase);
      expect(result).toBe('Hero1');
    });

    it('should handle mixed case existing components', async () => {
      const mockSupabase = createMockSupabase();
      const mock = mockSupabase as unknown as MockSupabase;

      // Mock types table
      mock.eq.mockResolvedValueOnce({
        data: [
          { name: 'hero', display_name: 'Hero Section' },
        ],
        error: null
      });

      const existingComponents = [
        { code_name: 'HERO1' },
        { code_name: 'hero2' },
        { code_name: 'Hero3' },
      ];

      mock.or.mockResolvedValueOnce({
        data: existingComponents,
        error: null
      });

      const result = await getCodeNameWithAutoNumber('Hero Banner', mockSupabase);
      expect(result).toBe('Hero4');
    });
  });

  describe('extractComponentType', () => {
    it('should extract type from database types', () => {
      const types = [
        { name: 'hero', display_name: 'Hero Section' },
        { name: 'footer', display_name: 'Footer' },
        { name: 'bentobox', display_name: 'Bento Box' },
      ];

      expect(extractComponentType('Epic Hero', types)).toBe('Hero');
      expect(extractComponentType('Dark Footer', types)).toBe('Footer');
      expect(extractComponentType('Bento Box Layout', types)).toBe('Bentobox');
    });

    it('should prioritize exact matches', () => {
      const types = [
        { name: 'hero', display_name: 'Hero Section' },
        { name: 'superhero', display_name: 'Super Hero' },
      ];

      expect(extractComponentType('Super Hero', types)).toBe('Superhero');
    });

    it('should match longer names first', () => {
      const types = [
        { name: 'action', display_name: 'Action' },
        { name: 'call_to_action', display_name: 'Call to Action' },
      ];

      expect(extractComponentType('Call to Action Banner', types)).toBe('CallToAction');
    });

    it('should format type names correctly', () => {
      const types = [
        { name: 'signup_form', display_name: 'Signup Form' },
        { name: 'nav-bar', display_name: 'Navigation Bar' },
        { name: 'hero section', display_name: 'Hero Section' },
      ];

      expect(extractComponentType('Cool Signup Form', types)).toBe('SignupForm');
      expect(extractComponentType('Top Nav Bar', types)).toBe('NavBar');
      expect(extractComponentType('Amazing Hero Section', types)).toBe('HeroSection');
    });

    it('should fallback to common types when no database types provided', () => {
      expect(extractComponentType('Epic Hero')).toBe('Hero');
      expect(extractComponentType('Dark Footer')).toBe('Footer');
      expect(extractComponentType('Nav Bar')).toBe('Navigation');
      expect(extractComponentType('Page Header')).toBe('Header');
      expect(extractComponentType('Our Services')).toBe('Services');
    });

    it('should return Section for unknown types', () => {
      const types = [
        { name: 'hero', display_name: 'Hero Section' },
      ];

      expect(extractComponentType('Random Component', types)).toBe('Section');
      expect(extractComponentType('Something Else', [])).toBe('Section');
      expect(extractComponentType('Unknown Widget')).toBe('Section');
    });
  });

  describe('extractExistingNumbers', () => {
    it('should extract numbers from component names', () => {
      const components = [
        { code_name: 'Hero1' },
        { code_name: 'Hero2' },
        { code_name: 'Hero10' },
        { code_name: 'Hero15' },
      ];

      const numbers = extractExistingNumbers(components, 'Hero');
      expect(numbers).toEqual([1, 2, 10, 15]);
    });

    it('should handle components without numbers', () => {
      const components = [
        { code_name: 'Hero' },
        { code_name: 'HeroSection' },
        { code_name: 'Hero1' },
      ];

      const numbers = extractExistingNumbers(components, 'Hero');
      expect(numbers).toEqual([1]);
    });

    it('should filter by base type correctly', () => {
      const components = [
        { code_name: 'Hero1' },
        { code_name: 'Footer1' },
        { code_name: 'Hero2' },
        { code_name: 'Navigation1' },
      ];

      const heroNumbers = extractExistingNumbers(components, 'Hero');
      expect(heroNumbers).toEqual([1, 2]);

      const footerNumbers = extractExistingNumbers(components, 'Footer');
      expect(footerNumbers).toEqual([1]);
    });

    it('should handle case insensitive matching', () => {
      const components = [
        { code_name: 'HERO1' },
        { code_name: 'hero2' },
        { code_name: 'Hero3' },
      ];

      const numbers = extractExistingNumbers(components, 'Hero');
      expect(numbers).toEqual([1, 2, 3]);
    });

    it('should return empty array when no matches', () => {
      const components = [
        { code_name: 'Footer1' },
        { code_name: 'Navigation1' },
      ];

      const numbers = extractExistingNumbers(components, 'Hero');
      expect(numbers).toEqual([]);
    });
  });
});