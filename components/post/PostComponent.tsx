"use client";

import React, { useState } from "react";
import { Heart, MessageCircle, Repeat, Share } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Post, User } from "@/types/interfaces";
import { userApi, postApi } from "@/lib/api";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/registry/new-york/ui/avatar";
import { Button } from "@/registry/new-york/ui/button";
import { Icon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { ShowPostsCount } from "@/components/home/ShowPostsCount";

interface PostComponentProps {
  post: Post;
  currentUserId?: string;
  isComment?: boolean;
  showPostCount?: boolean;
}

/**
 * Simple utility to format a date relative to now
 */
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}y ago`;
};

export default function PostComponent({
  post,
  currentUserId,
  isComment = false,
  showPostCount = false,
}: PostComponentProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isRetweeted, setIsRetweeted] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [retweetCount, setRetweetCount] = useState(post.retweets);
  const [showComments, setShowComments] = useState(false);

  // Fetch user information when component mounts (only if needed)
  React.useEffect(() => {
    const fetchUser = async () => {
      // Only fetch if we don't already have user data in the post
      if (!post.userName || !post.userAvatar) {
        try {
          const userData = await userApi.getUserById(post.userId);
          setUser(userData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUser();
  }, [post.userId, post.userName, post.userAvatar]);

  const handlePostClick = (e: React.MouseEvent) => {
    // Prevent navigation if the click was on an interactive element
    if (
      (e.target as HTMLElement).closest("button") ||
      (e.target as HTMLElement).closest("a")
    ) {
      return;
    }

    router.push(`/post/${post.id}`);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the post click handler from firing
    if (!currentUserId) return;

    try {
      if (isLiked) {
        await postApi.unlikePost(currentUserId, post.id);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        await postApi.likePost(currentUserId, post.id);
        setLikeCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error liking/unliking post:", error);
    }
  };

  const handleRetweet = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the post click handler from firing
    if (!currentUserId) return;

    try {
      if (isRetweeted) {
        // If unretweetPost is available in the API, use it
        // Otherwise, just toggle the state locally
        if (postApi.unretweetPost) {
          await postApi.unretweetPost(currentUserId, post.id);
        }
        setRetweetCount((prev) => Math.max(0, prev - 1));
      } else {
        await postApi.retweetPost(currentUserId, post.id);
        setRetweetCount((prev) => prev + 1);
      }
      setIsRetweeted(!isRetweeted);
    } catch (error) {
      console.error("Error retweeting/unretweeting post:", error);
    }
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the post click handler from firing

    // If we're in the post detail view, just toggle the comments
    if (isComment) {
      setShowComments(!showComments);
    } else {
      // Navigate to post detail page for commenting
      router.push(`/post/${post.id}`);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the post click handler from firing
    // Share functionality would be implemented here
  };

  // Use post data if available, otherwise fall back to fetched user data
  const displayName = post.userName || user?.alias || "Anonymous";
  const displayHandle =
    post.userHandle ||
    (user?.id ? `@user_${user.id.substring(0, 6)}` : "@user");
  const avatarSrc = post.userAvatar || user?.pfp;
  const isVerified = post.verified || false;

  return (
    <>
      {showPostCount && <ShowPostsCount count={35} />}
      <div
        className={cn(
          "group cursor-pointer border-b border-border px-4 py-3 transition-colors hover:bg-accent/5 dark:hover:bg-accent/5",
          isComment && "ml-12 mt-2",
        )}
        onClick={handlePostClick}
      >
        <div className="flex gap-3">
          <Link
            href={`/profile/${post.userId}`}
            className="shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatarSrc} alt={displayName} />
              <AvatarFallback>
                {displayName.substring(0, 2) || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1">
              <Link
                href={`/profile/${post.userId}`}
                className="max-w-[150px] truncate font-semibold hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {displayName}
              </Link>
              {isVerified && (
                <Icon
                  name="shield-check"
                  className="h-4 w-4 shrink-0 text-primary"
                />
              )}
              <span className="truncate text-sm text-muted-foreground">
                {displayHandle}
              </span>
              <span className="text-sm text-muted-foreground">
                ·{" "}
                {post.createdAt ? formatTimeAgo(new Date(post.createdAt)) : ""}
              </span>
            </div>

            <div className="mt-0.5">
              <p className="whitespace-pre-wrap text-[15px] leading-[20px]">
                {post.content}
              </p>

              {Array.isArray(post.media) && post.media.length > 0 && (
                <div
                  className={cn(
                    "mt-3 grid gap-2",
                    post.media?.length === 1 && "grid-cols-1",
                    post.media?.length === 2 && "grid-cols-2",
                    post.media?.length === 3 && "grid-cols-2",
                    post.media?.length === 4 && "grid-cols-2",
                  )}
                >
                  {post.media.map((media, index) => (
                    <img
                      key={index}
                      src={media}
                      alt={`Post media ${index + 1}`}
                      className={cn(
                        "w-full rounded-2xl object-cover",
                        post.media?.length === 1
                          ? "max-h-[500px]"
                          : "max-h-[250px]",
                        post.media?.length === 3 && index === 0 && "col-span-2",
                      )}
                    />
                  ))}
                </div>
              )}

              {post.quoteTweet && (
                <div className="mt-3 rounded-xl border p-3 hover:bg-muted/50">
                  <p className="text-sm text-muted-foreground">Quoted Post</p>
                  {/* We'd fetch and render the quoted tweet here */}
                </div>
              )}
            </div>

            <div className="mt-3 flex max-w-[425px] justify-between pr-8">
              <Button
                variant="ghost"
                size="sm"
                className="flex h-[20px] items-center gap-1 rounded-[20px] p-0 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                onClick={handleComment}
              >
                <MessageCircle
                  className={cn(
                    "h-[18px] w-[18px]",
                    showComments && "text-primary",
                  )}
                />
                <span className="ml-0.5 text-xs">{post.comments.length}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex h-[20px] items-center gap-1 rounded-[20px] p-0 text-muted-foreground hover:bg-green-500/10 hover:text-green-500",
                  isRetweeted && "text-green-500",
                )}
                onClick={handleRetweet}
              >
                <Repeat className="h-[18px] w-[18px]" />
                <span className="ml-0.5 text-xs">{retweetCount}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex h-[20px] items-center gap-1 rounded-[20px] p-0 text-muted-foreground hover:bg-red-500/10 hover:text-red-500",
                  isLiked && "text-red-500",
                )}
                onClick={handleLike}
              >
                <Heart
                  className={cn("h-[18px] w-[18px]", isLiked && "fill-current")}
                />
                <span className="ml-0.5 text-xs">{likeCount}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex h-[20px] items-center gap-1 rounded-[20px] p-0 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                onClick={handleShare}
              >
                <Share className="h-[18px] w-[18px]" />
              </Button>
            </div>
          </div>
        </div>

        {/* Comments section - only show in post detail view or when expanded */}
        {isComment && showComments && post.comments.length > 0 && (
          <div className="mt-3 border-t pt-3">
            <h3 className="mb-3 font-semibold">Comments</h3>
            <div className="space-y-3">
              {post.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="cursor-pointer rounded-lg transition-colors hover:bg-accent/5"
                >
                  <PostComponent
                    post={comment}
                    currentUserId={currentUserId}
                    isComment={true}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
