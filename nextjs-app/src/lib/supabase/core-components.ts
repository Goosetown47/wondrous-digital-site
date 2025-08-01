import type { CoreComponent } from '@/types/builder';

export interface CreateComponentInput {
  name: string;
  type: 'component' | 'section';
  source: 'shadcn' | 'aceternity' | 'expansions' | 'custom';
  code: string;
  dependencies?: string[];
  imports?: string[];
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateComponentInput extends Partial<CreateComponentInput> {
  id: string;
}

export interface ComponentFilters {
  type?: 'component' | 'section';
  source?: 'shadcn' | 'aceternity' | 'expansions' | 'custom';
  search?: string;
}

class CoreComponentsService {

  async getAll(): Promise<CoreComponent[]> {
    return this.getComponents();
  }

  async getComponents(filters?: ComponentFilters): Promise<CoreComponent[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.type) {
        params.set('type', filters.type);
      }
      
      if (filters?.source) {
        params.set('source', filters.source);
      }
      
      if (filters?.search) {
        params.set('search', filters.search);
      }

      const response = await fetch(`/api/core-components?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch components');
      }

      const data = await response.json();
      return data as CoreComponent[];
    } catch (error) {
      console.error('Error fetching components:', error);
      throw error;
    }
  }

  async getComponent(id: string): Promise<CoreComponent | null> {
    try {
      const response = await fetch(`/api/core-components/${id}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch component');
      }

      const data = await response.json();
      return data as CoreComponent;
    } catch (error) {
      console.error('Error fetching component:', error);
      throw error;
    }
  }

  async createComponent(input: CreateComponentInput): Promise<CoreComponent> {
    try {
      const response = await fetch('/api/core-components', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...input,
          dependencies: input.dependencies || [],
          imports: input.imports || {},
          metadata: input.metadata || {},
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create component');
      }

      const data = await response.json();
      return data as CoreComponent;
    } catch (error) {
      console.error('Error creating component:', error);
      throw error;
    }
  }

  async updateComponent(input: UpdateComponentInput): Promise<CoreComponent> {
    const { id, ...updates } = input;
    
    try {
      const response = await fetch(`/api/core-components/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update component');
      }

      const data = await response.json();
      return data as CoreComponent;
    } catch (error) {
      console.error('Error updating component:', error);
      throw error;
    }
  }

  async deleteComponent(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/core-components/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete component');
      }
    } catch (error) {
      console.error('Error deleting component:', error);
      throw error;
    }
  }

  async getComponentsBySource(source: string): Promise<CoreComponent[]> {
    return this.getComponents({ source });
  }

  async searchComponents(searchTerm: string): Promise<CoreComponent[]> {
    return this.getComponents({ search: searchTerm });
  }
}

export const coreComponentsService = new CoreComponentsService();