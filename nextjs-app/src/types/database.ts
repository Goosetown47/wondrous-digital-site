import type { Section } from '@/stores/builderStore';

// Multi-tenant entities
export interface Account {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AccountUser {
  account_id: string;
  user_id: string;
  role: 'account_owner' | 'user' | 'staff' | 'admin';
  joined_at: string;
  invited_by?: string | null;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  account_id?: string | null;
  description?: string | null;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string | null;
}

export interface AuditLog {
  id: string;
  account_id: string;
  user_id: string;
  action: string;
  resource_type?: string | null;
  resource_id?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface StaffAccountAssignment {
  id: string;
  staff_user_id: string;
  account_id: string;
  assignment_notes?: string | null;
  assigned_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccountInvitation {
  id: string;
  account_id: string;
  email: string;
  role: 'account_owner' | 'user';
  token: string;
  invited_by: string;
  invited_at: string;
  expires_at: string;
  accepted_at?: string | null;
  declined_at?: string | null;
  cancelled_at?: string | null;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  customer_id: string; // Kept for backward compatibility
  account_id?: string | null; // New field for multi-tenant
  theme_id?: string | null;
  theme_overrides?: Record<string, unknown> | null;
  archived_at?: string | null;
  created_by?: string | null;
  template_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  project_id: string;
  path: string;
  title?: string;
  sections: Section[];
  published_sections?: Section[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ProjectDomain {
  id: string;
  project_id: string;
  domain: string;
  is_primary: boolean;
  verified: boolean;
  verified_at?: string;
  ssl_state?: string;
  verification_details?: Record<string, unknown>;
  created_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject_template: string;
  body_template: string;
  description?: string | null;
  variables: string[];
  created_at: string;
  updated_at: string;
}

export interface EmailQueue {
  id: string;
  to_email: string;
  from_email: string;
  subject: string;
  body: string;
  template_id?: string | null;
  template_data?: Record<string, unknown>;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  retry_count: number;
  max_retries: number;
  scheduled_at: string;
  sent_at?: string | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: string;
  email_queue_id: string;
  provider: string;
  provider_id?: string | null;
  status: string;
  delivered_at?: string | null;
  opened_at?: string | null;
  clicked_at?: string | null;
  bounced_at?: string | null;
  complained_at?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface EmailPreferences {
  user_id: string;
  marketing_emails: boolean;
  product_updates: boolean;
  security_alerts: boolean;
  billing_notifications: boolean;
  weekly_digest: boolean;
  created_at: string;
  updated_at: string;
}

// Database response types
export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: Account;
        Insert: Omit<Account, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Account, 'id' | 'created_at' | 'updated_at'>>;
      };
      account_users: {
        Row: AccountUser;
        Insert: Omit<AccountUser, 'joined_at'>;
        Update: Partial<AccountUser>;
      };
      roles: {
        Row: Role;
        Insert: Omit<Role, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Role, 'id' | 'created_at' | 'updated_at'>>;
      };
      permissions: {
        Row: Permission;
        Insert: Omit<Permission, 'id'>;
        Update: Partial<Omit<Permission, 'id'>>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'id' | 'created_at'>;
        Update: never; // Audit logs should never be updated
      };
      staff_account_assignments: {
        Row: StaffAccountAssignment;
        Insert: Omit<StaffAccountAssignment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<StaffAccountAssignment, 'id' | 'created_at' | 'updated_at'>>;
      };
      account_invitations: {
        Row: AccountInvitation;
        Insert: Omit<AccountInvitation, 'id' | 'token' | 'invited_at' | 'expires_at'>;
        Update: Partial<Pick<AccountInvitation, 'accepted_at' | 'declined_at' | 'cancelled_at'>>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>;
      };
      pages: {
        Row: Page;
        Insert: Omit<Page, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Page, 'id' | 'created_at' | 'updated_at'>>;
      };
      project_domains: {
        Row: ProjectDomain;
        Insert: Omit<ProjectDomain, 'id' | 'created_at'>;
        Update: Partial<Omit<ProjectDomain, 'id' | 'created_at'>>;
      };
      email_templates: {
        Row: EmailTemplate;
        Insert: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>>;
      };
      email_queue: {
        Row: EmailQueue;
        Insert: Omit<EmailQueue, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<EmailQueue, 'id' | 'created_at' | 'updated_at'>>;
      };
      email_logs: {
        Row: EmailLog;
        Insert: Omit<EmailLog, 'id' | 'created_at'>;
        Update: never; // Email logs should not be updated
      };
      email_preferences: {
        Row: EmailPreferences;
        Insert: Omit<EmailPreferences, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<EmailPreferences, 'user_id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}