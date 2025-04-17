/**
 * Posts Section Component (`components/home/PostsSection.tsx`)
 *
 * What it does:
 * - Renders the main list/feed of posts on the home page.
 * - Takes an array of `Post` objects as input.
 * - Handles the display logic for each post, including avatar, user info, content, media, and action buttons.
 * - Implements navigation to the post detail page when a post is clicked.
 *
 * How it does it:
 * - Marked as a Client Component ("use client") primarily for the `onClick` navigation handler.
 * - Receives the list of posts, loading state, and current user ID as props from the parent page (`app/home/page.tsx`).
 * - Maps over the `posts` array to render each post individually.
 * - **Important:** This component currently re-implements the rendering logic for a single post, which is very similar to `components/post/PostComponent.tsx`. Ideally, this should be refactored to reuse `PostComponent`.
 * - Includes helper functions (`formatDate`, `formatNumber`, `generateHandle`, `enhanceContent`) for data presentation.
 * - Adds an `onClick` handler to the main div wrapping each post to navigate to `/post/[id]` using `useRouter`.
 * - Displays loading and empty states.
 *
 * Dependencies for Post Actions:
 * - `@/types/interfaces`: Defines the `Post` interface.
 * - `next/navigation`: For `useRouter` (used for the post click navigation).
 * - Note: It currently doesn't directly call API functions for actions like liking/retweeting itself,
 *     as that logic is self-contained within its own rendering code instead of using PostComponent.
 */
"use client";

import React, { useState, useEffect } from "react";
import { Post } from "@/types/interfaces";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  HeartIcon,
  RepeatIcon,
  MessageSquareIcon,
  Share2Icon,
  MoreHorizontalIcon,
  BarChart2Icon,
  BookmarkIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PostsSectionProps {
  posts: Array<Post & { [key: string]: any; showPostCount?: boolean }>;
  loading: boolean;
  currentUserId?: string;
  className?: string;
}

export function PostsSection({
  posts,
  loading,
  currentUserId,
  className,
}: PostsSectionProps) {
  const [isClientMounted, setIsClientMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Set mounted state to true after initial render on the client
    setIsClientMounted(true);
  }, []);

  // Log post dates to see what's coming in
  React.useEffect(() => {
    if (posts && posts.length > 0) {
      console.log(
        "Post dates:",
        posts.map((post) => ({
          id: post.id,
          createdAt: post.createdAt,
        }))
      );
    }
  }, [posts]);

  console.log("Posts data:", posts); // Debug log to check what's coming in

  const formatDate = (date: string | null | undefined) => {
    try {
      // Return early if date is not provided
      if (!date) return "now";

      // Special handling for hard-coded values in the UI
      if (date === "now" || date === "recently") {
        return date;
      }

      // Try parsing the date with the Date constructor
      const d = new Date(date);

      // Check if the date is valid
      if (isNaN(d.getTime())) {
        console.log("Invalid date format:", date);
        return "now"; // Default for most recent posts
      }

      // Format to show only relative time like Twitter
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      console.log(
        `Formatting date: ${date}, diff: ${diffSecs}s, ${diffMins}m, ${diffHours}h, ${diffDays}d`
      );

      // If it's very recent (within 30 seconds), show "now"
      if (diffSecs < 30) return "now";
      if (diffSecs < 60) return `${diffSecs}s`;
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;

      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      console.error("Error formatting date:", e, "Date value:", date);
      return "now"; // Better fallback text for a Twitter-like experience
    }
  };

  // Function to format large numbers with K, M, B suffixes
  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num.toString();
  };

  // Sample images for posts that don't have media
  const sampleImages = [
    "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=2832&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2832&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2832&auto=format&fit=crop",
  ];

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center text-center">
        <h3 className="text-xl font-medium">No posts yet</h3>
        <p className="mt-2 text-muted-foreground">
          Follow users to see their posts here
        </p>
      </div>
    );
  }

  // Function to generate a handle from display name or address
  const generateHandle = (
    displayName: string | null,
    address: string | null
  ): string => {
    // If display name is available, convert it to a handle format
    if (displayName) {
      // Convert display name to lowercase, remove spaces and special characters
      let handle = displayName
        .toLowerCase()
        .replace(/[^\w]/g, "") // Remove non-alphanumeric characters
        .trim();

      // If handle is empty after processing, fallback to address
      if (!handle) {
        return address ? address.toLowerCase().substring(0, 10) : "user";
      }

      // Log the original and processed handle for debugging
      console.log(`Generated handle: ${displayName} → ${handle}`);

      return handle;
    }

    // Fallback to address if no display name
    if (!address) return "user";
    return (
      address.toLowerCase().substring(0, 6) +
      "..." +
      address.toLowerCase().substring(address.length - 4)
    );
  };

  // Function to ensure content has emojis
  const enhanceContent = (content: string, index: number): string => {
    // Check for common emoji characters
    const hasEmoji = /[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(content);
    if (!hasEmoji) {
      const emojis = [
        "🚀",
        "💯",
        "🔥",
        "✨",
        "💎",
        "🧠",
        "👀",
        "💪",
        "🎉",
        "🌈",
      ];
      // Add emoji at end if not there already
      return `${content} ${emojis[index % emojis.length]}`;
    }
    return content;
  };

  return (
    <div className={cn("divide-y divide-border", className)}>
      {posts.map((post, index) => {
        // Debug the post data - what's going on with createdAt
        console.log(
          `Post ${index}: id=${post.id}, createdAt=${post.createdAt}, typeof=${typeof post.createdAt}`
        );

        // Get media URL - use post's media if available, otherwise set to undefined
        // const mediaUrl =
        //   post.media && post.media.length > 0 ? post.media[0] : undefined;

        // Enhanced content with emojis if needed
        const enhancedContent = enhanceContent(post.content, index);

        // No need for postData assertion now, as props type allows extra fields
        const displayName = post.display_name || post.userName || "Anonymous"; // Access potential extra fields directly
        const avatarUrl =
          post.avatar_url ||
          post.userAvatar ||
          `https://api.dicebear.com/7.x/shapes/svg?seed=${post.userId || index}`;
        const handle = post.handle || generateHandle(displayName, post.address); // Access potential extra fields directly

        // Handle post click navigation
        const handlePostClick = (e: React.MouseEvent<HTMLDivElement>) => {
          // Prevent navigation if clicking on interactive elements like links or buttons
          if ((e.target as HTMLElement).closest("a, button")) {
            return;
          }
          router.push(`/post/${post.id}`);
        };

        return (
          <div
            key={post.id}
            className="cursor-pointer p-4 transition-colors hover:bg-muted/50"
            onClick={handlePostClick}
          >
            <div className="flex space-x-3">
              {/* User Avatar Link (for the post author) */}
              <Link href={`/${handle}`} onClick={(e) => e.stopPropagation()}>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback>
                    {displayName?.charAt(0).toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
              </Link>

              <div className="flex-1 space-y-1">
                {/* User Info & Timestamp */}
                <div className="flex items-center justify-between">
                  <Link
                    href={`/${handle}`}
                    className="group flex items-center gap-1 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="font-semibold group-hover:underline">
                      {displayName}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      @{handle}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      · {isClientMounted ? formatDate(post.createdAt) : "..."}
                    </span>
                  </Link>
                </div>

                {/* Post Content */}
                <p className="whitespace-pre-wrap text-sm">{enhancedContent}</p>

                {/* Post Media - UPDATED TO USE post.image_url */}
                {post.image_url && (
                  <div className="relative mt-2 aspect-video w-full overflow-hidden rounded-lg border">
                    <Image
                      src={post.image_url}
                      alt="Post media"
                      layout="fill"
                      objectFit="cover"
                      unoptimized // Add this if using external URLs without configured domains
                    />
                  </div>
                )}

                {/* Action Buttons - Now accessing counts directly */}
                <div className="flex items-center justify-between pt-2 text-muted-foreground">
                  {/* Reply Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Open reply modal/compose view
                      console.log("Reply clicked for post:", post.id);
                    }}
                  >
                    <MessageSquareIcon className="h-4 w-4" />
                    <span className="text-xs">
                      {formatNumber(post.replies_count ?? 0)}{" "}
                      {/* Direct access */}
                    </span>
                  </Button>
                  {/* Repost Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Add repost logic
                      console.log("Repost clicked for post:", post.id);
                    }}
                  >
                    <RepeatIcon className="h-4 w-4" />
                    <span className="text-xs">
                      {formatNumber(post.reposts_count ?? 0)}{" "}
                      {/* Direct access */}
                    </span>
                  </Button>
                  {/* Like Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Add like logic
                      console.log("Like clicked for post:", post.id);
                    }}
                  >
                    <HeartIcon className="h-4 w-4" />
                    <span className="text-xs">
                      {formatNumber(post.likes_count ?? 0)}{" "}
                      {/* Direct access */}
                    </span>
                  </Button>
                  {/* Views */}
                  <div className="flex items-center gap-1">
                    <BarChart2Icon className="h-4 w-4" />
                    <span className="text-xs">
                      {formatNumber(post.views_count ?? 0)}{" "}
                      {/* Direct access */}
                    </span>
                  </div>
                  {/* Bookmark & Share Buttons */}
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Add bookmark logic
                        console.log("Bookmark clicked for post:", post.id);
                      }}
                    >
                      <BookmarkIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Add share logic
                        console.log("Share clicked for post:", post.id);
                      }}
                    >
                      <Share2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
