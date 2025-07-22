import React, { useEffect, useState } from 'react';
import { Globe, Activity, FileText, Loader2, AlertCircle, Clock } from 'lucide-react';
import { deploymentQueueService } from '../../services/deploymentQueueService';
import { supabase } from '../../utils/supabase';

interface DeploymentStatusBadgeProps {
  projectId: string;
  netlifyId?: string | null;
  deploymentStatus?: string;
  deploymentUrl?: string | null;
  className?: string;
}

interface ActiveDeployment {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

const DeploymentStatusBadge: React.FC<DeploymentStatusBadgeProps> = ({
  projectId,
  netlifyId,
  deploymentStatus = 'none',
  deploymentUrl,
  className = ''
}) => {
  const [activeDeployment, setActiveDeployment] = useState<ActiveDeployment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const checkActiveDeployment = async () => {
      try {
        // Check if there's an active deployment in the queue
        const { data, error } = await supabase
          .from('deployment_queue')
          .select('id, status, created_at')
          .eq('project_id', projectId)
          .in('status', ['queued', 'processing'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          setActiveDeployment(data);
          
          // Subscribe to updates for this deployment
          unsubscribe = deploymentQueueService.subscribeToDeployment(
            data.id,
            (event) => {
              if (event.deployment) {
                if (event.deployment.status === 'completed' || event.deployment.status === 'failed') {
                  // Deployment finished, clear active deployment
                  setActiveDeployment(null);
                } else {
                  // Update status
                  setActiveDeployment({
                    id: event.deployment.id,
                    status: event.deployment.status,
                    created_at: event.deployment.created_at
                  });
                }
              }
            }
          );
        } else {
          setActiveDeployment(null);
        }
      } catch (error) {
        console.error('Error checking active deployment:', error);
      } finally {
        setLoading(false);
      }
    };

    checkActiveDeployment();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [projectId]);

  // Determine the display status and configuration
  const getStatusConfig = () => {
    // If there's an active deployment, show its status
    if (activeDeployment) {
      if (activeDeployment.status === 'queued') {
        return {
          status: 'queued',
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          icon: Clock,
          label: 'Queued',
          animated: true
        };
      } else if (activeDeployment.status === 'processing') {
        return {
          status: 'processing',
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          icon: Loader2,
          label: 'Deploying',
          animated: true,
          spin: true
        };
      }
    }

    // Otherwise, show the persistent status from the projects table
    if (netlifyId && deploymentUrl && deploymentStatus === 'deployed') {
      return {
        status: 'deployed',
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: Globe,
        label: 'Deployed',
        animated: false
      };
    } else if (deploymentStatus === 'failed') {
      return {
        status: 'failed',
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: AlertCircle,
        label: 'Failed',
        animated: false
      };
    } else {
      return {
        status: 'none',
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: FileText,
        label: 'Not Deployed',
        animated: false
      };
    }
  };

  if (loading) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`}>
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        Loading...
      </span>
    );
  }

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} ${className}`}>
      <Icon className={`h-3 w-3 mr-1 ${config.spin ? 'animate-spin' : ''} ${config.animated && !config.spin ? 'animate-pulse' : ''}`} />
      {config.label}
    </span>
  );
};

export default DeploymentStatusBadge;