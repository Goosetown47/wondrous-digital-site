import { supabase } from './client';
import type { LabDraft } from '@/types/builder';

// Helper function to calculate content hash using browser crypto API
async function calculateContentHash(content: any): Promise<string> {
  const contentString = JSON.stringify(content);
  const encoder = new TextEncoder();
  const data = encoder.encode(contentString);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hash));
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export const labDraftService = {
  async getAll(filters?: { type?: string; status?: string }) {
    try {
      const params = new URLSearchParams();
      
      if (filters?.type) {
        params.set('type', filters.type);
      }
      
      if (filters?.status) {
        params.set('status', filters.status);
      }

      const response = await fetch(`/api/lab?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch lab drafts');
      }

      const data = await response.json();
      return data as LabDraft[];
    } catch (error) {
      console.error('Error fetching lab drafts:', error);
      throw error;
    }
  },

  async getById(id: string) {
    try {
      const response = await fetch(`/api/lab/${id}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Draft not found');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch lab draft');
      }

      const data = await response.json();
      return data as LabDraft;
    } catch (error) {
      console.error('Error fetching lab draft:', error);
      throw error;
    }
  },

  async create(draft: Omit<LabDraft, 'id' | 'created_at' | 'updated_at' | 'created_by'> & { type_id?: string | null }) {
    try {
      const response = await fetch('/api/lab', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(draft),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create lab draft');
      }

      const data = await response.json();
      return data as LabDraft;
    } catch (error) {
      console.error('Error creating lab draft:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Omit<LabDraft, 'id' | 'created_at' | 'updated_at'>>) {
    try {
      // Calculate content hash if content is being updated
      let updatePayload: any = { ...updates };
      if (updates.content) {
        updatePayload.content_hash = await calculateContentHash(updates.content);
      }
      
      const response = await fetch(`/api/lab/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update lab draft');
      }

      const data = await response.json();
      return data as LabDraft;
    } catch (error) {
      console.error('Error updating lab draft:', error);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      const response = await fetch(`/api/lab/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete lab draft');
      }
    } catch (error) {
      console.error('Error deleting lab draft:', error);
      throw error;
    }
  },

  async promoteToLibrary(draftId: string, publishStatus: 'published' | 'unpublished' = 'unpublished') {
    console.log('Promoting draft to library:', draftId);
    
    // Check auth state
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user?.id, user?.email);
    
    // Get the draft
    const draft = await this.getById(draftId);
    console.log('Draft to promote:', draft);
    
    if (!draft) {
      throw new Error('Draft not found');
    }
    
    // Create library item from draft
    const insertData = {
      name: draft.name,
      type: draft.type,
      type_id: draft.type_id,
      component_name: draft.metadata?.component_name || null,
      content: draft.content,
      metadata: draft.metadata,
      published: publishStatus === 'published',
      version: 1,
      category: draft.metadata?.category || null,
      source_draft_id: draftId,
      created_by: user?.id || draft.created_by,
    };
    
    console.log('Inserting library item:', insertData);
    
    const { data: libraryItem, error: createError } = await supabase
      .from('library_items')
      .insert(insertData)
      .select()
      .single();

    if (createError) {
      console.error('Error creating library item:', {
        message: createError.message,
        details: createError.details,
        hint: createError.hint,
        code: createError.code,
        fullError: createError
      });
      throw createError;
    }
    
    console.log('Library item created:', libraryItem);

    // If this is a theme, also create an entry in the themes table
    if (draft.type === 'theme' && libraryItem) {
      console.log('Creating theme entry for promoted theme');
      const { data: theme, error: themeError } = await supabase
        .from('themes')
        .insert({
          name: draft.name,
          description: draft.content?.description || null,
          variables: draft.content?.variables || {},
          metadata: {
            ...draft.metadata,
            library_item_id: libraryItem.id,
            source_draft_id: draftId,
          },
          created_by: user?.id || draft.created_by,
        })
        .select()
        .single();

      if (themeError) {
        console.error('Error creating theme entry:', themeError);
        // Don't throw here, the library item was already created
        // We'll update the library item with the theme reference if successful
      } else if (theme) {
        console.log('Theme entry created:', theme);
        // Update library item with theme reference
        await supabase
          .from('library_items')
          .update({ theme_id: theme.id })
          .eq('id', libraryItem.id);
      }
    }

    // Update draft with library reference and version
    const now = new Date().toISOString();
    await this.update(draftId, {
      status: 'promoted',
      library_version: libraryItem.version || 1,
      metadata: {
        ...draft.metadata,
        library_item_id: libraryItem.id,
        promoted_at: now,
        last_synced_at: now,
        last_synced_content_hash: await calculateContentHash(draft.content),
      },
    });

    return libraryItem;
  },

  async updateLibraryItem(draftId: string) {
    console.log('Updating library item from draft:', draftId);
    
    // Get the draft
    const draft = await this.getById(draftId);
    if (!draft) {
      throw new Error('Draft not found');
    }
    
    // Check if draft has a linked library item
    const libraryItemId = draft.metadata?.library_item_id;
    if (!libraryItemId) {
      throw new Error('Draft has not been promoted to library yet');
    }
    
    // Get current library item to increment version
    const { data: currentLibraryItem, error: fetchError } = await supabase
      .from('library_items')
      .select('*')
      .eq('id', libraryItemId)
      .single();
    
    if (fetchError || !currentLibraryItem) {
      throw new Error('Library item not found');
    }
    
    // Check if this version already exists (in case of retry)
    const { data: existingVersion } = await supabase
      .from('library_versions')
      .select('id')
      .eq('library_item_id', libraryItemId)
      .eq('version', currentLibraryItem.version)
      .single();
    
    // Only create version snapshot if it doesn't exist
    if (!existingVersion) {
      const { error: versionError } = await supabase
        .from('library_versions')
        .insert({
          library_item_id: libraryItemId,
          version: currentLibraryItem.version,
          content: currentLibraryItem.content,
          change_notes: `Version ${currentLibraryItem.version} snapshot before update`,
          created_by: draft.created_by,
        });
      
      if (versionError) {
        console.error('Error creating version snapshot:', {
          message: versionError.message,
          details: versionError.details,
          hint: versionError.hint,
          code: versionError.code,
        });
        // Don't throw - continue with the update even if versioning fails
      }
    }
    
    // Update the library item with new content
    const { data: updatedLibraryItem, error: updateError } = await supabase
      .from('library_items')
      .update({
        name: draft.name,
        content: draft.content,
        metadata: draft.metadata,
        component_name: draft.metadata?.component_name || null,
        type_id: draft.type_id,
        version: (currentLibraryItem.version || 1) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', libraryItemId)
      .select()
      .single();
    
    if (updateError) {
      throw updateError;
    }
    
    // Update draft to mark it as synced with new version and content hash
    await this.update(draftId, {
      library_version: updatedLibraryItem.version,
      metadata: {
        ...draft.metadata,
        last_synced_at: new Date().toISOString(),
        last_synced_content_hash: await calculateContentHash(draft.content),
      },
    });
    
    console.log('Library item updated:', updatedLibraryItem);
    return updatedLibraryItem;
  },
};