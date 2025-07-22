import React, { useEffect, useState } from 'react';
import { Activity, AlertCircle, CheckCircle, Clock, Loader2, RefreshCw, ExternalLink } from 'lucide-react';
import { deploymentQueueService, QueuedDeployment } from '../../services/deploymentQueueService';
import { formatDistanceToNow } from 'date-fns';

interface DeploymentHistoryProps {
  projectId: string;
  limit?: number;
  className?: string;
}

const DeploymentHistory: React.FC<DeploymentHistoryProps> = ({ 
  projectId, 
  limit = 5, 
  className = '' 
}) => {
  const [deployments, setDeployments] = useState<QueuedDeployment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeployments = async () => {
    try {
      const data = await deploymentQueueService.getProjectDeployments(projectId, limit);
      setDeployments(data);
    } catch (error) {
      console.error('Error fetching deployment history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployments();
    
    // Refresh every 30 seconds if there are active deployments
    const interval = setInterval(() => {
      const hasActive = deployments.some(d => 
        d.status === 'queued' || d.status === 'processing'
      );
      if (hasActive) {
        fetchDeployments();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [projectId, limit]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (deployment: QueuedDeployment) => {
    switch (deployment.status) {
      case 'queued':
        return 'Queued';
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Deployed';
      case 'failed':
        return `Failed${deployment.attempt_count > 1 ? ` (${deployment.attempt_count} attempts)` : ''}`;
      default:
        return deployment.status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'processing':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'completed':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">Deployment History</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (deployments.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">Deployment History</h3>
        </div>
        <div className="text-center py-8">
          <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No deployments yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Deployment History</h3>
        <button
          onClick={fetchDeployments}
          className="text-gray-400 hover:text-gray-600"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        {deployments.map((deployment) => {
          const statusColor = getStatusColor(deployment.status);
          const deploymentUrl = deployment.payload?.deploymentResult?.deployment_url;
          
          return (
            <div
              key={deployment.id}
              className={`p-3 rounded-lg border ${statusColor}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getStatusIcon(deployment.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {getStatusText(deployment)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {deployment.completed_at || deployment.started_at
                        ? formatDistanceToNow(
                            new Date(deployment.completed_at || deployment.started_at || deployment.created_at),
                            { addSuffix: true }
                          )
                        : 'Just now'}
                    </p>
                    {deployment.error_message && (
                      <p className="text-xs text-red-600 mt-1">
                        {deployment.error_message}
                      </p>
                    )}
                  </div>
                </div>
                
                {deployment.status === 'completed' && deploymentUrl && (
                  <a
                    href={deploymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-3 text-blue-600 hover:text-blue-700"
                    title="View deployment"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {deployments.length >= limit && (
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            Showing last {limit} deployments
          </p>
        </div>
      )}
    </div>
  );
};

export default DeploymentHistory;