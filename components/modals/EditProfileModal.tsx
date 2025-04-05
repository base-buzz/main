"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { User } from "@/types/interfaces";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EditProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

export default function EditProfileModal({
  user,
  isOpen,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    display_name: user.display_name || "",
    avatar_url: user.avatar_url || "",
    header_url: user.header_url || "",
    location: user.location || "",
    bio: user.bio || "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.display_name || "",
        avatar_url: user.avatar_url || "",
        header_url: user.header_url || "",
        location: user.location || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: Partial<User> = {
      display_name: formData.display_name,
      avatar_url: formData.avatar_url,
      header_url: formData.header_url,
      location: formData.location,
      bio: formData.bio,
      id: user.id,
      address: user.address,
      email: user.email,
      tier: user.tier,
      buzz_balance: user.buzz_balance,
      ens_name: user.ens_name,
      created_at: user.created_at,
      updated_at: new Date().toISOString(),
    };
    onSave(updatedUser as User);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="display_name">Name</Label>
              <Input
                id="display_name"
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="avatar_url">Profile Picture URL</Label>
              <Input
                id="avatar_url"
                name="avatar_url"
                value={formData.avatar_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
              {formData.avatar_url && (
                <div className="relative mt-2 h-16 w-16 overflow-hidden rounded-full">
                  <Image
                    src={formData.avatar_url}
                    alt="Profile preview"
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="header_url">Cover Image URL</Label>
              <Input
                id="header_url"
                name="header_url"
                value={formData.header_url}
                onChange={handleChange}
                placeholder="https://example.com/cover.jpg"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
