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
      users: {
        Row: {
          id: string;
          address: string | null;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          email: string | null;
          tier: "blue" | "silver" | "gold" | "diamond";
          buzz_balance: number;
          ens_name: string | null;
          created_at: string;
          updated_at: string;
          location: string | null;
          header_url: string | null;
        };
        Insert: {
          id?: string;
          address?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          email?: string | null;
          tier?: "blue" | "silver" | "gold" | "diamond";
          buzz_balance?: number;
          ens_name?: string | null;
          created_at?: string;
          updated_at?: string;
          location?: string | null;
          header_url?: string | null;
        };
        Update: {
          id?: string;
          address?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          email?: string | null;
          tier?: "blue" | "silver" | "gold" | "diamond";
          buzz_balance?: number;
          ens_name?: string | null;
          created_at?: string;
          updated_at?: string;
          location?: string | null;
          header_url?: string | null;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          media_urls: string[] | null;
          reply_to_id: string | null;
          is_repost: boolean;
          repost_id: string | null;
          is_token_gated: boolean;
          required_tier: "blue" | "silver" | "gold" | "diamond" | null;
          likes_count: number;
          reposts_count: number;
          replies_count: number;
          created_at: string;
          updated_at: string;
          is_deleted: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          media_urls?: string[] | null;
          reply_to_id?: string | null;
          is_repost?: boolean;
          repost_id?: string | null;
          is_token_gated?: boolean;
          required_tier?: "blue" | "silver" | "gold" | "diamond" | null;
          likes_count?: number;
          reposts_count?: number;
          replies_count?: number;
          created_at?: string;
          updated_at?: string;
          is_deleted?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          media_urls?: string[] | null;
          reply_to_id?: string | null;
          is_repost?: boolean;
          repost_id?: string | null;
          is_token_gated?: boolean;
          required_tier?: "blue" | "silver" | "gold" | "diamond" | null;
          likes_count?: number;
          reposts_count?: number;
          replies_count?: number;
          created_at?: string;
          updated_at?: string;
          is_deleted?: boolean;
        };
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string;
          created_at?: string;
        };
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          actor_id: string | null;
          type: "like" | "follow" | "reply" | "repost" | "mention" | "system";
          post_id: string | null;
          message: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          actor_id?: string | null;
          type: "like" | "follow" | "reply" | "repost" | "mention" | "system";
          post_id?: string | null;
          message?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          actor_id?: string | null;
          type?: "like" | "follow" | "reply" | "repost" | "mention" | "system";
          post_id?: string | null;
          message?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
      user_preferences: {
        Row: {
          user_id: string;
          notification_likes: boolean;
          notification_follows: boolean;
          notification_replies: boolean;
          notification_reposts: boolean;
          notification_mentions: boolean;
          notification_messages: boolean;
          theme: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          notification_likes?: boolean;
          notification_follows?: boolean;
          notification_replies?: boolean;
          notification_reposts?: boolean;
          notification_mentions?: boolean;
          notification_messages?: boolean;
          theme?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          notification_likes?: boolean;
          notification_follows?: boolean;
          notification_replies?: boolean;
          notification_reposts?: boolean;
          notification_mentions?: boolean;
          notification_messages?: boolean;
          theme?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          awarded_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          awarded_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_id?: string;
          awarded_at?: string;
        };
      };
      badge_types: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon_url: string | null;
          tier: "blue" | "silver" | "gold" | "diamond" | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          icon_url?: string | null;
          tier?: "blue" | "silver" | "gold" | "diamond" | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          icon_url?: string | null;
          tier?: "blue" | "silver" | "gold" | "diamond" | null;
          created_at?: string;
        };
      };
    };
    Views: {
      user_stats: {
        Row: {
          id: string;
          display_name: string | null;
          address: string | null;
          avatar_url: string | null;
          tier: "blue" | "silver" | "gold" | "diamond";
          buzz_balance: number;
          posts_count: number;
          followers_count: number;
          following_count: number;
        };
      };
      trending_posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          media_urls: string[] | null;
          created_at: string;
          likes_count: number;
          replies_count: number;
          reposts_count: number;
          display_name: string | null;
          avatar_url: string | null;
          address: string | null;
          tier: "blue" | "silver" | "gold" | "diamond";
          engagement_score: number;
          hours_age: number;
          trending_score: number;
        };
      };
    };
    Functions: {
      handle_likes_count: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      handle_updated_at: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      handle_tier_update: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      handle_like_notification: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      handle_follow_notification: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };
    Enums: {
      // We don't have explicit enums in our schema
    };
  };
}
