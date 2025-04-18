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

  // Check if the profile being viewed belongs to the current logged-in user
  const isCurrentUserProfile = currentUserId === profileUser.address;

  return (
    <>
      {/* Banner/Avatar/Button Section - REMOVE border */}
      <div className="">
        {" "}
        {/* Removed border-b border-border */}
        {/* Header Image */}
        {/* Apply responsive height */}
        <div className="relative h-[150px] w-full bg-muted md:h-[200px]">
          {" "}
          {/* Reduced height */}
          {profileUser.header_url && (
            <Image
              src={bannerUrl}
              alt={`${profileUser.display_name || profileUser.handle}'s banner`}
              fill
              style={{ objectFit: "cover" }}
              priority // Prioritize banner loading
              unoptimized // If using external/Supabase URLs not in next.config
            />
          )}
        </div>
        {/* Wrapper for Avatar AND Edit Button */}
        <div className="flex items-end justify-between px-4">
          {/* Avatar */}
          <div className="relative -mt-[48px] h-[96px] w-[96px]">
            <Avatar className="h-full w-full rounded-full border-4 border-background">
              <AvatarImage src={profileUser.avatar_url ?? undefined} />
              <AvatarFallback className="text-2xl md:text-3xl">
                {(profileUser.display_name || profileUser.handle || "X")
                  .charAt(0)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Edit/Follow Button - Now using flex for positioning */}
          <div className="pb-4 pt-4">
            {" "}
            {/* Added pt-4 */}{" "}
            {/* Add padding bottom to align with user info */}
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
      </div>

      {/* User Info Section - REMOVE border, REDUCE top padding */}
      <div className="px-4 pt-2 md:pt-3">
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
