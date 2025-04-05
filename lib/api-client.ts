// API client for interacting with backend routes
import { useState, useEffect } from "react";

// Types
export interface Post {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  is_repost: boolean;
  repost_id?: string;
  reply_to_id?: string;
  likes_count: number;
  replies_count: number;
  reposts_count: number;
  users?: User;
}

export interface User {
  id: string;
  display_name?: string;
  avatar_url?: string;
  address?: string;
  tier?: "blue" | "silver" | "gold" | "diamond";
  bio?: string;
}

// Posts API
export const postsApi = {
  // Get trending posts
  getTrendingPosts: async (limit = 20, page = 0): Promise<Post[]> => {
    const response = await fetch(`/api/posts?limit=${limit}&page=${page}`);
    if (!response.ok) throw new Error("Failed to fetch trending posts");
    return response.json();
  },

  // Get user feed
  getUserFeed: async (
    userId: string,
    limit = 20,
    page = 0,
  ): Promise<Post[]> => {
    const response = await fetch(
      `/api/posts/feed?userId=${userId}&limit=${limit}&page=${page}`,
    );
    if (!response.ok) throw new Error("Failed to fetch user feed");
    return response.json();
  },

  // Get a single post by ID
  getPost: async (postId: string): Promise<Post> => {
    const response = await fetch(`/api/posts/${postId}`);
    if (!response.ok) throw new Error("Failed to fetch post");
    return response.json();
  },

  // Create a new post
  createPost: async (userId: string, content: string): Promise<Post> => {
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, content }),
    });
    if (!response.ok) throw new Error("Failed to create post");
    return response.json();
  },

  // Update a post
  updatePost: async (postId: string, content: string): Promise<Post> => {
    const response = await fetch(`/api/posts/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error("Failed to update post");
    return response.json();
  },

  // Delete a post
  deletePost: async (postId: string): Promise<boolean> => {
    const response = await fetch(`/api/posts/${postId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete post");
    return response.json();
  },

  // Get post replies
  getReplies: async (postId: string, limit = 20, page = 0): Promise<Post[]> => {
    const response = await fetch(
      `/api/posts/${postId}/replies?limit=${limit}&page=${page}`,
    );
    if (!response.ok) throw new Error("Failed to fetch replies");
    return response.json();
  },

  // Create a reply to a post
  createReply: async (
    userId: string,
    postId: string,
    content: string,
  ): Promise<Post> => {
    const response = await fetch(`/api/posts/${postId}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, content }),
    });
    if (!response.ok) throw new Error("Failed to create reply");
    return response.json();
  },
};

// Likes API
export const likesApi = {
  // Like a post
  likePost: async (userId: string, postId: string): Promise<void> => {
    const response = await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, postId }),
    });
    if (!response.ok) throw new Error("Failed to like post");
  },

  // Unlike a post
  unlikePost: async (userId: string, postId: string): Promise<void> => {
    const response = await fetch(
      `/api/likes?userId=${userId}&postId=${postId}`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) throw new Error("Failed to unlike post");
  },

  // Check if user has liked a post
  hasLiked: async (userId: string, postId: string): Promise<boolean> => {
    const response = await fetch(
      `/api/likes?userId=${userId}&postId=${postId}`,
    );
    if (!response.ok) throw new Error("Failed to check like status");
    const data = await response.json();
    return data.hasLiked;
  },
};

// Users API
export const usersApi = {
  // Get user by ID
  getUser: async (userId: string): Promise<User> => {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch user");
    return response.json();
  },

  // Get user posts
  getUserPosts: async (
    userId: string,
    limit = 20,
    page = 0,
  ): Promise<Post[]> => {
    const response = await fetch(
      `/api/users/${userId}/posts?limit=${limit}&page=${page}`,
    );
    if (!response.ok) throw new Error("Failed to fetch user posts");
    return response.json();
  },

  // Get user followers
  getUserFollowers: async (
    userId: string,
    limit = 20,
    page = 0,
  ): Promise<User[]> => {
    const response = await fetch(
      `/api/users/${userId}/followers?limit=${limit}&page=${page}`,
    );
    if (!response.ok) throw new Error("Failed to fetch user followers");
    return response.json();
  },

  // Get users that a user is following
  getUserFollowing: async (
    userId: string,
    limit = 20,
    page = 0,
  ): Promise<User[]> => {
    const response = await fetch(
      `/api/users/${userId}/following?limit=${limit}&page=${page}`,
    );
    if (!response.ok) throw new Error("Failed to fetch user following");
    return response.json();
  },
};

// Hook for fetching posts
export function usePosts(userId?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        const data = userId
          ? await postsApi.getUserFeed(userId)
          : await postsApi.getTrendingPosts();
        setPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An error occurred"));
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [userId]);

  return { posts, loading, error };
}

// Hook for fetching a single post with replies
export function usePost(postId: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPostWithReplies() {
      try {
        setLoading(true);
        const [postData, repliesData] = await Promise.all([
          postsApi.getPost(postId),
          postsApi.getReplies(postId),
        ]);
        setPost(postData);
        setReplies(repliesData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An error occurred"));
      } finally {
        setLoading(false);
      }
    }

    fetchPostWithReplies();
  }, [postId]);

  return { post, replies, loading, error };
}
