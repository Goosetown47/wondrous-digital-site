-- Create command_history table for tracking Universal Command Input executions
-- This table logs all command executions (npm install, shadcn add) for audit trail

CREATE TABLE IF NOT EXISTS command_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  command_text TEXT NOT NULL,
  command_type TEXT NOT NULL CHECK (command_type IN ('npm', 'shadcn-component', 'shadcn-registry', 'unknown')),
  success BOOLEAN NOT NULL DEFAULT false,
  output TEXT,
  errors TEXT[],
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_command_history_user_id ON command_history(user_id);
CREATE INDEX IF NOT EXISTS idx_command_history_executed_at ON command_history(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_command_history_command_type ON command_history(command_type);
CREATE INDEX IF NOT EXISTS idx_command_history_success ON command_history(success);

-- Add RLS policies
ALTER TABLE command_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own command history
CREATE POLICY "Users can view own command history"
  ON command_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Only authenticated users can insert command history
CREATE POLICY "Authenticated users can insert command history"
  ON command_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE command_history IS 'Audit log for Universal Command Input system - tracks all npm and shadcn CLI command executions';