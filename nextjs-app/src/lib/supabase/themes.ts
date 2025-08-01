import type { Theme } from '@/types/builder';

class ThemeService {
  /**
   * Get all published themes from library
   */
  async getAll() {
    try {
      const response = await fetch('/api/themes?published=true', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch themes');
      }

      const data = await response.json();
      return data as Theme[];
    } catch (error) {
      console.error('Error fetching themes:', error);
      throw error;
    }
  }

  /**
   * Get a single theme by ID
   */
  async getById(id: string) {
    try {
      const response = await fetch(`/api/themes/${id}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch theme');
      }

      const data = await response.json();
      return data as Theme;
    } catch (error) {
      console.error('Error fetching theme:', error);
      throw error;
    }
  }

  /**
   * Create a new theme
   */
  async create(theme: Omit<Theme, 'id' | 'created_at' | 'updated_at' | 'created_by'>) {
    try {
      const response = await fetch('/api/themes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: theme.name,
          variables: theme.variables,
          metadata: theme.metadata,
          published: false, // New themes start as drafts
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create theme');
      }

      const data = await response.json();
      return data as Theme;
    } catch (error) {
      console.error('Error creating theme:', error);
      throw error;
    }
  }

  /**
   * Update an existing theme
   */
  async update(id: string, updates: Partial<Omit<Theme, 'id' | 'created_at' | 'updated_at' | 'created_by'>>) {
    try {
      const response = await fetch(`/api/themes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update theme');
      }

      const data = await response.json();
      return data as Theme;
    } catch (error) {
      console.error('Error updating theme:', error);
      throw error;
    }
  }

  /**
   * Delete a theme
   */
  async delete(id: string) {
    try {
      const response = await fetch(`/api/themes/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete theme');
      }
    } catch (error) {
      console.error('Error deleting theme:', error);
      throw error;
    }
  }

  /**
   * Create a theme from a lab draft
   */
  async createFromDraft(draftId: string, name: string, description?: string) {
    // First get the draft
    const { data: draft, error: draftError } = await supabase
      .from('lab_drafts')
      .select('*')
      .eq('id', draftId)
      .eq('type', 'theme')
      .single();

    if (draftError) throw draftError;
    if (!draft) throw new Error('Draft not found');

    // Create the theme
    return this.create({
      name,
      description,
      variables: draft.content.variables || {},
      metadata: {
        ...draft.content.metadata,
        source_draft_id: draftId,
      },
    });
  }

  /**
   * Apply a theme to a project
   */
  async applyToProject(projectId: string, themeId: string, overrides?: Record<string, unknown>) {
    try {
      const response = await fetch(`/api/projects/${projectId}/theme`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          themeId,
          overrides: overrides || {},
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to apply theme to project');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error applying theme to project:', error);
      throw error;
    }
  }
}

export const themeService = new ThemeService();