import React, { useState, useEffect } from 'react';
import { X, Info, AlertTriangle, AlertCircle, Clock, Download, RefreshCw } from 'lucide-react';
import { deploymentQueueService, DeploymentLog } from '../../services/deploymentQueueService';

interface DeploymentLogsModalProps {
  deploymentId: string;
  onClose: () => void;
}

const DeploymentLogsModal: React.FC<DeploymentLogsModalProps> = ({ deploymentId, onClose }) => {
  const [logs, setLogs] = useState<DeploymentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLogs();
    
    // Subscribe to new logs
    const unsubscribe = deploymentQueueService.subscribeToDeployment(deploymentId, (event) => {
      if (event.type === 'deployment_log' && event.log) {
        setLogs(prev => [...prev, event.log]);
      }
    });

    return () => unsubscribe();
  }, [deploymentId]);

  const fetchLogs = async () => {
    try {
      const logsData = await deploymentQueueService.getDeploymentLogs(deploymentId);
      setLogs(logsData);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLogs();
    setRefreshing(false);
  };

  const handleDownload = () => {
    const logContent = logs.map(log => 
      `[${new Date(log.created_at).toISOString()}] [${log.log_level.toUpperCase()}] ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deployment-${deploymentId}-logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Deployment Logs</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              title="Refresh logs"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-gray-400 hover:text-gray-600"
              title="Download logs"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 text-gray-400 animate-pulse mx-auto mb-2" />
              <p className="text-gray-500">Loading logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8">
              <Info className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No logs available for this deployment</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-start space-x-3 py-2 px-3 rounded-lg ${
                    log.log_level === 'error' ? 'bg-red-50' :
                    log.log_level === 'warning' ? 'bg-yellow-50' :
                    'bg-gray-50'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getLogIcon(log.log_level)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline space-x-2 text-xs text-gray-500">
                      <span className="font-mono">{formatTimestamp(log.created_at)}</span>
                      <span className="uppercase font-medium">{log.log_level}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-900 break-words">{log.message}</p>
                    {log.metadata && (
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with deployment ID */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500">
            Deployment ID: <span className="font-mono">{deploymentId}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeploymentLogsModal;