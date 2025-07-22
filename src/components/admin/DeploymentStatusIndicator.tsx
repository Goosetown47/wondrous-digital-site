import React, { useEffect, useState } from 'react';
import { Activity, AlertCircle, CheckCircle, Clock, Loader2, X } from 'lucide-react';
import { deploymentQueueService, QueuedDeployment, DeploymentEvent } from '../../services/deploymentQueueService';

interface DeploymentStatusIndicatorProps {
  deploymentId: string;
  onComplete?: (deployment: QueuedDeployment) => void;
  onFailed?: (deployment: QueuedDeployment) => void;
  showLogs?: boolean;
  className?: string;
}

const DeploymentStatusIndicator: React.FC<DeploymentStatusIndicatorProps> = ({
  deploymentId,
  onComplete,
  onFailed,
  showLogs = false,
  className = ''
}) => {
  const [deployment, setDeployment] = useState<QueuedDeployment | null>(null);
  const [queuePosition, setQueuePosition] = useState<number>(-1);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogsPanel, setShowLogsPanel] = useState(false);

  useEffect(() => {
    // Fetch initial deployment data
    const fetchDeployment = async () => {
      try {
        // Fetch the specific deployment by ID
        const { data, error } = await deploymentQueueService.getDeploymentById(deploymentId);
        
        if (error) {
          console.error('Error fetching deployment:', error);
          return;
        }
        
        if (data) {
          setDeployment(data);
          
          // Get queue position if queued
          if (data.status === 'queued') {
            const position = await deploymentQueueService.getQueuePosition(deploymentId);
            setQueuePosition(position);
          }
        }
      } catch (error) {
        console.error('Error fetching deployment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeployment();

    // Subscribe to updates
    const unsubscribe = deploymentQueueService.subscribeToDeployment(
      deploymentId,
      async (event: DeploymentEvent) => {
        if (event.deployment) {
          setDeployment(event.deployment);
          
          // Update queue position if still queued
          if (event.deployment.status === 'queued') {
            const position = await deploymentQueueService.getQueuePosition(deploymentId);
            setQueuePosition(position);
          } else {
            setQueuePosition(-1);
          }

          // Call callbacks
          if (event.deployment.status === 'completed' && onComplete) {
            onComplete(event.deployment);
          } else if (event.deployment.status === 'failed' && onFailed) {
            onFailed(event.deployment);
          }
        }

        if (event.log && showLogs) {
          setLogs(prev => [...prev, `[${event.log!.log_level}] ${event.log!.message}`]);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [deploymentId, onComplete, onFailed, showLogs]);

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 text-gray-500 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading deployment status...</span>
      </div>
    );
  }

  if (!deployment) {
    return (
      <div className={`flex items-center space-x-2 text-red-500 ${className}`}>
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">Deployment not found</span>
      </div>
    );
  }

  const getStatusDisplay = () => {
    switch (deployment.status) {
      case 'queued':
        return {
          icon: <Clock className="h-4 w-4 text-yellow-500" />,
          text: queuePosition > 0 ? `Queued (Position: ${queuePosition})` : 'Queued',
          color: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'processing':
        return {
          icon: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />,
          text: 'Deploying...',
          color: 'text-blue-700',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'completed':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          text: 'Deployed successfully',
          color: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'failed':
        return {
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          text: 'Deployment failed',
          color: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: <Activity className="h-4 w-4 text-gray-500" />,
          text: 'Unknown status',
          color: 'text-gray-700',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const status = getStatusDisplay();

  return (
    <div className={className}>
      <div 
        className={`flex items-center justify-between px-4 py-3 rounded-lg border ${status.bgColor} ${status.borderColor}`}
      >
        <div className="flex items-center space-x-3">
          {status.icon}
          <div>
            <p className={`text-sm font-medium ${status.color}`}>
              {status.text}
            </p>
            {deployment.error_message && (
              <p className="text-xs text-red-600 mt-1">
                {deployment.error_message}
              </p>
            )}
            {deployment.attempt_count > 1 && (
              <p className="text-xs text-gray-500 mt-1">
                Attempt {deployment.attempt_count} of {deployment.max_attempts}
              </p>
            )}
          </div>
        </div>

        {showLogs && logs.length > 0 && (
          <button
            onClick={() => setShowLogsPanel(!showLogsPanel)}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
          >
            <span>{showLogsPanel ? 'Hide' : 'Show'} logs</span>
            <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded">
              {logs.length}
            </span>
          </button>
        )}
      </div>

      {showLogs && showLogsPanel && logs.length > 0 && (
        <div className="mt-2 bg-gray-900 text-gray-100 rounded-lg p-4 text-xs font-mono">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Deployment Logs</span>
            <button
              onClick={() => setShowLogsPanel(false)}
              className="text-gray-400 hover:text-gray-200"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-gray-300">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress bar for processing deployments */}
      {deployment.status === 'processing' && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full animate-pulse" 
              style={{ width: '60%' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DeploymentStatusIndicator;