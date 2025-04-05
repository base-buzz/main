"use client";

import React, { useState } from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Placeholder for API call - in a production app, this would call an API
      console.log("Creating post with content:", content);

      // Create a fake post for now
      const newPost: Post = {
        id: `temp-${Date.now()}`,
        userId: user.id,
        userName: user.display_name || "Anonymous",
        userHandle: user.address ? `@${user.address.substring(0, 8)}` : "@anon",
        userAvatar: user.avatar_url || "https://i.pravatar.cc/150?img=1",
        verified: user.tier === "gold" || user.tier === "diamond",
        content,
        createdAt: new Date().toISOString(),
        likes: 0,
        retweets: 0,
        comments: [],
        media: [],
      };

      // Notify parent component
      if (onPostCreated) {
        onPostCreated(newPost);
      }

      // Clear form
      setContent("");
      setIsFocused(false);
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
