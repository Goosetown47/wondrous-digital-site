/*
  # Fix infinite recursion in users table RLS policies

  1. Problem
     - Admin policies were creating circular references by querying users table within user policies
     - This caused infinite recursion when trying to access user data

  2. Solution
     - Drop existing problematic policies
     - Create new policies that avoid circular references
     - Use auth.jwt() claims or simpler conditions to check admin status

  3. New Policies
     - Allow users to read their own data (simple, no recursion)
     - Allow service role to manage all users (for admin operations)
     - Remove circular admin checks from user-level policies
*/

-- Drop existing policies that cause circular references
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;

-- Create new policies without circular references
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow service role to manage all users (for admin operations through functions)
CREATE POLICY "Service role can manage all users"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);