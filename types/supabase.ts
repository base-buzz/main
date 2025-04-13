export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          awarded_at: string | null
          badge_id: string
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string | null
          badge_id: string
          id?: string
          user_id: string
        }
        Update: {
          awarded_at?: string | null
          badge_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badge_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_groups: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      badge_types: {
        Row: {
          created_at: string | null
          description: string | null
          icon_url: string | null
          id: string
          name: string
          tier: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          name: string
          tier?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          name?: string
          tier?: string | null
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "trending_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          post_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          post_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          post_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "trending_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      post_bookmarks: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "trending_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "trending_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reposts: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reposts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_reposts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "trending_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_reposts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_reposts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          is_deleted: boolean | null
          is_repost: boolean | null
          is_token_gated: boolean | null
          likes_count: number | null
          media_urls: string[] | null
          replies_count: number | null
          reply_to_id: string | null
          repost_id: string | null
          reposts_count: number | null
          required_tier: string | null
          updated_at: string | null
          user_id: string
          views_count: number
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_deleted?: boolean | null
          is_repost?: boolean | null
          is_token_gated?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          replies_count?: number | null
          reply_to_id?: string | null
          repost_id?: string | null
          reposts_count?: number | null
          required_tier?: string | null
          updated_at?: string | null
          user_id: string
          views_count?: number
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_deleted?: boolean | null
          is_repost?: boolean | null
          is_token_gated?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          replies_count?: number | null
          reply_to_id?: string | null
          repost_id?: string | null
          reposts_count?: number | null
          required_tier?: string | null
          updated_at?: string | null
          user_id?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "posts_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "trending_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_repost_id_fkey"
            columns: ["repost_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_repost_id_fkey"
            columns: ["repost_id"]
            isOneToOne: false
            referencedRelation: "trending_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      siwe_nonces: {
        Row: {
          expires_at: string
          issued_at: string
          nonce: string
        }
        Insert: {
          expires_at?: string
          issued_at?: string
          nonce: string
        }
        Update: {
          expires_at?: string
          issued_at?: string
          nonce?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          notification_follows: boolean | null
          notification_likes: boolean | null
          notification_mentions: boolean | null
          notification_messages: boolean | null
          notification_replies: boolean | null
          notification_reposts: boolean | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          notification_follows?: boolean | null
          notification_likes?: boolean | null
          notification_mentions?: boolean | null
          notification_messages?: boolean | null
          notification_replies?: boolean | null
          notification_reposts?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          notification_follows?: boolean | null
          notification_likes?: boolean | null
          notification_mentions?: boolean | null
          notification_messages?: boolean | null
          notification_replies?: boolean | null
          notification_reposts?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          buzz_balance: number | null
          created_at: string | null
          display_name: string | null
          email: string | null
          ens_name: string | null
          group_id: string | null
          handle: string | null
          header_url: string | null
          id: string
          location: string | null
          tier: string | null
          updated_at: string | null
          verification_type:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          buzz_balance?: number | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          ens_name?: string | null
          group_id?: string | null
          handle?: string | null
          header_url?: string | null
          id?: string
          location?: string | null
          tier?: string | null
          updated_at?: string | null
          verification_type?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          buzz_balance?: number | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          ens_name?: string | null
          group_id?: string | null
          handle?: string | null
          header_url?: string | null
          id?: string
          location?: string | null
          tier?: string | null
          updated_at?: string | null
          verification_type?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "users_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "affiliate_groups"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      trending_posts: {
        Row: {
          address: string | null
          avatar_url: string | null
          content: string | null
          created_at: string | null
          display_name: string | null
          engagement_score: number | null
          hours_age: number | null
          id: string | null
          likes_count: number | null
          media_urls: string[] | null
          replies_count: number | null
          reposts_count: number | null
          tier: string | null
          trending_score: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          address: string | null
          avatar_url: string | null
          buzz_balance: number | null
          display_name: string | null
          followers_count: number | null
          following_count: number | null
          handle: string | null
          id: string | null
          posts_count: number | null
          tier: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      find_user_by_wallet_or_id: {
        Args: { wallet_param: string; id_param: string }
        Returns: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          buzz_balance: number | null
          created_at: string | null
          display_name: string | null
          email: string | null
          ens_name: string | null
          group_id: string | null
          handle: string | null
          header_url: string | null
          id: string
          location: string | null
          tier: string | null
          updated_at: string | null
          verification_type:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }[]
      }
      generate_random_content: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_by_wallet: {
        Args: { wallet_address: string }
        Returns: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          buzz_balance: number | null
          created_at: string | null
          display_name: string | null
          email: string | null
          ens_name: string | null
          group_id: string | null
          handle: string | null
          header_url: string | null
          id: string
          location: string | null
          tier: string | null
          updated_at: string | null
          verification_type:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }[]
      }
    }
    Enums: {
      verification_status: "none" | "blue" | "grey" | "gold"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      verification_status: ["none", "blue", "grey", "gold"],
    },
  },
} as const
