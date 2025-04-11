"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from "@/types/interfaces"; // Assuming User type is defined here or in a shared location
import { EditProfileDialog } from "@/components/profile/EditProfileDialog"; // Assuming this exists

interface ProfileHeaderClientProps {
  profileUser: User;
  currentUserId: string | undefined; // Address of the logged-in user
}

export function ProfileHeaderClient({
  profileUser,
  currentUserId,
}: ProfileHeaderClientProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const isOwnProfile = currentUserId === profileUser.address;

  // Fetch initial follow status
  useEffect(() => {
    if (!isOwnProfile && currentUserId) {
      setIsLoadingFollow(true);
      // Use fetch to call the API route
      fetch(
        `/api/follows?follower_id=${encodeURIComponent(currentUserId)}&following_id=${encodeURIComponent(profileUser.address || "")}`
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setIsFollowing(data.isFollowing);
        })
        .catch((err: Error) => {
          // Catch block with typed error
          console.error("Failed to check follow status:", err.message || err);
        })
        .finally(() => setIsLoadingFollow(false));
    }
  }, [currentUserId, profileUser.address, isOwnProfile]);

  const handleFollowToggle = async () => {
    if (!currentUserId || isOwnProfile || isLoadingFollow) return;

    setIsLoadingFollow(true);
    try {
      if (isFollowing) {
        // Unfollow
        const res = await fetch(
          `/api/follows?follower_id=${encodeURIComponent(currentUserId)}&following_id=${encodeURIComponent(profileUser.address || "")}`,
          { method: "DELETE" }
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (data.success) {
          setIsFollowing(false);
        }
      } else {
        // Follow
        const res = await fetch("/api/follows", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ following_id: profileUser.address || "" }), // follower_id is determined server-side now
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        // Assuming the POST returns the follow record or confirms success
        if (data) {
          setIsFollowing(true);
        }
      }
      // Optionally refresh data or show notification
      router.refresh(); // Refresh server component data if needed
    } catch (error) {
      console.error("Failed to toggle follow:", error);
      // TODO: Show error to user
    } finally {
      setIsLoadingFollow(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditProfileOpen(true);
  };

  return (
    <>
      <div className="border-b border-border p-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={profileUser.avatar_url || "/default-avatar.png"}
              alt={profileUser.display_name || profileUser.handle || "Profile"}
            />
            <AvatarFallback>
              {(profileUser.handle || "X").substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold">
              {/* Prioritize display_name, fallback to handle */}
              {profileUser.display_name || profileUser.handle || "User"}
            </h1>
            <p className="text-sm text-muted-foreground">
              @{profileUser.handle}
            </p>
          </div>

          {/* Follow/Edit Button Logic */}
          <div className="ml-auto">
            {isOwnProfile ? (
              <Button variant="outline" onClick={handleEditProfile}>
                Edit Profile
              </Button>
            ) : currentUserId ? (
              <Button
                onClick={handleFollowToggle}
                disabled={isLoadingFollow}
                variant={isFollowing ? "outline" : "default"}
              >
                {isLoadingFollow ? "..." : isFollowing ? "Following" : "Follow"}
              </Button>
            ) : null}
            {/* Hide follow button if not logged in */}
          </div>
        </div>
        {/* TODO: Add stats (following, followers) */}
      </div>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        // Pass necessary user data if dialog needs it
        // user={isOwnProfile ? profileUser : undefined}
      />
    </>
  );
}
