"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from "@/types/interfaces"; // Assuming User type is defined here or in a shared location
import { EditProfileDialog } from "@/components/profile/EditProfileDialog"; // Assuming this exists
import { cn } from "@/lib/utils"; // Import cn
import { CalendarDays, MapPin } from "lucide-react"; // Import icons

interface ProfileHeaderClientProps {
  profileUser: User;
  currentUserId: string | undefined; // Address of the logged-in user
}

// Helper function to format join date
function formatJoinDate(dateString: string | null | undefined): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return `Joined ${date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return ""; // Return empty string on error
  }
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

  // Placeholder for banner URL - use profileUser.header_url when available
  const bannerUrl = profileUser.header_url || "/default-banner.png"; // Add a default banner

  // Placeholder counts - Replace with actual data later
  const followingCount = profileUser.following_count ?? 0;
  const followersCount = profileUser.followers_count ?? 0;

  return (
    <>
      {/* Banner and Avatar Section */}
      <div className="relative border-b border-border">
        {/* Banner Image */}
        <div className="h-40 w-full bg-muted md:h-52">
          {" "}
          {/* Placeholder background */}
          <Image
            src={bannerUrl}
            alt={`${profileUser.display_name || profileUser.handle}'s banner`}
            fill
            style={{ objectFit: "cover" }}
            priority // Prioritize banner loading
            unoptimized // If using external/Supabase URLs not in next.config
          />
        </div>

        {/* Avatar - Positioned overlapping banner */}
        <div className="absolute bottom-0 left-4 translate-y-1/2 transform">
          <Avatar className="h-24 w-24 rounded-full border-4 border-background md:h-32 md:w-32">
            <AvatarImage
              src={profileUser.avatar_url || "/default-avatar.png"}
              alt={profileUser.display_name || profileUser.handle || "Profile"}
            />
            <AvatarFallback className="text-3xl md:text-4xl">
              {(profileUser.display_name || profileUser.handle || "X")
                .charAt(0)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Edit/Follow Button - Positioned top-right below banner area */}
        <div className="absolute right-4 top-[calc(10rem+0.5rem)] md:top-[calc(13rem+0.5rem)]">
          {" "}
          {/* Adjust top based on banner height */}
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
        </div>
      </div>

      {/* User Info Section - Below Avatar/Banner */}
      <div className="border-b border-border p-4 pt-16 md:pt-20">
        {" "}
        {/* Add padding top to clear avatar */}
        {/* Name and Handle */}
        <div>
          <h1 className="text-xl font-bold">
            {profileUser.display_name || profileUser.handle || "User"}
          </h1>
          <p className="text-sm text-muted-foreground">@{profileUser.handle}</p>
        </div>
        {/* Bio */}
        {profileUser.bio && <p className="mt-3 text-base">{profileUser.bio}</p>}
        {/* Location and Joined Date */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {profileUser.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {profileUser.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            {formatJoinDate(profileUser.created_at)}
          </span>
        </div>
        {/* Following/Followers Stats */}
        <div className="mt-3 flex space-x-4 text-sm">
          <span className="hover:underline cursor-pointer">
            <span className="font-semibold text-foreground">
              {followingCount}
            </span>{" "}
            Following
          </span>
          <span className="hover:underline cursor-pointer">
            <span className="font-semibold text-foreground">
              {followersCount}
            </span>{" "}
            Followers
          </span>
        </div>
      </div>

      {/* TODO: Add Profile Tabs here */}

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
