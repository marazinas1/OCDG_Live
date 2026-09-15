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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          archived_at: string | null
          created_at: string
          email: string
          id: string
          interest: string | null
          message: string | null
          name: string
          phone: string | null
          read_at: string | null
          source: string | null
          user_agent: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          email: string
          id?: string
          interest?: string | null
          message?: string | null
          name: string
          phone?: string | null
          read_at?: string | null
          source?: string | null
          user_agent?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          email?: string
          id?: string
          interest?: string | null
          message?: string | null
          name?: string
          phone?: string | null
          read_at?: string | null
          source?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      page_media: {
        Row: {
          alt_text: string
          bucket: string
          created_at: string
          id: string
          page: string
          slot: string
          storage_path: string
          updated_at: string
        }
        Insert: {
          alt_text?: string
          bucket?: string
          created_at?: string
          id?: string
          page: string
          slot: string
          storage_path: string
          updated_at?: string
        }
        Update: {
          alt_text?: string
          bucket?: string
          created_at?: string
          id?: string
          page?: string
          slot?: string
          storage_path?: string
          updated_at?: string
        }
        Relationships: []
      }
      page_media_defaults: {
        Row: {
          alt_text: string
          bucket: string
          created_at: string
          id: string
          page: string
          slot: string
          storage_path: string
          updated_at: string
        }
        Insert: {
          alt_text?: string
          bucket?: string
          created_at?: string
          id?: string
          page: string
          slot: string
          storage_path: string
          updated_at?: string
        }
        Update: {
          alt_text?: string
          bucket?: string
          created_at?: string
          id?: string
          page?: string
          slot?: string
          storage_path?: string
          updated_at?: string
        }
        Relationships: []
      }
      page_text: {
        Row: {
          created_at: string
          id: string
          page: string
          slot: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          page: string
          slot: string
          updated_at?: string
          value?: string
        }
        Update: {
          created_at?: string
          id?: string
          page?: string
          slot?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          country: string | null
          created_at: string
          day: string
          device: string
          duration_seconds: number | null
          id: string
          path: string
          referrer_host: string | null
          session_id: string | null
          source: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          visitor_hash: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          day?: string
          device?: string
          duration_seconds?: number | null
          id?: string
          path: string
          referrer_host?: string | null
          session_id?: string | null
          source?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          visitor_hash: string
        }
        Update: {
          country?: string | null
          created_at?: string
          day?: string
          device?: string
          duration_seconds?: number | null
          id?: string
          path?: string
          referrer_host?: string | null
          session_id?: string | null
          source?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          visitor_hash?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          bedrooms: number | null
          created_at: string
          description: string | null
          floor_plans: Json
          full_baths: number | null
          half_baths: number | null
          has_page: boolean
          headline: string | null
          highlights: Json
          id: string
          listed_date: string | null
          location_city: string | null
          location_features: Json
          location_heading: string | null
          location_highlight: string | null
          location_neighborhood: string | null
          location_state: string | null
          luxury_features: Json
          map_embed_query: string | null
          mls_url: string | null
          price: string | null
          published: boolean
          slug: string
          sort_order: number
          specs: Json
          sqft: number | null
          status: string
          tagline: string | null
          title: string
          total_rooms: number | null
          unit: string | null
          updated_at: string
          vision_caption_eyebrow: string | null
          vision_caption_title: string | null
          vision_floors: Json
          vision_headline: string | null
        }
        Insert: {
          bedrooms?: number | null
          created_at?: string
          description?: string | null
          floor_plans?: Json
          full_baths?: number | null
          half_baths?: number | null
          has_page?: boolean
          headline?: string | null
          highlights?: Json
          id?: string
          listed_date?: string | null
          location_city?: string | null
          location_features?: Json
          location_heading?: string | null
          location_highlight?: string | null
          location_neighborhood?: string | null
          location_state?: string | null
          luxury_features?: Json
          map_embed_query?: string | null
          mls_url?: string | null
          price?: string | null
          published?: boolean
          slug: string
          sort_order?: number
          specs?: Json
          sqft?: number | null
          status?: string
          tagline?: string | null
          title: string
          total_rooms?: number | null
          unit?: string | null
          updated_at?: string
          vision_caption_eyebrow?: string | null
          vision_caption_title?: string | null
          vision_floors?: Json
          vision_headline?: string | null
        }
        Update: {
          bedrooms?: number | null
          created_at?: string
          description?: string | null
          floor_plans?: Json
          full_baths?: number | null
          half_baths?: number | null
          has_page?: boolean
          headline?: string | null
          highlights?: Json
          id?: string
          listed_date?: string | null
          location_city?: string | null
          location_features?: Json
          location_heading?: string | null
          location_highlight?: string | null
          location_neighborhood?: string | null
          location_state?: string | null
          luxury_features?: Json
          map_embed_query?: string | null
          mls_url?: string | null
          price?: string | null
          published?: boolean
          slug?: string
          sort_order?: number
          specs?: Json
          sqft?: number | null
          status?: string
          tagline?: string | null
          title?: string
          total_rooms?: number | null
          unit?: string | null
          updated_at?: string
          vision_caption_eyebrow?: string | null
          vision_caption_title?: string | null
          vision_floors?: Json
          vision_headline?: string | null
        }
        Relationships: []
      }
      property_images: {
        Row: {
          alt_text: string | null
          category: string
          created_at: string
          floor_plan_id: string | null
          id: string
          property_id: string
          sort_order: number
          storage_path: string
        }
        Insert: {
          alt_text?: string | null
          category: string
          created_at?: string
          floor_plan_id?: string | null
          id?: string
          property_id: string
          sort_order?: number
          storage_path: string
        }
        Update: {
          alt_text?: string | null
          category?: string
          created_at?: string
          floor_plan_id?: string | null
          id?: string
          property_id?: string
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          about_hero_eyebrow: string | null
          about_hero_image_path: string | null
          about_hero_title: string | null
          about_leader_name: string | null
          about_leader_role: string | null
          about_partners: Json
          about_partners_heading: string | null
          about_partners_label: string | null
          about_portrait_image_path: string | null
          about_promise_heading: string | null
          about_promise_label: string | null
          about_promise_paragraph: string | null
          about_story_heading: string | null
          about_story_image_path: string | null
          about_story_label: string | null
          about_story_paragraph_1: string | null
          about_story_paragraph_2: string | null
          about_story_quote: string | null
          about_story_quote_attribution: string | null
          created_at: string
          favicon_path: string | null
          hero_cta_label: string | null
          hero_eyebrow: string | null
          hero_headline: string | null
          hero_image_path: string | null
          hero_subline: string | null
          home_quote: string | null
          home_quote_attribution: string | null
          id: string
          logo_dark_path: string | null
          logo_path: string | null
          singleton: boolean
          site_name: string
          updated_at: string
        }
        Insert: {
          about_hero_eyebrow?: string | null
          about_hero_image_path?: string | null
          about_hero_title?: string | null
          about_leader_name?: string | null
          about_leader_role?: string | null
          about_partners?: Json
          about_partners_heading?: string | null
          about_partners_label?: string | null
          about_portrait_image_path?: string | null
          about_promise_heading?: string | null
          about_promise_label?: string | null
          about_promise_paragraph?: string | null
          about_story_heading?: string | null
          about_story_image_path?: string | null
          about_story_label?: string | null
          about_story_paragraph_1?: string | null
          about_story_paragraph_2?: string | null
          about_story_quote?: string | null
          about_story_quote_attribution?: string | null
          created_at?: string
          favicon_path?: string | null
          hero_cta_label?: string | null
          hero_eyebrow?: string | null
          hero_headline?: string | null
          hero_image_path?: string | null
          hero_subline?: string | null
          home_quote?: string | null
          home_quote_attribution?: string | null
          id?: string
          logo_dark_path?: string | null
          logo_path?: string | null
          singleton?: boolean
          site_name?: string
          updated_at?: string
        }
        Update: {
          about_hero_eyebrow?: string | null
          about_hero_image_path?: string | null
          about_hero_title?: string | null
          about_leader_name?: string | null
          about_leader_role?: string | null
          about_partners?: Json
          about_partners_heading?: string | null
          about_partners_label?: string | null
          about_portrait_image_path?: string | null
          about_promise_heading?: string | null
          about_promise_label?: string | null
          about_promise_paragraph?: string | null
          about_story_heading?: string | null
          about_story_image_path?: string | null
          about_story_label?: string | null
          about_story_paragraph_1?: string | null
          about_story_paragraph_2?: string | null
          about_story_quote?: string | null
          about_story_quote_attribution?: string | null
          created_at?: string
          favicon_path?: string | null
          hero_cta_label?: string | null
          hero_eyebrow?: string | null
          hero_headline?: string | null
          hero_image_path?: string | null
          hero_subline?: string | null
          home_quote?: string | null
          home_quote_attribution?: string | null
          id?: string
          logo_dark_path?: string | null
          logo_path?: string | null
          singleton?: boolean
          site_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          anchor: string | null
          author_detail: string | null
          author_name: string
          created_at: string
          id: string
          published: boolean
          quote: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          anchor?: string | null
          author_detail?: string | null
          author_name: string
          created_at?: string
          id?: string
          published?: boolean
          quote: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          anchor?: string | null
          author_detail?: string | null
          author_name?: string
          created_at?: string
          id?: string
          published?: boolean
          quote?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      analytics_purge_old: { Args: never; Returns: number }
      analytics_summary: { Args: { _from: string; _to: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id?: string }; Returns: boolean }
      is_developer: { Args: { _user_id?: string }; Returns: boolean }
      is_owner: { Args: { _user_id?: string }; Returns: boolean }
      is_staff: { Args: { _user_id?: string }; Returns: boolean }
      list_property_bucket_paths: {
        Args: { _slug: string }
        Returns: {
          name: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "developer" | "owner" | "editor"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "developer", "owner", "editor"],
    },
  },
} as const
