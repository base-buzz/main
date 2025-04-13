/**
 * Post Detail Page (`app/post/[id]/page.tsx`)
 *
 * What it does:
 * - Displays the detail page for a single post identified by the [id] parameter in the URL.
 * - Shows the main post content, author details, and replies.
 * - Allows logged-in users to add new replies.
 *
 * How it does it:
 * - Marked as a Client Component ("use client") to allow for client-side hooks and state.
 * - Uses `useParams` to get the postId from the URL.
 * - Uses `useCurrentUser` hook to get the logged-in user's details.
 * - Fetches the main post data and its replies client-side within a `useEffect` hook.
 * - Calls `getPostById` and `getPostReplies` from `services/posts.service.ts` for data fetching.
 *   (Note: These service functions currently use the client-side Supabase instance).
 * - Maps the raw fetched data (from Supabase tables/views) to the `Post` interface required by UI components.
 * - Renders the main post and each reply using the reusable `PostComponent`.
 * - Renders the `CreatePostForm` component to allow users to submit new replies.
 * - Includes basic loading and error state handling.
 *
 * Dependencies for Post Actions:
 * - `@/services/posts.service.ts`: For fetching post and reply data (`getPostById`, `getPostReplies`).
 * - `@/components/post/PostComponent`: For rendering the main post and replies.
 * - `@/components/post/CreatePostForm`: For the reply input form.
 * - `@/hooks/useCurrentUser`: To get current user data for authentication checks and passing to components.
 */
"use client"; // Restore directive

import React, { useEffect, useState } from "react"; // Restore hooks
import { useParams } from "next/navigation"; // Restore hook
import Link from "next/link";
import Image from "next/image";
import { useCurrentUser } from "@/hooks/useCurrentUser"; // Restore hook
// Remove service imports for functions now handled directly
// import {
//   getPostById,
//   getPostReplies,
//   createReply,
// } from "@/services/posts.service";
import { Post, User } from "@/types/interfaces";
import PostComponent from "@/components/post/PostComponent";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import CreatePostForm from "@/components/post/CreatePostForm";
import { Icon } from "@/components/ui/icons";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabaseClient } from "@/lib/supabase/client"; // Import the CLIENT client

// --- Helper function to map DB reply to Post interface ---
const mapDbReplyToPost = (
  reply: any // Use 'any' for input flexibility, be strict on output
): Post => {
  const replyWithUser = reply as typeof reply & { users: User | null };
  return {
    id: replyWithUser.id,
    content: replyWithUser.content,
    createdAt: replyWithUser.created_at || new Date().toISOString(),
    image_url: replyWithUser.image_url,
    userId: replyWithUser.users?.id || replyWithUser.user_id,
    userName: replyWithUser.users?.display_name || "Anonymous",
    userAvatar:
      replyWithUser.users?.avatar_url ||
      `https://api.dicebear.com/7.x/shapes/svg?seed=${replyWithUser.user_id}`,
    userHandle: replyWithUser.users?.address
      ? `@${replyWithUser.users.address.slice(-6)}`
      : `@${replyWithUser.user_id.slice(0, 6)}`,
    likes: replyWithUser.likes_count ?? 0,
    retweets: replyWithUser.reposts_count ?? 0,
    comments: [], // Replies don't have nested comments array in this view
    verified: replyWithUser.users?.tier === "gold",
    media: replyWithUser.media_urls || undefined, // Use undefined if expected by Post type
    // Ensure all other required Post fields have defaults
    // Add defaults based on your actual Post interface definition
  };
};
// --- End Helper Function ---

// Restore original component structure
export default function PostPage() {
  const params = useParams();
  const postId = params?.id as string;
  const { user, isLoading } = useCurrentUser();
  const isAuthenticated = !!user;
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  console.log(`[PostPage] Loading page for postId: ${postId}`);

  // Restore useEffect for client-side data fetching
  useEffect(() => {
    const fetchPostAndReplies = async () => {
      // Only fetch if postId is present AND user loading is complete
      if (!postId || isLoading) return;

      console.log(
        `[PostPage] useEffect: Fetching data for postId: ${postId} (User loading complete)`
      );

      // Add a small delay to potentially wait for client initialization
      await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms delay

      try {
        setPageLoading(true);
        setError(null);

        console.log("[PostPage] Preparing Supabase queries...");

        // Fetch main post and replies concurrently using supabaseClient directly
        const postQuery = supabaseClient
          .from("posts")
          // Simplify select to isolate the issue
          .select(
            `id, content, user_id, is_deleted, created_at, image_url, likes_count, reposts_count, media_urls, reply_to_id`
          )
          .eq("id", postId)
          .is("is_deleted", false)
          .maybeSingle();

        const repliesQuery = supabaseClient
          .from("posts")
          .select(
            `*, users:user_id (id, display_name, avatar_url, address, tier)`
          )
          .eq("reply_to_id", postId)
          .is("is_deleted", false)
          .order("created_at", { ascending: true }); // Limit can be added here if needed

        console.log("[PostPage] Executing Promise.all...");
        const promiseAllResult = await Promise.all([postQuery, repliesQuery]);
        console.log(
          "[PostPage] Promise.all finished. Results:",
          promiseAllResult
        );

        const [
          { data: mainPostData, error: postError },
          { data: rawReplies, error: repliesError },
        ] = promiseAllResult;

        // Log the raw results
        console.log("[PostPage] Raw mainPostData:", mainPostData);
        console.log("[PostPage] Raw postError:", postError);
        console.log("[PostPage] Raw rawReplies:", rawReplies);
        console.log("[PostPage] Raw repliesError:", repliesError);

        // Handle errors from Supabase calls
        if (postError) throw postError;
        if (repliesError) throw repliesError;

        if (mainPostData) {
          // Map replies
          const mappedReplies: Post[] = (rawReplies || []).map(
            mapDbReplyToPost
          );
          // Map main post
          const mainPostWithUser = mainPostData as typeof mainPostData & {
            users: User | null;
          };
          const finalMainPost: Post = {
            id: mainPostWithUser.id,
            content: mainPostWithUser.content,
            createdAt: mainPostWithUser.created_at || new Date().toISOString(),
            image_url: mainPostWithUser.image_url,
            userId: mainPostWithUser.users?.id || mainPostWithUser.user_id,
            userName: mainPostWithUser.users?.display_name || "Anonymous",
            userAvatar:
              mainPostWithUser.users?.avatar_url ||
              `https://api.dicebear.com/7.x/shapes/svg?seed=${mainPostWithUser.user_id}`,
            userHandle: mainPostWithUser.users?.address
              ? `@${mainPostWithUser.users.address.slice(-6)}`
              : `@${mainPostWithUser.user_id.slice(0, 6)}`,
            likes: mainPostWithUser.likes_count ?? 0,
            retweets: mainPostWithUser.reposts_count ?? 0,
            comments: mappedReplies, // Assign the correctly mapped replies
            verified: mainPostWithUser.users?.tier === "gold",
            media: mainPostWithUser.media_urls || undefined,
          };
          setPost(finalMainPost);
        } else {
          setError("Post not found");
          setPost(null);
        }
      } catch (err: any) {
        console.error("Error fetching post details:", err);
        setError(err.message || "Failed to load post details");
        setPost(null);
      } finally {
        setPageLoading(false);
      }
    };

    fetchPostAndReplies();
  }, [postId, isLoading]);

  // Restore client-side reply handling
  const handleReplyCreated = (newReply: Post) => {
    console.log(
      `[PostPage] handleReplyCreated triggered for postId: ${postId}`,
      newReply
    );
    if (post) {
      setPost((prevPost) => {
        if (!prevPost) return null;
        return {
          ...prevPost,
          comments: [newReply, ...(prevPost.comments || [])], // Prepend new reply
        };
      });
    }
  };

  // Restore loading state
  if (isLoading || pageLoading) {
    return <LoadingSpinner />;
  }

  if (error || !post) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <div className="rounded-lg bg-destructive/10 p-6 text-destructive">
          <p>{error || "Post could not be loaded."}</p>
          <Link href="/">
            <Button className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Restore original return JSX
  return (
    <div className="divide-y divide-border">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center bg-background/90 px-4 py-3 backdrop-blur-md">
        <Link href="/home" className="mr-4">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Post</h1>
      </div>

      {/* Main post */}
      <div className="p-4">
        <PostComponent post={post} currentUserId={user?.id} />
      </div>

      {/* Reply form */}
      {user && isAuthenticated && (
        <div className="p-4">
          <div className="flex gap-3">
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-muted">
              {/* Check if user.avatar_url exists */}
              {user.avatar_url && (
                <Image
                  src={user.avatar_url}
                  alt={user.display_name || "User Avatar"}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              )}
            </div>
            <div className="w-full">
              <CreatePostForm
                userId={user.id}
                onPostCreated={handleReplyCreated} // Restore callback
                replyToId={post.id}
                className="border-0 p-0 shadow-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Replies section */}
      <div className="divide-y divide-border">
        <h2 className="bg-background/50 p-4 font-bold">Replies</h2>
        {post.comments && post.comments.length > 0 ? (
          post.comments.map((comment) => (
            <div key={comment.id} className="p-4">
              <PostComponent
                post={comment}
                currentUserId={user?.id}
                isComment={true}
              />
            </div>
          ))
        ) : (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">
              No replies yet. Be the first to reply!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
