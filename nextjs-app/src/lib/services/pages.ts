import { supabase } from '@/lib/supabase/client';
import type { Page } from '@/types/database';
import type { Section } from '@/stores/builderStore';

export interface PageWithProject extends Page {
  projects?: {
    id: string;
    name: string;
    account_id: string;
  };
}

export interface CreatePageData {
  project_id: string;
  path: string;
  title?: string;
  sections?: Section[];
  metadata?: Record<string, unknown>;
}

export interface UpdatePageData {
  title?: string;
  sections?: Section[];
  metadata?: Record<string, unknown>;
}

/**
 * Get a page by project ID and path
 */
export async function getPageByProjectId(projectId: string, path: string = '/') {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('pages')
    .select(`
      *,
      projects!inner(
        id,
        name,
        account_id
      )
    `)
    .eq('project_id', projectId)
    .eq('path', path)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw error;
  }
  
  return data as PageWithProject | null;
}

/**
 * Create a new page
 */
export async function createPage(pageData: CreatePageData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('pages')
    .insert({
      ...pageData,
      sections: pageData.sections || [],
      metadata: pageData.metadata || {}
    })
    .select()
    .single();

  if (error) throw error;
  
  // Log the action
  await logPageAction('create', data.id, pageData.project_id, { page_path: data.path });
  
  return data as Page;
}

/**
 * Update page content
 */
export async function updatePage(pageId: string, updates: UpdatePageData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get the page first to get project_id for logging
  const { data: existingPage } = await supabase
    .from('pages')
    .select('project_id, path')
    .eq('id', pageId)
    .single();

  const { data, error } = await supabase
    .from('pages')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', pageId)
    .select()
    .single();

  if (error) throw error;
  
  // Log the action
  if (existingPage) {
    await logPageAction('update', pageId, existingPage.project_id, { 
      updates: Object.keys(updates),
      section_count: updates.sections?.length 
    });
  }
  
  return data as Page;
}

/**
 * Delete a page
 */
export async function deletePage(pageId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get page info for logging
  const { data: page } = await supabase
    .from('pages')
    .select('project_id, path, title')
    .eq('id', pageId)
    .single();
  
  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('id', pageId);

  if (error) throw error;
  
  // Log the action
  if (page) {
    await logPageAction('delete', pageId, page.project_id, { 
      page_path: page.path,
      page_title: page.title 
    });
  }
  
  // Return the deleted page info for cache invalidation
  return page;
}

/**
 * List all pages in a project
 */
export async function listProjectPages(projectId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('project_id', projectId)
    .order('path');

  if (error) throw error;
  return data as Page[];
}

/**
 * Get or create homepage for a project
 */
export async function getOrCreateHomepage(projectId: string) {
  // First try to get existing homepage
  const existingPage = await getPageByProjectId(projectId, '/');
  
  if (existingPage) {
    return existingPage;
  }

  // Create homepage if it doesn't exist
  const newPage = await createPage({
    project_id: projectId,
    path: '/',
    title: 'Home',
    sections: [],
    metadata: {
      description: 'Homepage',
      isHomepage: true
    }
  });

  return newPage;
}

/**
 * Duplicate a page with a new path
 */
export async function duplicatePage(pageId: string, newPath: string, newTitle?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get the original page
  const { data: originalPage, error: fetchError } = await supabase
    .from('pages')
    .select('*')
    .eq('id', pageId)
    .single();

  if (fetchError) throw fetchError;
  if (!originalPage) throw new Error('Page not found');

  // Create new page with duplicated content
  const { data, error } = await supabase
    .from('pages')
    .insert({
      project_id: originalPage.project_id,
      path: newPath,
      title: newTitle || `${originalPage.title || 'Untitled'} (Copy)`,
      sections: originalPage.sections || [],
      metadata: {
        ...(originalPage.metadata as Record<string, unknown> || {}),
        duplicatedFrom: pageId,
        duplicatedAt: new Date().toISOString()
      }
    })
    .select()
    .single();

  if (error) throw error;
  
  // Log the action
  await logPageAction('duplicate', data.id, originalPage.project_id, { 
    originalPageId: pageId,
    originalPath: originalPage.path,
    newPath: newPath
  });
  
  return data as Page;
}

/**
 * Log page actions for audit trail
 */
async function logPageAction(
  action: string, 
  pageId: string, 
  projectId: string, 
  metadata?: Record<string, unknown>
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Get project's account ID
  const { data: project } = await supabase
    .from('projects')
    .select('account_id')
    .eq('id', projectId)
    .single();

  if (!project?.account_id) return;

  try {
    await supabase
      .from('audit_logs')
      .insert({
        account_id: project.account_id,
        user_id: user.id,
        action: `page:${action}`,
        resource_type: 'page',
        resource_id: pageId,
        metadata: metadata || {}
      });
  } catch (error) {
    console.error('Failed to log page action:', error);
  }
}