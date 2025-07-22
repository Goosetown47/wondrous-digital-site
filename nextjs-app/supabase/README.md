# Supabase Migrations for Next.js PageBuilder

## How to Apply Migrations

1. **Using Supabase Dashboard (Easiest)**:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy the contents of `migrations/001_create_pagebuilder_tables.sql`
   - Paste and run the SQL

2. **Using Supabase CLI** (if you have it set up):
   ```bash
   cd nextjs-app
   supabase db push
   ```

## What the Migration Creates

- **projects** table: Stores project metadata
- **pages** table: Stores page content with sections as JSONB
- **project_domains** table: Maps custom domains to projects
- Row Level Security (RLS) policies for authentication
- Indexes for performance
- Update triggers for timestamps

## Important Notes

- The migration includes RLS policies that reference `auth.users`
- For testing without auth, you may need to temporarily disable RLS or modify the policies
- The `customer_id` field uses a dummy value in the app until auth is implemented

## Testing Without Auth

If you want to test without authentication, run this after the main migration:

```sql
-- Temporarily disable RLS for testing
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_domains DISABLE ROW LEVEL SECURITY;
```

Remember to re-enable RLS when you implement authentication!