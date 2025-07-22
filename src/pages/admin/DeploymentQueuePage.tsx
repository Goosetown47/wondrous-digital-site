import React, { useState, useEffect } from 'react';
import { deploymentQueueService, QueuedDeployment } from '../../services/deploymentQueueService';
import { supabase } from '../../utils/supabase';
import { useToast } from '../../contexts/ToastContext';
import DeploymentQueueStatus from '../../components/admin/DeploymentQueueStatus';
import DeploymentLogsModal from '../../components/admin/DeploymentLogsModal';
import { 
  Clock, Activity, CheckCircle, AlertTriangle, RefreshCw, Trash2, 
  Play, Search, Filter, Download, X, Eye, Loader2
} from 'lucide-react';

interface Project {
  id: string;
  project_name: string;
  subdomain: string | null;
}

const DeploymentQueuePage: React.FC = () => {
  const [deployments, setDeployments] = useState<QueuedDeployment[]>([]);
  const [projects, setProjects] = useState<Map<string, Project>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedDeployments, setSelectedDeployments] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string[]>(['queued', 'processing', 'failed']);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLogs, setShowLogs] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { addToast } = useToast();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 50;

  useEffect(() => {
    fetchDeployments();
  }, [statusFilter, currentPage]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('id, project_name, subdomain');
    
    if (data) {
      const projectMap = new Map(data.map(p => [p.id, p]));
      setProjects(projectMap);
    }
  };

  const fetchDeployments = async () => {
    setLoading(true);
    try {
      const { data, count } = await deploymentQueueService.getAllDeployments({
        status: statusFilter,
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage
      });
      
      setDeployments(data);
      setTotalCount(count);
    } catch (error) {
      console.error('Error fetching deployments:', error);
      addToast('Failed to fetch deployments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDeployment = async (deploymentId: string) => {
    try {
      await deploymentQueueService.cancelDeployment(deploymentId);
      addToast('Deployment cancelled', 'success');
      fetchDeployments();
    } catch (error) {
      console.error('Error cancelling deployment:', error);
      addToast('Failed to cancel deployment', 'error');
    }
  };

  const handleRetryDeployment = async (deploymentId: string) => {
    try {
      await deploymentQueueService.retryDeployment(deploymentId);
      addToast('Deployment queued for retry', 'success');
      fetchDeployments();
    } catch (error) {
      console.error('Error retrying deployment:', error);
      addToast('Failed to retry deployment', 'error');
    }
  };

  const handleDeleteDeployment = async (deploymentId: string) => {
    if (!confirm('Are you sure you want to delete this deployment record?')) return;
    
    try {
      await deploymentQueueService.deleteDeployment(deploymentId);
      addToast('Deployment deleted', 'success');
      fetchDeployments();
    } catch (error) {
      console.error('Error deleting deployment:', error);
      addToast('Failed to delete deployment', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedDeployments.size} deployment records?`)) return;
    
    setIsProcessing(true);
    try {
      await deploymentQueueService.deleteDeployments(Array.from(selectedDeployments));
      addToast(`Deleted ${selectedDeployments.size} deployments`, 'success');
      setSelectedDeployments(new Set());
      fetchDeployments();
    } catch (error) {
      console.error('Error deleting deployments:', error);
      addToast('Failed to delete deployments', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearOld = async () => {
    const days = prompt('Delete completed/failed deployments older than how many days?', '7');
    if (!days) return;
    
    setIsProcessing(true);
    try {
      const count = await deploymentQueueService.clearOldDeployments(parseInt(days));
      addToast(`Deleted ${count} old deployments`, 'success');
      fetchDeployments();
    } catch (error) {
      console.error('Error clearing old deployments:', error);
      addToast('Failed to clear old deployments', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTriggerProcessing = async () => {
    setIsProcessing(true);
    try {
      await deploymentQueueService.triggerQueueProcessing();
      addToast('Queue processing triggered', 'success');
      setTimeout(fetchDeployments, 2000); // Refresh after 2 seconds
    } catch (error) {
      console.error('Error triggering queue:', error);
      addToast('Failed to trigger queue processing', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Activity className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      'queued': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${configs[status] || 'bg-gray-100 text-gray-800'}`}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </span>
    );
  };

  const getTimeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const filteredDeployments = deployments.filter(deployment => {
    if (searchTerm) {
      const project = projects.get(deployment.project_id);
      const searchLower = searchTerm.toLowerCase();
      return (
        deployment.id.toLowerCase().includes(searchLower) ||
        project?.project_name.toLowerCase().includes(searchLower) ||
        deployment.payload.subdomain?.toLowerCase().includes(searchLower) ||
        deployment.payload.deployment_domain?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Deployment Queue</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and monitor all deployment operations
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleClearOld}
              disabled={isProcessing}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Old
            </button>
            <button
              onClick={handleTriggerProcessing}
              disabled={isProcessing}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Process Queue
            </button>
          </div>
        </div>
      </div>

      {/* Queue Status */}
      <div className="mb-6">
        <DeploymentQueueStatus />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search deployments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">Status:</span>
            {['queued', 'processing', 'completed', 'failed'].map(status => (
              <label key={status} className="flex items-center">
                <input
                  type="checkbox"
                  checked={statusFilter.includes(status)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setStatusFilter([...statusFilter, status]);
                    } else {
                      setStatusFilter(statusFilter.filter(s => s !== status));
                    }
                    setCurrentPage(1);
                  }}
                  className="mr-1.5 h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm capitalize">{status}</span>
              </label>
            ))}
          </div>
        </div>

        {selectedDeployments.size > 0 && (
          <button
            onClick={handleBulkDelete}
            disabled={isProcessing}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected ({selectedDeployments.size})
          </button>
        )}
      </div>

      {/* Deployments Table */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
              <p className="mt-4 text-gray-500">Loading deployments...</p>
            </div>
          </div>
        ) : filteredDeployments.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No deployments found</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedDeployments.size === filteredDeployments.length && filteredDeployments.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDeployments(new Set(filteredDeployments.map(d => d.id)));
                        } else {
                          setSelectedDeployments(new Set());
                        }
                      }}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Attempts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDeployments.map((deployment) => {
                  const project = projects.get(deployment.project_id);
                  const duration = deployment.completed_at && deployment.started_at
                    ? Math.floor((new Date(deployment.completed_at).getTime() - new Date(deployment.started_at).getTime()) / 1000)
                    : null;
                  
                  return (
                    <tr key={deployment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedDeployments.has(deployment.id)}
                          onChange={(e) => {
                            const newSelection = new Set(selectedDeployments);
                            if (e.target.checked) {
                              newSelection.add(deployment.id);
                            } else {
                              newSelection.delete(deployment.id);
                            }
                            setSelectedDeployments(newSelection);
                          }}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(deployment.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {project?.project_name || 'Unknown Project'}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {deployment.project_id.slice(0, 8)}...
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {deployment.payload.subdomain && (
                            <span className="text-gray-700">{deployment.payload.subdomain}.</span>
                          )}
                          <span className="text-gray-900">{deployment.payload.deployment_domain}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {getTimeSince(deployment.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {duration !== null ? `${duration}s` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {deployment.attempt_count}/{deployment.max_attempts}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {deployment.status === 'queued' && (
                            <button
                              onClick={() => handleCancelDeployment(deployment.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Cancel deployment"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                          {deployment.status === 'failed' && (
                            <button
                              onClick={() => handleRetryDeployment(deployment.id)}
                              className="text-blue-600 hover:text-blue-700"
                              title="Retry deployment"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setShowLogs(deployment.id)}
                            className="text-gray-600 hover:text-gray-700"
                            title="View logs"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {['completed', 'failed'].includes(deployment.status) && (
                            <button
                              onClick={() => handleDeleteDeployment(deployment.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Delete record"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} deployments
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Deployment Logs Modal */}
      {showLogs && (
        <DeploymentLogsModal
          deploymentId={showLogs}
          onClose={() => setShowLogs(null)}
        />
      )}
    </div>
  );
};

export default DeploymentQueuePage;