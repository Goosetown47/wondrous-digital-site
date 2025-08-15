import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  archiveProject,
  restoreProject,
  deleteProject,
  cloneProject,
  getProjectsByAccount,
  getProjectTemplates,
  reassignProjectAccount,
  getAllAccounts,
  type UpdateProjectData,
} from '@/lib/services/projects';
import { toast } from 'sonner';

/**
 * Hook to fetch all projects (admin/staff only)
 */
export function useProjects(includeArchived = false) {
  return useQuery({
    queryKey: ['projects', 'all', { includeArchived }],
    queryFn: () => getAllProjects(includeArchived),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch a single project
 */
export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => projectId ? getProjectById(projectId) : null,
    enabled: !!projectId,
  });
}

/**
 * Hook to fetch projects by account
 */
export function useAccountProjects(accountId: string | undefined, includeArchived = true) {
  return useQuery({
    queryKey: ['projects', 'account', accountId, { includeArchived }],
    queryFn: () => accountId ? getProjectsByAccount(accountId, includeArchived) : [],
    enabled: !!accountId,
  });
}

/**
 * Hook to fetch project templates
 */
export function useProjectTemplates() {
  return useQuery({
    queryKey: ['projects', 'templates'],
    queryFn: getProjectTemplates,
  });
}

/**
 * Hook to create a new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: (data) => {
      // Invalidate all project queries
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      // Invalidate project access queries so dropdowns update
      queryClient.invalidateQueries({ queryKey: ['account-projects-with-access'] });
      queryClient.invalidateQueries({ queryKey: ['user-project-count'] });
      toast.success(`Project "${data.name}" created successfully`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create project');
    },
  });
}

/**
 * Hook to update a project
 */
export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: UpdateProjectData) => updateProject(projectId, updates),
    onSuccess: (data) => {
      // Update the specific project in cache
      queryClient.setQueryData(['projects', projectId], data);
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: ['projects', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'account'] });
      // Invalidate project access queries so dropdowns update
      queryClient.invalidateQueries({ queryKey: ['account-projects-with-access'] });
      queryClient.invalidateQueries({ queryKey: ['user-project-count'] });
      toast.success('Project updated successfully');
    },
    onError: (error) => {
      // Don't show toast for slug errors - they're handled inline
      if (error instanceof Error && !error.message.includes('slug is already in use')) {
        toast.error(error.message);
      } else if (!(error instanceof Error)) {
        toast.error('Failed to update project');
      }
    },
  });
}

/**
 * Hook to archive a project
 */
export function useArchiveProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveProject,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      // Invalidate project access queries so dropdowns update
      queryClient.invalidateQueries({ queryKey: ['account-projects-with-access'] });
      queryClient.invalidateQueries({ queryKey: ['user-project-count'] });
      toast.success(`Project "${data.name}" archived`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to archive project');
    },
  });
}

/**
 * Hook to restore an archived project
 */
export function useRestoreProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreProject,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      // Invalidate project access queries so dropdowns update
      queryClient.invalidateQueries({ queryKey: ['account-projects-with-access'] });
      queryClient.invalidateQueries({ queryKey: ['user-project-count'] });
      toast.success(`Project "${data.name}" restored`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to restore project');
    },
  });
}

/**
 * Hook to delete a project permanently
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      // Invalidate all project-related queries
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      // Invalidate project access queries so dropdowns update
      queryClient.invalidateQueries({ queryKey: ['account-projects-with-access'] });
      queryClient.invalidateQueries({ queryKey: ['user-project-count'] });
      toast.success('Project deleted permanently');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete project');
    },
  });
}

/**
 * Hook to clone a project
 */
export function useCloneProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sourceProjectId, newName, targetAccountId }: {
      sourceProjectId: string;
      newName: string;
      targetAccountId: string;
    }) => cloneProject(sourceProjectId, newName, targetAccountId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      // Invalidate project access queries so dropdowns update
      queryClient.invalidateQueries({ queryKey: ['account-projects-with-access'] });
      queryClient.invalidateQueries({ queryKey: ['user-project-count'] });
      toast.success(`Project cloned as "${data.name}"`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to clone project');
    },
  });
}

/**
 * Hook to reassign project to different account
 */
export function useReassignProjectAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, newAccountId, reason }: {
      projectId: string;
      newAccountId: string;
      reason?: string;
    }) => reassignProjectAccount(projectId, newAccountId, reason),
    onSuccess: (data) => {
      // Update the specific project in cache
      queryClient.setQueryData(['projects', data.id], data);
      // Invalidate list queries to refresh the display
      queryClient.invalidateQueries({ queryKey: ['projects', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'account'] });
      // Invalidate project access queries so dropdowns update
      queryClient.invalidateQueries({ queryKey: ['account-projects-with-access'] });
      queryClient.invalidateQueries({ queryKey: ['user-project-count'] });
      toast.success(`Project reassigned to "${data.accounts?.name}"`)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to reassign project');
    },
  });
}

/**
 * Hook to fetch all accounts for dropdowns
 */
export function useAccounts() {
  return useQuery({
    queryKey: ['accounts', 'all'],
    queryFn: getAllAccounts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}