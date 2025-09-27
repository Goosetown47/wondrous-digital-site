import { describe, it, expect, beforeEach, vi } from 'vitest';
import { navigationService } from '../navigation';
import { supabase } from '@/lib/supabase/client';
import type { NavigationMenu, NavigationItem, NavigationItemType } from '@/types/navigation';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

// Helper type for mock chain
type MockSupabaseChain = {
  insert?: ReturnType<typeof vi.fn>;
  select?: ReturnType<typeof vi.fn>;
  single?: ReturnType<typeof vi.fn>;
  update?: ReturnType<typeof vi.fn>;
  eq?: ReturnType<typeof vi.fn>;
  delete?: ReturnType<typeof vi.fn>;
  order?: ReturnType<typeof vi.fn>;
  neq?: ReturnType<typeof vi.fn>;
};

describe('Navigation Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CRUD Operations', () => {
    describe('create', () => {
      it('should create a new navigation menu', async () => {
        const mockMenu: Omit<NavigationMenu, 'id' | 'created_at' | 'updated_at'> = {
          project_id: 'test-project-id',
          type: 'header',
          library_item_id: 'test-library-id',
          items: [],
          settings: {},
          is_active: false,
        };

        const mockResponse = {
          ...mockMenu,
          id: 'test-menu-id',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const mockSupabaseChain: MockSupabaseChain = {
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockResponse, error: null }),
        };

        // @ts-expect-error - Mock chain for testing
        vi.mocked(supabase.from).mockReturnValue(mockSupabaseChain);

        const result = await navigationService.create(mockMenu);

        expect(supabase.from).toHaveBeenCalledWith('navigation_menus');
        expect(mockSupabaseChain.insert).toHaveBeenCalledWith(mockMenu);
        expect(result).toEqual(mockResponse);
      });

      it('should throw error when creation fails', async () => {
        const mockMenu: Omit<NavigationMenu, 'id' | 'created_at' | 'updated_at'> = {
          project_id: 'test-project-id',
          type: 'header',
          library_item_id: 'test-library-id',
          items: [],
          settings: {},
          is_active: false,
        };

        const mockSupabaseChain: MockSupabaseChain = {
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Creation failed' } }),
        };

        // @ts-expect-error - Mock chain for testing
        vi.mocked(supabase.from).mockReturnValue(mockSupabaseChain);

        await expect(navigationService.create(mockMenu)).rejects.toThrow('Creation failed');
      });
    });

    describe('getByProject', () => {
      it('should fetch navigation menus for a project', async () => {
        const projectId = 'test-project-id';
        const mockMenus = [
          {
            id: 'menu-1',
            project_id: projectId,
            type: 'header',
            library_item_id: 'lib-1',
            items: [],
            settings: {},
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'menu-2',
            project_id: projectId,
            type: 'footer',
            library_item_id: 'lib-2',
            items: [],
            settings: {},
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];

        const mockSupabaseChain: MockSupabaseChain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: mockMenus, error: null }),
        };

        // @ts-expect-error - Mock chain for testing
        vi.mocked(supabase.from).mockReturnValue(mockSupabaseChain);

        const result = await navigationService.getByProject(projectId);

        expect(supabase.from).toHaveBeenCalledWith('navigation_menus');
        expect(mockSupabaseChain.eq).toHaveBeenCalledWith('project_id', projectId);
        expect(result).toEqual(mockMenus);
      });
    });

    describe('update', () => {
      it('should update a navigation menu', async () => {
        const menuId = 'test-menu-id';
        const updates = {
          items: [
            {
              id: 'item-1',
              type: 'link' as NavigationItemType,
              label: 'Home',
              url: '/',
              children: [],
            },
          ],
          is_active: true,
        };

        const mockResponse = {
          id: menuId,
          project_id: 'test-project-id',
          type: 'header',
          library_item_id: 'test-library-id',
          ...updates,
          settings: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const mockSupabaseChain: MockSupabaseChain = {
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockResponse, error: null }),
        };

        // @ts-expect-error - Mock chain for testing
        vi.mocked(supabase.from).mockReturnValue(mockSupabaseChain);

        const result = await navigationService.update(menuId, updates);

        expect(supabase.from).toHaveBeenCalledWith('navigation_menus');
        expect(mockSupabaseChain.update).toHaveBeenCalledWith(updates);
        expect(mockSupabaseChain.eq).toHaveBeenCalledWith('id', menuId);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('delete', () => {
      it('should delete a navigation menu', async () => {
        const menuId = 'test-menu-id';

        const mockSupabaseChain: MockSupabaseChain = {
          delete: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: null }),
        };

        // @ts-expect-error - Mock chain for testing
        vi.mocked(supabase.from).mockReturnValue(mockSupabaseChain);

        await navigationService.delete(menuId);

        expect(supabase.from).toHaveBeenCalledWith('navigation_menus');
        expect(mockSupabaseChain.delete).toHaveBeenCalled();
        expect(mockSupabaseChain.eq).toHaveBeenCalledWith('id', menuId);
      });
    });
  });

  describe('Tree Structure Operations', () => {
    describe('addItem', () => {
      it('should add item to root level', () => {
        const items: NavigationItem[] = [];
        const newItem: NavigationItem = {
          id: 'item-1',
          type: 'link',
          label: 'Home',
          url: '/',
          children: [],
        };

        const result = navigationService.addItem(items, newItem);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(newItem);
      });

      it('should add item as child to parent', () => {
        const items: NavigationItem[] = [
          {
            id: 'parent-1',
            type: 'link',
            label: 'Services',
            url: '/services',
            children: [],
          },
        ];

        const newItem: NavigationItem = {
          id: 'child-1',
          type: 'link',
          label: 'Consulting',
          url: '/services/consulting',
          children: [],
        };

        const result = navigationService.addItem(items, newItem, 'parent-1');

        expect(result[0].children).toHaveLength(1);
        expect(result[0].children?.[0]).toEqual(newItem);
      });
    });

    describe('removeItem', () => {
      it('should remove item from root level', () => {
        const items: NavigationItem[] = [
          {
            id: 'item-1',
            type: 'link',
            label: 'Home',
            url: '/',
            children: [],
          },
          {
            id: 'item-2',
            type: 'link',
            label: 'About',
            url: '/about',
            children: [],
          },
        ];

        const result = navigationService.removeItem(items, 'item-1');

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('item-2');
      });

      it('should remove nested item', () => {
        const items: NavigationItem[] = [
          {
            id: 'parent-1',
            type: 'link',
            label: 'Services',
            url: '/services',
            children: [
              {
                id: 'child-1',
                type: 'link',
                label: 'Consulting',
                url: '/services/consulting',
                children: [],
              },
            ],
          },
        ];

        const result = navigationService.removeItem(items, 'child-1');

        expect(result[0].children).toHaveLength(0);
      });
    });

    describe('reorderItems', () => {
      it('should reorder items at root level', () => {
        const items: NavigationItem[] = [
          {
            id: 'item-1',
            type: 'link',
            label: 'Home',
            url: '/',
            children: [],
          },
          {
            id: 'item-2',
            type: 'link',
            label: 'About',
            url: '/about',
            children: [],
          },
          {
            id: 'item-3',
            type: 'link',
            label: 'Contact',
            url: '/contact',
            children: [],
          },
        ];

        const result = navigationService.reorderItems(items, 'item-3', 0);

        expect(result[0].id).toBe('item-3');
        expect(result[1].id).toBe('item-1');
        expect(result[2].id).toBe('item-2');
      });
    });

    describe('nestItem', () => {
      it('should move item into another item as child', () => {
        const items: NavigationItem[] = [
          {
            id: 'item-1',
            type: 'link',
            label: 'Services',
            url: '/services',
            children: [],
          },
          {
            id: 'item-2',
            type: 'link',
            label: 'Consulting',
            url: '/consulting',
            children: [],
          },
        ];

        const result = navigationService.nestItem(items, 'item-2', 'item-1');

        expect(result).toHaveLength(1);
        expect(result[0].children).toHaveLength(1);
        expect(result[0].children?.[0].id).toBe('item-2');
      });

      it('should respect max depth limit', () => {
        const deeplyNested = {
          id: 'level-1',
          type: 'link' as NavigationItemType,
          label: 'Level 1',
          url: '/1',
          children: [
            {
              id: 'level-2',
              type: 'link' as NavigationItemType,
              label: 'Level 2',
              url: '/2',
              children: [
                {
                  id: 'level-3',
                  type: 'link' as NavigationItemType,
                  label: 'Level 3',
                  url: '/3',
                  children: [],
                },
              ],
            },
          ],
        };

        const items = [deeplyNested];
        const newItem: NavigationItem = {
          id: 'new-item',
          type: 'link',
          label: 'New',
          url: '/new',
          children: [],
        };

        // Assuming max depth is 3
        expect(() => 
          navigationService.nestItem([...items, newItem], 'new-item', 'level-3', 3)
        ).toThrow('Maximum nesting depth exceeded');
      });
    });
  });

  describe('JSON Validation', () => {
    it('should validate correct navigation tree structure', () => {
      const validTree = [
        {
          id: 'item-1',
          type: 'link' as NavigationItemType,
          label: 'Home',
          url: '/',
          children: [],
        },
        {
          id: 'item-2',
          type: 'category' as NavigationItemType,
          label: 'Services',
          children: [
            {
              id: 'item-3',
              type: 'link' as NavigationItemType,
              label: 'Consulting',
              url: '/services/consulting',
              children: [],
            },
          ],
        },
        {
          id: 'item-4',
          type: 'divider' as NavigationItemType,
          children: [],
        },
      ];

      expect(() => navigationService.validateTree(validTree)).not.toThrow();
    });

    it('should reject invalid item types', () => {
      const invalidTree = [
        {
          id: 'item-1',
          type: 'invalid' as 'link' | 'category' | 'divider',
          label: 'Home',
          url: '/',
          children: [],
        },
      ];

      expect(() => navigationService.validateTree(invalidTree)).toThrow();
    });

    it('should reject missing required fields', () => {
      const invalidTree = [
        {
          id: 'item-1',
          type: 'link' as NavigationItemType,
          // missing label
          url: '/',
          children: [],
        } as NavigationItem,
      ];

      expect(() => navigationService.validateTree(invalidTree)).toThrow();
    });

    it('should validate optional fields correctly', () => {
      const validTree = [
        {
          id: 'item-1',
          type: 'link' as NavigationItemType,
          label: 'Services',
          url: '/services',
          icon: 'stethoscope',
          badge: 'New',
          description: 'Our medical services',
          image_url: 'https://example.com/image.jpg',
          children: [],
        },
      ];

      expect(() => navigationService.validateTree(validTree)).not.toThrow();
    });
  });

  describe('Active Menu Management', () => {
    it('should set one menu active and deactivate others of same type', async () => {
      const menuId = 'menu-1';
      const projectId = 'project-1';

      // Mock data for active menu test
      const mockSupabaseChain: MockSupabaseChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: { project_id: projectId, type: 'header' }, 
          error: null 
        }),
        update: vi.fn().mockReturnThis(),
        neq: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      // @ts-expect-error - Mock chain for testing
      vi.mocked(supabase.from).mockReturnValue(mockSupabaseChain);

      await navigationService.setActive(menuId);

      expect(mockSupabaseChain.update).toHaveBeenCalledWith({ is_active: false });
      expect(mockSupabaseChain.update).toHaveBeenCalledWith({ is_active: true });
    });
  });
});