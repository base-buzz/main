import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { Post } from "@/lib/api-client";
import { likesApi } from "@/lib/api-client";
import { Icon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onReply?: (post: Post) => void;
}

export function PostCard({ post, currentUserId, onReply }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
  const [replyCount, setReplyCount] = useState(post.replies_count || 0);
  const [repostCount, setRepostCount] = useState(post.reposts_count || 0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  // Format date for display
  const formattedDate = post.created_at
    ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
    : "";

  // Check if user has already liked the post
  useEffect(() => {
    if (!currentUserId) return;

    const checkLikeStatus = async () => {
      try {
        const hasLiked = await likesApi.hasLiked(currentUserId, post.id);
        setIsLiked(hasLiked);
      } catch (error) {
        console.error("Failed to check like status:", error);
      }
    };

    checkLikeStatus();
  }, [currentUserId, post.id]);

  // Handle like/unlike
  const handleLikeToggle = async () => {
    if (!currentUserId || isLikeLoading) return;

    try {
      setIsLikeLoading(true);

      if (isLiked) {
        await likesApi.unlikePost(currentUserId, post.id);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        await likesApi.likePost(currentUserId, post.id);
        setLikeCount((prev) => prev + 1);
      }

      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    } finally {
      setIsLikeLoading(false);
    }
  };

  // Handle reply
  const handleReply = () => {
    if (onReply) {
      onReply(post);
    }
  };

  return (
    <div className="border-b border-border p-4 hover:bg-accent/5">
      <div className="flex space-x-3">
        {/* User avatar */}
        <div className="flex-shrink-0">
          <Link href={`/profile/${post.user_id}`}>
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted">
              <Image
                className="object-cover"
                src={post.users?.avatar_url || "/placeholder-avatar.png"}
                alt={post.users?.display_name || "User"}
                fill
                sizes="40px"
              />
            </div>
          </Link>
        </div>

        {/* Post content */}
        <div className="min-w-0 flex-1">
          {/* User info and timestamp */}
          <div className="flex items-center space-x-1">
            <Link
              href={`/profile/${post.user_id}`}
              className="font-medium hover:underline"
            >
              {post.users?.display_name || "Anonymous"}
            </Link>
            {post.users?.tier && (
              <span
                className={`rounded bg-accent/50 px-1 text-xs text-foreground`}
              >
                {post.users.tier}
              </span>
            )}
            <span className="text-sm text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">
              {formattedDate}
            </span>
          </div>

          {/* Post text */}
          <Link href={`/post/${post.id}`}>
            <p className="mt-1">{post.content}</p>
          </Link>

          {/* Action buttons */}
          <div className="mt-2 flex max-w-md justify-between">
            {/* Reply button */}
            <button
              onClick={handleReply}
              className="flex items-center text-muted-foreground hover:text-primary"
            >
              <Icon name="message-circle" className="mr-1 h-5 w-5" />
              <span>{replyCount > 0 ? replyCount : ""}</span>
            </button>

            {/* Repost button */}
            <button className="flex items-center text-muted-foreground hover:text-green-500">
              <svg
                className="mr-1 h-5 w-5"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 1l4 4-4 4"></path>
                <path d="M3 11V9a4 4 0 014-4h14"></path>
                <path d="M7 23l-4-4 4-4"></path>
                <path d="M21 13v2a4 4 0 01-4 4H3"></path>
              </svg>
              <span>{repostCount > 0 ? repostCount : ""}</span>
            </button>

            {/* Like button */}
            <button
              onClick={handleLikeToggle}
              disabled={isLikeLoading}
              className={`flex items-center ${
                isLiked
                  ? "text-red-500"
                  : "text-muted-foreground hover:text-red-500"
              }`}
            >
              <svg
                className={cn("mr-1 h-5 w-5", isLiked && "fill-current")}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <span>{likeCount > 0 ? likeCount : ""}</span>
            </button>

            {/* Share button */}
            <button className="flex items-center text-muted-foreground hover:text-primary">
              <svg
                className="mr-1 h-5 w-5"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                <polyline points="16 6 12 2 8 6"></polyline>
                <line x1="12" y1="2" x2="12" y2="15"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
