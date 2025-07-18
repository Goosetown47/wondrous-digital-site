-- Add UPDATE policy for authenticated users on their own projects
-- This allows users to update projects they have access to, including global navigation fields

CREATE POLICY "Users can update their projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (
    -- Users can update projects for their customer
    customer_id = (
      SELECT users.customer_id
      FROM users
      WHERE users.id = auth.uid()
    )
    OR
    -- Admins can update any project
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    -- Same conditions for the new row data
    customer_id = (
      SELECT users.customer_id
      FROM users
      WHERE users.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );