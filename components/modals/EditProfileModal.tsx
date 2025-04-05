"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/interfaces";
import { Button } from "@/registry/new-york/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/registry/new-york/ui/dialog";
import { Input } from "@/registry/new-york/ui/input";
import { Label } from "@/registry/new-york/ui/label";
import { Textarea } from "@/registry/new-york/ui/textarea";

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
  const [formData, setFormData] = useState<User>({
    id: "",
    alias: "",
    pfp: "",
    dob: "",
    location: "",
    headerImage: "",
    bio: "",
  });

  // Initialize form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({ ...user });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Save to local storage
    const localStorageKey = `basebuzz_user_${user.id}`;
    localStorage.setItem(localStorageKey, JSON.stringify(formData));

    onSave(formData);
    onClose();
  };

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
              <Label htmlFor="alias">Display Name</Label>
              <Input
                id="alias"
                name="alias"
                value={formData.alias}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pfp">Profile Image URL</Label>
              <Input
                id="pfp"
                name="pfp"
                value={formData.pfp}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
              {formData.pfp && (
                <div className="mt-2 h-16 w-16 overflow-hidden rounded-full">
                  <img
                    src={formData.pfp}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="headerImage">Cover Image URL</Label>
              <Input
                id="headerImage"
                name="headerImage"
                value={formData.headerImage}
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
