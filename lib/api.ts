import {
  User,
  Post,
  DirectMessage,
  Notification,
  Listing,
} from "@/types/interfaces";

/**
 * API client for interacting with the BaseBuzz API
 *
 * UPDATED:
 * - Added consistent X-Custom-Auth header for all authenticated requests
 * - Improved error handling and logging
 * - Added withCredentials option to ensure cookies are sent with requests
 * - Enhanced debugging information
 */

/**
 * API client for interacting with the backend
 */

// Base API URL
const API_URL = "/api";

// Error handling helper
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "An error occurred");
  }
  return response.json();
};

/**
 * Custom headers for API requests
 * @returns Common headers for all API requests
 */
export function getCommonHeaders() {
  return {
    "Content-Type": "application/json",
    // Include custom auth header to support wallet-based authentication
    "X-Custom-Auth": "true",
  };
}

/**
 * Enhanced fetch function that ensures cookies are included and handles errors consistently
 * @param url API URL to fetch
 * @param options Fetch options
 * @returns Response data
 */
export async function apiFetch<T = any>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  try {
    // Ensure headers are set
    const headers = {
      ...getCommonHeaders(),
      ...(options.headers || {}),
    };

    // Always include credentials to ensure cookies are sent
    const fetchOptions: RequestInit = {
      ...options,
      headers,
      credentials: "include",
    };

    console.log(`🔄 Fetching ${options.method || "GET"} ${url}`);

    const response = await fetch(url, fetchOptions);

    // Handle HTTP errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error (${response.status}):`, errorText);
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    // Return parsed JSON response
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`❌ Fetch error for ${url}:`, error);
    throw error;
  }
}

// User API functions
export const userApi = {
  // Get all users
  getUsers: async (): Promise<User[]> => {
    const response = await fetch(`${API_URL}/users?suggested=true`);
    return handleResponse(response);
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User> => {
    const response = await fetch(`${API_URL}/users/${id}`);
    return handleResponse(response);
  },

  // Get user profile
  async getProfile(userId: string): Promise<User> {
    try {
      console.log(`🧑 Fetching profile for user ${userId}...`);

      const profile = await apiFetch<User>(`/api/users/${userId}`);
      console.log("✅ Profile fetched successfully");
      return profile;
    } catch (error) {
      console.error(`Error fetching profile for user ${userId}:`, error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      console.log("✏️ Updating user profile...");

      const updatedProfile = await apiFetch<User>("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify(userData),
      });

      console.log("✅ Profile updated successfully");
      return updatedProfile;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  // Follow a user
  async followUser(userId: string): Promise<void> {
    try {
      console.log(`➕ Following user ${userId}...`);

      await apiFetch<void>(`/api/users/${userId}/follow`, {
        method: "POST",
      });

      console.log("✅ User followed successfully");
    } catch (error) {
      console.error(`Error following user ${userId}:`, error);
      throw error;
    }
  },

  // Unfollow a user
  async unfollowUser(userId: string): Promise<void> {
    try {
      console.log(`➖ Unfollowing user ${userId}...`);

      await apiFetch<void>(`/api/users/${userId}/unfollow`, {
        method: "POST",
      });

      console.log("✅ User unfollowed successfully");
    } catch (error) {
      console.error(`Error unfollowing user ${userId}:`, error);
      throw error;
    }
  },
};

// Post API functions
export const postApi = {
  // Get posts from the API
  async getPosts(): Promise<Post[]> {
    try {
      console.log("🔍 Fetching posts with authentication...");

      const posts = await apiFetch<Post[]>("/api/posts");
      console.log(`✅ Successfully fetched ${posts.length} posts`);
      return posts;
    } catch (error) {
      console.error("Error fetching posts:", error);
      return [];
    }
  },

  // Get replies to a post
  getPostReplies: async (
    postId: string,
    page = 0,
    limit = 10,
  ): Promise<Post[]> => {
    try {
      const response = await fetch(
        `${API_URL}/posts/${postId}/replies?limit=${limit}&page=${page}`,
      );
      const data = await handleResponse(response);

      // Map replies to the Post interface
      return data.map((reply: any) => ({
        id: reply.id,
        userId: reply.user_id,
        userName: reply.display_name || "User",
        userHandle: reply.address
          ? `@${reply.address.substring(0, 8)}`
          : "@user",
        userAvatar: reply.avatar_url || "https://i.pravatar.cc/150?img=1",
        verified: reply.tier === "gold" || reply.tier === "diamond",
        content: reply.content,
        createdAt: reply.created_at,
        likes: reply.likes_count || 0,
        retweets: reply.reposts_count || 0,
        comments: [], // We don't fetch nested replies
        media: reply.media_urls || [],
      }));
    } catch (error) {
      console.error(`Error fetching replies for post ${postId}:`, error);
      return [];
    }
  },

  // Get post by ID
  getPostById: async (id: string): Promise<Post | null> => {
    try {
      const response = await fetch(`${API_URL}/posts/${id}`);
      const post = await handleResponse(response);

      // Map the API response to match the existing Post interface
      const mappedPost = {
        id: post.id,
        userId: post.user_id,
        userName: post.display_name || "User",
        userHandle: post.address ? `@${post.address.substring(0, 8)}` : "@user",
        userAvatar: post.avatar_url || "https://i.pravatar.cc/150?img=1",
        verified: post.tier === "gold" || post.tier === "diamond",
        content: post.content,
        createdAt: post.created_at,
        likes: post.likes_count || 0,
        retweets: post.reposts_count || 0,
        comments: [] as Post[], // Explicitly type comments as Post[]
        media: post.media_urls || [],
        // Add metadata for paginating replies
        _repliesMetadata: {
          hasMoreReplies: post.replies_count > 10,
          totalReplies: post.replies_count || 0,
          currentPage: 0,
        },
      };

      // Fetch replies for this post
      try {
        // Get first page of replies (10 per page)
        const replies = await postApi.getPostReplies(id, 0, 10);
        mappedPost.comments = replies;
      } catch (error) {
        console.error(`Error fetching replies for post ${id}:`, error);
      }

      return mappedPost;
    } catch (error) {
      console.error(`Error fetching post ${id}:`, error);
      return null;
    }
  },

  // Get posts by user ID
  getPostsByUserId: async (userId: string): Promise<Post[]> => {
    const response = await fetch(`${API_URL}/posts?userId=${userId}`);
    return handleResponse(response);
  },

  // Create a new post
  async createPost(content: string, mediaUrls: string[] = []): Promise<Post> {
    try {
      console.log("📝 Creating new post...");

      const newPost = await apiFetch<Post>("/api/posts", {
        method: "POST",
        body: JSON.stringify({ content, mediaUrls }),
      });

      console.log("✅ Post created successfully");
      return newPost;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  },

  // Update a post
  updatePost: async (post: {
    id: string;
    content: string;
    media?: string[];
  }): Promise<Post> => {
    const response = await fetch(`${API_URL}/posts`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(post),
    });
    return handleResponse(response);
  },

  // Delete a post
  deletePost: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/posts?id=${id}`, {
      method: "DELETE",
    });
    return handleResponse(response);
  },

  // Like a post
  async likePost(postId: string): Promise<void> {
    try {
      console.log(`👍 Liking post ${postId}...`);

      await apiFetch<void>(`/api/posts/${postId}/like`, {
        method: "POST",
      });

      console.log("✅ Post liked successfully");
    } catch (error) {
      console.error(`Error liking post ${postId}:`, error);
      throw error;
    }
  },

  // Unlike a post
  async unlikePost(postId: string): Promise<void> {
    try {
      console.log(`👎 Unliking post ${postId}...`);

      await apiFetch<void>(`/api/posts/${postId}/unlike`, {
        method: "POST",
      });

      console.log("✅ Post unliked successfully");
    } catch (error) {
      console.error(`Error unliking post ${postId}:`, error);
      throw error;
    }
  },

  // Retweet a post
  retweetPost: async (userId: string, postId: string): Promise<void> => {
    try {
      await fetch(`${API_URL}/posts/${postId}/repost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
    } catch (error) {
      console.error(`Error retweeting post ${postId}:`, error);
      throw error;
    }
  },

  // Unretweet a post
  unretweetPost: async (
    postId: string,
    userId: string,
  ): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/posts/retweet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ postId, userId, unretweet: true }),
    });
    return handleResponse(response);
  },

  // Reply to a post
  replyToPost: async (
    postId: string,
    userId: string,
    content: string,
    media?: string[],
  ): Promise<{ message: string; comment: Post }> => {
    const response = await fetch(`${API_URL}/posts/reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ postId, userId, content, media }),
    });
    return handleResponse(response);
  },

  // Quote tweet a post
  quoteTweet: async (
    postId: string,
    userId: string,
    content: string,
    media?: string[],
  ): Promise<{ message: string; post: Post }> => {
    const response = await fetch(`${API_URL}/posts/quote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ postId, userId, content, media }),
    });
    return handleResponse(response);
  },

  // Get user's posts
  getUserPosts: async (userId: string): Promise<Post[]> => {
    try {
      const response = await fetch(
        `${API_URL}/users/${userId}/posts?limit=20&page=0`,
      );
      const data = await handleResponse(response);

      // Map the API response to match the existing Post interface
      return data.map((post: any) => ({
        id: post.id,
        userId: post.user_id,
        userName: post.display_name || "User",
        userHandle: post.address ? `@${post.address.substring(0, 8)}` : "@user",
        userAvatar: post.avatar_url || "https://i.pravatar.cc/150?img=1",
        verified: post.tier === "gold" || post.tier === "diamond",
        content: post.content,
        createdAt: post.created_at,
        likes: post.likes_count || 0,
        retweets: post.reposts_count || 0,
        comments: [], // Will need to be populated separately
        media: post.media_urls || [],
      }));
    } catch (error) {
      console.error(`Error fetching user ${userId} posts:`, error);
      return [];
    }
  },

  // Get more replies for a specific post (for pagination)
  getMoreReplies: async (postId: string, page: number): Promise<Post[]> => {
    try {
      return await postApi.getPostReplies(postId, page, 10);
    } catch (error) {
      console.error(`Error fetching more replies for post ${postId}:`, error);
      return [];
    }
  },
};

// Direct Messages API functions
export const dmApi = {
  // Get all DMs
  getDMs: async (): Promise<DirectMessage[]> => {
    const response = await fetch(`${API_URL}/dms`);
    return handleResponse(response);
  },

  // Get DMs for a user (both sent and received)
  getDMsByUserId: async (userId: string): Promise<DirectMessage[]> => {
    const response = await fetch(`${API_URL}/dms?userId=${userId}`);
    return handleResponse(response);
  },

  // Get conversation between two users
  getConversation: async (
    senderId: string,
    receiverId: string,
  ): Promise<DirectMessage[]> => {
    const response = await fetch(
      `${API_URL}/dms?senderId=${senderId}&receiverId=${receiverId}`,
    );
    return handleResponse(response);
  },

  // Send a new DM
  sendDM: async (dm: {
    senderId: string;
    receiverId: string;
    message: string;
  }): Promise<DirectMessage> => {
    const response = await fetch(`${API_URL}/dms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dm),
    });
    return handleResponse(response);
  },
};

// Notifications API functions
export const notificationApi = {
  // Get all notifications
  getNotifications: async (): Promise<Notification[]> => {
    const response = await fetch(`${API_URL}/notifications`);
    return handleResponse(response);
  },

  // Get notifications for a user
  getNotificationsByUserId: async (userId: string): Promise<Notification[]> => {
    const response = await fetch(`${API_URL}/notifications?userId=${userId}`);
    return handleResponse(response);
  },

  // Mark a notification as read
  markAsRead: async (id: string): Promise<Notification> => {
    const response = await fetch(`${API_URL}/notifications`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, read: true }),
    });
    return handleResponse(response);
  },

  // Mark all notifications for a user as read
  markAllAsRead: async (userId: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/notifications`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, read: true }),
    });
    return handleResponse(response);
  },

  // Create a notification
  createNotification: async (notification: {
    userId: string;
    type: "like" | "retweet" | "reply" | "quoteTweet";
    postId: string;
  }): Promise<Notification> => {
    const response = await fetch(`${API_URL}/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notification),
    });
    return handleResponse(response);
  },
};

// Listings API functions
export const listingApi = {
  // Get all listings
  getListings: async (): Promise<Listing[]> => {
    const response = await fetch(`${API_URL}/listings`);
    return handleResponse(response);
  },

  // Get listing by ID
  getListingById: async (id: string): Promise<Listing> => {
    const response = await fetch(`${API_URL}/listings?id=${id}`);
    return handleResponse(response);
  },

  // Get listings by user ID
  getListingsByUserId: async (userId: string): Promise<Listing[]> => {
    const response = await fetch(`${API_URL}/listings?userId=${userId}`);
    return handleResponse(response);
  },

  // Get listings by category
  getListingsByCategory: async (
    category: "meme" | "project",
  ): Promise<Listing[]> => {
    const response = await fetch(`${API_URL}/listings?category=${category}`);
    return handleResponse(response);
  },

  // Create a new listing
  createListing: async (listing: {
    userId: string;
    title: string;
    description: string;
    category: "meme" | "project";
    media?: string[];
  }): Promise<Listing> => {
    const response = await fetch(`${API_URL}/listings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(listing),
    });
    return handleResponse(response);
  },

  // Delete a listing
  deleteListing: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/listings?id=${id}`, {
      method: "DELETE",
    });
    return handleResponse(response);
  },
};
