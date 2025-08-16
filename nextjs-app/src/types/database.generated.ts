
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      account_billing_history: {
        Row: {
          account_id: string
          amount_cents: number | null
          created_at: string | null
          currency: string | null
          event_type: string
          id: string
          metadata: Json | null
          new_tier: Database["public"]["Enums"]["tier_name"] | null
          old_tier: Database["public"]["Enums"]["tier_name"] | null
          stripe_event_id: string | null
          stripe_invoice_id: string | null
        }
        Insert: {
          account_id: string
          amount_cents?: number | null
          created_at?: string | null
          currency?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          new_tier?: Database["public"]["Enums"]["tier_name"] | null
          old_tier?: Database["public"]["Enums"]["tier_name"] | null
          stripe_event_id?: string | null
          stripe_invoice_id?: string | null
        }
        Update: {
          account_id?: string
          amount_cents?: number | null
          created_at?: string | null
          currency?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          new_tier?: Database["public"]["Enums"]["tier_name"] | null
          old_tier?: Database["public"]["Enums"]["tier_name"] | null
          stripe_event_id?: string | null
          stripe_invoice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "account_billing_history_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      account_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          account_id: string
          cancelled_at: string | null
          created_at: string
          declined_at: string | null
          email: string
          expires_at: string
          id: string
          invited_at: string
          invited_by: string
          role: string
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          account_id: string
          cancelled_at?: string | null
          created_at?: string
          declined_at?: string | null
          email: string
          expires_at?: string
          id?: string
          invited_at?: string
          invited_by: string
          role: string
          token?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          account_id?: string
          cancelled_at?: string | null
          created_at?: string
          declined_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_at?: string
          invited_by?: string
          role?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_invitations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      account_users: {
        Row: {
          account_id: string
          invited_by: string | null
          joined_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          account_id: string
          invited_by?: string | null
          joined_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          account_id?: string
          invited_by?: string | null
          joined_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_users_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          created_at: string | null
          grace_period_ends_at: string | null
          has_perform_addon: boolean | null
          id: string
          name: string
          plan: string | null
          settings: Json | null
          setup_fee_paid: boolean | null
          setup_fee_paid_at: string | null
          slug: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          tier: Database["public"]["Enums"]["tier_name"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          grace_period_ends_at?: string | null
          has_perform_addon?: boolean | null
          id?: string
          name: string
          plan?: string | null
          settings?: Json | null
          setup_fee_paid?: boolean | null
          setup_fee_paid_at?: string | null
          slug: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          tier?: Database["public"]["Enums"]["tier_name"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          grace_period_ends_at?: string | null
          has_perform_addon?: boolean | null
          id?: string
          name?: string
          plan?: string | null
          settings?: Json | null
          setup_fee_paid?: boolean | null
          setup_fee_paid_at?: string | null
          slug?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          tier?: Database["public"]["Enums"]["tier_name"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          account_id: string | null
          action: string
          created_at: string | null
          id: string
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          user_id: string | null
        }
        Insert: {
          account_id?: string | null
          action: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
        }
        Update: {
          account_id?: string | null
          action?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      core_components: {
        Row: {
          code: string
          created_at: string | null
          dependencies: Json | null
          id: string
          imports: Json | null
          metadata: Json | null
          name: string
          source: string
          type: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          dependencies?: Json | null
          id?: string
          imports?: Json | null
          metadata?: Json | null
          name: string
          source: string
          type: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          dependencies?: Json | null
          id?: string
          imports?: Json | null
          metadata?: Json | null
          name?: string
          source?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lab_drafts: {
        Row: {
          content: Json
          content_hash: string | null
          created_at: string | null
          created_by: string | null
          id: string
          library_version: number | null
          metadata: Json | null
          name: string
          status: string | null
          tier_restrictions: Json | null
          type: string
          type_id: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          content: Json
          content_hash?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          library_version?: number | null
          metadata?: Json | null
          name: string
          status?: string | null
          tier_restrictions?: Json | null
          type: string
          type_id?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          content?: Json
          content_hash?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          library_version?: number | null
          metadata?: Json | null
          name?: string
          status?: string | null
          tier_restrictions?: Json | null
          type?: string
          type_id?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_drafts_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "types"
            referencedColumns: ["id"]
          },
        ]
      }
      library_items: {
        Row: {
          category: string | null
          component_name: string | null
          content: Json
          created_at: string | null
          created_by: string | null
          id: string
          metadata: Json | null
          name: string
          published: boolean | null
          source_draft_id: string | null
          theme_id: string | null
          tier_restrictions: Json | null
          type: string
          type_id: string | null
          updated_at: string | null
          usage_count: number | null
          version: number | null
        }
        Insert: {
          category?: string | null
          component_name?: string | null
          content: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          metadata?: Json | null
          name: string
          published?: boolean | null
          source_draft_id?: string | null
          theme_id?: string | null
          tier_restrictions?: Json | null
          type: string
          type_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
          version?: number | null
        }
        Update: {
          category?: string | null
          component_name?: string | null
          content?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          published?: boolean | null
          source_draft_id?: string | null
          theme_id?: string | null
          tier_restrictions?: Json | null
          type?: string
          type_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "library_items_source_draft_id_fkey"
            columns: ["source_draft_id"]
            isOneToOne: false
            referencedRelation: "lab_drafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_items_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_items_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "types"
            referencedColumns: ["id"]
          },
        ]
      }
      library_versions: {
        Row: {
          change_notes: string | null
          content: Json
          created_at: string | null
          created_by: string | null
          id: string
          library_item_id: string | null
          version: number
        }
        Insert: {
          change_notes?: string | null
          content: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          library_item_id?: string | null
          version: number
        }
        Update: {
          change_notes?: string | null
          content?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          library_item_id?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "library_versions_library_item_id_fkey"
            columns: ["library_item_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          path: string
          project_id: string | null
          published_sections: Json | null
          sections: Json | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          path?: string
          project_id?: string | null
          published_sections?: Json | null
          sections?: Json | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          path?: string
          project_id?: string | null
          published_sections?: Json | null
          sections?: Json | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: string
          description: string | null
          id: string
          resource: string
        }
        Insert: {
          action: string
          description?: string | null
          id?: string
          resource: string
        }
        Update: {
          action?: string
          description?: string | null
          id?: string
          resource?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_domains: {
        Row: {
          created_at: string | null
          domain: string
          id: string
          include_www: boolean | null
          is_primary: boolean | null
          project_id: string | null
          ssl_state: string | null
          verification_details: Json | null
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          id?: string
          include_www?: boolean | null
          is_primary?: boolean | null
          project_id?: string | null
          ssl_state?: string | null
          verification_details?: Json | null
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          include_www?: boolean | null
          is_primary?: boolean | null
          project_id?: string | null
          ssl_state?: string | null
          verification_details?: Json | null
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_domains_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_users: {
        Row: {
          access_level: string | null
          account_id: string
          granted_at: string
          granted_by: string | null
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          access_level?: string | null
          account_id: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          access_level?: string | null
          account_id?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_users_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_users_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          account_id: string | null
          archived_at: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          description: string | null
          id: string
          name: string
          slug: string
          template_id: string | null
          theme_id: string | null
          theme_overrides: Json | null
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          archived_at?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
          template_id?: string | null
          theme_id?: string | null
          theme_overrides?: Json | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          archived_at?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
          template_id?: string | null
          theme_id?: string | null
          theme_overrides?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
        ]
      }
      reserved_domain_permissions: {
        Row: {
          account_id: string | null
          domain: string
          granted_at: string | null
          granted_by: string | null
          id: string
          notes: string | null
        }
        Insert: {
          account_id?: string | null
          domain: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          notes?: string | null
        }
        Update: {
          account_id?: string | null
          domain?: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reserved_domain_permissions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          account_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_system: boolean | null
          name: string
          permissions: string[]
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          permissions?: string[]
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          permissions?: string[]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      security_configuration_checks: {
        Row: {
          check_name: string
          checked_at: string | null
          description: string | null
          expected_value: string
          id: number
          is_compliant: boolean | null
        }
        Insert: {
          check_name: string
          checked_at?: string | null
          description?: string | null
          expected_value: string
          id?: number
          is_compliant?: boolean | null
        }
        Update: {
          check_name?: string
          checked_at?: string | null
          description?: string | null
          expected_value?: string
          id?: number
          is_compliant?: boolean | null
        }
        Relationships: []
      }
      staff_account_assignments: {
        Row: {
          account_id: string
          assigned_at: string | null
          assigned_by: string | null
          id: string
          staff_user_id: string
        }
        Insert: {
          account_id: string
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          staff_user_id: string
        }
        Update: {
          account_id?: string
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          staff_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_account_assignments_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      themes: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          metadata: Json | null
          name: string
          tier_restrictions: Json | null
          updated_at: string | null
          variables: Json
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          tier_restrictions?: Json | null
          updated_at?: string | null
          variables: Json
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          tier_restrictions?: Json | null
          updated_at?: string | null
          variables?: Json
        }
        Relationships: []
      }
      tier_features: {
        Row: {
          created_at: string | null
          custom_domains: boolean | null
          features: Json | null
          id: string
          marketing_platform: boolean | null
          max_projects: number
          max_users: number
          seo_platform: boolean | null
          tier: Database["public"]["Enums"]["tier_name"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_domains?: boolean | null
          features?: Json | null
          id?: string
          marketing_platform?: boolean | null
          max_projects: number
          max_users: number
          seo_platform?: boolean | null
          tier: Database["public"]["Enums"]["tier_name"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_domains?: boolean | null
          features?: Json | null
          id?: string
          marketing_platform?: boolean | null
          max_projects?: number
          max_users?: number
          seo_platform?: boolean | null
          tier?: Database["public"]["Enums"]["tier_name"]
          updated_at?: string | null
        }
        Relationships: []
      }
      types: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          display_name: string
          icon: string | null
          id: string
          metadata: Json | null
          name: string
          schema: Json | null
          tier_restrictions: Json | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          display_name: string
          icon?: string | null
          id?: string
          metadata?: Json | null
          name: string
          schema?: Json | null
          tier_restrictions?: Json | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          display_name?: string
          icon?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          schema?: Json | null
          tier_restrictions?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          metadata: Json | null
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          metadata?: Json | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          metadata?: Json | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      project_access_view: {
        Row: {
          access_level: string | null
          account_id: string | null
          granted_at: string | null
          granted_by: string | null
          granted_by_display_name: string | null
          id: string | null
          project_id: string | null
          project_name: string | null
          user_avatar_url: string | null
          user_display_name: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_users_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_users_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_invitation: {
        Args: { invitation_token: string }
        Returns: Json
      }
      cleanup_old_deployments: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      decline_invitation: {
        Args: { invitation_token: string }
        Returns: Json
      }
      filter_by_tier: {
        Args: { user_tier: Database["public"]["Enums"]["tier_name"] }
        Returns: {
          id: string
          name: string
          tier_restrictions: Json
          type: string
        }[]
      }
      generate_slug_from_email: {
        Args: { email: string }
        Returns: string
      }
      get_account_users_with_details: {
        Args: { p_account_id: string }
        Returns: {
          account_id: string
          avatar_url: string
          display_name: string
          email: string
          email_confirmed_at: string
          invited_by: string
          joined_at: string
          profile_metadata: Json
          role: string
          user_id: string
        }[]
      }
      get_project_access_for_account: {
        Args: { p_account_id: string }
        Returns: {
          access_level: string
          account_id: string
          granted_at: string
          granted_by: string
          granted_by_display_name: string
          id: string
          project_id: string
          project_name: string
          user_avatar_url: string
          user_display_name: string
          user_id: string
        }[]
      }
      get_recent_audit_logs: {
        Args: { p_account_id: string; p_limit?: number }
        Returns: {
          account_id: string
          action: string
          created_at: string
          id: string
          metadata: Json
          resource_id: string
          resource_type: string
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      has_project_access: {
        Args: { p_project_id: string; p_user_id?: string }
        Returns: boolean
      }
      has_role: {
        Args: { allowed_roles: string[] }
        Returns: boolean
      }
      has_tier_access: {
        Args: {
          account_tier: Database["public"]["Enums"]["tier_name"]
          restrictions: Json
        }
        Returns: boolean
      }
      is_valid_domain: {
        Args: { domain: string }
        Returns: boolean
      }
      mark_security_check_compliant: {
        Args: { p_check_name: string }
        Returns: undefined
      }
      page_has_unpublished_changes: {
        Args: { page_id: string }
        Returns: boolean
      }
      publish_page_draft: {
        Args: { page_id: string }
        Returns: undefined
      }
    }
    Enums: {
      account_type: "prospect" | "customer" | "inactive"
      project_status_type:
        | "draft"
        | "template-internal"
        | "template-public"
        | "prospect-staging"
        | "live-customer"
        | "paused-maintenance"
        | "archived"
      tier_name: "FREE" | "BASIC" | "PRO" | "SCALE" | "MAX"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_type: ["prospect", "customer", "inactive"],
      project_status_type: [
        "draft",
        "template-internal",
        "template-public",
        "prospect-staging",
        "live-customer",
        "paused-maintenance",
        "archived",
      ],
      tier_name: ["FREE", "BASIC", "PRO", "SCALE", "MAX"],
    },
  },
} as const
