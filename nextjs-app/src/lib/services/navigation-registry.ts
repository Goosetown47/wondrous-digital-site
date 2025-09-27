import { supabase } from '@/lib/supabase/client';
import type { NavigationComponent, NavigationComponentCapabilities } from '@/types/navigation';

/**
 * Service for managing navigation component registry
 * This tracks available navigation components and their capabilities
 */
class NavigationRegistryService {
  /**
   * Register a new navigation component
   */
  async register(component: Omit<NavigationComponent, 'id' | 'created_at'>): Promise<NavigationComponent> {
    const { data, error } = await supabase
      .from('navigation_components')
      .insert(component)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get all available navigation components
   */
  async getAll(): Promise<NavigationComponent[]> {
    const { data, error } = await supabase
      .from('navigation_components')
      .select('*')
      .order('type', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get components by type
   */
  async getByType(type: 'header' | 'footer' | 'sidebar'): Promise<NavigationComponent[]> {
    const { data, error } = await supabase
      .from('navigation_components')
      .select('*')
      .eq('type', type)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get a single component by ID
   */
  async getById(id: string): Promise<NavigationComponent | null> {
    const { data, error } = await supabase
      .from('navigation_components')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  /**
   * Update component capabilities
   */
  async updateCapabilities(
    id: string,
    capabilities: Partial<NavigationComponentCapabilities>
  ): Promise<NavigationComponent> {
    const { data, error } = await supabase
      .from('navigation_components')
      .update({ capabilities })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a component from registry
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('navigation_components')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Check if a component supports specific features
   */
  async checkCapabilities(
    componentId: string,
    requiredCapabilities: Partial<NavigationComponentCapabilities>
  ): Promise<boolean> {
    const component = await this.getById(componentId);
    if (!component) return false;

    const caps = component.capabilities;
    
    // Check each required capability
    for (const [key, value] of Object.entries(requiredCapabilities)) {
      const componentValue = caps[key as keyof NavigationComponentCapabilities];
      
      if (typeof value === 'boolean' && componentValue !== value) {
        return false;
      }
      
      if (typeof value === 'number' && typeof componentValue === 'number') {
        if (componentValue < value) return false;
      }
    }
    
    return true;
  }

  /**
   * Get default component for a type
   */
  async getDefault(type: 'header' | 'footer' | 'sidebar'): Promise<NavigationComponent | null> {
    const components = await this.getByType(type);
    
    // Return first component as default
    // In future, could add a 'is_default' flag to the table
    return components[0] || null;
  }
}

export const navigationRegistryService = new NavigationRegistryService();