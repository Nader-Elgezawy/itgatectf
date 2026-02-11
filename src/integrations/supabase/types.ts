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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      challenge_questions: {
        Row: {
          challenge_id: string
          created_at: string
          flag: string
          id: string
          penalty_points: number
          points: number
          question_text: string
          sort_order: number
        }
        Insert: {
          challenge_id: string
          created_at?: string
          flag: string
          id?: string
          penalty_points?: number
          points?: number
          question_text: string
          sort_order?: number
        }
        Update: {
          challenge_id?: string
          created_at?: string
          flag?: string
          id?: string
          penalty_points?: number
          points?: number
          question_text?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "challenge_questions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_questions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges_public"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          category: string
          created_at: string
          description: string
          file_name: string | null
          file_url: string | null
          flag: string
          id: string
          is_active: boolean | null
          penalty_points: number
          points: number
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          file_name?: string | null
          file_url?: string | null
          flag: string
          id?: string
          is_active?: boolean | null
          penalty_points?: number
          points?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          file_name?: string | null
          file_url?: string | null
          flag?: string
          id?: string
          is_active?: boolean | null
          penalty_points?: number
          points?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      competition_settings: {
        Row: {
          created_at: string
          end_time: string | null
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_time?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          certificate_id: string
          created_at: string
          id: string
          player1_name: string | null
          player2_name: string | null
          player3_name: string | null
          username: string
        }
        Insert: {
          certificate_id?: string
          created_at?: string
          id: string
          player1_name?: string | null
          player2_name?: string | null
          player3_name?: string | null
          username: string
        }
        Update: {
          certificate_id?: string
          created_at?: string
          id?: string
          player1_name?: string | null
          player2_name?: string | null
          player3_name?: string | null
          username?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          challenge_id: string
          id: string
          is_correct: boolean
          question_id: string | null
          submitted_at: string
          submitted_flag: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          id?: string
          is_correct?: boolean
          question_id?: string | null
          submitted_at?: string
          submitted_flag: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          id?: string
          is_correct?: boolean
          question_id?: string | null
          submitted_at?: string
          submitted_flag?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "challenge_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "challenge_questions_public"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          auth_user_id: string | null
          created_at: string
          id: string
          player1_name: string
          player2_name: string
          player3_name: string
          team_email: string
          team_name: string
          team_password_hash: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          id?: string
          player1_name: string
          player2_name: string
          player3_name: string
          team_email: string
          team_name: string
          team_password_hash: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          id?: string
          player1_name?: string
          player2_name?: string
          player3_name?: string
          team_email?: string
          team_name?: string
          team_password_hash?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      challenge_questions_public: {
        Row: {
          challenge_id: string | null
          created_at: string | null
          id: string | null
          penalty_points: number | null
          points: number | null
          question_text: string | null
          sort_order: number | null
        }
        Insert: {
          challenge_id?: string | null
          created_at?: string | null
          id?: string | null
          penalty_points?: number | null
          points?: number | null
          question_text?: string | null
          sort_order?: number | null
        }
        Update: {
          challenge_id?: string | null
          created_at?: string | null
          id?: string | null
          penalty_points?: number | null
          points?: number | null
          question_text?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_questions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_questions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges_public"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges_public: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          file_name: string | null
          file_url: string | null
          id: string | null
          is_active: boolean | null
          penalty_points: number | null
          points: number | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string | null
          is_active?: boolean | null
          penalty_points?: number | null
          points?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string | null
          is_active?: boolean | null
          penalty_points?: number | null
          points?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_leaderboard: {
        Args: never
        Returns: {
          last_solve: string
          player1_name: string
          player2_name: string
          player3_name: string
          solved_count: number
          total_points: number
          user_id: string
          username: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_solved_challenge: {
        Args: { _challenge_id: string; _user_id: string }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
