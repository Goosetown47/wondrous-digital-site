-- Query Results from Supabase 
-- 8/9/2025 at 4:05pm EST


QUERY 1

| create_statement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CREATE TABLE IF NOT EXISTS public.account_users (
    account_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text DEFAULT 'member'::text NOT NULL,
    joined_at timestamp with time zone DEFAULT now(),
    invited_by uuid
);                                                                                                                                                                                                                                                                                                                                       |
| CREATE TABLE IF NOT EXISTS public.accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    plan text DEFAULT 'free'::text,
    settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);                                                                                                                                                                                                                                     |
| CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    account_id uuid,
    user_id uuid,
    action text NOT NULL,
    resource_type text,
    resource_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);                                                                                                                                                                                                                                                               |
| CREATE TABLE IF NOT EXISTS public.core_components (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    source text NOT NULL,
    code text NOT NULL,
    dependencies jsonb DEFAULT '[]'::jsonb,
    imports jsonb DEFAULT '[]'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);                                                                                                                             |
| CREATE TABLE IF NOT EXISTS public.lab_drafts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    content jsonb NOT NULL,
    version integer DEFAULT 1,
    status text DEFAULT 'draft'::text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    type_id uuid,
    content_hash text,
    library_version integer
);                                                                          |
| CREATE TABLE IF NOT EXISTS public.library_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    category text,
    content jsonb NOT NULL,
    published boolean DEFAULT false,
    version integer DEFAULT 1,
    source_draft_id uuid,
    theme_id uuid,
    usage_count integer DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    type_id uuid,
    component_name text
); |
| CREATE TABLE IF NOT EXISTS public.library_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    library_item_id uuid,
    version integer NOT NULL,
    content jsonb NOT NULL,
    change_notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now()
);                                                                                                                                                                                                                                                                                |
| CREATE TABLE IF NOT EXISTS public.pages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid,
    path text DEFAULT '/'::text NOT NULL,
    title text,
    sections jsonb DEFAULT '[]'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    published_sections jsonb DEFAULT '[]'::jsonb
);                                                                                                                                                   |
| CREATE TABLE IF NOT EXISTS public.permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    resource text NOT NULL,
    action text NOT NULL,
    description text
);                                                                                                                                                                                                                                                                                                                                                                                                |
| CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL,
    role text DEFAULT 'user'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);                                                                                                                                                                                                                                                                                                                                                       |
| CREATE TABLE IF NOT EXISTS public.project_domains (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid,
    domain text NOT NULL,
    is_primary boolean DEFAULT false,
    verified boolean DEFAULT false,
    verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    ssl_state text DEFAULT 'PENDING'::text,
    verification_details jsonb,
    include_www boolean DEFAULT true
);                                                                                                                            |
| CREATE TABLE IF NOT EXISTS public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    customer_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    theme_id uuid,
    theme_overrides jsonb DEFAULT '{}'::jsonb,
    account_id uuid,
    archived_at timestamp with time zone,
    created_by uuid,
    template_id uuid,
    slug text NOT NULL,
    description text
);                                                                                         |
| CREATE TABLE IF NOT EXISTS public.reserved_domain_permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    account_id uuid,
    domain text NOT NULL,
    granted_at timestamp with time zone DEFAULT now(),
    granted_by uuid,
    notes text
);                                                                                                                                                                                                                                                                                                                 |
| CREATE TABLE IF NOT EXISTS public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    permissions ARRAY DEFAULT '{}'::text[] NOT NULL,
    account_id uuid,
    description text,
    is_system boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);                                                                                                                                                                                                       |
| CREATE TABLE IF NOT EXISTS public.staff_account_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    staff_user_id uuid NOT NULL,
    account_id uuid NOT NULL,
    assigned_at timestamp with time zone DEFAULT now(),
    assigned_by uuid
);                                                                                                                                                                                                                                                                                                                 |
| CREATE TABLE IF NOT EXISTS public.themes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    variables jsonb NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);                                                                                                                                                                                                                          |
| CREATE TABLE IF NOT EXISTS public.types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    display_name text NOT NULL,
    category text NOT NULL,
    description text,
    icon text,
    schema jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);                                                                                                                                                                                 |
| CREATE TABLE IF NOT EXISTS public.user_profiles (
    user_id uuid NOT NULL,
    display_name text,
    avatar_url text,
    phone text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);                                                                                                                                                                                                                                                                             |


QUERY 2

| index_statement                                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CREATE UNIQUE INDEX account_users_pkey ON public.account_users USING btree (account_id, user_id);                                                                 |
| CREATE INDEX idx_account_users_account ON public.account_users USING btree (account_id);                                                                          |
| CREATE INDEX idx_account_users_platform ON public.account_users USING btree (account_id, role) WHERE (account_id = '00000000-0000-0000-0000-000000000000'::uuid); |
| CREATE INDEX idx_account_users_user ON public.account_users USING btree (user_id);                                                                                |
| CREATE UNIQUE INDEX accounts_pkey ON public.accounts USING btree (id);                                                                                            |
| CREATE UNIQUE INDEX accounts_slug_key ON public.accounts USING btree (slug);                                                                                      |
| CREATE INDEX idx_accounts_slug ON public.accounts USING btree (slug);                                                                                             |
| CREATE UNIQUE INDEX audit_logs_pkey ON public.audit_logs USING btree (id);                                                                                        |
| CREATE INDEX idx_audit_logs_account ON public.audit_logs USING btree (account_id);                                                                                |
| CREATE INDEX idx_audit_logs_created ON public.audit_logs USING btree (created_at);                                                                                |
| CREATE INDEX idx_audit_logs_user ON public.audit_logs USING btree (user_id);                                                                                      |
| CREATE UNIQUE INDEX core_components_name_source_key ON public.core_components USING btree (name, source);                                                         |
| CREATE UNIQUE INDEX core_components_pkey ON public.core_components USING btree (id);                                                                              |
| CREATE INDEX idx_core_components_source ON public.core_components USING btree (source);                                                                           |
| CREATE INDEX idx_core_components_type ON public.core_components USING btree (type);                                                                               |
| CREATE INDEX idx_lab_drafts_content_hash ON public.lab_drafts USING btree (content_hash);                                                                         |
| CREATE INDEX idx_lab_drafts_status ON public.lab_drafts USING btree (status);                                                                                     |
| CREATE INDEX idx_lab_drafts_type ON public.lab_drafts USING btree (type);                                                                                         |
| CREATE INDEX idx_lab_drafts_type_id ON public.lab_drafts USING btree (type_id);                                                                                   |
| CREATE UNIQUE INDEX lab_drafts_pkey ON public.lab_drafts USING btree (id);                                                                                        |
| CREATE INDEX idx_library_items_category ON public.library_items USING btree (category);                                                                           |
| CREATE INDEX idx_library_items_published ON public.library_items USING btree (published);                                                                         |
| CREATE INDEX idx_library_items_type ON public.library_items USING btree (type);                                                                                   |
| CREATE INDEX idx_library_items_type_id ON public.library_items USING btree (type_id);                                                                             |
| CREATE UNIQUE INDEX library_items_pkey ON public.library_items USING btree (id);                                                                                  |
| CREATE INDEX idx_library_versions_item ON public.library_versions USING btree (library_item_id);                                                                  |
| CREATE UNIQUE INDEX library_versions_library_item_id_version_key ON public.library_versions USING btree (library_item_id, version);                               |
| CREATE UNIQUE INDEX library_versions_pkey ON public.library_versions USING btree (id);                                                                            |
| CREATE INDEX idx_pages_project_id ON public.pages USING btree (project_id);                                                                                       |
| CREATE INDEX idx_pages_project_path ON public.pages USING btree (project_id, path);                                                                               |
| CREATE INDEX idx_pages_published_sections ON public.pages USING gin (published_sections);                                                                         |
| CREATE UNIQUE INDEX pages_pkey ON public.pages USING btree (id);                                                                                                  |
| CREATE UNIQUE INDEX pages_project_id_path_key ON public.pages USING btree (project_id, path);                                                                     |
| CREATE UNIQUE INDEX permissions_pkey ON public.permissions USING btree (id);                                                                                      |
| CREATE UNIQUE INDEX permissions_resource_action_key ON public.permissions USING btree (resource, action);                                                         |
| CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);                                                                                            |
| CREATE INDEX idx_project_domains_domain ON public.project_domains USING btree (domain);                                                                           |
| CREATE INDEX idx_project_domains_project_id ON public.project_domains USING btree (project_id);                                                                   |
| CREATE UNIQUE INDEX project_domains_domain_key ON public.project_domains USING btree (domain);                                                                    |
| CREATE UNIQUE INDEX project_domains_pkey ON public.project_domains USING btree (id);                                                                              |
| CREATE INDEX idx_projects_archived_at ON public.projects USING btree (archived_at);                                                                               |
| CREATE INDEX idx_projects_created_by ON public.projects USING btree (created_by);                                                                                 |
| CREATE INDEX idx_projects_customer_id ON public.projects USING btree (customer_id);                                                                               |
| CREATE INDEX idx_projects_template_id ON public.projects USING btree (template_id);                                                                               |
| CREATE INDEX idx_projects_theme_id ON public.projects USING btree (theme_id);                                                                                     |
| CREATE UNIQUE INDEX projects_account_slug_unique ON public.projects USING btree (account_id, slug);                                                               |
| CREATE UNIQUE INDEX projects_pkey ON public.projects USING btree (id);                                                                                            |
| CREATE UNIQUE INDEX projects_slug_unique ON public.projects USING btree (slug);                                                                                   |
| CREATE INDEX idx_reserved_permissions_account ON public.reserved_domain_permissions USING btree (account_id);                                                     |
| CREATE INDEX idx_reserved_permissions_domain ON public.reserved_domain_permissions USING btree (domain);                                                          |
| CREATE UNIQUE INDEX reserved_domain_permissions_account_id_domain_key ON public.reserved_domain_permissions USING btree (account_id, domain);                     |
| CREATE UNIQUE INDEX reserved_domain_permissions_pkey ON public.reserved_domain_permissions USING btree (id);                                                      |
| CREATE INDEX idx_roles_account ON public.roles USING btree (account_id);                                                                                          |
| CREATE UNIQUE INDEX roles_name_account_id_key ON public.roles USING btree (name, account_id);                                                                     |
| CREATE UNIQUE INDEX roles_pkey ON public.roles USING btree (id);                                                                                                  |
| CREATE INDEX idx_staff_assignments_account ON public.staff_account_assignments USING btree (account_id);                                                          |
| CREATE INDEX idx_staff_assignments_staff ON public.staff_account_assignments USING btree (staff_user_id);                                                         |
| CREATE UNIQUE INDEX staff_account_assignments_pkey ON public.staff_account_assignments USING btree (id);                                                          |
| CREATE UNIQUE INDEX staff_account_assignments_staff_user_id_account_id_key ON public.staff_account_assignments USING btree (staff_user_id, account_id);           |
| CREATE UNIQUE INDEX themes_name_key ON public.themes USING btree (name);                                                                                          |
| CREATE UNIQUE INDEX themes_pkey ON public.themes USING btree (id);                                                                                                |
| CREATE INDEX idx_types_category ON public.types USING btree (category);                                                                                           |
| CREATE INDEX idx_types_name ON public.types USING btree (name);                                                                                                   |
| CREATE UNIQUE INDEX types_name_key ON public.types USING btree (name);                                                                                            |
| CREATE UNIQUE INDEX types_pkey ON public.types USING btree (id);                                                                                                  |
| CREATE INDEX idx_user_profiles_display_name ON public.user_profiles USING btree (display_name);                                                                   |
| CREATE INDEX idx_user_profiles_metadata ON public.user_profiles USING gin (metadata);                                                                             |
| CREATE UNIQUE INDEX user_profiles_pkey ON public.user_profiles USING btree (user_id);                                                                             |



QUERY 3

| constraint_statement                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ALTER TABLE accounts ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);                                                                                                                                 |
| ALTER TABLE accounts ADD CONSTRAINT accounts_plan_check CHECK ((plan = ANY (ARRAY['free'::text, 'pro'::text, 'enterprise'::text])));                                                                |
| ALTER TABLE accounts ADD CONSTRAINT accounts_slug_key UNIQUE (slug);                                                                                                                                |
| ALTER TABLE account_users ADD CONSTRAINT account_users_account_id_fkey FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;                                                          |
| ALTER TABLE account_users ADD CONSTRAINT account_users_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES auth.users(id);                                                                          |
| ALTER TABLE account_users ADD CONSTRAINT account_users_pkey PRIMARY KEY (account_id, user_id);                                                                                                      |
| ALTER TABLE account_users ADD CONSTRAINT account_users_role_check CHECK ((role = ANY (ARRAY['owner'::text, 'admin'::text, 'staff'::text, 'member'::text, 'viewer'::text, 'account_owner'::text]))); |
| ALTER TABLE account_users ADD CONSTRAINT account_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;                                                              |
| ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_account_id_fkey FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;                                                                |
| ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);                                                                                                                             |
| ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);                                                                                      |
| ALTER TABLE core_components ADD CONSTRAINT core_components_name_source_key UNIQUE (name, source);                                                                                                   |
| ALTER TABLE core_components ADD CONSTRAINT core_components_pkey PRIMARY KEY (id);                                                                                                                   |
| ALTER TABLE core_components ADD CONSTRAINT core_components_source_check CHECK ((source = ANY (ARRAY['shadcn'::text, 'aceternity'::text, 'expansions'::text, 'custom'::text])));                     |
| ALTER TABLE core_components ADD CONSTRAINT core_components_type_check CHECK ((type = ANY (ARRAY['component'::text, 'section'::text])));                                                             |
| ALTER TABLE lab_drafts ADD CONSTRAINT lab_drafts_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);                                                                                |
| ALTER TABLE lab_drafts ADD CONSTRAINT lab_drafts_pkey PRIMARY KEY (id);                                                                                                                             |
| ALTER TABLE lab_drafts ADD CONSTRAINT lab_drafts_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'testing'::text, 'ready'::text, 'promoted'::text])));                                      |
| ALTER TABLE lab_drafts ADD CONSTRAINT lab_drafts_type_check CHECK ((type = ANY (ARRAY['section'::text, 'page'::text, 'site'::text, 'theme'::text])));                                               |
| ALTER TABLE lab_drafts ADD CONSTRAINT lab_drafts_type_id_fkey FOREIGN KEY (type_id) REFERENCES types(id);                                                                                           |
| ALTER TABLE library_items ADD CONSTRAINT library_items_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);                                                                          |
| ALTER TABLE library_items ADD CONSTRAINT library_items_pkey PRIMARY KEY (id);                                                                                                                       |
| ALTER TABLE library_items ADD CONSTRAINT library_items_source_draft_id_fkey FOREIGN KEY (source_draft_id) REFERENCES lab_drafts(id);                                                                |
| ALTER TABLE library_items ADD CONSTRAINT library_items_theme_id_fkey FOREIGN KEY (theme_id) REFERENCES themes(id);                                                                                  |
| ALTER TABLE library_items ADD CONSTRAINT library_items_type_check CHECK ((type = ANY (ARRAY['section'::text, 'page'::text, 'site'::text, 'theme'::text])));                                         |
| ALTER TABLE library_items ADD CONSTRAINT library_items_type_id_fkey FOREIGN KEY (type_id) REFERENCES types(id);                                                                                     |
| ALTER TABLE library_versions ADD CONSTRAINT library_versions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);                                                                    |
| ALTER TABLE library_versions ADD CONSTRAINT library_versions_library_item_id_fkey FOREIGN KEY (library_item_id) REFERENCES library_items(id) ON DELETE CASCADE;                                     |
| ALTER TABLE library_versions ADD CONSTRAINT library_versions_library_item_id_version_key UNIQUE (library_item_id, version);                                                                         |
| ALTER TABLE library_versions ADD CONSTRAINT library_versions_pkey PRIMARY KEY (id);                                                                                                                 |
| ALTER TABLE pages ADD CONSTRAINT pages_pkey PRIMARY KEY (id);                                                                                                                                       |
| ALTER TABLE pages ADD CONSTRAINT pages_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;                                                                          |
| ALTER TABLE pages ADD CONSTRAINT pages_project_id_path_key UNIQUE (project_id, path);                                                                                                               |
| ALTER TABLE permissions ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);                                                                                                                           |
| ALTER TABLE permissions ADD CONSTRAINT permissions_resource_action_key UNIQUE (resource, action);                                                                                                   |
| ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;                                                                                  |
| ALTER TABLE profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);                                                                                                                                 |
| ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK ((role = ANY (ARRAY['user'::text, 'account_owner'::text, 'staff'::text, 'admin'::text])));                                            |
| ALTER TABLE project_domains ADD CONSTRAINT project_domains_domain_key UNIQUE (domain);                                                                                                              |
| ALTER TABLE project_domains ADD CONSTRAINT project_domains_pkey PRIMARY KEY (id);                                                                                                                   |
| ALTER TABLE project_domains ADD CONSTRAINT project_domains_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;                                                      |
| ALTER TABLE projects ADD CONSTRAINT projects_account_id_fkey FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;                                                                    |
| ALTER TABLE projects ADD CONSTRAINT projects_account_slug_unique UNIQUE (account_id, slug);                                                                                                         |
| ALTER TABLE projects ADD CONSTRAINT projects_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);                                                                                    |
| ALTER TABLE projects ADD CONSTRAINT projects_pkey PRIMARY KEY (id);                                                                                                                                 |
| ALTER TABLE projects ADD CONSTRAINT projects_slug_unique UNIQUE (slug);                                                                                                                             |
| ALTER TABLE projects ADD CONSTRAINT projects_template_id_fkey FOREIGN KEY (template_id) REFERENCES projects(id);                                                                                    |
| ALTER TABLE projects ADD CONSTRAINT projects_theme_id_fkey FOREIGN KEY (theme_id) REFERENCES library_items(id) ON DELETE SET NULL;                                                                  |
| ALTER TABLE reserved_domain_permissions ADD CONSTRAINT reserved_domain_permissions_account_id_domain_key UNIQUE (account_id, domain);                                                               |
| ALTER TABLE reserved_domain_permissions ADD CONSTRAINT reserved_domain_permissions_account_id_fkey FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;                              |
| ALTER TABLE reserved_domain_permissions ADD CONSTRAINT reserved_domain_permissions_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES auth.users(id);                                              |
| ALTER TABLE reserved_domain_permissions ADD CONSTRAINT reserved_domain_permissions_pkey PRIMARY KEY (id);                                                                                           |
| ALTER TABLE roles ADD CONSTRAINT roles_account_id_fkey FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;                                                                          |
| ALTER TABLE roles ADD CONSTRAINT roles_name_account_id_key UNIQUE (name, account_id);                                                                                                               |
| ALTER TABLE roles ADD CONSTRAINT roles_pkey PRIMARY KEY (id);                                                                                                                                       |
| ALTER TABLE staff_account_assignments ADD CONSTRAINT staff_account_assignments_account_id_fkey FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;                                  |
| ALTER TABLE staff_account_assignments ADD CONSTRAINT staff_account_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES auth.users(id);                                                |
| ALTER TABLE staff_account_assignments ADD CONSTRAINT staff_account_assignments_pkey PRIMARY KEY (id);                                                                                               |
| ALTER TABLE staff_account_assignments ADD CONSTRAINT staff_account_assignments_staff_user_id_account_id_key UNIQUE (staff_user_id, account_id);                                                     |
| ALTER TABLE staff_account_assignments ADD CONSTRAINT staff_account_assignments_staff_user_id_fkey FOREIGN KEY (staff_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;                          |
| ALTER TABLE themes ADD CONSTRAINT themes_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);                                                                                        |
| ALTER TABLE themes ADD CONSTRAINT themes_name_key UNIQUE (name);                                                                                                                                    |
| ALTER TABLE themes ADD CONSTRAINT themes_pkey PRIMARY KEY (id);                                                                                                                                     |
| ALTER TABLE types ADD CONSTRAINT types_category_check CHECK ((category = ANY (ARRAY['section'::text, 'page'::text, 'site'::text, 'theme'::text])));                                                 |
| ALTER TABLE types ADD CONSTRAINT types_name_key UNIQUE (name);                                                                                                                                      |
| ALTER TABLE types ADD CONSTRAINT types_pkey PRIMARY KEY (id);                                                                                                                                       |
| ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (user_id);                                                                                                                  |
| ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;                                                              |



QUERY 4

| policy_statement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CREATE POLICY "platform_admins_can_create_accounts" ON accounts AS PERMISSIVE FOR INSERT TO - WITH CHECK ((EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.user_id = auth.uid()) AND (account_users.account_id = '00000000-0000-0000-0000-000000000000'::uuid) AND (account_users.role = ANY (ARRAY['admin'::text, 'staff'::text]))))));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| CREATE POLICY "platform_admins_can_delete_accounts" ON accounts AS PERMISSIVE FOR DELETE TO - USING (((EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.user_id = auth.uid()) AND (account_users.account_id = '00000000-0000-0000-0000-000000000000'::uuid) AND (account_users.role = 'admin'::text)))) AND (id <> '00000000-0000-0000-0000-000000000000'::uuid)));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| CREATE POLICY "simple_accounts_select" ON accounts AS PERMISSIVE FOR SELECT TO - USING ((id IN ( SELECT account_users.account_id
   FROM account_users
  WHERE (account_users.user_id = auth.uid()))));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| CREATE POLICY "simple_accounts_update" ON accounts AS PERMISSIVE FOR UPDATE TO - USING ((id IN ( SELECT account_users.account_id
   FROM account_users
  WHERE ((account_users.user_id = auth.uid()) AND (account_users.role = ANY (ARRAY['account_owner'::text, 'admin'::text]))))));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| CREATE POLICY "users_can_update_accounts" ON accounts AS PERMISSIVE FOR UPDATE TO - USING (((EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.user_id = auth.uid()) AND (account_users.account_id = '00000000-0000-0000-0000-000000000000'::uuid) AND (account_users.role = 'admin'::text)))) OR (EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.user_id = auth.uid()) AND (account_users.account_id = '00000000-0000-0000-0000-000000000000'::uuid) AND (account_users.role = 'staff'::text)))) OR (EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.account_id = accounts.id) AND (account_users.user_id = auth.uid()) AND (account_users.role = ANY (ARRAY['owner'::text, 'admin'::text])))))));                                                                                                                                                                                                                                                                                            |
| CREATE POLICY "users_can_view_accounts" ON accounts AS PERMISSIVE FOR SELECT TO - USING (((EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.user_id = auth.uid()) AND (account_users.account_id = '00000000-0000-0000-0000-000000000000'::uuid) AND (account_users.role = 'admin'::text)))) OR (EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.user_id = auth.uid()) AND (account_users.account_id = '00000000-0000-0000-0000-000000000000'::uuid) AND (account_users.role = 'staff'::text)))) OR (EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.account_id = accounts.id) AND (account_users.user_id = auth.uid()))))));                                                                                                                                                                                                                                                                                                                                                                   |
| CREATE POLICY "admins_delete_account_users" ON account_users AS PERMISSIVE FOR DELETE TO - USING ((EXISTS ( SELECT 1
   FROM account_users existing
  WHERE ((existing.account_id = account_users.account_id) AND (existing.user_id = auth.uid()) AND (existing.role = ANY (ARRAY['account_owner'::text, 'admin'::text]))))));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| CREATE POLICY "admins_insert_account_users" ON account_users AS PERMISSIVE FOR INSERT TO - WITH CHECK ((EXISTS ( SELECT 1
   FROM account_users existing
  WHERE ((existing.account_id = account_users.account_id) AND (existing.user_id = auth.uid()) AND (existing.role = ANY (ARRAY['account_owner'::text, 'admin'::text]))))));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| CREATE POLICY "simple_account_users_select" ON account_users AS PERMISSIVE FOR SELECT TO - USING ((user_id = auth.uid()));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| CREATE POLICY "simple_account_users_update" ON account_users AS PERMISSIVE FOR UPDATE TO - USING ((user_id = auth.uid()));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| CREATE POLICY "Users can view audit logs for their accounts" ON audit_logs AS PERMISSIVE FOR SELECT TO - USING ((EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.account_id = audit_logs.account_id) AND (account_users.user_id = auth.uid()) AND (account_users.role = ANY (ARRAY['owner'::text, 'admin'::text]))))));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| CREATE POLICY "users_insert_own_audit_logs" ON audit_logs AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (((user_id = auth.uid()) AND ((EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.user_id = auth.uid()) AND (account_users.account_id = '00000000-0000-0000-0000-000000000000'::uuid) AND (account_users.role = 'admin'::text)))) OR (EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.user_id = auth.uid()) AND (account_users.account_id = audit_logs.account_id)))))));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| CREATE POLICY "Authenticated users can create core components" ON core_components AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| CREATE POLICY "Authenticated users can delete core components" ON core_components AS PERMISSIVE FOR DELETE TO authenticated USING (true);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| CREATE POLICY "Authenticated users can update core components" ON core_components AS PERMISSIVE FOR UPDATE TO authenticated USING (true) WITH CHECK (true);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| CREATE POLICY "Authenticated users can view all core components" ON core_components AS PERMISSIVE FOR SELECT TO authenticated USING (true);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| CREATE POLICY "Everyone can view core components" ON core_components AS PERMISSIVE FOR SELECT TO authenticated USING (true);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| CREATE POLICY "Staff and admins can delete core components" ON core_components AS PERMISSIVE FOR DELETE TO authenticated USING (has_role(ARRAY['staff'::text, 'admin'::text]));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| CREATE POLICY "Staff and admins can insert core components" ON core_components AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (has_role(ARRAY['staff'::text, 'admin'::text]));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| CREATE POLICY "Staff and admins can update core components" ON core_components AS PERMISSIVE FOR UPDATE TO authenticated USING (has_role(ARRAY['staff'::text, 'admin'::text])) WITH CHECK (has_role(ARRAY['staff'::text, 'admin'::text]));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| CREATE POLICY "Staff and admins can create lab drafts" ON lab_drafts AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (has_role(ARRAY['staff'::text, 'admin'::text]));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| CREATE POLICY "Staff and admins can delete lab drafts" ON lab_drafts AS PERMISSIVE FOR DELETE TO authenticated USING (has_role(ARRAY['staff'::text, 'admin'::text]));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| CREATE POLICY "Staff and admins can update lab drafts" ON lab_drafts AS PERMISSIVE FOR UPDATE TO authenticated USING (has_role(ARRAY['staff'::text, 'admin'::text])) WITH CHECK (has_role(ARRAY['staff'::text, 'admin'::text]));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| CREATE POLICY "Staff and admins can view lab drafts" ON lab_drafts AS PERMISSIVE FOR SELECT TO authenticated USING (has_role(ARRAY['staff'::text, 'admin'::text]));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| CREATE POLICY "Staff and admins can manage library items" ON library_items AS PERMISSIVE FOR ALL TO authenticated USING (has_role(ARRAY['staff'::text, 'admin'::text])) WITH CHECK (has_role(ARRAY['staff'::text, 'admin'::text]));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| CREATE POLICY "View published library items" ON library_items AS PERMISSIVE FOR SELECT TO authenticated USING (((published = true) OR (created_by = auth.uid()) OR ((auth.jwt() ->> 'role'::text) = 'admin'::text)));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| CREATE POLICY "Creators can view their own versions" ON library_versions AS PERMISSIVE FOR SELECT TO authenticated USING (((created_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM library_items
  WHERE ((library_items.id = library_versions.library_item_id) AND (library_items.created_by = auth.uid()))))));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| CREATE POLICY "Staff and admins can manage library versions" ON library_versions AS PERMISSIVE FOR ALL TO authenticated USING (has_role(ARRAY['staff'::text, 'admin'::text])) WITH CHECK (has_role(ARRAY['staff'::text, 'admin'::text]));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| CREATE POLICY "Users can view versions of published items" ON library_versions AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM library_items
  WHERE ((library_items.id = library_versions.library_item_id) AND (library_items.published = true)))));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| CREATE POLICY "View library versions" ON library_versions AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM library_items
  WHERE ((library_items.id = library_versions.library_item_id) AND ((library_items.published = true) OR (library_items.created_by = auth.uid()) OR ((auth.jwt() ->> 'role'::text) = 'admin'::text))))));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| CREATE POLICY "Users can create pages in their projects" ON pages AS PERMISSIVE FOR INSERT TO - WITH CHECK (((EXISTS ( SELECT 1
   FROM account_users au
  WHERE ((au.user_id = auth.uid()) AND (au.account_id = '00000000-0000-0000-0000-000000000000'::uuid) AND (au.role = ANY (ARRAY['admin'::text, 'staff'::text]))))) OR (project_id IN ( SELECT p.id
   FROM (projects p
     JOIN account_users au ON ((au.account_id = p.account_id)))
  WHERE ((au.user_id = auth.uid()) AND (au.role = ANY (ARRAY['admin'::text, 'staff'::text, 'account_owner'::text])))))));                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| CREATE POLICY "Users can delete pages in their projects" ON pages AS PERMISSIVE FOR DELETE TO - USING (((EXISTS ( SELECT 1
   FROM account_users au
  WHERE ((au.user_id = auth.uid()) AND (au.account_id = '00000000-0000-0000-0000-000000000000'::uuid) AND (au.role = ANY (ARRAY['admin'::text, 'staff'::text]))))) OR (project_id IN ( SELECT p.id
   FROM (projects p
     JOIN account_users au ON ((au.account_id = p.account_id)))
  WHERE ((au.user_id = auth.uid()) AND (au.role = 'admin'::text))))));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| CREATE POLICY "Users can update pages in their projects" ON pages AS PERMISSIVE FOR UPDATE TO - USING (((EXISTS ( SELECT 1
   FROM account_users au
  WHERE ((au.user_id = auth.uid()) AND (au.account_id = '00000000-0000-0000-0000-000000000000'::uuid) AND (au.role = ANY (ARRAY['admin'::text, 'staff'::text]))))) OR (project_id IN ( SELECT p.id
   FROM (projects p
     JOIN account_users au ON ((au.account_id = p.account_id)))
  WHERE ((au.user_id = auth.uid()) AND (au.role = ANY (ARRAY['admin'::text, 'staff'::text, 'account_owner'::text]))))))) WITH CHECK (((EXISTS ( SELECT 1
   FROM account_users au
  WHERE ((au.user_id = auth.uid()) AND (au.account_id = '00000000-0000-0000-0000-000000000000'::uuid) AND (au.role = ANY (ARRAY['admin'::text, 'staff'::text]))))) OR (project_id IN ( SELECT p.id
   FROM (projects p
     JOIN account_users au ON ((au.account_id = p.account_id)))
  WHERE ((au.user_id = auth.uid()) AND (au.role = ANY (ARRAY['admin'::text, 'staff'::text, 'account_owner'::text]))))))); |
| CREATE POLICY "Users can view pages in their projects" ON pages AS PERMISSIVE FOR SELECT TO - USING (((EXISTS ( SELECT 1
   FROM account_users au
  WHERE ((au.user_id = auth.uid()) AND (au.account_id = '00000000-0000-0000-0000-000000000000'::uuid) AND (au.role = ANY (ARRAY['admin'::text, 'staff'::text]))))) OR (project_id IN ( SELECT p.id
   FROM (projects p
     JOIN account_users au ON ((au.account_id = p.account_id)))
  WHERE (au.user_id = auth.uid())))));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| CREATE POLICY "All users can view permissions" ON permissions AS PERMISSIVE FOR SELECT TO - USING ((auth.uid() IS NOT NULL));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| CREATE POLICY "Admins can manage all profiles" ON profiles AS PERMISSIVE FOR ALL TO authenticated USING (((auth.jwt() ->> 'role'::text) = 'admin'::text)) WITH CHECK (((auth.jwt() ->> 'role'::text) = 'admin'::text));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| CREATE POLICY "Users can view own profile" ON profiles AS PERMISSIVE FOR SELECT TO authenticated USING ((id = auth.uid()));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| CREATE POLICY "Authenticated users can delete domains" ON project_domains AS PERMISSIVE FOR DELETE TO - USING ((auth.uid() IS NOT NULL));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| CREATE POLICY "Authenticated users can insert domains" ON project_domains AS PERMISSIVE FOR INSERT TO - WITH CHECK ((auth.uid() IS NOT NULL));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| CREATE POLICY "Authenticated users can update domains" ON project_domains AS PERMISSIVE FOR UPDATE TO - USING ((auth.uid() IS NOT NULL));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| CREATE POLICY "Authenticated users can view domains" ON project_domains AS PERMISSIVE FOR SELECT TO - USING ((auth.uid() IS NOT NULL));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| CREATE POLICY "Public can view verified domains" ON project_domains AS PERMISSIVE FOR SELECT TO - USING ((verified = true));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| CREATE POLICY "Users can add domains to their projects" ON project_domains AS PERMISSIVE FOR INSERT TO - WITH CHECK ((EXISTS ( SELECT 1
   FROM projects
  WHERE ((projects.id = project_domains.project_id) AND (projects.customer_id = auth.uid())))));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| CREATE POLICY "Users can remove domains from their projects" ON project_domains AS PERMISSIVE FOR DELETE TO - USING ((EXISTS ( SELECT 1
   FROM projects
  WHERE ((projects.id = project_domains.project_id) AND (projects.customer_id = auth.uid())))));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| CREATE POLICY "Users can update domains of their projects" ON project_domains AS PERMISSIVE FOR UPDATE TO - USING ((EXISTS ( SELECT 1
   FROM projects
  WHERE ((projects.id = project_domains.project_id) AND (projects.customer_id = auth.uid())))));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| CREATE POLICY "Users can view domains of their projects" ON project_domains AS PERMISSIVE FOR SELECT TO - USING ((EXISTS ( SELECT 1
   FROM projects
  WHERE ((projects.id = project_domains.project_id) AND (projects.customer_id = auth.uid())))));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| CREATE POLICY "account_owners_delete_own_projects" ON projects AS PERMISSIVE FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.user_id = auth.uid()) AND (account_users.account_id = projects.account_id) AND (account_users.role = 'account_owner'::text)))));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| CREATE POLICY "platform_admins_delete_any_project" ON projects AS PERMISSIVE FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.user_id = auth.uid()) AND (account_users.account_id = '00000000-0000-0000-0000-000000000000'::uuid) AND (account_users.role = 'admin'::text)))));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| CREATE POLICY "simple_delete_projects" ON projects AS PERMISSIVE FOR DELETE TO - USING ((EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.user_id = auth.uid()) AND (account_users.account_id = projects.account_id) AND (account_users.role = 'admin'::text)))));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| CREATE POLICY "simple_insert_projects" ON projects AS PERMISSIVE FOR INSERT TO - WITH CHECK ((EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.user_id = auth.uid()) AND (account_users.account_id = projects.account_id) AND (account_users.role = ANY (ARRAY['admin'::text, 'staff'::text]))))));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| CREATE POLICY "simple_update_projects" ON projects AS PERMISSIVE FOR UPDATE TO - USING ((EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.user_id = auth.uid()) AND (account_users.account_id = projects.account_id) AND (account_users.role = ANY (ARRAY['admin'::text, 'staff'::text, 'account_owner'::text])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.user_id = auth.uid()) AND (account_users.account_id = projects.account_id) AND (account_users.role = ANY (ARRAY['admin'::text, 'staff'::text, 'account_owner'::text]))))));                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| CREATE POLICY "users_can_create_projects" ON projects AS PERMISSIVE FOR INSERT TO - WITH CHECK (((EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.user_id = auth.uid()) AND (account_users.account_id = '00000000-0000-0000-0000-000000000000'::uuid) AND (account_users.role = 'admin'::text)))) OR (EXISTS ( SELECT 1
   FROM account_users au
  WHERE ((au.user_id = auth.uid()) AND (au.account_id = '00000000-0000-0000-0000-000000000000'::uuid) AND (au.role = 'staff'::text) AND (au.account_id IN ( SELECT staff_account_assignments.account_id
           FROM staff_account_assignments
          WHERE (staff_account_assignments.staff_user_id = auth.uid())))))) OR (EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.user_id = auth.uid()) AND (account_users.account_id = projects.account_id) AND (account_users.role = 'account_owner'::text) AND (account_users.account_id <> '00000000-0000-0000-0000-000000000000'::uuid))))));                                                           |
| CREATE POLICY "users_can_delete_projects" ON projects AS PERMISSIVE FOR DELETE TO - USING ((EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.user_id = auth.uid()) AND (account_users.account_id = '00000000-0000-0000-0000-000000000000'::uuid) AND (account_users.role = 'admin'::text)))));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| CREATE POLICY "users_can_update_projects" ON projects AS PERMISSIVE FOR UPDATE TO - USING (((EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.user_id = auth.uid()) AND (account_users.account_id = '00000000-0000-0000-0000-000000000000'::uuid) AND (account_users.role = 'admin'::text)))) OR (EXISTS ( SELECT 1
   FROM account_users au
  WHERE ((au.user_id = auth.uid()) AND (au.account_id = '00000000-0000-0000-0000-000000000000'::uuid) AND (au.role = 'staff'::text) AND (projects.account_id IN ( SELECT staff_account_assignments.account_id
           FROM staff_account_assignments
          WHERE (staff_account_assignments.staff_user_id = auth.uid())))))) OR (EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.user_id = auth.uid()) AND (account_users.account_id = projects.account_id) AND (account_users.role = 'account_owner'::text) AND (account_users.account_id <> '00000000-0000-0000-0000-000000000000'::uuid))))));                                                          |
| CREATE POLICY "users_can_view_projects" ON projects AS PERMISSIVE FOR SELECT TO - USING (((EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.user_id = auth.uid()) AND (account_users.account_id = '00000000-0000-0000-0000-000000000000'::uuid) AND (account_users.role = 'admin'::text)))) OR (EXISTS ( SELECT 1
   FROM account_users au
  WHERE ((au.user_id = auth.uid()) AND (au.account_id = '00000000-0000-0000-0000-000000000000'::uuid) AND (au.role = 'staff'::text) AND (projects.account_id IN ( SELECT staff_account_assignments.account_id
           FROM staff_account_assignments
          WHERE (staff_account_assignments.staff_user_id = auth.uid())))))) OR (account_id IN ( SELECT account_users.account_id
   FROM account_users
  WHERE ((account_users.user_id = auth.uid()) AND (account_users.account_id <> '00000000-0000-0000-0000-000000000000'::uuid))))));                                                                                                                                    |
| CREATE POLICY "Platform admins can manage reserved domain permissions" ON reserved_domain_permissions AS PERMISSIVE FOR ALL TO - USING ((auth.uid() IN ( SELECT account_users.user_id
   FROM account_users
  WHERE ((account_users.account_id = '00000000-0000-0000-0000-000000000000'::uuid) AND (account_users.role = ANY (ARRAY['admin'::text, 'staff'::text]))))));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| CREATE POLICY "Users can view roles" ON roles AS PERMISSIVE FOR SELECT TO - USING (((is_system = true) OR (EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.account_id = roles.account_id) AND (account_users.user_id = auth.uid()))))));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| CREATE POLICY "Admins can create staff assignments" ON staff_account_assignments AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.user_id = auth.uid()) AND (account_users.account_id = '00000000-0000-0000-0000-000000000000'::uuid) AND (account_users.role = 'admin'::text)))));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| CREATE POLICY "Admins can delete staff assignments" ON staff_account_assignments AS PERMISSIVE FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.user_id = auth.uid()) AND (account_users.account_id = '00000000-0000-0000-0000-000000000000'::uuid) AND (account_users.role = 'admin'::text)))));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| CREATE POLICY "Admins can view all staff assignments" ON staff_account_assignments AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM account_users
  WHERE ((account_users.user_id = auth.uid()) AND (account_users.account_id = '00000000-0000-0000-0000-000000000000'::uuid) AND (account_users.role = 'admin'::text)))));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| CREATE POLICY "Staff can view own assignments" ON staff_account_assignments AS PERMISSIVE FOR SELECT TO authenticated USING ((staff_user_id = auth.uid()));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| CREATE POLICY "Everyone can view themes" ON themes AS PERMISSIVE FOR SELECT TO authenticated USING (true);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| CREATE POLICY "Staff and admins can delete themes" ON themes AS PERMISSIVE FOR DELETE TO authenticated USING (has_role(ARRAY['staff'::text, 'admin'::text]));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| CREATE POLICY "Staff and admins can insert themes" ON themes AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (has_role(ARRAY['staff'::text, 'admin'::text]));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| CREATE POLICY "Staff and admins can update themes" ON themes AS PERMISSIVE FOR UPDATE TO authenticated USING (has_role(ARRAY['staff'::text, 'admin'::text])) WITH CHECK (has_role(ARRAY['staff'::text, 'admin'::text]));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| CREATE POLICY "Everyone can view types" ON types AS PERMISSIVE FOR SELECT TO authenticated USING (true);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| CREATE POLICY "Staff and admins can delete types" ON types AS PERMISSIVE FOR DELETE TO authenticated USING (has_role(ARRAY['staff'::text, 'admin'::text]));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| CREATE POLICY "Staff and admins can insert types" ON types AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (has_role(ARRAY['staff'::text, 'admin'::text]));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| CREATE POLICY "Staff and admins can update types" ON types AS PERMISSIVE FOR UPDATE TO authenticated USING (has_role(ARRAY['staff'::text, 'admin'::text])) WITH CHECK (has_role(ARRAY['staff'::text, 'admin'::text]));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| CREATE POLICY "Admin and staff can insert profiles" ON user_profiles AS PERMISSIVE FOR INSERT TO - WITH CHECK ((is_system_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'staff'::text])))))));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| CREATE POLICY "Admin and staff can update any profile" ON user_profiles AS PERMISSIVE FOR UPDATE TO - USING ((is_system_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'staff'::text])))))));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| CREATE POLICY "Admin and staff can view all profiles" ON user_profiles AS PERMISSIVE FOR SELECT TO - USING ((is_system_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'staff'::text])))))));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| CREATE POLICY "Users can update own profile" ON user_profiles AS PERMISSIVE FOR UPDATE TO - USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| CREATE POLICY "Users can view own profile" ON user_profiles AS PERMISSIVE FOR SELECT TO - USING ((auth.uid() = user_id));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

QUERY 5

| rls_statement                                                      |
| ------------------------------------------------------------------ |
| ALTER TABLE account_users ENABLE ROW LEVEL SECURITY;               |
| ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;                    |
| ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;                  |
| ALTER TABLE core_components ENABLE ROW LEVEL SECURITY;             |
| ALTER TABLE lab_drafts ENABLE ROW LEVEL SECURITY;                  |
| ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;               |
| ALTER TABLE library_versions ENABLE ROW LEVEL SECURITY;            |
| ALTER TABLE pages ENABLE ROW LEVEL SECURITY;                       |
| ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;                 |
| ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;                    |
| ALTER TABLE project_domains ENABLE ROW LEVEL SECURITY;             |
| ALTER TABLE projects ENABLE ROW LEVEL SECURITY;                    |
| ALTER TABLE reserved_domain_permissions ENABLE ROW LEVEL SECURITY; |
| ALTER TABLE roles ENABLE ROW LEVEL SECURITY;                       |
| ALTER TABLE staff_account_assignments ENABLE ROW LEVEL SECURITY;   |
| ALTER TABLE themes ENABLE ROW LEVEL SECURITY;                      |
| ALTER TABLE types ENABLE ROW LEVEL SECURITY;                       |
| ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;               |



QUERY 6

| function_statement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CREATE OR REPLACE FUNCTION check_projects_policy_recursion() RETURNS event_trigger AS $$

BEGIN
  RAISE NOTICE 'Policy created/altered on projects table - please ensure no self-referential queries';
END;

$$ LANGUAGE plpgsql;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| CREATE OR REPLACE FUNCTION check_theme_type() RETURNS trigger AS $$

BEGIN
  IF NEW.theme_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM library_items 
      WHERE id = NEW.theme_id 
      AND type = 'theme'
    ) THEN
      RAISE EXCEPTION 'Referenced library_item must be of type theme';
    END IF;
  END IF;
  RETURN NEW;
END;

$$ LANGUAGE plpgsql;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| CREATE OR REPLACE FUNCTION check_user_access() RETURNS TABLE(user_id uuid, user_email text, user_role text, has_admin boolean, has_staff boolean, has_lab_access boolean) AS $$

BEGIN
  RETURN QUERY
  SELECT 
    auth.uid() as user_id,
    auth.email() as user_email,
    p.role as user_role,
    public.has_role(ARRAY['admin']) as has_admin,
    public.has_role(ARRAY['staff', 'admin']) as has_staff,
    public.has_role(ARRAY['staff', 'admin']) as has_lab_access
  FROM profiles p
  WHERE p.id = auth.uid();
END;

$$ LANGUAGE plpgsql SECURITY DEFINER;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| CREATE OR REPLACE FUNCTION cleanup_old_deployments() RETURNS void AS $$

BEGIN
  DELETE FROM deployment_queue 
  WHERE status IN ('completed', 'failed') 
  AND completed_at < NOW() - INTERVAL '30 days';
END;

$$ LANGUAGE plpgsql;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| CREATE OR REPLACE FUNCTION create_user_profile() RETURNS trigger AS $$

BEGIN
    INSERT INTO public.user_profiles (user_id, display_name, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'display_name', 
            split_part(NEW.email, '@', 1)
        ),
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail signup
        RAISE WARNING 'Error creating user profile for %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;

$$ LANGUAGE plpgsql SECURITY DEFINER;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| CREATE OR REPLACE FUNCTION debug_user_access() RETURNS TABLE(current_user_id uuid, account_users_count integer, accounts_count integer, is_admin boolean, account_users_data jsonb, accounts_data jsonb) AS $$

DECLARE
  v_user_id UUID;  -- Use v_ prefix to avoid ambiguity
BEGIN
  v_user_id := auth.uid();
  
  RETURN QUERY
  SELECT 
    v_user_id as current_user_id,
    (SELECT COUNT(*) FROM account_users au WHERE au.user_id = v_user_id)::INTEGER as account_users_count,
    (SELECT COUNT(*) FROM accounts a WHERE EXISTS (
      SELECT 1 FROM account_users au2 
      WHERE au2.account_id = a.id AND au2.user_id = v_user_id
    ))::INTEGER as accounts_count,
    (SELECT EXISTS (
      SELECT 1 FROM account_users au3
      WHERE au3.user_id = v_user_id AND au3.role = 'admin'
    )) as is_admin,
    (SELECT jsonb_agg(row_to_json(au4.*)) FROM account_users au4 WHERE au4.user_id = v_user_id) as account_users_data,
    (SELECT jsonb_agg(row_to_json(a2.*)) FROM accounts a2 WHERE EXISTS (
      SELECT 1 FROM account_users au5 
      WHERE au5.account_id = a2.id AND au5.user_id = v_user_id
    )) as accounts_data;
END;

$$ LANGUAGE plpgsql SECURITY DEFINER;                                                                                                                      |
| CREATE OR REPLACE FUNCTION generate_project_slug() RETURNS trigger AS $$

BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
  END IF;
  RETURN NEW;
END;

$$ LANGUAGE plpgsql;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| CREATE OR REPLACE FUNCTION generate_slug_from_email(email text) RETURNS text AS $$

DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Extract username from email and convert to slug
  base_slug := LOWER(REGEXP_REPLACE(SPLIT_PART(email, '@', 1), '[^a-z0-9]+', '-', 'g'));
  final_slug := base_slug;
  
  -- Check if slug exists and append number if needed
  WHILE EXISTS (SELECT 1 FROM accounts WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;

$$ LANGUAGE plpgsql;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| CREATE OR REPLACE FUNCTION get_deployment_url(p_subdomain character varying, p_domain character varying, p_deployment_url text) RETURNS text AS $$

BEGIN
    -- If deployment_url is already set, return it
    IF p_deployment_url IS NOT NULL THEN
        RETURN p_deployment_url;
    END IF;
    
    -- Otherwise, construct from subdomain and domain
    IF p_subdomain IS NOT NULL AND p_domain IS NOT NULL THEN
        IF p_subdomain = '' THEN
            -- Root domain (no subdomain)
            RETURN 'https://' || p_domain;
        ELSE
            -- With subdomain
            RETURN 'https://' || p_subdomain || '.' || p_domain;
        END IF;
    END IF;
    
    RETURN NULL;
END;

$$ LANGUAGE plpgsql;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| CREATE OR REPLACE FUNCTION has_role(allowed_roles text[]) RETURNS boolean AS $$

DECLARE
  user_role TEXT;
BEGIN
  -- Get the current user's role
  SELECT role INTO user_role
  FROM public.profiles 
  WHERE id = auth.uid();
  
  -- Return true if user's role is in the allowed roles
  RETURN user_role = ANY(allowed_roles);
END;

$$ LANGUAGE plpgsql SECURITY DEFINER;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| CREATE OR REPLACE FUNCTION is_system_admin(user_id uuid) RETURNS boolean AS $$

DECLARE
  user_metadata JSONB;
BEGIN
  SELECT raw_user_meta_data INTO user_metadata
  FROM auth.users
  WHERE id = user_id;
  
  RETURN COALESCE((user_metadata->>'is_system_admin')::BOOLEAN, FALSE);
END;

$$ LANGUAGE plpgsql SECURITY DEFINER;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| CREATE OR REPLACE FUNCTION is_valid_domain(domain_name text) RETURNS boolean AS $$

BEGIN
    -- Basic domain validation regex
    RETURN domain_name ~* '^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$';
END;

$$ LANGUAGE plpgsql;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| CREATE OR REPLACE FUNCTION page_has_unpublished_changes(page_id uuid) RETURNS boolean AS $$

DECLARE
  page_record pages;
BEGIN
  SELECT * INTO page_record FROM pages WHERE id = page_id;
  
  IF page_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Compare sections (draft) with published_sections
  RETURN page_record.sections::text != page_record.published_sections::text;
END;

$$ LANGUAGE plpgsql SECURITY DEFINER;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| CREATE OR REPLACE FUNCTION publish_page_draft(page_id uuid) RETURNS pages AS $$

DECLARE
  updated_page pages;
BEGIN
  UPDATE pages 
  SET 
    published_sections = sections,
    updated_at = NOW()
  WHERE id = page_id
  RETURNING * INTO updated_page;
  
  IF updated_page IS NULL THEN
    RAISE EXCEPTION 'Page with id % not found', page_id;
  END IF;
  
  RETURN updated_page;
END;

$$ LANGUAGE plpgsql SECURITY DEFINER;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| CREATE OR REPLACE FUNCTION transition_project_status(p_project_id uuid, p_new_status project_status_type, p_user_id uuid, p_reason text) RETURNS boolean AS $$

DECLARE
  v_old_status project_status_type;
  v_is_admin boolean;
BEGIN
  -- Check if user is admin
  SELECT role = 'admin' INTO v_is_admin
  FROM users
  WHERE id = p_user_id;
  
  -- Get current status
  SELECT project_status INTO v_old_status
  FROM projects
  WHERE id = p_project_id;
  
  IF v_old_status IS NULL THEN
    RAISE EXCEPTION 'Project not found';
  END IF;
  
  -- Update the status (admins can make any transition)
  UPDATE projects
  SET project_status = p_new_status,
      updated_at = now()
  WHERE id = p_project_id;
  
  -- Record the transition
  INSERT INTO project_status_history (
    project_id, old_status, new_status, changed_by, reason
  ) VALUES (
    p_project_id, v_old_status, p_new_status, p_user_id, p_reason
  );
  
  -- Log the action
  INSERT INTO audit_logs (
    user_id, action_type, entity_type, entity_id, old_data, new_data
  ) VALUES (
    p_user_id, 
    'status_change', 
    'project', 
    p_project_id,
    jsonb_build_object('status', v_old_status),
    jsonb_build_object('status', p_new_status)
  );
  
  RETURN true;
END;

$$ LANGUAGE plpgsql SECURITY DEFINER; |
| CREATE OR REPLACE FUNCTION update_deployment_queue_updated_at() RETURNS trigger AS $$

BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;

$$ LANGUAGE plpgsql;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| CREATE OR REPLACE FUNCTION update_netlify_site_cache_updated_at() RETURNS trigger AS $$

BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;

$$ LANGUAGE plpgsql;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS trigger AS $$

BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;

$$ LANGUAGE plpgsql;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| CREATE OR REPLACE FUNCTION update_user_profiles_updated_at() RETURNS trigger AS $$

BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;

$$ LANGUAGE plpgsql;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| CREATE OR REPLACE FUNCTION validate_deployment_url(url text) RETURNS boolean AS $$

BEGIN
    -- Prevent deploying to bare wondrousdigital.com
    IF url IN ('wondrousdigital.com', 'https://wondrousdigital.com', 'http://wondrousdigital.com') THEN
        RAISE EXCEPTION 'Cannot deploy project to main marketing domain. Use a subdomain instead.';
    END IF;
    
    -- Basic URL validation
    IF url IS NULL OR url = '' THEN
        RETURN TRUE; -- Allow NULL values
    END IF;
    
    RETURN TRUE;
END;

$$ LANGUAGE plpgsql;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |



QUERY 7

| trigger_statement                                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------- |
| CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();                  |
| CREATE TRIGGER update_core_components_updated_at BEFORE UPDATE ON core_components FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();    |
| CREATE TRIGGER update_lab_drafts_updated_at BEFORE UPDATE ON lab_drafts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();              |
| CREATE TRIGGER update_library_items_updated_at BEFORE UPDATE ON library_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();        |
| CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();                        |
| CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();                  |
| CREATE TRIGGER projects_generate_slug BEFORE INSERT ON projects FOR EACH ROW EXECUTE FUNCTION generate_project_slug();                         |
| CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();                  |
| CREATE TRIGGER validate_project_theme BEFORE INSERT ON projects FOR EACH ROW EXECUTE FUNCTION check_theme_type();                              |
| CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();                        |
| CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON themes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();                      |
| CREATE TRIGGER update_types_updated_at BEFORE UPDATE ON types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();                        |
| CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_user_profiles_updated_at(); |



