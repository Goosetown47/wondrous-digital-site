-- Create deployment queue table for managing scaled deployments
CREATE TABLE IF NOT EXISTS deployment_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  priority INTEGER NOT NULL DEFAULT 0,
  payload JSONB NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_deployment_queue_status ON deployment_queue(status);
CREATE INDEX idx_deployment_queue_priority ON deployment_queue(priority DESC, created_at ASC);
CREATE INDEX idx_deployment_queue_project_id ON deployment_queue(project_id);
CREATE INDEX idx_deployment_queue_customer_id ON deployment_queue(customer_id);
CREATE INDEX idx_deployment_queue_created_at ON deployment_queue(created_at);

-- Add deployment_id column to existing deployment_logs table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'deployment_logs' 
    AND column_name = 'deployment_id'
  ) THEN
    ALTER TABLE deployment_logs 
    ADD COLUMN deployment_id UUID REFERENCES deployment_queue(id) ON DELETE CASCADE;
  END IF;
END
$$;

-- Create indexes for deployment logs if they don't exist
CREATE INDEX IF NOT EXISTS idx_deployment_logs_deployment_id ON deployment_logs(deployment_id);
CREATE INDEX IF NOT EXISTS idx_deployment_logs_project_id ON deployment_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_deployment_logs_created_at ON deployment_logs(created_at);

-- RLS policies for deployment_queue
ALTER TABLE deployment_queue ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view their own deployments
CREATE POLICY "Users can view their own deployments" ON deployment_queue
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM users WHERE customer_id = deployment_queue.customer_id
    )
  );

-- Service role can manage all deployments
CREATE POLICY "Service role can manage all deployments" ON deployment_queue
  FOR ALL USING (auth.role() = 'service_role');

-- RLS policies for deployment_logs
ALTER TABLE deployment_logs ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view logs for their deployments
CREATE POLICY "Users can view their own deployment logs" ON deployment_logs
  FOR SELECT USING (
    auth.uid() IN (
      SELECT u.id FROM users u
      JOIN deployment_queue dq ON dq.customer_id = u.customer_id
      WHERE dq.id = deployment_logs.deployment_id
    )
  );

-- Service role can manage all logs
CREATE POLICY "Service role can manage all deployment logs" ON deployment_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_deployment_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER deployment_queue_updated_at
  BEFORE UPDATE ON deployment_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_deployment_queue_updated_at();

-- Function to clean up old completed/failed deployments (30 days retention)
CREATE OR REPLACE FUNCTION cleanup_old_deployments()
RETURNS void AS $$
BEGIN
  DELETE FROM deployment_queue 
  WHERE status IN ('completed', 'failed') 
  AND completed_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;