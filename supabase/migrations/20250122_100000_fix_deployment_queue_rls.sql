-- Fix RLS policies for deployment_queue to allow admin users to queue deployments

-- Add policy for admins to insert deployments
CREATE POLICY "Admins can queue deployments" ON deployment_queue
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add policy for admins to view all deployments
CREATE POLICY "Admins can view all deployments" ON deployment_queue
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add policy for admins to update deployments (for cancellation)
CREATE POLICY "Admins can update deployments" ON deployment_queue
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add corresponding policies for deployment_logs
CREATE POLICY "Admins can view all deployment logs" ON deployment_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add policy for admins to insert logs (if needed for debugging)
CREATE POLICY "Admins can insert deployment logs" ON deployment_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );