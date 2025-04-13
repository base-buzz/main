/**
 * Post Detail Page (`app/post/[id]/page.tsx`)
 *
 * What it does:
 * - Displays the detail page for a single post identified by the [id] parameter in the URL.
 * - Shows the main post content, author details, and replies.
 * - Allows logged-in users to add new replies.
 *
 * How it does it:
 * - Is an async Server Component by default.
 * - Receives `params` prop containing the postId.
 * - Fetches the session, main post data, and its replies server-side using async/await.
 * - Calls `getServerSession` from `next-auth/next`.
 * - Calls `getPostById` and `getPostReplies` from `services/posts.service.ts`.
 * - Maps the raw fetched data to the `Post` interface required by UI components.
 * - Renders the main post and each reply using the reusable `PostComponent` (Client Component).
 * - Renders the `CreatePostForm` component (Client Component) to allow users to submit new replies.
 * - Uses `notFound()` from `next/navigation` for error handling.
 *
 * Dependencies for Post Actions:
 * - `@/services/posts.service.ts`: For fetching post and reply data (`getPostById`, `getPostReplies`).
 * - `@/components/post/PostComponent`: For rendering the main post and replies.
 * - `@/components/post/CreatePostForm`: For the reply input form.
 * - `next-auth/next`: For `getServerSession`.
 */
// "use client"; // REMOVED - This is now a Server Component

// Remove client-side hooks
// import React, { useEffect, useState } from "react";
import React from "react"; // Keep React for JSX
// import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
// import { useCurrentUser } from "@/hooks/useCurrentUser"; // Remove client hook
import { Post, User } from "@/types/interfaces";
import PostComponent from "@/components/post/PostComponent";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import CreatePostForm from "@/components/post/CreatePostForm";
import { Icon } from "@/components/ui/icons";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
// import { supabaseClient } from "@/lib/supabase/client"; // No longer needed here
import { notFound } from "next/navigation"; // Import for handling not found
import { getServerSession } from "next-auth/next";
import { Session } from "next-auth"; // Import Session from base package
import { getPostById, getPostReplies } from "@/services/posts.service";

// Add mapping function similar to the old client-side one
const mapDbDataToPost = (dbPost: any, comments: Post[] = []): Post => {
  // Basic null check for safety
  if (!dbPost) {
    // This case should ideally be handled before calling this function
    // But returning a structure that won't break PostComponent is safer
    console.error("mapDbDataToPost called with null/undefined dbPost");
    return {
      id: "error",
      content: "Error loading post",
      userId: "",
      createdAt: new Date().toISOString(),
      userName: "Error",
      userAvatar: "",
      userHandle: "",
      likes: 0,
      retweets: 0,
      comments: [],
      verified: false,
    };
  }

  // Type assertion after check or use optional chaining
  const postWithUser = dbPost as typeof dbPost & { users: User | null };

  return {
    id: postWithUser.id,
    content: postWithUser.content,
    createdAt: postWithUser.created_at || new Date().toISOString(),
    image_url: postWithUser.image_url,
    userId: postWithUser.users?.id || postWithUser.user_id,
    userName: postWithUser.users?.display_name || "Anonymous",
    userAvatar:
      postWithUser.users?.avatar_url ||
      `https://api.dicebear.com/7.x/shapes/svg?seed=${postWithUser.user_id}`,
    userHandle: postWithUser.users?.address
      ? `@${postWithUser.users.address.slice(-6)}`
      : `@${postWithUser.user_id?.slice(0, 6) ?? "error"}`,
    likes: postWithUser.likes_count ?? 0,
    retweets: postWithUser.reposts_count ?? 0,
    comments: comments, // Assign pre-mapped comments for main post
    verified: postWithUser.users?.tier === "gold",
    media: postWithUser.media_urls || undefined,
    // Ensure all required fields from Post interface are present
  };
};

// Async Server Component
export default async function PostPage({ params }: { params: { id: string } }) {
  const postId = params?.id;

  // Validate postId early
  if (!postId) {
    notFound(); // Use Next.js notFound helper
  }

  console.log(`[PostPage] Server: Loading page for postId: ${postId}`);

  // Fetch session server-side
  const session: Session | null = await getServerSession();
  const currentUser = session?.user;
  // Use address as the primary ID from session
  const userIdFromSession = currentUser?.address;

  try {
    // Fetch main post and replies concurrently server-side
    // Note: Ensure service functions return necessary data, including joined user data
    const [rawPostData, rawRepliesData] = await Promise.all([
      getPostById(postId),
      getPostReplies(postId),
    ]);

    // Handle post not found
    if (!rawPostData) {
      console.log(`[PostPage] Server: Post not found for postId: ${postId}`);
      notFound();
    }

    console.log(
      `[PostPage] Server: Data fetched successfully for postId: ${postId}`
    );

    // Map replies first (they don't have nested comments)
    const mappedReplies: Post[] = (rawRepliesData || []).map((reply) =>
      mapDbDataToPost(reply)
    );

    // Map the main post, passing the mapped replies
    const post: Post = mapDbDataToPost(rawPostData, mappedReplies);

    // Render the page with fetched data
    return (
      <div>
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center border-b bg-background/90 px-4 py-3 backdrop-blur-md">
          <Link href="/home" className="mr-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Post</h1>
        </div>

        {/* Main post - Remove p-4 wrapper */}
        <div>
          <PostComponent
            post={post}
            currentUserId={userIdFromSession ?? undefined}
          />
        </div>

        {/* Reply form */}
        {userIdFromSession && (
          <div className="border-b px-4 py-3">
            <CreatePostForm
              userId={userIdFromSession}
              replyToId={postId}
              userAvatar={currentUser?.image ?? undefined}
            />
          </div>
        )}

        {/* Replies section - Remove outer divide-y, add border-t */}
        <div className="border-t">
          {mappedReplies && mappedReplies.length > 0 ? (
            mappedReplies.map((reply: Post) => (
              // Remove p-4 wrapper, add border-b
              <div key={reply.id} className="border-b">
                <PostComponent
                  post={reply}
                  currentUserId={userIdFromSession ?? undefined}
                />
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No replies yet.
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error(
      `[PostPage] Server: Error loading page for postId: ${postId}`,
      error
    );
    // Consider a more specific error page or handling
    // For now, re-throwing might trigger default error handling
    // Or render a generic error message
    return (
      <div className="flex h-full items-center justify-center py-20">
        <div className="rounded-lg bg-destructive/10 p-6 text-destructive">
          <p>Could not load post details.</p>
          <Link href="/">
            <Button className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }
}
