-- Add RLS policy for admins to delete deployments from the deployment_queue table
-- This fixes the issue where deletions from the UI were failing silently

-- Add policy for admins to delete deployments (completed/failed only)
CREATE POLICY "Admins can delete deployments" ON deployment_queue
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
    AND status IN ('completed', 'failed')
  );

-- Note: This policy ensures that:
-- 1. Only admin users can delete deployments
-- 2. Only completed or failed deployments can be deleted (not queued or processing)
-- 3. This matches the business logic in deploymentQueueService.deleteDeployment()