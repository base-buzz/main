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
    try {
      setLoading(true);
      setError(null);

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
  }, [isAuthenticated, isWalletConnected]);

  // Fetch posts on initial load and when auth status changes
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.handle) {
      const targetPath = `/${session.user.handle}`;
      console.log(
        `[CLIENT /home] Already authenticated, redirecting to ${targetPath}...`
      );
      router.replace(targetPath);
    }
  }, [status, session, router]);

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
