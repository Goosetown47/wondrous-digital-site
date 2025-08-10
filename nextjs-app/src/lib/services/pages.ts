import { supabase } from '@/lib/supabase/client';
import type { Page } from '@/types/database';
import type { Section } from '@/stores/builderStore';
import { isAdmin, isStaff } from '@/lib/permissions';

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
  published_sections?: Section[];
  metadata?: Record<string, unknown>;
}

/**
 * Verify user has access to a project (and therefore its pages)
 * Returns the account_id if access is granted, throws error otherwise
 */
async function verifyProjectAccess(projectId: string, userId: string): Promise<string> {
  // First check if user is platform admin or staff (bypass account restrictions)
  const isPlatformAdmin = await isAdmin(userId);
  const isPlatformStaff = await isStaff(userId);
  
  if (isPlatformAdmin || isPlatformStaff) {
    // Get account_id for audit logging even though access is granted
    const { data: project } = await supabase
      .from('projects')
      .select('account_id')
      .eq('id', projectId)
      .single();
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    return project.account_id;
  }
  
  // For regular users, verify they have access through account membership
  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      account_id,
      accounts!inner(
        account_users!inner(
          user_id
        )
      )
    `)
    .eq('id', projectId)
    .eq('accounts.account_users.user_id', userId)
    .single();
  
  if (error || !project) {
    throw new Error('Access denied: You do not have permission to access this project');
  }
  
  return project.account_id;
}

/**
 * Get a page by project ID and path
 * Includes account access validation
 */
export async function getPageByProjectId(projectId: string, path: string = '/') {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Verify user has access to this project
  await verifyProjectAccess(projectId, user.id);

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
 * Validates account access before creation
 */
export async function createPage(pageData: CreatePageData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Verify user has access to this project
  const accountId = await verifyProjectAccess(pageData.project_id, user.id);

  const { data, error } = await supabase
    .from('pages')
    .insert({
      ...pageData,
      sections: pageData.sections || [],
      published_sections: pageData.sections || [], // Initialize published_sections with same content as sections
      metadata: pageData.metadata || {}
    })
    .select()
    .single();

  if (error) throw error;
  
  // Log the action with the verified account_id
  await logPageAction('create', data.id, pageData.project_id, accountId, { page_path: data.path });
  
  return data as Page;
}

/**
 * Update page content
 * Validates account access before update
 */
export async function updatePage(pageId: string, updates: UpdatePageData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get the page first to get project_id for access verification
  const { data: existingPage } = await supabase
    .from('pages')
    .select('project_id, path')
    .eq('id', pageId)
    .single();
    
  if (!existingPage) {
    throw new Error('Page not found');
  }

  // Verify user has access to this project
  const accountId = await verifyProjectAccess(existingPage.project_id, user.id);

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
  await logPageAction('update', pageId, existingPage.project_id, accountId, { 
    updates: Object.keys(updates),
    section_count: updates.sections?.length 
  });
  
  return data as Page;
}

/**
 * Delete a page
 * Validates account access before deletion
 */
export async function deletePage(pageId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get page info for access verification and logging
  const { data: page } = await supabase
    .from('pages')
    .select('project_id, path, title')
    .eq('id', pageId)
    .single();
    
  if (!page) {
    throw new Error('Page not found');
  }
  
  // Verify user has access to this project
  const accountId = await verifyProjectAccess(page.project_id, user.id);
  
  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('id', pageId);

  if (error) throw error;
  
  // Log the action
  await logPageAction('delete', pageId, page.project_id, accountId, { 
    page_path: page.path,
    page_title: page.title 
  });
  
  // Return the deleted page info for cache invalidation
  return page;
}

/**
 * List all pages in a project
 * Validates account access before listing
 */
export async function listProjectPages(projectId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Verify user has access to this project
  await verifyProjectAccess(projectId, user.id);

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
 * Validates account access
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
 * Set a page as the homepage
 * Validates account access before update
 */
export async function setPageAsHomepage(pageId: string, projectId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Verify user has access to this project
  const accountId = await verifyProjectAccess(projectId, user.id);

  // Get all pages to update metadata properly
  const { data: pages } = await supabase
    .from('pages')
    .select('id, metadata')
    .eq('project_id', projectId);

  // Update all pages: unset homepage for all except the selected one
  if (pages) {
    for (const page of pages) {
      const updatedMetadata = {
        ...(page.metadata || {}),
        isHomepage: page.id === pageId
      };
      
      await supabase
        .from('pages')
        .update({ metadata: updatedMetadata })
        .eq('id', page.id);
    }
  }

  // Get the updated page to return
  const { data, error } = await supabase
    .from('pages')
    .select()
    .eq('id', pageId)
    .single();

  if (error) throw error;

  // Log the action
  await logPageAction('set_homepage', pageId, projectId, accountId, { 
    previous_homepage: 'unset' 
  });

  return data as Page;
}

/**
 * Get page content for preview
 * Uses published_sections instead of sections
 * Validates account access
 */
export async function getPageForPreview(projectId: string, path: string = '/') {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Verify user has access to this project
  await verifyProjectAccess(projectId, user.id);

  const { data, error } = await supabase
    .from('pages')
    .select(`
      id,
      project_id,
      path,
      title,
      published_sections,
      metadata,
      created_at,
      updated_at,
      projects!inner(
        id,
        name,
        account_id
      )
    `)
    .eq('project_id', projectId)
    .eq('path', path)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  
  if (!data) return null;
  
  // Return with sections mapped from published_sections
  return {
    ...data,
    sections: data.published_sections || [],
    projects: Array.isArray(data.projects) ? data.projects[0] : data.projects
  } as PageWithProject;
}

/**
 * Publish a page (copy sections to published_sections)
 * Validates account access before publishing
 */
export async function publishPage(pageId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get the page to verify access
  const { data: page } = await supabase
    .from('pages')
    .select('project_id, sections')
    .eq('id', pageId)
    .single();
    
  if (!page) {
    throw new Error('Page not found');
  }

  // Verify user has access to this project
  const accountId = await verifyProjectAccess(page.project_id, user.id);

  // Update published_sections with current sections
  const { data, error } = await supabase
    .from('pages')
    .update({
      published_sections: page.sections || [],
      updated_at: new Date().toISOString()
    })
    .eq('id', pageId)
    .select()
    .single();

  if (error) throw error;

  // Log the action
  await logPageAction('publish', pageId, page.project_id, accountId, { 
    section_count: page.sections?.length || 0
  });

  return data as Page;
}

/**
 * Get pages by account (for cross-project views)
 * Only available to platform admins/staff
 */
export async function getPagesByAccount(accountId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Only platform admins/staff can view across projects
  const isPlatformAdmin = await isAdmin(user.id);
  const isPlatformStaff = await isStaff(user.id);
  
  if (!isPlatformAdmin && !isPlatformStaff) {
    throw new Error('Access denied: Platform admin or staff role required');
  }

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
    .eq('projects.account_id', accountId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as PageWithProject[];
}

/**
 * Log page actions to audit_logs
 * Now accepts account_id parameter to avoid extra queries
 */
async function logPageAction(
  action: string,
  pageId: string,
  projectId: string,
  accountId: string,
  metadata?: Record<string, unknown>
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try {
    await supabase
      .from('audit_logs')
      .insert({
        account_id: accountId,
        user_id: user.id,
        action: `page:${action}`,
        resource_type: 'page',
        resource_id: pageId,
        metadata: {
          project_id: projectId,
          ...(metadata || {})
        }
      });
  } catch (error) {
    console.error('Failed to log page action:', error);
  }
}

/**
 * Duplicate a page
 * Creates a copy of a page with a new path
 */
export async function duplicatePage(pageId: string, newPath: string, newTitle?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get the original page
  const { data: originalPage } = await supabase
    .from('pages')
    .select('*')
    .eq('id', pageId)
    .single();
    
  if (!originalPage) {
    throw new Error('Page not found');
  }

  // Verify user has access to this project
  const accountId = await verifyProjectAccess(originalPage.project_id, user.id);

  // Create the duplicate
  const { data, error } = await supabase
    .from('pages')
    .insert({
      project_id: originalPage.project_id,
      path: newPath,
      title: newTitle || `${originalPage.title} (Copy)`,
      sections: originalPage.sections || [],
      published_sections: originalPage.published_sections || [],
      metadata: {
        ...(originalPage.metadata || {}),
        duplicatedFrom: pageId,
        duplicatedAt: new Date().toISOString()
      }
    })
    .select()
    .single();

  if (error) throw error;

  // Log the action
  await logPageAction('duplicate', data.id, originalPage.project_id, accountId, { 
    source_page_id: pageId,
    new_path: newPath,
    new_title: newTitle
  });

  return data as Page;
}

/**
 * Save draft content (alias for updatePage that only updates sections)
 */
export async function saveDraftPage(pageId: string, sections: Section[]) {
  return updatePage(pageId, { sections });
}

/**
 * Publish page draft (alias for publishPage)
 * Kept for backward compatibility
 */
export async function publishPageDraft(pageId: string) {
  return publishPage(pageId);
}

/**
 * Check if a page has unpublished changes
 * Compares sections with published_sections
 */
export async function pageHasUnpublishedChanges(pageId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: page, error } = await supabase
    .from('pages')
    .select('sections, published_sections, project_id')
    .eq('id', pageId)
    .single();

  if (error) throw error;
  if (!page) return false;

  // Verify user has access (will throw if no access)
  await verifyProjectAccess(page.project_id, user.id);

  // Compare sections with published_sections
  return JSON.stringify(page.sections) !== JSON.stringify(page.published_sections);
}