/**
 * Create Post Form Component (`components/post/CreatePostForm.tsx`)
 *
 * What it does:
 * - Provides a form for users to create new posts, replies, or quote tweets.
 * - Includes a textarea for content, buttons for adding media/emoji (media currently mocked), and a submit button.
 * - Adapts placeholder text and submit button label based on whether it's a new post, reply, or quote.
 *
 * How it does it:
 * - Marked as a Client Component ("use client") for state management and form handling.
 * - Receives `userId` and optional `replyToId`, `quoteTweetId`, `onPostCreated` callback as props.
 * - Uses `useState` to manage form content, media URLs, submission state, and focus state.
 * - `handleSubmit` function prevents default form submission, checks for content, sets submitting state.
 * - Calls `postApi.createPost` to send the data to the backend API (`/api/posts`).
 * - Resets the form fields on successful submission.
 * - Calls the optional `onPostCreated` callback (used by `app/post/[id]/page.tsx` for optimistic UI updates on replies).
 * - Uses `useRouter` to refresh the page data after submission (`router.refresh()`).
 *
 * Dependencies for Post Actions:
 * - `@/lib/api`: Provides `postApi.createPost` for submitting the new post data.
 * - `@/types/interfaces`: Defines the `Post` interface (used in `onPostCreated` callback).
 * - `next/navigation`: For `useRouter`.
 */
"use client";

import React, { useState, useRef } from "react";
import { Image, Smile, X, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { postApi } from "@/lib/api";
import { Post } from "@/types/interfaces";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import NextImage from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CreatePostFormProps {
  userId: string;
  userAvatar?: string;
  quoteTweetId?: string;
  replyToId?: string;
  className?: string;
}

export default function CreatePostForm({
  userId,
  userAvatar,
  quoteTweetId,
  replyToId,
  className,
}: CreatePostFormProps) {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const router = useRouter();

  const handleAddMedia = () => {
    // In a real app, you'd implement a file upload functionality
    // This is a simplified mock version that adds a random image URL
    const newMediaUrl = `https://source.unsplash.com/random/800x600?sig=${Math.random()}`;
    setMedia((prev) => [...prev, newMediaUrl]);
  };

  const handleRemoveMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && media.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Use the updated createPost function signature for all post types
      const newPost = await postApi.createPost(
        userId,
        content,
        // Pass only the first image URL if media exists, otherwise undefined
        media.length > 0 ? media[0] : undefined,
        replyToId, // Pass as parentId
        quoteTweetId // Pass as quotedPostId
      );

      // Reset form
      setContent("");
      setMedia([]);
      setIsTextareaFocused(false);

      // Refresh the page to show the new post
      router.refresh();
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("flex w-full space-x-3", className)}>
      <Avatar className="mt-1 h-10 w-10">
        <AvatarImage src={userAvatar} alt="User avatar" />
        <AvatarFallback>??</AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <form onSubmit={handleSubmit} className="w-full">
          <Textarea
            placeholder={
              replyToId
                ? "Write your reply..."
                : quoteTweetId
                  ? "Add a comment..."
                  : "What's happening?"
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsTextareaFocused(true)}
            onBlur={() => content.length === 0 && setIsTextareaFocused(false)}
            className="min-h-[60px] w-full resize-none border-0 bg-transparent p-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
          />

          {media.length > 0 && (
            <div
              className={`mt-2 grid gap-2 ${media.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
            >
              {media.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-video overflow-hidden rounded-lg"
                >
                  <NextImage
                    src={url}
                    alt={`Upload preview ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-2 z-10 h-6 w-6 rounded-full bg-background/80 p-1"
                    onClick={() => handleRemoveMedia(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {(isTextareaFocused || content.length > 0) && (
            <div className="my-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full px-3 text-sm text-primary hover:bg-primary/10"
              >
                <Globe className="mr-1 h-4 w-4" />
                Everyone can reply
              </Button>
            </div>
          )}

          <div className="my-2 border-t"></div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleAddMedia}
                disabled={media.length >= 4}
                title={media.length >= 4 ? "Maximum 4 images" : "Add image"}
                className="h-8 w-8 rounded-full text-primary hover:bg-primary/10"
              >
                <Image className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Add emoji"
                className="h-8 w-8 rounded-full text-primary hover:bg-primary/10"
              >
                <Smile className="h-5 w-5" />
              </Button>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || (!content.trim() && media.length === 0)}
              className="rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting
                ? "Posting..."
                : replyToId
                  ? "Reply"
                  : quoteTweetId
                    ? "Quote"
                    : "Post"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
