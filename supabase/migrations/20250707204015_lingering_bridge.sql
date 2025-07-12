/*
  # Add Multi-Tenancy Support

  1. New Tables
    - `customers` - Store information about customer businesses
    - `users` - Link to auth.users and store role information
    - `external_links` - Store external service URLs for each customer

  2. Updates
    - Add customer_id to posts table to associate posts with customers

  3. Security
    - Enable RLS on all tables
    - Create appropriate policies for multi-tenant access
*/

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  contact_email text NOT NULL,
  domain text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Create index on customers domain
CREATE INDEX IF NOT EXISTS customers_domain_idx ON customers(domain);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users,
  email text NOT NULL,
  full_name text,
  role text NOT NULL CHECK (role IN ('admin', 'customer')),
  customer_id uuid REFERENCES customers(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on users customer_id
CREATE INDEX IF NOT EXISTS users_customer_id_idx ON users(customer_id);

-- Create external_links table
CREATE TABLE IF NOT EXISTS external_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id),
  gohighlevel_url text,
  searchatlas_url text,
  stripe_portal_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on external_links customer_id
CREATE INDEX IF NOT EXISTS external_links_customer_id_idx ON external_links(customer_id);

-- Alter posts table to add customer_id
ALTER TABLE posts ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES customers(id);

-- Create index on posts customer_id
CREATE INDEX IF NOT EXISTS posts_customer_id_idx ON posts(customer_id);

-- Create updated_at triggers for new tables
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_external_links_updated_at
  BEFORE UPDATE ON external_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_links ENABLE ROW LEVEL SECURITY;

-- Update existing policy for posts to account for multi-tenancy
-- First, drop the existing policy
DROP POLICY IF EXISTS "Public can read published posts" ON posts;

-- Create a new policy for public posts (agency blog posts with no customer_id)
CREATE POLICY "Public can read published posts with no customer_id"
  ON posts
  FOR SELECT
  TO public
  USING (published_at <= now() AND customer_id IS NULL);

-- Create a policy for customer-specific posts
CREATE POLICY "Users can read posts for their customer"
  ON posts
  FOR SELECT
  TO authenticated
  USING (
    customer_id = (
      SELECT customer_id FROM users
      WHERE users.id = auth.uid()
    )
    OR
    customer_id IS NULL
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create policy for authenticated users to read customers
CREATE POLICY "Authenticated users can read customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for admins to manage customers
CREATE POLICY "Admins can manage customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create policy for users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Create policy for admins to read all users
CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users admin
      WHERE admin.id = auth.uid()
      AND admin.role = 'admin'
    )
  );

-- Create policy for admins to manage users
CREATE POLICY "Admins can manage users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users admin
      WHERE admin.id = auth.uid()
      AND admin.role = 'admin'
    )
  );

-- Create policy for authenticated users to read external_links
CREATE POLICY "Users can read external links for their customer"
  ON external_links
  FOR SELECT
  TO authenticated
  USING (
    customer_id = (
      SELECT customer_id FROM users
      WHERE users.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create policy for admins to manage external_links
CREATE POLICY "Admins can manage external links"
  ON external_links
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );