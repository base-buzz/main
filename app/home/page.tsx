"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ComposeBox } from "@/components/home/ComposeBox";
import { ShowPostsCount } from "@/components/home/ShowPostsCount";
import { useAuth } from "@/contexts/auth-context";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Post } from "@/types/interfaces";
import { postApi, apiFetch } from "@/lib/api";
import { UnauthenticatedHomeView } from "@/components/auth/UnauthenticatedHomeView";
import { PostsSection } from "@/components/home/PostsSection";
import { HomeTabs } from "@/components/home/HomeTabs";

export default function HomePage() {
  const { isAuthenticated, isWalletConnected } = useAuth();
  const { user, isLoading: userLoading } = useCurrentUser();
  const pathname = usePathname();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch posts when authentication status changes
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Log auth status
        console.log("🔐 Auth status:", {
          isWalletConnected,
          isAuthenticated,
        });

        if (isAuthenticated) {
          console.log(`📊 Fetching posts with auth...`);
          const fetchedPosts = await postApi.getPosts();

          console.log(`📝 Received ${fetchedPosts.length} posts`);
          setPosts(fetchedPosts);
        } else {
          console.log("⚠️ Not authenticated, skipping post fetch");
          setPosts([]);
        }
      } catch (err) {
        console.error("❌ Error fetching posts:", err);
        setError("Failed to fetch posts");
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [isAuthenticated, isWalletConnected]);

  const handlePostCreated = (newPost: Post) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  // Show loading state while auth is loading (removed userLoading check)
  if (userLoading || loading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show the authenticated view if user is authenticated
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
        {/* Desktop tabs - visible on md screens and above */}
        <div className="hidden md:block">
          <HomeTabs />
        </div>

        <div className="divide-y divide-border">
          {/* Restore Post creation area */}
          {user && (
            <div className="hidden p-4 md:block">
              <ComposeBox user={user} onPostCreated={handlePostCreated} />
              <ShowPostsCount count={posts.length} />
            </div>
          )}

          {/* Posts feed with loading state */}
          <PostsSection
            posts={posts.map((post, index) => ({
              ...post,
              showPostCount: index === 0, // Only show post count on first post
            }))}
            loading={loading}
            currentUserId={user?.id}
            className="divide-y divide-border"
          />
        </div>
      </>
    );
  }

  // Show the unauthenticated home view component
  return <UnauthenticatedHomeView />;
}
