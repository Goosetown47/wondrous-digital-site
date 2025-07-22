import type { Section } from '@/stores/builderStore';

export interface Project {
  id: string;
  name: string;
  customer_id: string;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  project_id: string;
  path: string;
  title?: string;
  sections: Section[];
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
  created_at: string;
}

// Database response types
export interface Database {
  public: {
    Tables: {
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
    };
  };
}