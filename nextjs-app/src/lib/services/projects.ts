import { supabase } from '@/lib/supabase/client';
import type { Project, Account } from '@/types/database';
import { isAdmin, isStaff } from '@/lib/permissions';

export interface ProjectWithAccount extends Project {
  accounts?: Account;
}

export interface CreateProjectData {
  name: string;
  account_id: string;
  slug?: string;
  template_id?: string | null;
}

export interface UpdateProjectData {
  name?: string;
  slug?: string;
  description?: string | null;
  theme_id?: string | null;
  theme_overrides?: Record<string, unknown> | null;
}

/**
 * Get all projects across all accounts (admin/staff only)
 */
export async function getAllProjects(includeArchived = false) {
  const response = await fetch(`/api/projects?includeArchived=${includeArchived}`, {
    method: 'GET',
    credentials: 'include', // Include cookies for authentication
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated');
    }
    if (response.status === 403) {
      throw new Error('Insufficient permissions');
    }
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch projects');
  }

  const data = await response.json();
  return data as ProjectWithAccount[];
}

/**
 * Get a single project by ID with account info
 */
export async function getProjectById(projectId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      accounts(
        id,
        name,
        slug,
        plan
      )
    `)
    .eq('id', projectId)
    .single();

  if (error) throw error;
  return data as ProjectWithAccount;
}

/**
 * Create a new project with account assignment
 */
export async function createProject(projectData: CreateProjectData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check permissions
  const isAdminUser = await isAdmin(user.id);
  const isStaffUser = await isStaff(user.id);
  
  // Check if user is account owner of the target account
  const { data: accountUser } = await supabase
    .from('account_users')
    .select('role')
    .eq('user_id', user.id)
    .eq('account_id', projectData.account_id)
    .eq('role', 'account_owner')
    .single();
  
  const isAccountOwner = !!accountUser;
  
  console.log('Permission check:', { 
    userId: user.id, 
    isAdmin: isAdminUser, 
    isStaff: isStaffUser,
    isAccountOwner,
    targetAccountId: projectData.account_id
  });
  
  const canCreate = isAdminUser || isStaffUser || isAccountOwner;
  if (!canCreate) throw new Error('Insufficient permissions');

  const insertData = {
    ...projectData,
    created_by: user.id,
    customer_id: user.id // Set to user.id to satisfy foreign key constraint
  };
  
  console.log('Attempting to create project with data:', insertData);

  const { data, error } = await supabase
    .from('projects')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Failed to create project:', error);
    throw error;
  }
  
  // Log the action (wrapped in try-catch to prevent cascading failures)
  try {
    await logProjectAction('create', data.id, { project_name: data.name });
  } catch (logError) {
    console.error('Failed to log project creation:', logError);
    // Continue despite logging failure
  }
  
  return data as Project;
}

/**
 * Update project details
 */
export async function updateProject(projectId: string, updates: UpdateProjectData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // If updating slug, check for uniqueness
  if (updates.slug) {
    const { data: existingProject } = await supabase
      .from('projects')
      .select('id')
      .eq('slug', updates.slug)
      .neq('id', projectId) // Exclude current project
      .single();
    
    if (existingProject) {
      throw new Error('This slug is already in use. Preview domain must be unique.');
    }
  }

  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    // Handle unique constraint violation
    if (error.code === '23505' && error.message.includes('projects_slug_unique')) {
      throw new Error('This slug is already in use. Preview domain must be unique.');
    }
    throw error;
  }
  
  // Log the action
  await logProjectAction('update', projectId, { updates });
  
  return data as Project;
}

/**
 * Archive a project (soft delete)
 */
export async function archiveProject(projectId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user is admin or account owner of the project
  const isAdminUser = await isAdmin(user.id);
  
  // Get project to check ownership
  const project = await getProjectById(projectId);
  
  // Check if user is account owner of the project's account
  const { data: accountUser } = await supabase
    .from('account_users')
    .select('role')
    .eq('user_id', user.id)
    .eq('account_id', project.account_id)
    .eq('role', 'account_owner')
    .single();
  
  const isAccountOwner = !!accountUser;
  
  const canArchive = isAdminUser || isAccountOwner;
  if (!canArchive) throw new Error('Only admins or account owners can archive projects');

  const { data, error } = await supabase
    .from('projects')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', projectId)
    .select()
    .single();

  if (error) throw error;
  
  // Log the action
  await logProjectAction('archive', projectId);
  
  return data as Project;
}

/**
 * Restore an archived project
 */
export async function restoreProject(projectId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user is admin or account owner of the project
  const isAdminUser = await isAdmin(user.id);
  
  // Get project to check ownership
  const project = await getProjectById(projectId);
  
  // Check if user is account owner of the project's account
  const { data: accountUser } = await supabase
    .from('account_users')
    .select('role')
    .eq('user_id', user.id)
    .eq('account_id', project.account_id)
    .eq('role', 'account_owner')
    .single();
  
  const isAccountOwner = !!accountUser;
  
  const canRestore = isAdminUser || isAccountOwner;
  if (!canRestore) throw new Error('Only admins or account owners can restore projects');

  const { data, error } = await supabase
    .from('projects')
    .update({ archived_at: null })
    .eq('id', projectId)
    .select()
    .single();

  if (error) throw error;
  
  // Log the action
  await logProjectAction('restore', projectId);
  
  return data as Project;
}

/**
 * Delete a project permanently (hard delete)
 */
export async function deleteProject(projectId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // First, get project info for logging and ownership check
  const project = await getProjectById(projectId);

  // Check if user is admin or account owner of the project
  const isAdminUser = await isAdmin(user.id);
  
  // Check if user is account owner of the project's account
  const { data: accountUser } = await supabase
    .from('account_users')
    .select('role')
    .eq('user_id', user.id)
    .eq('account_id', project.account_id)
    .eq('role', 'account_owner')
    .single();
  
  const isAccountOwner = !!accountUser;
  
  const canDelete = isAdminUser || isAccountOwner;
  if (!canDelete) throw new Error('Only admins or account owners can delete projects');
  
  // Store account_id before deletion for logging
  const accountId = project.account_id;
  
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) throw error;
  
  // Log the action with stored account_id
  try {
    await supabase
      .from('audit_logs')
      .insert({
        account_id: accountId,
        user_id: user.id,
        action: 'project:delete',
        resource_type: 'project',
        resource_id: projectId,
        metadata: { project_name: project.name }
      });
  } catch (logError) {
    console.error('Failed to log project deletion:', logError);
    // Continue despite logging failure
  }
}

/**
 * Clone an existing project as a template
 */
export async function cloneProject(sourceProjectId: string, newName: string, targetAccountId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check permissions
  const canClone = await isAdmin(user.id) || await isStaff(user.id);
  if (!canClone) throw new Error('Insufficient permissions');

  // Get source project
  const sourceProject = await getProjectById(sourceProjectId);
  
  // Create new project based on source
  const newProject = await createProject({
    name: newName,
    account_id: targetAccountId,
    template_id: sourceProjectId
  });

  // Copy theme settings if any
  if (sourceProject.theme_id || sourceProject.theme_overrides) {
    await updateProject(newProject.id, {
      theme_id: sourceProject.theme_id,
      theme_overrides: sourceProject.theme_overrides
    });
  }

  // TODO: Copy pages and sections when those services are ready
  
  // Log the action
  await logProjectAction('clone', newProject.id, { 
    source_project_id: sourceProjectId,
    source_project_name: sourceProject.name 
  });
  
  return newProject;
}

/**
 * Get projects by account ID
 */
export async function getProjectsByAccount(accountId: string, includeArchived = false) {
  let query = supabase
    .from('projects')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false });

  if (!includeArchived) {
    query = query.is('archived_at', null);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Project[];
}

/**
 * Get project templates (projects marked as templates)
 */
export async function getProjectTemplates() {
  // For now, return projects that have been used as templates
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .not('template_id', 'is', null)
    .is('archived_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Get unique template projects
  const templateIds = [...new Set(data?.map(p => p.template_id))];
  
  if (templateIds.length === 0) return [];
  
  const { data: templates, error: templateError } = await supabase
    .from('projects')
    .select('*')
    .in('id', templateIds);

  if (templateError) throw templateError;
  return templates as Project[];
}

/**
 * Reassign a project to a different account
 */
export async function reassignProjectAccount(projectId: string, newAccountId: string, reason?: string) {
  const response = await fetch(`/api/projects/${projectId}/account`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      account_id: newAccountId,
      reason
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to reassign project account');
  }

  const data = await response.json();
  return data.project as ProjectWithAccount;
}

/**
 * Get all accounts (for admin/staff use in dropdowns)
 */
export async function getAllAccounts() {
  const response = await fetch('/api/accounts', {
    method: 'GET',
    credentials: 'include', // Include cookies for authentication
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated');
    }
    if (response.status === 403) {
      throw new Error('Insufficient permissions');
    }
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch accounts');
  }

  const data = await response.json();
  return data as Account[];
}

/**
 * Log project actions for audit trail
 */
async function logProjectAction(action: string, projectId: string, metadata?: Record<string, unknown>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Get project's account ID
  const { data: project } = await supabase
    .from('projects')
    .select('account_id')
    .eq('id', projectId)
    .single();

  if (!project?.account_id) return;

  await supabase
    .from('audit_logs')
    .insert({
      account_id: project.account_id,
      user_id: user.id,
      action: `project:${action}`,
      resource_type: 'project',
      resource_id: projectId,
      metadata: metadata || {}
    });
}