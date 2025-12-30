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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      ea_robot_subscriptions: {
        Row: {
          email: string
          id: string
          notified: boolean
          subscribed_at: string
          verification_token: string | null
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          email: string
          id?: string
          notified?: boolean
          subscribed_at?: string
          verification_token?: string | null
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          notified?: boolean
          subscribed_at?: string
          verification_token?: string | null
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string
          id: string
          membership_type: string
          payment_date: string
          user_id: string
          valid_until: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          membership_type: string
          payment_date?: string
          user_id: string
          valid_until: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          membership_type?: string
          payment_date?: string
          user_id?: string
          valid_until?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          admin_notes: string | null
          avatar_url: string | null
          blocked_at: string | null
          created_at: string
          email: string
          email_notifications: boolean | null
          id: string
          is_blocked: boolean | null
          membership_type: Database["public"]["Enums"]["membership_type"] | null
          paid_at: string | null
          paid_until: string | null
          telegram_chat_id: number | null
          telegram_notifications: boolean | null
          telegram_username: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          avatar_url?: string | null
          blocked_at?: string | null
          created_at?: string
          email: string
          email_notifications?: boolean | null
          id?: string
          is_blocked?: boolean | null
          membership_type?:
            | Database["public"]["Enums"]["membership_type"]
            | null
          paid_at?: string | null
          paid_until?: string | null
          telegram_chat_id?: number | null
          telegram_notifications?: boolean | null
          telegram_username?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          avatar_url?: string | null
          blocked_at?: string | null
          created_at?: string
          email?: string
          email_notifications?: boolean | null
          id?: string
          is_blocked?: boolean | null
          membership_type?:
            | Database["public"]["Enums"]["membership_type"]
            | null
          paid_at?: string | null
          paid_until?: string | null
          telegram_chat_id?: number | null
          telegram_notifications?: boolean | null
          telegram_username?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      signal_results: {
        Row: {
          created_at: string
          direction: string
          entry_price: number
          exit_price: number | null
          id: string
          notes: string | null
          pair: string
          profit_percent: number | null
          profit_pips: number | null
          result: string | null
          signal_date: string
          stop_loss: number | null
          take_profit: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          direction: string
          entry_price: number
          exit_price?: number | null
          id?: string
          notes?: string | null
          pair: string
          profit_percent?: number | null
          profit_pips?: number | null
          result?: string | null
          signal_date?: string
          stop_loss?: number | null
          take_profit?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          direction?: string
          entry_price?: number
          exit_price?: number | null
          id?: string
          notes?: string | null
          pair?: string
          profit_percent?: number | null
          profit_pips?: number | null
          result?: string | null
          signal_date?: string
          stop_loss?: number | null
          take_profit?: number | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_ea_subscription_exists: {
        Args: { check_email: string }
        Returns: boolean
      }
      has_active_membership: { Args: { _user_id: string }; Returns: boolean }
      is_admin: { Args: { check_user_id: string }; Returns: boolean }
    }
    Enums: {
      membership_type: "mentorship" | "signals"
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
      membership_type: ["mentorship", "signals"],
    },
  },
} as const
