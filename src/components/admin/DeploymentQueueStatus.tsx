import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
import { deploymentQueueService } from '../../services/deploymentQueueService';
import { netlifyRateLimiter } from '../../services/netlifyRateLimiter';

interface DeploymentQueueStatusProps {
  className?: string;
  compact?: boolean;
}

const DeploymentQueueStatus: React.FC<DeploymentQueueStatusProps> = ({ 
  className = '', 
  compact = false 
}) => {
  const [queueStatus, setQueueStatus] = useState({
    queued: 0,
    processing: 0,
    completed_last_hour: 0,
    failed_last_hour: 0
  });
  
  const [rateLimiterStatus, setRateLimiterStatus] = useState({
    availableTokens: 0,
    maxTokens: 0,
    refillRate: 0,
    pendingRequests: 0
  });

  useEffect(() => {
    // Subscribe to queue status updates
    const unsubscribeQueue = deploymentQueueService.subscribeToQueueStatus(setQueueStatus);

    // Poll rate limiter status
    const rateLimiterInterval = setInterval(() => {
      setRateLimiterStatus(netlifyRateLimiter.getStatus());
    }, 1000);

    return () => {
      unsubscribeQueue();
      clearInterval(rateLimiterInterval);
    };
  }, []);

  const totalActive = queueStatus.queued + queueStatus.processing;
  const apiUsagePercent = ((rateLimiterStatus.maxTokens - rateLimiterStatus.availableTokens) / rateLimiterStatus.maxTokens) * 100;

  if (compact) {
    return (
      <div className={`flex items-center space-x-4 text-sm ${className}`}>
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4 text-yellow-500" />
          <span>{queueStatus.queued}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Activity className="h-4 w-4 text-blue-500" />
          <span>{queueStatus.processing}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Zap className="h-4 w-4 text-purple-500" />
          <span>{Math.round(apiUsagePercent)}%</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Deployment Queue Status</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Queued */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-gray-900">{queueStatus.queued}</p>
            <p className="text-xs text-gray-500">Queued</p>
          </div>
        </div>

        {/* Processing */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-gray-900">{queueStatus.processing}</p>
            <p className="text-xs text-gray-500">Processing</p>
          </div>
        </div>

        {/* Completed */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-gray-900">{queueStatus.completed_last_hour}</p>
            <p className="text-xs text-gray-500">Completed (1h)</p>
          </div>
        </div>

        {/* Failed */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-gray-900">{queueStatus.failed_last_hour}</p>
            <p className="text-xs text-gray-500">Failed (1h)</p>
          </div>
        </div>
      </div>

      {/* API Rate Limit Status */}
      <div className="border-t border-gray-200 pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-700">API Rate Limit</span>
          <span className="text-xs text-gray-500">
            {rateLimiterStatus.availableTokens}/{rateLimiterStatus.maxTokens} tokens
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              apiUsagePercent > 80 ? 'bg-red-500' : 
              apiUsagePercent > 60 ? 'bg-yellow-500' : 
              'bg-green-500'
            }`}
            style={{ width: `${100 - apiUsagePercent}%` }}
          />
        </div>
        {rateLimiterStatus.pendingRequests > 0 && (
          <p className="text-xs text-yellow-600 mt-1">
            {rateLimiterStatus.pendingRequests} requests waiting for rate limit
          </p>
        )}
      </div>

      {/* Warning if queue is getting large */}
      {totalActive > 20 && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800 flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1" />
            High deployment volume detected. Deployments may take longer than usual.
          </p>
        </div>
      )}
    </div>
  );
};

export default DeploymentQueueStatus;