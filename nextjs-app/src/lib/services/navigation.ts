import { supabase } from '@/lib/supabase/client';
import type {
  NavigationMenu,
  NavigationItem,
  ValidationResult,
  ValidationError,
} from '@/types/navigation';
import { z } from 'zod';

// Zod schemas for validation
const NavigationItemSchema: z.ZodType<NavigationItem> = z.lazy(() =>
  z.object({
    id: z.string(),
    type: z.enum(['link', 'category', 'divider']),
    label: z.string().optional(),
    url: z.string().optional(),
    page_id: z.string().uuid().optional(),
    icon: z.string().optional(),
    badge: z.string().optional(),
    description: z.string().optional(),
    image_url: z.string().url().optional(),
    styling: z
      .object({
        bold: z.boolean().optional(),
        color: z.string().optional(),
        className: z.string().optional(),
      })
      .optional(),
    children: z.array(NavigationItemSchema).optional(),
  })
  .refine(
    (item) => {
      // Links and categories must have labels
      if (item.type !== 'divider' && !item.label) {
        return false;
      }
      // Links must have either URL or page_id
      if (item.type === 'link' && !item.url && !item.page_id) {
        return false;
      }
      return true;
    },
    {
      message: 'Invalid navigation item structure',
    }
  )
);

const NavigationTreeSchema = z.array(NavigationItemSchema);

class NavigationService {
  /**
   * Create a new navigation menu
   */
  async create(menu: Omit<NavigationMenu, 'id' | 'created_at' | 'updated_at'>): Promise<NavigationMenu> {
    const { data, error } = await supabase
      .from('navigation_menus')
      .insert(menu)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Get navigation menus by project
   */
  async getByProject(projectId: string): Promise<NavigationMenu[]> {
    const { data, error } = await supabase
      .from('navigation_menus')
      .select('*')
      .eq('project_id', projectId)
      .order('type', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  /**
   * Get a single navigation menu by ID
   */
  async getById(id: string): Promise<NavigationMenu> {
    const { data, error } = await supabase
      .from('navigation_menus')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Update a navigation menu
   */
  async update(id: string, updates: Partial<Omit<NavigationMenu, 'id' | 'created_at' | 'updated_at'>>): Promise<NavigationMenu> {
    const { data, error } = await supabase
      .from('navigation_menus')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Delete a navigation menu
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('navigation_menus')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  /**
   * Set a menu as active (and deactivate others of the same type)
   */
  async setActive(menuId: string): Promise<void> {
    // Get the menu details
    const { data: menu, error: menuError } = await supabase
      .from('navigation_menus')
      .select('project_id, type')
      .eq('id', menuId)
      .single();

    if (menuError) throw new Error(menuError.message);

    // Deactivate all menus of the same type for this project
    const { error: deactivateError } = await supabase
      .from('navigation_menus')
      .update({ is_active: false })
      .eq('project_id', menu.project_id)
      .eq('type', menu.type)
      .neq('id', menuId);

    if (deactivateError) throw new Error(deactivateError.message);

    // Activate the selected menu
    const { error: activateError } = await supabase
      .from('navigation_menus')
      .update({ is_active: true })
      .eq('id', menuId);

    if (activateError) throw new Error(activateError.message);
  }

  /**
   * Get active navigation for a project
   */
  async getActiveByProject(projectId: string, type?: 'header' | 'footer' | 'sidebar'): Promise<NavigationMenu[]> {
    let query = supabase
      .from('navigation_menus')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_active', true);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);
    return data || [];
  }

  // Tree manipulation methods

  /**
   * Add an item to the navigation tree
   */
  addItem(items: NavigationItem[], newItem: NavigationItem, parentId?: string): NavigationItem[] {
    if (!parentId) {
      // Add to root level
      return [...items, newItem];
    }

    // Add as child to parent
    return this.updateItemInTree(items, parentId, (parent) => ({
      ...parent,
      children: [...(parent.children || []), newItem],
    }));
  }

  /**
   * Remove an item from the navigation tree
   */
  removeItem(items: NavigationItem[], itemId: string): NavigationItem[] {
    return items
      .filter((item) => item.id !== itemId)
      .map((item) => ({
        ...item,
        children: item.children ? this.removeItem(item.children, itemId) : [],
      }));
  }

  /**
   * Reorder items in the navigation tree
   */
  reorderItems(items: NavigationItem[], itemId: string, newIndex: number): NavigationItem[] {
    const itemToMove = this.findItemInTree(items, itemId);
    if (!itemToMove) return items;

    // Remove the item from its current position
    const withoutItem = this.removeItem(items, itemId);

    // Insert at new position
    const result = [...withoutItem];
    result.splice(newIndex, 0, itemToMove);
    return result;
  }

  /**
   * Nest an item under another parent
   */
  nestItem(
    items: NavigationItem[],
    itemId: string,
    newParentId: string,
    maxDepth: number = 3
  ): NavigationItem[] {
    const itemToMove = this.findItemInTree(items, itemId);
    if (!itemToMove) return items;

    // Check depth limit
    const parentDepth = this.getItemDepth(items, newParentId);
    if (parentDepth >= maxDepth - 1) {
      throw new Error('Maximum nesting depth exceeded');
    }

    // Remove from current position
    const withoutItem = this.removeItem(items, itemId);

    // Add to new parent
    return this.updateItemInTree(withoutItem, newParentId, (parent) => ({
      ...parent,
      children: [...(parent.children || []), itemToMove],
    }));
  }

  /**
   * Update an item in the tree
   */
  updateItem(
    items: NavigationItem[],
    itemId: string,
    updates: Partial<NavigationItem>
  ): NavigationItem[] {
    return this.updateItemInTree(items, itemId, (item) => ({
      ...item,
      ...updates,
    }));
  }

  /**
   * Validate navigation tree structure
   */
  validateTree(items: NavigationItem[]): void {
    const result = NavigationTreeSchema.safeParse(items);
    if (!result.success) {
      throw new Error(`Invalid navigation tree: ${result.error.message}`);
    }
  }

  /**
   * Get validation result for navigation tree
   */
  getValidationResult(items: NavigationItem[]): ValidationResult {
    const result = NavigationTreeSchema.safeParse(items);
    
    if (result.success) {
      return { isValid: true, errors: [] };
    }

    const errors: ValidationError[] = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
      field: issue.path[issue.path.length - 1]?.toString(),
    }));

    return { isValid: false, errors };
  }

  // Helper methods

  private findItemInTree(items: NavigationItem[], itemId: string): NavigationItem | null {
    for (const item of items) {
      if (item.id === itemId) {
        return item;
      }
      if (item.children) {
        const found = this.findItemInTree(item.children, itemId);
        if (found) return found;
      }
    }
    return null;
  }

  private updateItemInTree(
    items: NavigationItem[],
    itemId: string,
    updater: (item: NavigationItem) => NavigationItem
  ): NavigationItem[] {
    return items.map((item) => {
      if (item.id === itemId) {
        return updater(item);
      }
      if (item.children) {
        return {
          ...item,
          children: this.updateItemInTree(item.children, itemId, updater),
        };
      }
      return item;
    });
  }

  private getItemDepth(items: NavigationItem[], itemId: string, currentDepth: number = 0): number {
    for (const item of items) {
      if (item.id === itemId) {
        return currentDepth;
      }
      if (item.children) {
        const depth = this.getItemDepth(item.children, itemId, currentDepth + 1);
        if (depth >= 0) return depth;
      }
    }
    return -1;
  }

  /**
   * Generate a unique ID for a new navigation item
   */
  generateItemId(): string {
    return `nav-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clone a navigation menu
   */
  async cloneMenu(menuId: string): Promise<NavigationMenu> {
    const original = await this.getById(menuId);
    
    const clone: Omit<NavigationMenu, 'id' | 'created_at' | 'updated_at'> = {
      project_id: original.project_id,
      type: original.type,
      library_item_id: original.library_item_id,
      items: JSON.parse(JSON.stringify(original.items)), // Deep clone
      settings: { ...original.settings },
      is_active: false, // Cloned menus start inactive
    };

    return this.create(clone);
  }
}

export const navigationService = new NavigationService();