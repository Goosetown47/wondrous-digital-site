-- /supabase/seed/seed.sql
-- Development test data (not for production)

-- Test accounts
INSERT INTO accounts (name, slug, settings) VALUES
  ('Test Company 1', 'test-company-1', '{}'),
  ('Test Company 2', 'test-company-2', '{}'),
  ('Demo Agency', 'demo-agency', '{}')
ON CONFLICT DO NOTHING;

-- Test users (passwords should be set via auth)
-- Note: User creation should be done via Supabase Auth, not direct inserts

-- Sample projects
-- INSERT INTO projects (name, account_id, ...) VALUES ...

-- Sample pages
-- INSERT INTO pages (title, project_id, ...) VALUES ...
