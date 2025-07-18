import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { FolderPlus, Search, Filter, FileText, Archive, Activity, Globe, Copy, Trash2, Eye, Rocket, Pause, Edit, Layout } from 'lucide-react';
import StatusDropdown from '../../components/admin/StatusDropdown';
import ActionButton from '../../components/admin/ActionButton';
import { useToast } from '../../contexts/ToastContext';
import BulkActionsDropdown, { BulkAction } from '../../components/admin/BulkActionsDropdown';
import BulkOperationModal from '../../components/admin/BulkOperationModal';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal';
import CreateProjectModal from '../../components/admin/CreateProjectModal';
import CloneProjectModal from '../../components/admin/CloneProjectModal';
import DeployProjectModal from '../../components/admin/DeployProjectModal';
import EditProjectModal from '../../components/admin/EditProjectModal';
import ConvertToTemplateModal from '../../components/admin/ConvertToTemplateModal';
import { statusChangeSchema, validateStatusTransition, bulkStatusChangeSchema } from '../../schemas';

interface Project {
  id: string;
  project_name: string;
  project_status: 'draft' | 'template-internal' | 'template-public' | 'prospect-staging' | 'live-customer' | 'paused-maintenance' | 'archived';
  project_type: string;
  domain: string | null;
  subdomain: string | null;
  deployment_domain?: string | null;
  deployment_status: string;
  deployment_url: string | null;
  netlify_site_id?: string | null;
  last_deployed_at: string | null;
  created_at: string;
  updated_at: string;
  customer_id: string | null;
  business_name: string | null;
  account_type: 'prospect' | 'customer' | 'inactive' | null;
  contact_email: string | null;
  custom_domains?: string[];
  computed_deployment_url?: string | null;
  tab_category: 'draft' | 'templates' | 'active' | 'paused' | 'archive';
}

type TabType = 'draft' | 'templates' | 'active' | 'paused' | 'archive';

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('draft');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [accountFilter] = useState<string>('');
  const [tabCounts, setTabCounts] = useState<Record<TabType, number>>({
    draft: 0,
    templates: 0,
    active: 0,
    paused: 0,
    archive: 0
  });
  const [bulkOperationModal, setBulkOperationModal] = useState<{
    isOpen: boolean;
    operation: BulkAction | null;
  }>({ isOpen: false, operation: null });
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    project: Project | null;
  }>({ isOpen: false, project: null });
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);
  const [cloneModal, setCloneModal] = useState<{
    isOpen: boolean;
    sourceProject: Project | null;
  }>({ isOpen: false, sourceProject: null });
  const [deployModal, setDeployModal] = useState<{
    isOpen: boolean;
    project: Project | null;
  }>({ isOpen: false, project: null });
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    project: Project | null;
  }>({ isOpen: false, project: null });
  const [convertModal, setConvertModal] = useState<{
    isOpen: boolean;
    project: Project | null;
  }>({ isOpen: false, project: null });
  const { addToast } = useToast();

  // Fetch tab counts on mount
  useEffect(() => {
    fetchTabCounts();
  }, []);

  // Fetch projects based on active tab
  useEffect(() => {
    fetchProjects();
  }, [activeTab, accountFilter]);

  const fetchTabCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('project_management_view')
        .select('project_status');

      if (error) throw error;

      const counts = {
        draft: 0,
        templates: 0,
        active: 0,
        paused: 0,
        archive: 0
      };

      data?.forEach(project => {
        if (project.project_status === 'draft') counts.draft++;
        else if (project.project_status === 'template-internal' || project.project_status === 'template-public') counts.templates++;
        else if (project.project_status === 'prospect-staging' || project.project_status === 'live-customer') counts.active++;
        else if (project.project_status === 'paused-maintenance') counts.paused++;
        else if (project.project_status === 'archived') counts.archive++;
      });

      setTabCounts(counts);
    } catch (error) {
      console.error('Error fetching tab counts:', error);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('project_management_view')
        .select('*');

      // Filter by tab using project_status
      if (activeTab === 'draft') {
        query = query.eq('project_status', 'draft');
      } else if (activeTab === 'templates') {
        query = query.in('project_status', ['template-internal', 'template-public']);
      } else if (activeTab === 'active') {
        query = query.in('project_status', ['prospect-staging', 'live-customer']);
      } else if (activeTab === 'paused') {
        query = query.eq('project_status', 'paused-maintenance');
      } else if (activeTab === 'archive') {
        query = query.eq('project_status', 'archived');
      }

      query = query.order('created_at', { ascending: false });

      // Apply account filter if selected
      if (accountFilter) {
        query = query.eq('customer_id', accountFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter projects based on search term
  const filteredProjects = projects.filter(project =>
    project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.business_name && project.business_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (project.domain && project.domain.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (project.subdomain && project.subdomain.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle bulk selection
  const handleSelectAll = () => {
    if (selectedProjects.size === filteredProjects.length) {
      setSelectedProjects(new Set());
    } else {
      setSelectedProjects(new Set(filteredProjects.map(p => p.id)));
    }
  };

  const handleSelectProject = (projectId: string) => {
    const newSelection = new Set(selectedProjects);
    if (newSelection.has(projectId)) {
      newSelection.delete(projectId);
    } else {
      newSelection.add(projectId);
    }
    setSelectedProjects(newSelection);
  };

  // Handle project status transitions
  const handleStatusChange = async (projectId: string, newStatus: Project['project_status']) => {
    console.log('Attempting to change project status:', { projectId, newStatus });
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('No authenticated user');

      // Get current project status for audit logging
      const { data: currentProject, error: fetchError } = await supabase
        .from('projects')
        .select('project_status')
        .eq('id', projectId)
        .single();

      if (fetchError) throw fetchError;

      // NEW: Parallel Zod validation for status change
      const statusChangeData = {
        project_id: projectId,
        new_status: newStatus
      };
      
      // Validate status change data structure
      const zodResult = statusChangeSchema.safeParse(statusChangeData);
      if (!zodResult.success) {
        // Log validation issues for debugging
        console.debug('Status change validation failed:', zodResult.error.format());
      }
      
      // DAY 3: Block invalid status transitions
      const transitionCheck = validateStatusTransition(currentProject.project_status, newStatus);
      if (!transitionCheck.valid) {
        // Invalid transition - log for debugging
        console.debug('Invalid status transition:', {
          from: currentProject.project_status,
          to: newStatus,
          message: transitionCheck.message
        });
        
        // Block the transition and show error
        addToast(transitionCheck.message || 'Invalid status transition', 'error');
        return;
      }

      // Update the project status directly
      const { data, error } = await supabase
        .from('projects')
        .update({ 
          project_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        throw error;
      }
      
      console.log('Status change successful:', data);
      
      // Log the status change
      const { error: historyError } = await supabase
        .from('project_status_history')
        .insert({
          project_id: projectId,
          old_status: currentProject.project_status,
          new_status: newStatus,
          changed_by: user.data.user.id,
          reason: 'Manual status change via admin interface'
        });
        
      if (historyError) {
        console.error('Failed to log status history:', historyError);
      }
      
      // Show success message
      const statusLabels: Record<Project['project_status'], string> = {
        'draft': 'Draft',
        'template-internal': 'Template (Internal)',
        'template-public': 'Template (Public)',
        'prospect-staging': 'Prospect Staging',
        'live-customer': 'Live Customer',
        'paused-maintenance': 'Maintenance',
        'archived': 'Archived'
      };
      // Determine which tab the project will be in
      const tabMap: Record<Project['project_status'], string> = {
        'draft': 'Draft',
        'template-internal': 'Templates',
        'template-public': 'Templates',
        'prospect-staging': 'Active',
        'live-customer': 'Active',
        'paused-maintenance': 'Paused/Maintenance',
        'archived': 'Archive'
      };
      
      const newTab = tabMap[newStatus];
      const projectName = projects.find(p => p.id === projectId)?.project_name || 'Project';
      
      if (newStatus === 'archived') {
        addToast(
          `${projectName} is now archived and can be found in the Archive tab`, 
          'success'
        );
      } else {
        addToast(
          `${projectName} has been set to ${statusLabels[newStatus]} in Supabase and is now in the ${newTab} tab`, 
          'success'
        );
      }
      
      // Refresh the list and counts
      await fetchProjects();
      await fetchTabCounts();
    } catch (error) {
      console.error('Error updating project status:', error);
      addToast(
        'Failed to update project status: ' + (error as Error).message, 
        'error'
      );
    }
  };

  // View project - navigate to Project page as customer would see it
  const handleViewProject = (projectId: string) => {
    navigate('/dashboard/content/project', { state: { projectId } });
  };

  // Edit project - open admin edit modal
  const handleEditProject = (project: Project) => {
    setEditModal({ isOpen: true, project });
  };

  // Clone project
  const handleCloneProject = (project: Project) => {
    setCloneModal({ isOpen: true, sourceProject: project });
  };

  // Convert to template
  const handleConvertToTemplate = (project: Project) => {
    setConvertModal({ isOpen: true, project });
  };

  // Handle bulk action selection
  const handleBulkAction = (action: BulkAction) => {
    setBulkOperationModal({ isOpen: true, operation: action });
  };

  // Get selected projects data
  const getSelectedProjectsData = () => {
    return projects.filter(p => selectedProjects.has(p.id));
  };

  // Determine allowed bulk actions based on selected projects
  const getAllowedBulkActions = () => {
    const selectedProjectsData = getSelectedProjectsData();
    
    return {
      changeStatus: selectedProjectsData.length > 0,
      archive: selectedProjectsData.some(p => p.project_status !== 'archived'),
      delete: selectedProjectsData.every(p => p.project_status === 'archived')
    };
  };

  // Handle bulk status change
  const handleBulkStatusChange = async (newStatus: Project['project_status']) => {
    setIsProcessingBulk(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('No authenticated user');

      const selectedProjectsData = getSelectedProjectsData();
      const projectIds = selectedProjectsData.map(p => p.id);
      
      // NEW: Parallel Zod validation for bulk status change
      const bulkChangeData = {
        project_ids: projectIds,
        new_status: newStatus
      };
      
      // Validate bulk operation data
      const zodResult = bulkStatusChangeSchema.safeParse(bulkChangeData);
      if (!zodResult.success) {
        console.debug('Bulk status change validation failed:', zodResult.error.format());
      }
      
      // Update all projects in a transaction-like manner
      const updatePromises = projectIds.map(async (projectId) => {
        const project = selectedProjectsData.find(p => p.id === projectId);
        if (!project) return null;

        // Update the project status
        const { error } = await supabase
          .from('projects')
          .update({ 
            project_status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', projectId);

        if (error) throw error;

        // Log the status change
        await supabase
          .from('project_status_history')
          .insert({
            project_id: projectId,
            old_status: project.project_status,
            new_status: newStatus,
            changed_by: user.data.user.id,
            reason: `Bulk status change via admin interface (${selectedProjectsData.length} projects)`
          });

        return { projectId, success: true };
      });

      const results = await Promise.allSettled(updatePromises);
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failureCount = results.filter(r => r.status === 'rejected').length;

      if (successCount > 0) {
        addToast(
          `Successfully updated ${successCount} project${successCount !== 1 ? 's' : ''} to ${newStatus}`,
          'success'
        );
      }

      if (failureCount > 0) {
        addToast(
          `Failed to update ${failureCount} project${failureCount !== 1 ? 's' : ''}`,
          'error'
        );
      }

      // Refresh the list and clear selections
      await fetchProjects();
      await fetchTabCounts();
      setSelectedProjects(new Set());
      setBulkOperationModal({ isOpen: false, operation: null });
    } catch (error) {
      console.error('Error in bulk status change:', error);
      addToast('Failed to update project statuses', 'error');
    } finally {
      setIsProcessingBulk(false);
    }
  };

  // Handle bulk archive
  const handleBulkArchive = async () => {
    await handleBulkStatusChange('archived');
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    setIsProcessingBulk(true);
    try {
      const selectedProjectsData = getSelectedProjectsData();
      const projectIds = selectedProjectsData.map(p => p.id);
      
      // Delete all projects
      const { error } = await supabase
        .from('projects')
        .delete()
        .in('id', projectIds);

      if (error) throw error;

      addToast(
        `Successfully deleted ${selectedProjectsData.length} project${selectedProjectsData.length !== 1 ? 's' : ''}`,
        'success'
      );

      // Refresh the list and clear selections
      await fetchProjects();
      await fetchTabCounts();
      setSelectedProjects(new Set());
      setBulkOperationModal({ isOpen: false, operation: null });
    } catch (error) {
      console.error('Error in bulk delete:', error);
      addToast('Failed to delete projects', 'error');
    } finally {
      setIsProcessingBulk(false);
    }
  };

  // Handle bulk operation confirm
  const handleBulkOperationConfirm = async (data: { newStatus?: string }) => {
    switch (bulkOperationModal.operation) {
      case 'change-status':
        await handleBulkStatusChange(data.newStatus as Project['project_status']);
        break;
      case 'archive':
        await handleBulkArchive();
        break;
      case 'delete':
        await handleBulkDelete();
        break;
    }
  };

  // Handle single project delete
  const handleDeleteProject = (project: Project) => {
    setDeleteModal({ isOpen: true, project });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteModal.project) return;

    setIsProcessingDelete(true);
    try {
      const project = deleteModal.project;

      // Check if project can be deleted based on business rules
      const canDelete = project.project_status === 'draft' || project.project_status === 'archived';
      
      if (!canDelete) {
        addToast(
          'This project cannot be deleted in its current status. Please archive it first.',
          'error'
        );
        return;
      }

      // Delete the project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (error) throw error;

      addToast(
        `${project.project_name} has been permanently deleted`,
        'success'
      );

      // Close modal and refresh data
      setDeleteModal({ isOpen: false, project: null });
      await fetchProjects();
      await fetchTabCounts();
      
      // Clear selection if deleted project was selected
      setSelectedProjects(prev => {
        const newSelection = new Set(prev);
        newSelection.delete(project.id);
        return newSelection;
      });

    } catch (error) {
      console.error('Error deleting project:', error);
      addToast('Failed to delete project: ' + (error as Error).message, 'error');
    } finally {
      setIsProcessingDelete(false);
    }
  };


  // Get deployment status badge
  const getDeploymentBadge = (status: string, netlifyId?: string | null) => {
    const hasDeployment = !!netlifyId;
    const deployConfig = {
      'deployed': { bg: 'bg-green-100', text: 'text-green-800', icon: Globe },
      'deploying': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Activity },
      'failed': { bg: 'bg-red-100', text: 'text-red-800', icon: FileText },
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FileText },
      'none': { bg: 'bg-gray-100', text: 'text-gray-800', icon: FileText }
    };

    const config = deployConfig[status] || deployConfig['none'];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </span>
    );
  };

  // Tab configuration
  const tabs = [
    { id: 'draft' as TabType, label: 'Draft', icon: FileText },
    { id: 'templates' as TabType, label: 'Templates', icon: Copy },
    { id: 'active' as TabType, label: 'Active', icon: Activity },
    { id: 'paused' as TabType, label: 'Paused/Maintenance', icon: Pause },
    { id: 'archive' as TabType, label: 'Archive', icon: Archive }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage all projects across their lifecycle stages
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            New Project
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                  ${isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tabCounts[tab.id] || 0}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>

        {selectedProjects.size > 0 && (
          <BulkActionsDropdown
            selectedCount={selectedProjects.size}
            onAction={handleBulkAction}
            allowedActions={getAllowedBulkActions()}
          />
        )}
      </div>

      {/* Projects List */}
      <div className="flex-1 min-h-0 flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading projects...</p>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No projects found</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-visible flex-1 flex flex-col">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProjects.size === filteredProjects.length && filteredProjects.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain/Subdomain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deployment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProjects.has(project.id)}
                        onChange={() => handleSelectProject(project.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {project.project_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {project.project_type}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {project.business_name || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap relative">
                      <StatusDropdown
                        value={project.project_status}
                        options={[
                          { value: 'draft' as const, label: 'Draft', color: 'bg-gray-100 text-gray-800' },
                          { value: 'template-internal' as const, label: 'Template (Internal)', color: 'bg-purple-100 text-purple-800' },
                          { value: 'template-public' as const, label: 'Template (Public)', color: 'bg-purple-100 text-purple-800' },
                          { value: 'prospect-staging' as const, label: 'Prospect Staging', color: 'bg-blue-100 text-blue-800' },
                          { value: 'live-customer' as const, label: 'Live Customer', color: 'bg-green-100 text-green-800' },
                          { value: 'paused-maintenance' as const, label: 'Maintenance', color: 'bg-yellow-100 text-yellow-800' },
                          { value: 'archived' as const, label: 'Archived', color: 'bg-gray-100 text-gray-800' }
                        ]}
                        onChange={(newStatus) => handleStatusChange(project.id, newStatus)}
                        onConfirm={() => {}}
                        confirmLabel="Update Status"
                        entityName={project.project_name}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        {project.computed_deployment_url || project.deployment_url ? (
                          <a 
                            href={project.computed_deployment_url || project.deployment_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                          >
                            <Globe className="h-3 w-3 mr-1" />
                            {project.subdomain ? `${project.subdomain}.` : ''}
                            {project.deployment_domain || 'wondrousdigital.com'}
                          </a>
                        ) : (
                          <span className="text-sm text-gray-500">
                            {project.subdomain || project.domain ? (
                              <>
                                {project.subdomain ? `${project.subdomain}.` : ''}
                                {project.deployment_domain || project.domain || 'wondrousdigital.com'}
                              </>
                            ) : (
                              '-'
                            )}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getDeploymentBadge(project.deployment_status, project.netlify_site_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(project.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-1">
                        <ActionButton
                          icon={Eye}
                          label="View Project"
                          onClick={() => handleViewProject(project.id)}
                        />
                        <ActionButton
                          icon={Edit}
                          label="Edit Project"
                          onClick={() => handleEditProject(project)}
                        />
                        <ActionButton
                          icon={Copy}
                          label="Clone Project"
                          onClick={() => handleCloneProject(project)}
                        />
                        {!['template-internal', 'template-public'].includes(project.project_status) && (
                          <ActionButton
                            icon={Layout}
                            label="Convert to Template"
                            onClick={() => handleConvertToTemplate(project)}
                          />
                        )}
                        {(!project.netlify_site_id || project.deployment_status !== 'deployed') && (
                          <ActionButton
                            icon={Rocket}
                            label="Deploy Project"
                            onClick={() => setDeployModal({ isOpen: true, project })}
                          />
                        )}
                        {(project.project_status === 'live-customer' || project.project_status === 'prospect-staging') && (
                          <ActionButton
                            icon={Pause}
                            label="Set to Maintenance"
                            onClick={() => handleStatusChange(project.id, 'paused-maintenance')}
                          />
                        )}
                        {project.project_status !== 'archived' && (
                          <ActionButton
                            icon={Archive}
                            label="Archive Project"
                            onClick={() => handleStatusChange(project.id, 'archived')}
                          />
                        )}
                        <ActionButton
                          icon={Trash2}
                          label="Delete Project"
                          variant="danger"
                          onClick={() => handleDeleteProject(project)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchProjects();
          fetchTabCounts();
          addToast('Project created successfully!', 'success');
        }}
      />

      {/* Bulk Operation Modal */}
      {bulkOperationModal.operation && (
        <BulkOperationModal
          isOpen={bulkOperationModal.isOpen}
          onClose={() => setBulkOperationModal({ isOpen: false, operation: null })}
          operation={bulkOperationModal.operation}
          projects={getSelectedProjectsData()}
          onConfirm={handleBulkOperationConfirm}
          isProcessing={isProcessingBulk}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, project: null })}
        project={deleteModal.project}
        onConfirm={handleDeleteConfirm}
        isProcessing={isProcessingDelete}
      />

      {/* Clone Project Modal */}
      <CloneProjectModal
        isOpen={cloneModal.isOpen}
        onClose={() => setCloneModal({ isOpen: false, sourceProject: null })}
        sourceProject={cloneModal.sourceProject}
        onSuccess={() => {
          fetchProjects();
          fetchTabCounts();
        }}
      />

      {/* Deploy Project Modal */}
      <DeployProjectModal
        isOpen={deployModal.isOpen}
        onClose={() => setDeployModal({ isOpen: false, project: null })}
        project={deployModal.project}
        onSuccess={() => {
          fetchProjects();
          fetchTabCounts();
        }}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, project: null })}
        project={editModal.project}
        onSuccess={() => {
          fetchProjects();
          fetchTabCounts();
        }}
      />

      {/* Convert to Template Modal */}
      <ConvertToTemplateModal
        isOpen={convertModal.isOpen}
        onClose={() => setConvertModal({ isOpen: false, project: null })}
        preselectedProject={convertModal.project}
        onSuccess={() => {
          fetchProjects();
          fetchTabCounts();
        }}
      />
      
    </div>
  );
};

export default ProjectsPage;