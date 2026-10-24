export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admin_users_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      causes: {
        Row: {
          active: boolean;
          id: string;
          name: string;
        };
        Insert: {
          active?: boolean;
          id: string;
          name: string;
        };
        Update: {
          active?: boolean;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          author_id: string;
          body: string;
          created_at: string;
          hidden: boolean;
          id: string;
          post_id: string;
        };
        Insert: {
          author_id: string;
          body: string;
          created_at?: string;
          hidden?: boolean;
          id?: string;
          post_id: string;
        };
        Update: {
          author_id?: string;
          body?: string;
          created_at?: string;
          hidden?: boolean;
          id?: string;
          post_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "impact_posts";
            referencedColumns: ["id"];
          },
        ];
      };
      follows: {
        Row: {
          created_at: string;
          follower_id: string;
          id: string;
          organisation_id: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          follower_id: string;
          id?: string;
          organisation_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          follower_id?: string;
          id?: string;
          organisation_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey";
            columns: ["follower_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "follows_organisation_id_fkey";
            columns: ["organisation_id"];
            isOneToOne: false;
            referencedRelation: "organisations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "follows_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      impact_posts: {
        Row: {
          author_id: string;
          body: string;
          created_at: string;
          hidden: boolean;
          id: string;
          initiative_id: string | null;
          kind: string;
          media_paths: string[];
          milestone: string;
          organisation_id: string | null;
          role: string;
        };
        Insert: {
          author_id: string;
          body: string;
          created_at?: string;
          hidden?: boolean;
          id?: string;
          initiative_id?: string | null;
          kind?: string;
          media_paths?: string[];
          milestone?: string;
          organisation_id?: string | null;
          role?: string;
        };
        Update: {
          author_id?: string;
          body?: string;
          created_at?: string;
          hidden?: boolean;
          id?: string;
          initiative_id?: string | null;
          kind?: string;
          media_paths?: string[];
          milestone?: string;
          organisation_id?: string | null;
          role?: string;
        };
        Relationships: [
          {
            foreignKeyName: "impact_posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "impact_posts_initiative_id_fkey";
            columns: ["initiative_id"];
            isOneToOne: false;
            referencedRelation: "initiatives";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "impact_posts_organisation_id_fkey";
            columns: ["organisation_id"];
            isOneToOne: false;
            referencedRelation: "organisations";
            referencedColumns: ["id"];
          },
        ];
      };
      impact_verification_requests: {
        Row: {
          actual_snapshot: number;
          created_at: string;
          id: string;
          initiative_id: string;
          metric_id: string;
          organisation_id: string;
          requested_by: string;
          status: string;
          summary: string;
          target_snapshot: number;
        };
        Insert: {
          actual_snapshot: number;
          created_at?: string;
          id?: string;
          initiative_id: string;
          metric_id: string;
          organisation_id: string;
          requested_by: string;
          status?: string;
          summary: string;
          target_snapshot: number;
        };
        Update: {
          actual_snapshot?: number;
          created_at?: string;
          id?: string;
          initiative_id?: string;
          metric_id?: string;
          organisation_id?: string;
          requested_by?: string;
          status?: string;
          summary?: string;
          target_snapshot?: number;
        };
        Relationships: [
          {
            foreignKeyName: "impact_verification_requests_initiative_id_fkey";
            columns: ["initiative_id"];
            isOneToOne: false;
            referencedRelation: "initiatives";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "impact_verification_requests_metric_id_fkey";
            columns: ["metric_id"];
            isOneToOne: false;
            referencedRelation: "initiative_metrics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "impact_verification_requests_organisation_id_fkey";
            columns: ["organisation_id"];
            isOneToOne: false;
            referencedRelation: "organisations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "impact_verification_requests_requested_by_fkey";
            columns: ["requested_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      impact_verifications: {
        Row: {
          confirmed_value: number | null;
          decision: string;
          id: string;
          initiative_id: string;
          metric_id: string;
          notes: string;
          organisation_id: string;
          request_id: string;
          verified_at: string;
          verified_by_user_id: string;
        };
        Insert: {
          confirmed_value?: number | null;
          decision: string;
          id?: string;
          initiative_id: string;
          metric_id: string;
          notes: string;
          organisation_id: string;
          request_id: string;
          verified_at?: string;
          verified_by_user_id: string;
        };
        Update: {
          confirmed_value?: number | null;
          decision?: string;
          id?: string;
          initiative_id?: string;
          metric_id?: string;
          notes?: string;
          organisation_id?: string;
          request_id?: string;
          verified_at?: string;
          verified_by_user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "impact_verifications_initiative_id_fkey";
            columns: ["initiative_id"];
            isOneToOne: false;
            referencedRelation: "initiatives";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "impact_verifications_metric_id_fkey";
            columns: ["metric_id"];
            isOneToOne: false;
            referencedRelation: "initiative_metrics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "impact_verifications_organisation_id_fkey";
            columns: ["organisation_id"];
            isOneToOne: false;
            referencedRelation: "organisations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "impact_verifications_request_id_fkey";
            columns: ["request_id"];
            isOneToOne: true;
            referencedRelation: "impact_verification_requests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "impact_verifications_verified_by_user_id_fkey";
            columns: ["verified_by_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      initiative_attendance: {
        Row: {
          attended_on: string;
          initiative_id: string;
          recorded_by: string;
          user_id: string;
        };
        Insert: {
          attended_on?: string;
          initiative_id: string;
          recorded_by: string;
          user_id: string;
        };
        Update: {
          attended_on?: string;
          initiative_id?: string;
          recorded_by?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "initiative_attendance_initiative_id_fkey";
            columns: ["initiative_id"];
            isOneToOne: false;
            referencedRelation: "initiatives";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "initiative_attendance_recorded_by_fkey";
            columns: ["recorded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "initiative_attendance_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      initiative_evidence: {
        Row: {
          caption: string;
          created_at: string;
          id: string;
          initiative_id: string;
          related_metric_id: string | null;
          storage_path: string;
          type: string;
          uploader_id: string;
          visibility: string;
        };
        Insert: {
          caption: string;
          created_at?: string;
          id?: string;
          initiative_id: string;
          related_metric_id?: string | null;
          storage_path: string;
          type: string;
          uploader_id: string;
          visibility?: string;
        };
        Update: {
          caption?: string;
          created_at?: string;
          id?: string;
          initiative_id?: string;
          related_metric_id?: string | null;
          storage_path?: string;
          type?: string;
          uploader_id?: string;
          visibility?: string;
        };
        Relationships: [
          {
            foreignKeyName: "initiative_evidence_initiative_id_fkey";
            columns: ["initiative_id"];
            isOneToOne: false;
            referencedRelation: "initiatives";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "initiative_evidence_related_metric_id_fkey";
            columns: ["related_metric_id"];
            isOneToOne: false;
            referencedRelation: "initiative_metrics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "initiative_evidence_uploader_id_fkey";
            columns: ["uploader_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      initiative_members: {
        Row: {
          id: string;
          initiative_id: string;
          joined_at: string;
          role_id: string;
          status: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          initiative_id: string;
          joined_at?: string;
          role_id: string;
          status?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          initiative_id?: string;
          joined_at?: string;
          role_id?: string;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "initiative_members_initiative_id_fkey";
            columns: ["initiative_id"];
            isOneToOne: false;
            referencedRelation: "initiatives";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "initiative_members_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "initiative_roles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "initiative_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      initiative_metrics: {
        Row: {
          actual_value: number;
          baseline: number | null;
          created_at: string;
          description: string;
          id: string;
          initiative_id: string;
          measurement_method: string;
          metric_type: string;
          name: string;
          status: string;
          target_value: number;
          unit: string;
          verification_source: string;
        };
        Insert: {
          actual_value?: number;
          baseline?: number | null;
          created_at?: string;
          description?: string;
          id?: string;
          initiative_id: string;
          measurement_method: string;
          metric_type?: string;
          name: string;
          status?: string;
          target_value: number;
          unit: string;
          verification_source: string;
        };
        Update: {
          actual_value?: number;
          baseline?: number | null;
          created_at?: string;
          description?: string;
          id?: string;
          initiative_id?: string;
          measurement_method?: string;
          metric_type?: string;
          name?: string;
          status?: string;
          target_value?: number;
          unit?: string;
          verification_source?: string;
        };
        Relationships: [
          {
            foreignKeyName: "initiative_metrics_initiative_id_fkey";
            columns: ["initiative_id"];
            isOneToOne: false;
            referencedRelation: "initiatives";
            referencedColumns: ["id"];
          },
        ];
      };
      initiative_partners: {
        Row: {
          created_at: string;
          id: string;
          initiative_id: string;
          organisation_id: string;
          required: boolean;
          role: string;
          status: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          initiative_id: string;
          organisation_id: string;
          required?: boolean;
          role: string;
          status?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          initiative_id?: string;
          organisation_id?: string;
          required?: boolean;
          role?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "initiative_partners_initiative_id_fkey";
            columns: ["initiative_id"];
            isOneToOne: false;
            referencedRelation: "initiatives";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "initiative_partners_organisation_id_fkey";
            columns: ["organisation_id"];
            isOneToOne: false;
            referencedRelation: "organisations";
            referencedColumns: ["id"];
          },
        ];
      };
      initiative_permissions: {
        Row: {
          critical: boolean;
          id: string;
          initiative_id: string;
          name: string;
          notes: string;
          owner_id: string | null;
          reference: string;
          required: boolean;
          status: string;
        };
        Insert: {
          critical?: boolean;
          id?: string;
          initiative_id: string;
          name: string;
          notes?: string;
          owner_id?: string | null;
          reference?: string;
          required?: boolean;
          status?: string;
        };
        Update: {
          critical?: boolean;
          id?: string;
          initiative_id?: string;
          name?: string;
          notes?: string;
          owner_id?: string | null;
          reference?: string;
          required?: boolean;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "initiative_permissions_initiative_id_fkey";
            columns: ["initiative_id"];
            isOneToOne: false;
            referencedRelation: "initiatives";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "initiative_permissions_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      initiative_resources: {
        Row: {
          category: string;
          id: string;
          initiative_id: string;
          name: string;
          notes: string;
          required_quantity: number;
          secured_quantity: number;
          unit: string;
        };
        Insert: {
          category?: string;
          id?: string;
          initiative_id: string;
          name: string;
          notes?: string;
          required_quantity?: number;
          secured_quantity?: number;
          unit?: string;
        };
        Update: {
          category?: string;
          id?: string;
          initiative_id?: string;
          name?: string;
          notes?: string;
          required_quantity?: number;
          secured_quantity?: number;
          unit?: string;
        };
        Relationships: [
          {
            foreignKeyName: "initiative_resources_initiative_id_fkey";
            columns: ["initiative_id"];
            isOneToOne: false;
            referencedRelation: "initiatives";
            referencedColumns: ["id"];
          },
        ];
      };
      initiative_roles: {
        Row: {
          approval_required: boolean;
          commitment_hours: number;
          critical: boolean;
          description: string;
          experience_level: string;
          id: string;
          initiative_id: string;
          minimum_required: number;
          mode: string;
          positions_filled: number;
          positions_required: number;
          preferred_skills: string[];
          reasoning: string;
          responsibilities: string;
          schedule: string;
          skills: string[];
          title: string;
        };
        Insert: {
          approval_required?: boolean;
          commitment_hours?: number;
          critical?: boolean;
          description?: string;
          experience_level?: string;
          id?: string;
          initiative_id: string;
          minimum_required?: number;
          mode?: string;
          positions_filled?: number;
          positions_required: number;
          preferred_skills?: string[];
          reasoning?: string;
          responsibilities?: string;
          schedule?: string;
          skills?: string[];
          title: string;
        };
        Update: {
          approval_required?: boolean;
          commitment_hours?: number;
          critical?: boolean;
          description?: string;
          experience_level?: string;
          id?: string;
          initiative_id?: string;
          minimum_required?: number;
          mode?: string;
          positions_filled?: number;
          positions_required?: number;
          preferred_skills?: string[];
          reasoning?: string;
          responsibilities?: string;
          schedule?: string;
          skills?: string[];
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "initiative_roles_initiative_id_fkey";
            columns: ["initiative_id"];
            isOneToOne: false;
            referencedRelation: "initiatives";
            referencedColumns: ["id"];
          },
        ];
      };
      initiative_stakeholders: {
        Row: {
          id: string;
          initiative_id: string;
          organisation_id: string | null;
          purpose: string;
          required: boolean;
          status: string;
          type: string;
        };
        Insert: {
          id?: string;
          initiative_id: string;
          organisation_id?: string | null;
          purpose: string;
          required?: boolean;
          status?: string;
          type: string;
        };
        Update: {
          id?: string;
          initiative_id?: string;
          organisation_id?: string | null;
          purpose?: string;
          required?: boolean;
          status?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "initiative_stakeholders_initiative_id_fkey";
            columns: ["initiative_id"];
            isOneToOne: false;
            referencedRelation: "initiatives";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "initiative_stakeholders_organisation_id_fkey";
            columns: ["organisation_id"];
            isOneToOne: false;
            referencedRelation: "organisations";
            referencedColumns: ["id"];
          },
        ];
      };
      initiative_tasks: {
        Row: {
          assigned_user: string | null;
          created_at: string;
          description: string;
          due_date: string | null;
          id: string;
          initiative_id: string;
          priority: string;
          status: string;
          title: string;
        };
        Insert: {
          assigned_user?: string | null;
          created_at?: string;
          description?: string;
          due_date?: string | null;
          id?: string;
          initiative_id: string;
          priority?: string;
          status?: string;
          title: string;
        };
        Update: {
          assigned_user?: string | null;
          created_at?: string;
          description?: string;
          due_date?: string | null;
          id?: string;
          initiative_id?: string;
          priority?: string;
          status?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "initiative_tasks_assigned_user_fkey";
            columns: ["assigned_user"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "initiative_tasks_initiative_id_fkey";
            columns: ["initiative_id"];
            isOneToOne: false;
            referencedRelation: "initiatives";
            referencedColumns: ["id"];
          },
        ];
      };
      initiative_validations: {
        Row: {
          assumptions: string;
          changes: string;
          created_at: string;
          id: string;
          inaccuracies: string;
          initiative_id: string;
          observation: string;
          organisation_id: string;
          questions: string;
          refined_problem: string;
          requested_by: string;
          responded_at: string | null;
          responded_by: string | null;
          status: string;
          support: boolean;
          verdict: string | null;
        };
        Insert: {
          assumptions?: string;
          changes?: string;
          created_at?: string;
          id?: string;
          inaccuracies?: string;
          initiative_id: string;
          observation: string;
          organisation_id: string;
          questions?: string;
          refined_problem?: string;
          requested_by: string;
          responded_at?: string | null;
          responded_by?: string | null;
          status?: string;
          support?: boolean;
          verdict?: string | null;
        };
        Update: {
          assumptions?: string;
          changes?: string;
          created_at?: string;
          id?: string;
          inaccuracies?: string;
          initiative_id?: string;
          observation?: string;
          organisation_id?: string;
          questions?: string;
          refined_problem?: string;
          requested_by?: string;
          responded_at?: string | null;
          responded_by?: string | null;
          status?: string;
          support?: boolean;
          verdict?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "initiative_validations_initiative_id_fkey";
            columns: ["initiative_id"];
            isOneToOne: false;
            referencedRelation: "initiatives";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "initiative_validations_organisation_id_fkey";
            columns: ["organisation_id"];
            isOneToOne: false;
            referencedRelation: "organisations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "initiative_validations_requested_by_fkey";
            columns: ["requested_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "initiative_validations_responded_by_fkey";
            columns: ["responded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      initiatives: {
        Row: {
          cause: string;
          city: string;
          context: Json;
          cover: string;
          created_at: string;
          creator_id: string;
          goal: string;
          hidden: boolean;
          id: string;
          is_demo: boolean;
          is_need_validated: boolean;
          mode: string;
          need_id: string | null;
          observation: string;
          requires_validation: boolean;
          sdg_primary_id: number | null;
          secondary_sdgs: number[];
          slug: string;
          status: string;
          structured: Json;
          summary: string;
          timeline: string;
          title: string;
          updated_at: string;
          urgent: boolean;
          validated_problem: string;
          visibility: string;
          works_with_minors: boolean;
        };
        Insert: {
          cause: string;
          city: string;
          context?: Json;
          cover?: string;
          created_at?: string;
          creator_id: string;
          goal?: string;
          hidden?: boolean;
          id?: string;
          is_demo?: boolean;
          is_need_validated?: boolean;
          mode: string;
          need_id?: string | null;
          observation: string;
          requires_validation?: boolean;
          sdg_primary_id?: number | null;
          secondary_sdgs?: number[];
          slug: string;
          status?: string;
          structured?: Json;
          summary?: string;
          timeline?: string;
          title: string;
          updated_at?: string;
          urgent?: boolean;
          validated_problem?: string;
          visibility?: string;
          works_with_minors?: boolean;
        };
        Update: {
          cause?: string;
          city?: string;
          context?: Json;
          cover?: string;
          created_at?: string;
          creator_id?: string;
          goal?: string;
          hidden?: boolean;
          id?: string;
          is_demo?: boolean;
          is_need_validated?: boolean;
          mode?: string;
          need_id?: string | null;
          observation?: string;
          requires_validation?: boolean;
          sdg_primary_id?: number | null;
          secondary_sdgs?: number[];
          slug?: string;
          status?: string;
          structured?: Json;
          summary?: string;
          timeline?: string;
          title?: string;
          updated_at?: string;
          urgent?: boolean;
          validated_problem?: string;
          visibility?: string;
          works_with_minors?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "initiatives_cause_fkey";
            columns: ["cause"];
            isOneToOne: false;
            referencedRelation: "causes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "initiatives_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "initiatives_need_id_fkey";
            columns: ["need_id"];
            isOneToOne: false;
            referencedRelation: "organisation_needs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "initiatives_sdg_primary_id_fkey";
            columns: ["sdg_primary_id"];
            isOneToOne: false;
            referencedRelation: "sdgs";
            referencedColumns: ["id"];
          },
        ];
      };
      moderation_actions: {
        Row: {
          action: string;
          admin_id: string;
          created_at: string;
          id: string;
          notes: string;
          report_id: string | null;
        };
        Insert: {
          action: string;
          admin_id: string;
          created_at?: string;
          id?: string;
          notes: string;
          report_id?: string | null;
        };
        Update: {
          action?: string;
          admin_id?: string;
          created_at?: string;
          id?: string;
          notes?: string;
          report_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "moderation_actions_admin_id_fkey";
            columns: ["admin_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "moderation_actions_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "reports";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          body: string;
          created_at: string;
          href: string;
          id: string;
          read_at: string | null;
          type: string;
          user_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          href: string;
          id?: string;
          read_at?: string | null;
          type: string;
          user_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          href?: string;
          id?: string;
          read_at?: string | null;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      organisation_members: {
        Row: {
          organisation_id: string;
          role: string;
          status: string;
          user_id: string;
        };
        Insert: {
          organisation_id: string;
          role: string;
          status?: string;
          user_id: string;
        };
        Update: {
          organisation_id?: string;
          role?: string;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organisation_members_organisation_id_fkey";
            columns: ["organisation_id"];
            isOneToOne: false;
            referencedRelation: "organisations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "organisation_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      organisation_needs: {
        Row: {
          affected: string;
          cause: string | null;
          city: string;
          created_at: string;
          created_by: string;
          description: string;
          hidden: boolean;
          id: string;
          is_demo: boolean;
          organisation_id: string;
          outcome: string;
          roles: string[];
          sdg_id: number | null;
          support: string;
          timeframe: string;
          title: string;
        };
        Insert: {
          affected?: string;
          cause?: string | null;
          city: string;
          created_at?: string;
          created_by: string;
          description: string;
          hidden?: boolean;
          id?: string;
          is_demo?: boolean;
          organisation_id: string;
          outcome: string;
          roles?: string[];
          sdg_id?: number | null;
          support?: string;
          timeframe?: string;
          title: string;
        };
        Update: {
          affected?: string;
          cause?: string | null;
          city?: string;
          created_at?: string;
          created_by?: string;
          description?: string;
          hidden?: boolean;
          id?: string;
          is_demo?: boolean;
          organisation_id?: string;
          outcome?: string;
          roles?: string[];
          sdg_id?: number | null;
          support?: string;
          timeframe?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organisation_needs_cause_fkey";
            columns: ["cause"];
            isOneToOne: false;
            referencedRelation: "causes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "organisation_needs_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "organisation_needs_organisation_id_fkey";
            columns: ["organisation_id"];
            isOneToOne: false;
            referencedRelation: "organisations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "organisation_needs_sdg_id_fkey";
            columns: ["sdg_id"];
            isOneToOne: false;
            referencedRelation: "sdgs";
            referencedColumns: ["id"];
          },
        ];
      };
      organisation_verification_requests: {
        Row: {
          contact_email: string;
          created_at: string;
          document_path: string | null;
          id: string;
          notes: string;
          organisation_id: string;
          reference: string;
          requested_by: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: string;
        };
        Insert: {
          contact_email: string;
          created_at?: string;
          document_path?: string | null;
          id?: string;
          notes?: string;
          organisation_id: string;
          reference?: string;
          requested_by: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string;
        };
        Update: {
          contact_email?: string;
          created_at?: string;
          document_path?: string | null;
          id?: string;
          notes?: string;
          organisation_id?: string;
          reference?: string;
          requested_by?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organisation_verification_requests_organisation_id_fkey";
            columns: ["organisation_id"];
            isOneToOne: false;
            referencedRelation: "organisations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "organisation_verification_requests_requested_by_fkey";
            columns: ["requested_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "organisation_verification_requests_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      organisations: {
        Row: {
          causes: string[];
          city: string;
          created_at: string;
          created_by: string;
          description: string;
          hidden: boolean;
          id: string;
          is_demo: boolean;
          logo_path: string | null;
          name: string;
          organisation_type: string;
          slug: string;
          verification_status: string;
          website: string;
        };
        Insert: {
          causes?: string[];
          city: string;
          created_at?: string;
          created_by: string;
          description?: string;
          hidden?: boolean;
          id?: string;
          is_demo?: boolean;
          logo_path?: string | null;
          name: string;
          organisation_type: string;
          slug: string;
          verification_status?: string;
          website?: string;
        };
        Update: {
          causes?: string[];
          city?: string;
          created_at?: string;
          created_by?: string;
          description?: string;
          hidden?: boolean;
          id?: string;
          is_demo?: boolean;
          logo_path?: string | null;
          name?: string;
          organisation_type?: string;
          slug?: string;
          verification_status?: string;
          website?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organisations_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profile_preferences: {
        Row: {
          contributions: string[];
          days: string;
          dismissed_tips: string[];
          hours: number;
          intro_completed: boolean;
          mode: string;
          notifications_enabled: boolean;
          user_id: string;
        };
        Insert: {
          contributions?: string[];
          days?: string;
          dismissed_tips?: string[];
          hours?: number;
          intro_completed?: boolean;
          mode?: string;
          notifications_enabled?: boolean;
          user_id: string;
        };
        Update: {
          contributions?: string[];
          days?: string;
          dismissed_tips?: string[];
          hours?: number;
          intro_completed?: boolean;
          mode?: string;
          notifications_enabled?: boolean;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profile_preferences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          account_type: string;
          avatar_path: string | null;
          bio: string;
          causes: string[];
          city: string;
          created_at: string;
          display_name: string;
          experience_level: string;
          hidden: boolean;
          id: string;
          is_demo: boolean;
          onboarding_completed: boolean;
          show_availability: boolean;
          skills: string[];
          suspended: boolean;
          updated_at: string;
          username: string;
        };
        Insert: {
          account_type?: string;
          avatar_path?: string | null;
          bio?: string;
          causes?: string[];
          city?: string;
          created_at?: string;
          display_name: string;
          experience_level?: string;
          hidden?: boolean;
          id: string;
          is_demo?: boolean;
          onboarding_completed?: boolean;
          show_availability?: boolean;
          skills?: string[];
          suspended?: boolean;
          updated_at?: string;
          username: string;
        };
        Update: {
          account_type?: string;
          avatar_path?: string | null;
          bio?: string;
          causes?: string[];
          city?: string;
          created_at?: string;
          display_name?: string;
          experience_level?: string;
          hidden?: boolean;
          id?: string;
          is_demo?: boolean;
          onboarding_completed?: boolean;
          show_availability?: boolean;
          skills?: string[];
          suspended?: boolean;
          updated_at?: string;
          username?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          created_at: string;
          details: string;
          id: string;
          reason: string;
          reporter_id: string;
          status: string;
          target_id: string;
          target_type: string;
        };
        Insert: {
          created_at?: string;
          details?: string;
          id?: string;
          reason: string;
          reporter_id: string;
          status?: string;
          target_id: string;
          target_type: string;
        };
        Update: {
          created_at?: string;
          details?: string;
          id?: string;
          reason?: string;
          reporter_id?: string;
          status?: string;
          target_id?: string;
          target_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey";
            columns: ["reporter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      role_applications: {
        Row: {
          availability: string;
          created_at: string;
          experience: string;
          id: string;
          initiative_id: string;
          motivation: string;
          review_notes: string;
          reviewed_by: string | null;
          role_id: string;
          status: string;
          user_id: string;
        };
        Insert: {
          availability: string;
          created_at?: string;
          experience: string;
          id?: string;
          initiative_id: string;
          motivation: string;
          review_notes?: string;
          reviewed_by?: string | null;
          role_id: string;
          status?: string;
          user_id: string;
        };
        Update: {
          availability?: string;
          created_at?: string;
          experience?: string;
          id?: string;
          initiative_id?: string;
          motivation?: string;
          review_notes?: string;
          reviewed_by?: string | null;
          role_id?: string;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "role_applications_initiative_id_fkey";
            columns: ["initiative_id"];
            isOneToOne: false;
            referencedRelation: "initiatives";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "role_applications_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "role_applications_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "initiative_roles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "role_applications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      saved_initiatives: {
        Row: {
          created_at: string;
          initiative_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          initiative_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          initiative_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_initiatives_initiative_id_fkey";
            columns: ["initiative_id"];
            isOneToOne: false;
            referencedRelation: "initiatives";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "saved_initiatives_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      sdgs: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          id: number;
          name: string;
        };
        Update: {
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      skills: {
        Row: {
          active: boolean;
          id: string;
          name: string;
        };
        Insert: {
          active?: boolean;
          id: string;
          name: string;
        };
        Update: {
          active?: boolean;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      actionos_discover: {
        Args: {
          beginner_only?: boolean;
          cause_filter?: string;
          city_filter?: string;
          fits_hours?: boolean;
          mode_filter?: string;
          page_number?: number;
          recommended?: boolean;
          search_text?: string;
          skill_filter?: string;
          stage_filter?: string;
        };
        Returns: {
          cause: string;
          city: string;
          context: Json;
          cover: string;
          created_at: string;
          creator_id: string;
          goal: string;
          hidden: boolean;
          id: string;
          is_demo: boolean;
          is_need_validated: boolean;
          mode: string;
          need_id: string | null;
          observation: string;
          requires_validation: boolean;
          sdg_primary_id: number | null;
          secondary_sdgs: number[];
          slug: string;
          status: string;
          structured: Json;
          summary: string;
          timeline: string;
          title: string;
          updated_at: string;
          urgent: boolean;
          validated_problem: string;
          visibility: string;
          works_with_minors: boolean;
        }[];
        SetofOptions: {
          from: "*";
          to: "initiatives";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      actionos_mutate: {
        Args: { operation: string; payload: Json };
        Returns: Json;
      };
      actionos_organisation_member: {
        Args: { operation: string; payload: Json };
        Returns: Json;
      };
      actionos_readiness: { Args: { initiative_id: string }; Returns: Json };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;

export type TableName = keyof Database["public"]["Tables"];
export type Row<T extends TableName> = Database["public"]["Tables"][T]["Row"];
