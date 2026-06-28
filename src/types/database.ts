// Hand-maintained types mirroring supabase/migrations/00001_initial_schema.sql.
// In a full setup these are generated via `supabase gen types typescript`.

export type AppRole = 'user' | 'admin';
export type OrgRole = 'owner' | 'admin' | 'member';
export type PlanTier = 'free' | 'pro' | 'enterprise';
export type InvitationStatus = 'pending' | 'accepted' | 'expired';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          role: AppRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: AppRole;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
        };
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
        Relationships: [];
      };
      organization_members: {
        Row: {
          org_id: string;
          user_id: string;
          role: OrgRole;
          joined_at: string;
        };
        Insert: {
          org_id: string;
          user_id: string;
          role?: OrgRole;
        };
        Update: Partial<Database['public']['Tables']['organization_members']['Insert']>;
        Relationships: [];
      };
      organization_invitations: {
        Row: {
          id: string;
          org_id: string;
          email: string;
          role: OrgRole;
          invited_by: string | null;
          status: InvitationStatus;
          token: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          email: string;
          role?: OrgRole;
          invited_by?: string | null;
          status?: InvitationStatus;
          token: string;
          expires_at: string;
        };
        Update: Partial<Database['public']['Tables']['organization_invitations']['Insert']>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string | null;
          org_id: string | null;
          status: string;
          plan: PlanTier;
          stripe_customer_id: string | null;
          stripe_price_id: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id?: string | null;
          org_id?: string | null;
          status: string;
          plan: PlanTier;
          stripe_customer_id?: string | null;
          stripe_price_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
        };
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
        Relationships: [];
      };
      processed_webhook_events: {
        Row: {
          id: string;
          processed_at: string;
        };
        Insert: {
          id: string;
          processed_at?: string;
        };
        Update: Partial<Database['public']['Tables']['processed_webhook_events']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      my_org_ids: { Args: Record<string, never>; Returns: string[] };
      is_org_admin: { Args: { target_org: string }; Returns: boolean };
      is_app_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: Record<string, never>;
  };
}
