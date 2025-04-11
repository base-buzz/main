"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Camera, X } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";
import Image from "next/image";

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileDialog({ isOpen, onClose }: EditProfileDialogProps) {
  const { user, updateUserProfile } = useCurrentUser();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    location: "",
    avatar_url: "",
    header_url: "",
  });

  useEffect(() => {
    if (user && isOpen && !hasInitialized) {
      setFormData({
        display_name: user.display_name || "",
        bio: user.bio || "",
        location: user.location || "",
        avatar_url: user.avatar_url || "",
        header_url: user.header_url || "",
      });
      setHasInitialized(true);
    }

    if (!isOpen) {
      setHasInitialized(false);
    }
  }, [user, isOpen, hasInitialized]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (file: File, type: "avatar" | "header") => {
    const uploadToast = toast.loading(`Uploading ${type}...`);

    if (status !== "authenticated" || !session?.user?.address) {
      console.error("Attempted image upload without authenticated session.", {
        status,
        sessionAddress: session?.user?.address,
      });
      toast.error("Authentication required. Please sign in again.", {
        id: uploadToast,
      });
      return;
    }

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("type", type);

      const response = await fetch("/api/profile/upload", {
        method: "POST",
        body: body,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to upload ${type}`);
      }

      setFormData((prev) => ({
        ...prev,
        [type === "avatar" ? "avatar_url" : "header_url"]: result.publicUrl,
      }));

      toast.success(`${type === "avatar" ? "Avatar" : "Header"} updated!`, {
        id: uploadToast,
      });
    } catch (error: any) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(error.message || `Failed to upload ${type}`, {
        id: uploadToast,
      });
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          display_name: formData.display_name,
          bio: formData.bio,
          location: formData.location,
          avatar_url: formData.avatar_url,
          header_url: formData.header_url,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile");
      }

      await updateUserProfile({
        ...(result.user || formData),
      });

      toast.success("Profile updated successfully");
      onClose();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription className="sr-only">
              Update your profile information
            </DialogDescription>
          </div>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="rounded-full bg-foreground px-4 py-1 text-[14px] font-bold text-background hover:bg-foreground/90"
          >
            Save
          </Button>
        </DialogHeader>

        {/* Header Image */}
        <div className="relative h-[200px] w-full overflow-hidden bg-accent">
          {formData.header_url && (
            <Image
              src={formData.header_url}
              alt="Header"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <label className="cursor-pointer rounded-full bg-black/50 p-3 transition-colors hover:bg-black/70">
              <Camera className="h-5 w-5 text-white" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, "header");
                }}
              />
            </label>
          </div>
        </div>

        {/* Avatar */}
        <div className="relative -mt-[72px] ml-4">
          <div className="relative h-[134px] w-[134px] overflow-hidden rounded-full border-4 border-background bg-accent">
            {formData.avatar_url ? (
              <Image
                src={formData.avatar_url}
                alt="Avatar"
                fill
                className="object-cover"
                sizes="134px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-4xl">
                  {formData.display_name?.[0] || "U"}
                </span>
              </div>
            )}
            <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity hover:opacity-100">
              <Camera className="h-8 w-8 text-white" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, "avatar");
                }}
              />
            </label>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <Input
              name="display_name"
              value={formData.display_name}
              onChange={handleChange}
              placeholder="Name"
              className="rounded-none border-x-0 border-t-0 px-3 py-6 text-xl"
            />
          </div>
          <div>
            <Textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Bio"
              className="min-h-[100px] resize-none rounded-none border-x-0 border-t-0 px-3 py-4 text-lg"
            />
          </div>
          <div>
            <Input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Location"
              className="rounded-none border-x-0 border-t-0 px-3 py-6 text-lg"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
