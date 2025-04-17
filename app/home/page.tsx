"use client";

import React, { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ComposeBox } from "@/components/home/ComposeBox";
import { ShowPostsCount } from "@/components/home/ShowPostsCount";
import { useSession } from "next-auth/react";
import { useAccount } from "wagmi";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Post } from "@/types/interfaces";
import { postApi, apiFetch } from "@/lib/api";
import { UnauthenticatedHomeView } from "@/components/auth/UnauthenticatedHomeView";
import { PostsSection } from "@/components/home/PostsSection";
import { HomeTabs } from "@/components/home/HomeTabs";

export default function HomePage() {
  const { data: session, status } = useSession();
  const { isConnected: isWalletConnected } = useAccount();
  const isAuthenticated = status === "authenticated";

  const { user, isLoading: userLoading } = useCurrentUser();
  const pathname = usePathname();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch posts
  const fetchPosts = useCallback(async () => {
    // Check authentication status early
    if (status !== "authenticated" || !user?.id) {
      console.log(
        "⚠️ Not authenticated or user ID missing, skipping feed fetch"
      );
      setPosts([]);
      setLoading(false); // Ensure loading stops if not fetching
      return; // Exit early
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`📊 Fetching user feed via API for ${user.id}...`);

      // Fetch data from the API route
      const response = await fetch("/api/feed");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API Error: ${response.statusText}`);
      }

      const rawFeedPosts = await response.json();

      if (!Array.isArray(rawFeedPosts)) {
        console.error("❌ API response is not an array:", rawFeedPosts);
        throw new Error("Invalid data format received from API");
      }

      // Map raw data to Post interface, acknowledging joined user data
      const fetchedPosts: Post[] = rawFeedPosts.map((post: any) => {
        const userData = post.users; // Access the joined user data
        return {
          id: post.id,
          userId: post.user_id,
          content: post.content,
          createdAt: post.created_at || new Date().toISOString(),
          image_url: post.image_url,
          likes: post.likes_count ?? 0,
          retweets: post.reposts_count ?? 0,
          comments: [],
          userName: userData?.display_name || "User",
          userHandle: userData?.address
            ? `@${userData.address.slice(-6)}`
            : `@unknown`,
          userAvatar: userData?.avatar_url || undefined,
          verified: userData?.tier === "gold",
        };
      });

      console.log(
        `📝 Received and mapped ${fetchedPosts.length} posts from API`
      );
      setPosts(fetchedPosts);
    } catch (err) {
      console.error("❌ Error fetching posts via API:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch posts via API"
      );
      setPosts([]); // Clear posts on error
    } finally {
      setLoading(false);
    }
  }, [status, user?.id]); // Updated dependencies: only need session status and user ID

  // Fetch posts on initial load and when auth status or user ID changes
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostCreated = (newPost: Post) => {
    console.log("✅ Post created, triggering refetch...");
    fetchPosts();
  };

  if (status === "loading" || loading || userLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (isAuthenticated) {
    if (error) {
      return (
        <div className="flex h-full items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="hidden md:block">
          <HomeTabs />
        </div>

        <div className="divide-y divide-border">
          {user && (
            <div className="hidden p-4 md:block">
              <ComposeBox user={user} onPostCreated={handlePostCreated} />
              <ShowPostsCount count={posts.length} />
            </div>
          )}

          <PostsSection
            posts={posts.map((post, index) => ({
              ...post,
              showPostCount: index === 0,
            }))}
            loading={loading}
            currentUserId={session?.user?.address ?? undefined}
            className="divide-y divide-border"
          />
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    console.warn("HomePage rendered while unauthenticated, returning null.");
    return null;
  }
}
