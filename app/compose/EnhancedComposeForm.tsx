"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Image,
  Smile,
  X,
  Globe,
  ChevronDown,
  Users,
  Calendar,
  MapPin,
  BarChart2,
} from "lucide-react";
import { Post } from "@/types/interfaces";
import { postApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NextImage from "next/image";

interface EnhancedComposeFormProps {
  userId: string;
  onPostCreated?: (post: Post) => void;
  quoteTweetId?: string;
  replyToId?: string;
}

type AudienceOption =
  | "Everyone"
  | "Circle"
  | "Ethereum"
  | "BuildinPublic"
  | "Canto";

interface Community {
  id: string;
  name: string;
  icon: string;
  memberCount: number;
}

export default function EnhancedComposeForm({
  userId,
  onPostCreated,
  quoteTweetId,
  replyToId,
}: EnhancedComposeFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audience, setAudience] = useState<AudienceOption>("Everyone");
  const [audienceMenuOpen, setAudienceMenuOpen] = useState(false);

  // Mock communities for audience selection
  const communities: Community[] = [
    {
      id: "eth",
      name: "Ethereum",
      icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
      memberCount: 1400,
    },
    {
      id: "build",
      name: "BuildinPublic",
      icon: "/black.svg",
      memberCount: 6100,
    },
    {
      id: "canto",
      name: "Canto",
      icon: "https://cryptologos.cc/logos/canto-canto-logo.png",
      memberCount: 198,
    },
  ];

  const handleAddMedia = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // In a real app, you'd upload these files to storage
    // For mocking purposes, we'll create object URLs
    Array.from(files).forEach((file) => {
      // Check if we already have 4 images
      if (media.length >= 4) return;

      const imageUrl = URL.createObjectURL(file);
      setMedia((prev) => [...prev, imageUrl]);
    });

    // Reset the input
    if (fileInputRef.current) fileInputRef.current.value = "";
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
      // For now, we'll just mock this since we don't have Supabase
      // In a real app, this would call your API endpoints
      setTimeout(() => {
        const mockPost: Post = {
          id: `mock-${Date.now()}`,
          userId,
          content,
          createdAt: new Date().toISOString(),
          likes: 0,
          retweets: 0,
          comments: [],
          media: media.length > 0 ? [...media] : undefined,
        };

        // Call the onPostCreated callback if provided
        if (onPostCreated) {
          onPostCreated(mockPost);
        }

        // Redirect to home page to see posts feed
        router.push("/home");
      }, 1000);
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAudienceIcon = () => {
    switch (audience) {
      case "Circle":
        return <Users className="h-4 w-4" />;
      case "Ethereum":
      case "BuildinPublic":
      case "Canto":
        return <Globe className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getCommunityById = (id: string): Community | undefined => {
    if (id === "eth") return communities[0];
    if (id === "build") return communities[1];
    if (id === "canto") return communities[2];
    return undefined;
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        {/* Audience selector */}
        <div className="mb-4">
          <Popover open={audienceMenuOpen} onOpenChange={setAudienceMenuOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-primary text-sm font-medium text-primary"
              >
                {getAudienceIcon()}
                <span className="ml-1">{audience}</span>
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="start">
              <div className="p-4">
                <h3 className="text-lg font-bold">Choose audience</h3>
              </div>

              <div className="max-h-[300px] overflow-y-auto">
                <div className="p-2">
                  <button
                    className={`flex w-full items-center gap-3 rounded-md p-2 hover:bg-accent ${audience === "Everyone" ? "bg-accent/50" : ""}`}
                    onClick={() => {
                      setAudience("Everyone");
                      setAudienceMenuOpen(false);
                    }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
                      <Globe className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">Everyone</div>
                    </div>
                    {audience === "Everyone" && (
                      <CheckIcon className="h-4 w-4 text-primary" />
                    )}
                  </button>
                </div>

                <div className="px-4 py-2">
                  <div className="text-sm font-medium">My Communities</div>
                </div>

                {communities.map((community) => (
                  <div className="p-2" key={community.id}>
                    <button
                      className={`flex w-full items-center gap-3 rounded-md p-2 hover:bg-accent ${audience === community.name ? "bg-accent/50" : ""}`}
                      onClick={() => {
                        setAudience(community.name as AudienceOption);
                        setAudienceMenuOpen(false);
                      }}
                    >
                      <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted">
                        <NextImage
                          src={community.icon}
                          alt={community.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{community.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {community.memberCount.toLocaleString()} Members
                        </div>
                      </div>
                      {audience === community.name && (
                        <CheckIcon className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Text input */}
        <Textarea
          placeholder="What's happening?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[150px] resize-none border-0 bg-transparent p-0 text-xl focus-visible:ring-0 focus-visible:ring-offset-0"
        />

        {/* Image upload (hidden) */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />

        {/* Media preview */}
        {media.length > 0 && (
          <div
            className={`mt-3 grid gap-2 ${
              media.length > 1 ? "grid-cols-2" : "grid-cols-1"
            }`}
          >
            {media.map((url, index) => (
              <div
                key={index}
                className="relative aspect-video overflow-hidden rounded-lg"
              >
                <NextImage
                  src={url}
                  alt={`Upload ${index + 1}`}
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

        {/* Accessibility message */}
        <div className="my-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full px-3 text-sm text-primary"
          >
            <Globe className="mr-1 h-4 w-4" />
            Everyone can reply
          </Button>
        </div>

        {/* Action buttons and post button */}
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleAddMedia}
              disabled={media.length >= 4}
              title={
                media.length >= 4 ? "Maximum 4 images allowed" : "Add image"
              }
              className="rounded-full text-primary hover:bg-primary/10"
            >
              {/* Disable alt-text rule for lucide icon */}
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Add emoji"
              className="rounded-full text-primary hover:bg-primary/10"
            >
              <Smile className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Schedule post"
              className="rounded-full text-primary hover:bg-primary/10"
            >
              <Calendar className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Add location"
              className="rounded-full text-primary hover:bg-primary/10"
            >
              <MapPin className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Add poll"
              className="rounded-full text-primary hover:bg-primary/10"
            >
              <BarChart2 className="h-5 w-5" />
            </Button>
          </div>
          <Button
            type="submit"
            disabled={isSubmitting || (!content.trim() && media.length === 0)}
            className="rounded-full bg-primary px-6 py-2 text-base font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>
      </form>
    </div>
  );
}
