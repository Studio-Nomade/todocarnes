export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      booking_events: {
        Row: {
          created_at: string
          days: string[]
          end_date: string | null
          id: string
          is_active: boolean
          location: string | null
          name: string
          slot_minutes: number
          slot_times: string[]
          slug: string
          start_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          days: string[]
          end_date?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          name: string
          slot_minutes?: number
          slot_times: string[]
          slug: string
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          days?: string[]
          end_date?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          name?: string
          slot_minutes?: number
          slot_times?: string[]
          slug?: string
          start_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          came_from: Database["public"]["Enums"]["contact_origin"] | null
          cargo: string | null
          company: string | null
          created_at: string
          day: string
          email: string
          event_id: string
          ics_uid: string
          id: string
          name: string
          phone: string | null
          rep_id: string
          slot_time: string
          status: Database["public"]["Enums"]["booking_status"]
          topics: string | null
          updated_at: string
        }
        Insert: {
          came_from?: Database["public"]["Enums"]["contact_origin"] | null
          cargo?: string | null
          company?: string | null
          created_at?: string
          day: string
          email: string
          event_id: string
          ics_uid?: string
          id?: string
          name: string
          phone?: string | null
          rep_id: string
          slot_time: string
          status?: Database["public"]["Enums"]["booking_status"]
          topics?: string | null
          updated_at?: string
        }
        Update: {
          came_from?: Database["public"]["Enums"]["contact_origin"] | null
          cargo?: string | null
          company?: string | null
          created_at?: string
          day?: string
          email?: string
          event_id?: string
          ics_uid?: string
          id?: string
          name?: string
          phone?: string | null
          rep_id?: string
          slot_time?: string
          status?: Database["public"]["Enums"]["booking_status"]
          topics?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "booking_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_rep_id_fkey"
            columns: ["rep_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_exports: {
        Row: {
          catalog_id: string
          created_at: string
          created_by: string | null
          id: string
          storage_path: string
        }
        Insert: {
          catalog_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          storage_path: string
        }
        Update: {
          catalog_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_exports_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "catalogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_exports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_items: {
        Row: {
          catalog_id: string
          created_at: string
          id: string
          product_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          catalog_id: string
          created_at?: string
          id?: string
          product_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          catalog_id?: string
          created_at?: string
          id?: string
          product_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_items_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "catalogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      catalogs: {
        Row: {
          client_logo_path: string | null
          client_name: string | null
          created_at: string
          created_by: string | null
          id: string
          month: number
          status: string
          title: string
          updated_at: string
          year: number
        }
        Insert: {
          client_logo_path?: string | null
          client_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          month: number
          status?: string
          title: string
          updated_at?: string
          year: number
        }
        Update: {
          client_logo_path?: string | null
          client_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          month?: number
          status?: string
          title?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "catalogs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          icon_key: string | null
          id: string
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon_key?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon_key?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      cuts: {
        Row: {
          category_id: string
          created_at: string
          id: string
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cuts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      image_generation_jobs: {
        Row: {
          created_at: string
          created_by: string | null
          error_message: string | null
          id: string
          model: string | null
          product_id: string | null
          prompt: string | null
          requested_slot: string | null
          result_image_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          model?: string | null
          product_id?: string | null
          prompt?: string | null
          requested_slot?: string | null
          result_image_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          model?: string | null
          product_id?: string | null
          prompt?: string | null
          requested_slot?: string | null
          result_image_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "image_generation_jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "image_generation_jobs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "image_generation_jobs_result_image_id_fkey"
            columns: ["result_image_id"]
            isOneToOne: false
            referencedRelation: "product_images"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          area: Database["public"]["Enums"]["area_comercial"] | null
          assigned_rep_id: string | null
          came_from: Database["public"]["Enums"]["contact_origin"] | null
          company: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
          source: Database["public"]["Enums"]["lead_source"]
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          utm: Json | null
        }
        Insert: {
          area?: Database["public"]["Enums"]["area_comercial"] | null
          assigned_rep_id?: string | null
          came_from?: Database["public"]["Enums"]["contact_origin"] | null
          company?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          source: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          utm?: Json | null
        }
        Update: {
          area?: Database["public"]["Enums"]["area_comercial"] | null
          assigned_rep_id?: string | null
          came_from?: Database["public"]["Enums"]["contact_origin"] | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          utm?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_rep_id_fkey"
            columns: ["assigned_rep_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string
          created_by: string | null
          generated_by_ai: boolean
          id: string
          product_id: string
          prompt_used: string | null
          slot: string
          status: string
          storage_path: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          generated_by_ai?: boolean
          id?: string
          product_id: string
          prompt_used?: string | null
          slot: string
          status?: string
          storage_path: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          generated_by_ai?: boolean
          id?: string
          product_id?: string
          prompt_used?: string | null
          slot?: string
          status?: string
          storage_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          box_weight: string | null
          brand: string | null
          category_id: string
          code: string | null
          created_at: string
          created_by: string | null
          cut_id: string
          eyebrow: string | null
          format: string | null
          id: string
          month_tag: string | null
          notes: string | null
          origin: string | null
          status: string
          title: string
          units: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          box_weight?: string | null
          brand?: string | null
          category_id: string
          code?: string | null
          created_at?: string
          created_by?: string | null
          cut_id: string
          eyebrow?: string | null
          format?: string | null
          id?: string
          month_tag?: string | null
          notes?: string | null
          origin?: string | null
          status?: string
          title: string
          units?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          box_weight?: string | null
          brand?: string | null
          category_id?: string
          code?: string | null
          created_at?: string
          created_by?: string | null
          cut_id?: string
          eyebrow?: string | null
          format?: string | null
          id?: string
          month_tag?: string | null
          notes?: string | null
          origin?: string | null
          status?: string
          title?: string
          units?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_cut_id_fkey"
            columns: ["cut_id"]
            isOneToOne: false
            referencedRelation: "cuts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          area: Database["public"]["Enums"]["area_comercial"] | null
          contact_email: string
          created_at: string
          id: string
          is_public: boolean
          job_title: string
          name: string
          phone: string
          photo_url: string | null
          public_bio: string | null
          public_order: number | null
          role: string
          status: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          area?: Database["public"]["Enums"]["area_comercial"] | null
          contact_email: string
          created_at?: string
          id: string
          is_public?: boolean
          job_title?: string
          name: string
          phone?: string
          photo_url?: string | null
          public_bio?: string | null
          public_order?: number | null
          role: string
          status?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          area?: Database["public"]["Enums"]["area_comercial"] | null
          contact_email?: string
          created_at?: string
          id?: string
          is_public?: boolean
          job_title?: string
          name?: string
          phone?: string
          photo_url?: string | null
          public_bio?: string | null
          public_order?: number | null
          role?: string
          status?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          id: string
          sort_order: number
          status: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_product_image: {
        Args: { target_image_id: string }
        Returns: undefined
      }
      available_slots: {
        Args: { p_event_id: string; p_rep_id: string }
        Returns: {
          day: string
          slot_time: string
          taken: boolean
        }[]
      }
      reorder_catalog_items: {
        Args: { ordered_ids: string[]; target_catalog_id: string }
        Returns: undefined
      }
    }
    Enums: {
      area_comercial:
        | "food_service"
        | "retail_ggcc"
        | "mmpp_trimmings"
        | "ventas_nacionales"
        | "maquila_desarrollo"
        | "marca_propia"
        | "otro"
      booking_status: "pending" | "confirmed" | "cancelled"
      contact_origin:
        | "redes_sociales"
        | "mail_newsletter"
        | "invitacion_comercial"
        | "buscar_google"
        | "a_traves_de_tercero"
        | "otro"
      lead_source: "landing" | "agenda_contact"
      lead_status: "new" | "contacted" | "qualified" | "closed" | "discarded"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      area_comercial: [
        "food_service",
        "retail_ggcc",
        "mmpp_trimmings",
        "ventas_nacionales",
        "maquila_desarrollo",
        "marca_propia",
        "otro",
      ],
      booking_status: ["pending", "confirmed", "cancelled"],
      contact_origin: [
        "redes_sociales",
        "mail_newsletter",
        "invitacion_comercial",
        "buscar_google",
        "a_traves_de_tercero",
        "otro",
      ],
      lead_source: ["landing", "agenda_contact"],
      lead_status: ["new", "contacted", "qualified", "closed", "discarded"],
    },
  },
} as const

