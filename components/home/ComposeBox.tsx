"use client";

import React, { useState, useEffect, useRef } from "react";
import { User, Post } from "@/types/interfaces";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import TextareaAutosize from "react-textarea-autosize";
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
  X,
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

  // Image upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Ref for hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Prevent submission if already submitting or uploading
    if (isSubmitting || isUploadingImage) return;

    // Basic content check (can add image-only posts later if desired)
    if (!content.trim() && !selectedFile) {
      console.log(
        "ComposeBox handleSubmit: Content and image empty, returning."
      );
      setError("Please enter some text or select an image to post.");
      return;
    }
    if (content.length > MAX_CHARS) {
      setError(`Post cannot exceed ${MAX_CHARS} characters.`);
      return;
    }

    console.log("ComposeBox handleSubmit: Setting loading state.");
    setIsSubmitting(true);
    setError(null);
    setUploadError(null);

    let imageUrl: string | null = null;

    // 1. Upload image if selected
    if (selectedFile) {
      console.log("ComposeBox: Uploading image...");
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const response = await fetch("/api/posts/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to upload image");
        }

        imageUrl = result.publicUrl;
        console.log("ComposeBox: Image uploaded successfully:", imageUrl);
      } catch (uploadErr: any) {
        console.error("ComposeBox: Image upload failed:", uploadErr);
        setUploadError(uploadErr.message || "Image upload failed.");
        setIsUploadingImage(false);
        setIsSubmitting(false);
        return; // Stop submission if image upload fails
      } finally {
        setIsUploadingImage(false);
      }
    }

    // 2. Create the post (with or without image URL)
    try {
      console.log("ComposeBox: Attempting to call postApi.createPost...", {
        content,
        imageUrl,
      });
      // Pass imageUrl to createPost (needs API and backend update)
      const newPost = await postApi.createPost(
        effectiveUser.id,
        content,
        imageUrl // Pass the uploaded image URL
      );
      console.log("ComposeBox: postApi.createPost call finished.");

      // Notify parent component with the REAL post from the API
      if (onPostCreated && newPost) {
        console.log("ComposeBox: Calling onPostCreated callback.");
        onPostCreated(newPost);
      }

      // Clear form and state
      console.log("ComposeBox: Clearing form and image state.");
      setContent("");
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadError(null);
      setIsFocused(false);
    } catch (postErr: any) {
      console.error("ComposeBox: Post creation failed:", postErr);
      // Use the more specific error state
      setError(postErr.message || "Failed to create post. Please try again.");
    } finally {
      console.log(
        "ComposeBox handleSubmit: Resetting submit loading state in finally block."
      );
      setIsSubmitting(false);
      // Ensure upload loading is also reset just in case
      setIsUploadingImage(false);
    }
  };

  const handleButtonClick = () => {
    console.log("ComposeBox SUBMIT BUTTON onClick triggered!");
  };

  const charsRemaining = MAX_CHARS - content.length;
  const showCharCount = content.length > 0;

  // --- Image Upload Handlers --- //

  const handleImageButtonClick = () => {
    fileInputRef.current?.click(); // Trigger hidden file input
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic validation (optional: add size check)
      if (!file.type.startsWith("image/")) {
        setUploadError("Please select an image file.");
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadError(null);
      console.log("Image selected:", file.name);
    }
    // Clear the input value so the same file can be selected again if needed
    event.target.value = "";
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }
    console.log("Selected image removed.");
  };

  // --- End Image Upload Handlers --- //

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

            <TextareaAutosize
              value={content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setContent(e.target.value)
              }
              onFocus={() => setIsFocused(true)}
              placeholder="What's happening?"
              className={`w-full resize-none border-none bg-transparent px-0 text-xl placeholder:text-muted-foreground/60 focus-visible:ring-0 focus:outline-none`}
              minRows={1}
              maxRows={15}
              cacheMeasurements
            />

            {previewUrl && (
              <div className="relative mt-3">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-80 w-full rounded-lg border border-border object-cover"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute right-2 top-2 h-7 w-7 rounded-full bg-black/50 text-white hover:bg-black/70"
                  onClick={handleRemoveImage}
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {uploadError && (
              <p className="mt-2 text-sm text-destructive">{uploadError}</p>
            )}

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
                  onClick={handleImageButtonClick}
                  disabled={isUploadingImage || isSubmitting}
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

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
