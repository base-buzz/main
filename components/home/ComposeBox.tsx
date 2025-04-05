"use client";

import React, { useState, useEffect } from "react";
import { User, Post } from "@/types/interfaces";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ImageIcon,
  SmileIcon,
  SendIcon,
  CalendarIcon,
  MapPinIcon,
  BarChart2Icon,
  GiftIcon,
  Globe,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { postApi } from "@/lib/api";

interface ComposeBoxProps {
  user: User;
  onPostCreated?: (post: Post) => void;
}

const MAX_CHARS = 280;

export function ComposeBox({ user, onPostCreated }: ComposeBoxProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audience, setAudience] = useState("Everyone");
  const [isFocused, setIsFocused] = useState(false);
  const { user: currentUserFromHook } = useCurrentUser();

  const effectiveUser = user;

  // Reset isSubmitting state if there was an error and user types again
  useEffect(() => {
    if (error) {
      setIsSubmitting(false);
      console.log(
        "ComposeBox useEffect: Reset isSubmitting due to error state change."
      );
    }
  }, [content, error]); // Run when content or error changes

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("ComposeBox handleSubmit triggered!");
    e.preventDefault();

    if (!content.trim()) {
      console.log("ComposeBox handleSubmit: Content empty, returning.");
      return;
    }

    console.log("ComposeBox handleSubmit: Setting loading state.");
    setIsSubmitting(true);
    setError(null);

    try {
      console.log("ComposeBox: Attempting to call postApi.createPost...");
      // Call the actual API to create the post
      const newPost = await postApi.createPost(effectiveUser.id, content);
      console.log("ComposeBox: postApi.createPost call finished.");

      // Notify parent component with the REAL post from the API
      if (onPostCreated && newPost) {
        console.log("ComposeBox: Calling onPostCreated callback.");
        onPostCreated(newPost);
      }

      // Clear form
      console.log("ComposeBox: Clearing form.");
      setContent("");
      setIsFocused(false);
    } catch (err) {
      // Error already logged in catch block
      setError("Failed to create post. Please try again.");
    } finally {
      console.log(
        "ComposeBox handleSubmit: Resetting loading state in finally block."
      );
      setIsSubmitting(false);
    }
  };

  const handleButtonClick = () => {
    console.log("ComposeBox SUBMIT BUTTON onClick triggered!");
  };

  const charsRemaining = MAX_CHARS - content.length;
  const showCharCount = content.length > 0;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 rounded-full">
            <AvatarImage
              src={effectiveUser?.avatar_url || "/default-avatar.png"}
              alt={effectiveUser.display_name || "User"}
            />
            <AvatarFallback>
              {effectiveUser.display_name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            {isFocused && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="mb-2 flex h-7 items-center gap-1 rounded-full border border-primary/10 px-3 py-0.5 text-sm font-semibold text-primary hover:bg-primary/10"
                  >
                    {audience}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setAudience("Everyone")}>
                    Everyone
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAudience("Circle")}>
                    Circle
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="What's happening?"
              className={`resize-none border-none bg-transparent px-0 text-xl placeholder:text-muted-foreground/60 focus-visible:ring-0 ${
                isFocused ? "min-h-[120px]" : "min-h-[24px]"
              }`}
            />

            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

            {isFocused && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mb-3 flex h-6 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-primary hover:bg-primary/10"
              >
                <Globe className="h-3.5 w-3.5" />
                Everyone can reply
              </Button>
            )}

            <div
              className={`flex items-center justify-between ${isFocused ? "border-t border-border/50 pt-3" : "mt-1"}`}
            >
              <div className="-ml-2 flex gap-0.5">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full text-[#1d9bf0] hover:bg-[#1d9bf0]/10"
                >
                  <ImageIcon className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full text-[#1d9bf0] hover:bg-[#1d9bf0]/10"
                >
                  <GiftIcon className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full text-[#1d9bf0] hover:bg-[#1d9bf0]/10"
                >
                  <BarChart2Icon className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full text-[#1d9bf0] hover:bg-[#1d9bf0]/10"
                >
                  <SmileIcon className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full text-[#1d9bf0] hover:bg-[#1d9bf0]/10"
                >
                  <CalendarIcon className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full text-[#1d9bf0] hover:bg-[#1d9bf0]/10"
                >
                  <MapPinIcon className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full text-[#1d9bf0] hover:bg-[#1d9bf0]/10"
                >
                  <Globe className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex items-center gap-4">
                {showCharCount && (
                  <div className="text-sm text-muted-foreground">
                    {charsRemaining}
                  </div>
                )}
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 rounded-full bg-primary px-4 font-semibold hover:bg-primary/90 disabled:bg-primary/50"
                  disabled={!content.trim() || isSubmitting}
                  onClick={handleButtonClick}
                >
                  {isSubmitting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  ) : (
                    "Post"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
