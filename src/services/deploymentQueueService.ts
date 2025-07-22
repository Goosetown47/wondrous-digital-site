import { supabase } from '../utils/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface QueuedDeployment {
  id: string;
  project_id: string;
  customer_id: string | null;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  priority: number;
  payload: {
    subdomain: string;
    deployment_domain: string;
    exportResult: any;
    netlify_site_id?: string;
  };
  attempt_count: number;
  max_attempts: number;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface DeploymentLog {
  id: string;
  deployment_id: string;
  project_id: string;
  log_level: 'info' | 'warning' | 'error';
  message: string;
  metadata?: any;
  created_at: string;
}

export type DeploymentEventType = 'deployment_queued' | 'deployment_started' | 'deployment_completed' | 'deployment_failed' | 'deployment_log';

export interface DeploymentEvent {
  type: DeploymentEventType;
  deployment?: QueuedDeployment;
  log?: DeploymentLog;
}

class DeploymentQueueService {
  private static instance: DeploymentQueueService;
  private subscriptions: Map<string, RealtimeChannel> = new Map();
  private deploymentCallbacks: Map<string, ((event: DeploymentEvent) => void)[]> = new Map();

  private constructor() {}

  static getInstance(): DeploymentQueueService {
    if (!DeploymentQueueService.instance) {
      DeploymentQueueService.instance = new DeploymentQueueService();
    }
    return DeploymentQueueService.instance;
  }

  /**
   * Queue a deployment for processing
   */
  async queueDeployment(
    projectId: string,
    customerId: string | null,
    payload: any,
    priority: number = 0
  ): Promise<QueuedDeployment> {
    const { data, error } = await supabase
      .from('deployment_queue')
      .insert({
        project_id: projectId,
        customer_id: customerId,
        payload,
        priority,
        status: 'queued'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get a specific deployment by ID
   */
  async getDeploymentById(deploymentId: string): Promise<{ data: QueuedDeployment | null; error: any }> {
    const { data, error } = await supabase
      .from('deployment_queue')
      .select('*')
      .eq('id', deploymentId)
      .single();

    return { data, error };
  }

  /**
   * Get the current position in queue for a deployment
   */
  async getQueuePosition(deploymentId: string): Promise<number> {
    const { data: deployment } = await supabase
      .from('deployment_queue')
      .select('created_at, priority')
      .eq('id', deploymentId)
      .single();

    if (!deployment) return -1;

    const { count } = await supabase
      .from('deployment_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'queued')
      .or(`priority.gt.${deployment.priority},and(priority.eq.${deployment.priority},created_at.lt.${deployment.created_at})`);

    return (count || 0) + 1;
  }

  /**
   * Get queue status (number of queued, processing, etc.)
   */
  async getQueueStatus(): Promise<{
    queued: number;
    processing: number;
    completed_last_hour: number;
    failed_last_hour: number;
  }> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    // Get counts for each status
    const [queuedResult, processingResult, completedResult, failedResult] = await Promise.all([
      supabase
        .from('deployment_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'queued'),
      supabase
        .from('deployment_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'processing'),
      supabase
        .from('deployment_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('completed_at', oneHourAgo),
      supabase
        .from('deployment_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed')
        .gte('completed_at', oneHourAgo)
    ]);

    return {
      queued: queuedResult.count || 0,
      processing: processingResult.count || 0,
      completed_last_hour: completedResult.count || 0,
      failed_last_hour: failedResult.count || 0
    };
  }

  /**
   * Get deployments for a specific project
   */
  async getProjectDeployments(
    projectId: string,
    limit: number = 10
  ): Promise<QueuedDeployment[]> {
    const { data, error } = await supabase
      .from('deployment_queue')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get deployment logs
   */
  async getDeploymentLogs(deploymentId: string): Promise<DeploymentLog[]> {
    const { data, error } = await supabase
      .from('deployment_logs')
      .select('*')
      .eq('deployment_id', deploymentId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Subscribe to deployment updates for a specific deployment
   */
  subscribeToDeployment(
    deploymentId: string,
    callback: (event: DeploymentEvent) => void
  ): () => void {
    // Add callback to the list
    if (!this.deploymentCallbacks.has(deploymentId)) {
      this.deploymentCallbacks.set(deploymentId, []);
    }
    this.deploymentCallbacks.get(deploymentId)!.push(callback);

    // Create subscription if it doesn't exist
    if (!this.subscriptions.has(deploymentId)) {
      const channel = supabase
        .channel(`deployment-${deploymentId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'deployment_queue',
            filter: `id=eq.${deploymentId}`
          },
          (payload) => {
            const deployment = payload.new as QueuedDeployment;
            const callbacks = this.deploymentCallbacks.get(deploymentId) || [];
            
            let eventType: DeploymentEventType = 'deployment_queued';
            if (deployment.status === 'processing') eventType = 'deployment_started';
            else if (deployment.status === 'completed') eventType = 'deployment_completed';
            else if (deployment.status === 'failed') eventType = 'deployment_failed';

            callbacks.forEach(cb => cb({ type: eventType, deployment }));
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'deployment_logs',
            filter: `deployment_id=eq.${deploymentId}`
          },
          (payload) => {
            const log = payload.new as DeploymentLog;
            const callbacks = this.deploymentCallbacks.get(deploymentId) || [];
            callbacks.forEach(cb => cb({ type: 'deployment_log', log }));
          }
        )
        .subscribe();

      this.subscriptions.set(deploymentId, channel);
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.deploymentCallbacks.get(deploymentId) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }

      // If no more callbacks, unsubscribe and clean up
      if (callbacks.length === 0) {
        const channel = this.subscriptions.get(deploymentId);
        if (channel) {
          channel.unsubscribe();
          this.subscriptions.delete(deploymentId);
        }
        this.deploymentCallbacks.delete(deploymentId);
      }
    };
  }

  /**
   * Subscribe to overall queue status updates
   */
  subscribeToQueueStatus(
    callback: (status: Awaited<ReturnType<typeof this.getQueueStatus>>) => void
  ): () => void {
    // Poll for status updates every 5 seconds
    const interval = setInterval(async () => {
      try {
        const status = await this.getQueueStatus();
        callback(status);
      } catch (error) {
        console.error('Error fetching queue status:', error);
      }
    }, 5000);

    // Initial fetch
    this.getQueueStatus().then(callback).catch(console.error);

    // Return cleanup function
    return () => clearInterval(interval);
  }

  /**
   * Cancel a queued deployment
   */
  async cancelDeployment(deploymentId: string): Promise<void> {
    const { error } = await supabase
      .from('deployment_queue')
      .update({
        status: 'failed',
        error_message: 'Deployment cancelled by user',
        completed_at: new Date().toISOString()
      })
      .eq('id', deploymentId)
      .eq('status', 'queued');

    if (error) throw error;
  }

  /**
   * Retry a failed deployment
   */
  async retryDeployment(deploymentId: string): Promise<QueuedDeployment> {
    // First get the deployment
    const { data: deployment, error: fetchError } = await supabase
      .from('deployment_queue')
      .select('*')
      .eq('id', deploymentId)
      .eq('status', 'failed')
      .single();

    if (fetchError || !deployment) {
      throw new Error('Failed deployment not found');
    }

    // Reset the deployment to queued status
    const { data, error } = await supabase
      .from('deployment_queue')
      .update({
        status: 'queued',
        error_message: null,
        started_at: null,
        completed_at: null,
        attempt_count: 0
      })
      .eq('id', deploymentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a deployment from the queue
   */
  async deleteDeployment(deploymentId: string): Promise<void> {
    const { error } = await supabase
      .from('deployment_queue')
      .delete()
      .eq('id', deploymentId)
      .in('status', ['completed', 'failed']);

    if (error) throw error;
  }

  /**
   * Delete multiple deployments
   */
  async deleteDeployments(deploymentIds: string[]): Promise<void> {
    const { error } = await supabase
      .from('deployment_queue')
      .delete()
      .in('id', deploymentIds)
      .in('status', ['completed', 'failed']);

    if (error) throw error;
  }

  /**
   * Get all deployments with filters
   */
  async getAllDeployments(filters?: {
    status?: string[];
    projectId?: string;
    customerId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: QueuedDeployment[]; count: number }> {
    let query = supabase
      .from('deployment_queue')
      .select('*', { count: 'exact' });

    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }
    if (filters?.projectId) {
      query = query.eq('project_id', filters.projectId);
    }
    if (filters?.customerId) {
      query = query.eq('customer_id', filters.customerId);
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    query = query.order('created_at', { ascending: false });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return { data: data || [], count: count || 0 };
  }

  /**
   * Clear old completed/failed deployments
   */
  async clearOldDeployments(daysToKeep: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { data, error } = await supabase
      .from('deployment_queue')
      .delete()
      .in('status', ['completed', 'failed'])
      .lt('completed_at', cutoffDate.toISOString())
      .select();

    if (error) throw error;
    return data?.length || 0;
  }

  /**
   * Manually trigger Edge Function to process queue
   */
  async triggerQueueProcessing(): Promise<void> {
    const { error } = await supabase.functions.invoke('process-deployment-queue', {
      body: {}
    });

    if (error) throw error;
  }

  /**
   * Clean up completed subscriptions
   */
  cleanup(): void {
    this.subscriptions.forEach(channel => channel.unsubscribe());
    this.subscriptions.clear();
    this.deploymentCallbacks.clear();
  }
}

export const deploymentQueueService = DeploymentQueueService.getInstance();