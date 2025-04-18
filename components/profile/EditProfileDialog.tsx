"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import ReactCrop, {
  type Crop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileDialog({ isOpen, onClose }: EditProfileDialogProps) {
  const { user, updateUserProfile } = useCurrentUser();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    location: "",
    avatar_url: "",
    header_url: "",
    website_url: "",
    birth_date: "",
  });

  // State for cropping
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [cropType, setCropType] = useState<"avatar" | "header" | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (user && isOpen && !hasInitialized) {
      setFormData({
        display_name: user.display_name || "",
        bio: user.bio || "",
        location: user.location || "",
        avatar_url: user.avatar_url || "",
        header_url: user.header_url || "",
        website_url: user.website_url || "",
        birth_date: user.birth_date || "",
      });
      setHasInitialized(true);
    }

    if (!isOpen) {
      setHasInitialized(false);
      setImgSrc("");
      setCrop(undefined);
      setCompletedCrop(undefined);
      setAspect(undefined);
      setCropType(null);
    }
  }, [user, isOpen, hasInitialized]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Function to handle file selection and initiate cropping --- //
  function onSelectFile(
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "header"
  ) {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImgSrc(reader.result?.toString() || "")
      );
      reader.readAsDataURL(e.target.files[0]);
      setCropType(type);
      setAspect(type === "avatar" ? 1 / 1 : 3 / 1);
      setCrop(undefined);
      setCompletedCrop(undefined);
    } else {
      setImgSrc("");
      setCropType(null);
      setAspect(undefined);
    }
  }

  // --- Function to generate cropped image and trigger upload --- //
  const handleApplyCrop = async () => {
    const image = imgRef.current;
    if (!image || !completedCrop || !cropType) {
      toast.error("Could not apply crop. Image or crop data missing.");
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      toast.error("Could not process image for cropping.");
      return;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    // devicePixelRatio slightly increases sharpness on high DPI displays
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio);

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = "high";

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;

    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;

    ctx.save();

    // Move the crop origin to the canvas origin (0,0)
    ctx.translate(-cropX, -cropY);
    // Move the origin to the center of the original position
    ctx.translate(centerX, centerY);
    // Rotate
    // ctx.rotate(rotate * Math.PI / 180); // Rotation not implemented here
    // Scale
    // ctx.scale(scale, scale); // Scale not implemented here
    // Move the center of the image to the origin (0,0)
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight
    );

    ctx.restore();

    // Convert canvas to blob
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error("Canvas is empty");
          toast.error("Failed to create cropped image.");
          // Reset cropping state even on failure
          setImgSrc("");
          setCropType(null);
          setAspect(undefined);
          return;
        }

        // Create a new File object
        const filename = `${cropType}_${Date.now()}.png`; // Generate a filename
        const croppedFile = new File([blob], filename, {
          type: "image/png", // Or determine type from blob.type
        });

        console.log(
          "Cropped file created:",
          croppedFile.name,
          `${(croppedFile.size / 1024).toFixed(1)} KB`
        );

        // Proceed to upload the cropped file
        handleImageUpload(croppedFile, cropType);

        // Reset cropping state after successful blob creation
        setImgSrc("");
        setCropType(null);
        setAspect(undefined);
      },
      "image/png", // Specify output format
      0.9 // Specify quality (0 to 1)
    );
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

    // --- Image Compression --- //
    console.log(
      `Compressing ${type} image... Original size: ${(file.size / 1024 / 1024).toFixed(2)} MB`
    );
    const options = {
      maxSizeMB: type === "avatar" ? 0.5 : 1, // Smaller max size for avatars
      maxWidthOrHeight: type === "avatar" ? 400 : 1500, // Resize dimensions
      useWebWorker: true,
      // fileType: 'image/webp', // Optional: force output type
    };

    let compressedFile: File;
    try {
      compressedFile = await imageCompression(file, options);
      console.log(
        `Compressed ${type} image size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`
      );
    } catch (compressionError) {
      console.error(`Error compressing ${type} image:`, compressionError);
      toast.error(
        `Failed to process ${type} image. Please try a different image.`,
        {
          id: uploadToast,
        }
      );
      return; // Stop if compression fails
    }
    // --- End Image Compression --- //

    try {
      const body = new FormData();
      body.append("file", compressedFile, compressedFile.name);
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
          website_url: formData.website_url,
          birth_date: formData.birth_date,
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
      router.refresh();
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
      <DialogContent className="sm:max-w-[600px] p-0 rounded-2xl border-none [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between px-4 pt-3">
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

        {/* Header Image - Reverted to responsive height */}
        <div className="relative h-[150px] w-full overflow-hidden bg-accent md:h-[200px]">
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
                  onSelectFile(e, "header");
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
                  onSelectFile(e, "avatar");
                }}
              />
            </label>
          </div>
        </div>

        {/* --- Cropping Modal/UI (Conditional Rendering) --- */}
        {imgSrc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="rounded-lg bg-background p-6 shadow-xl max-w-xl w-full">
              <h3 className="text-lg font-medium mb-4">Crop {cropType}</h3>
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  style={{
                    display: "block",
                    maxWidth: "100%",
                    maxHeight: "60vh",
                  }}
                  onLoad={(e) => {
                    const { width, height } = e.currentTarget;
                    if (aspect) {
                      setCrop(
                        centerCrop(
                          makeAspectCrop(
                            { unit: "%", width: 90 },
                            aspect,
                            width,
                            height
                          ),
                          width,
                          height
                        )
                      );
                    }
                  }}
                />
              </ReactCrop>
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setImgSrc("");
                    setCropType(null);
                    setAspect(undefined);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleApplyCrop}>Apply Crop</Button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-6 px-4 pb-6">
          <div className="relative">
            <label
              htmlFor="display_name"
              className="absolute left-3 top-1 text-sm text-muted-foreground"
            >
              Name
            </label>
            <Input
              id="display_name"
              name="display_name"
              value={formData.display_name}
              onChange={handleChange}
              placeholder=" "
              className="mt-1 block w-full rounded-md border border-border bg-transparent px-3 pt-[2.0rem] pb-2 text-lg"
            />
          </div>
          <div className="relative">
            <label
              htmlFor="bio"
              className="absolute left-3 top-1 text-sm text-muted-foreground"
            >
              Bio
            </label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder=" "
              className="mt-1 block w-full min-h-[100px] resize-none rounded-md border border-border bg-transparent px-3 pt-[2.0rem] pb-2 text-lg"
            />
          </div>
          <div className="relative">
            <label
              htmlFor="location"
              className="absolute left-3 top-1 text-sm text-muted-foreground"
            >
              Location
            </label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder=" "
              className="mt-1 block w-full rounded-md border border-border bg-transparent px-3 pt-[2.0rem] pb-2 text-lg"
            />
          </div>
          <div className="relative">
            <label
              htmlFor="website_url"
              className="absolute left-3 top-1 text-sm text-muted-foreground"
            >
              Website
            </label>
            <Input
              id="website_url"
              name="website_url"
              type="url"
              value={formData.website_url}
              onChange={handleChange}
              placeholder=" "
              className="mt-1 block w-full rounded-md border border-border bg-transparent px-3 pt-[2.0rem] pb-2 text-lg"
            />
          </div>
          {formData.birth_date && (
            <div className="text-sm text-muted-foreground">
              Birth date
              <span className="mx-1">·</span>
              <Button
                variant="link"
                className="p-0 h-auto text-primary hover:underline"
                onClick={() => {
                  toast.info("Birth date editing not implemented yet.");
                }}
              >
                Edit
              </Button>
              <p className="text-xl text-foreground mt-1">
                {new Date(formData.birth_date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
