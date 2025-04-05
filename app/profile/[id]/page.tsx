"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { userApi, postApi } from "@/lib/api";
import { Post, User } from "@/types/interfaces";
import PostComponent from "@/components/post/PostComponent";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/new-york/ui/tabs";
import { Button } from "@/registry/new-york/ui/button";
import {
  EditIcon,
  CalendarIcon,
  MapPinIcon,
  MoreHorizontal,
} from "lucide-react";
import { Card } from "@/registry/new-york/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/registry/new-york/ui/avatar";
import EditProfileModal from "@/components/modals/EditProfileModal";
import MobileHeader from "@/components/layout/MobileHeader";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const profileId = params?.id as string;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const {
    user: currentUser,
    loading: currentUserLoading,
    updateUserProfile,
  } = useCurrentUser();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  const isOwnProfile = currentUser?.id === profileId || profileId === "me";

  // Format join date
  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Check for locally stored user data
  const checkLocalStorage = (userId: string) => {
    if (typeof window !== "undefined") {
      const localStorageKey = `basebuzz_user_${userId}`;
      const storedData = localStorage.getItem(localStorageKey);
      if (storedData) {
        try {
          return JSON.parse(storedData) as User;
        } catch (e) {
          console.error("Error parsing local storage data:", e);
        }
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // If the profile is 'me', use the current user's ID
        const actualProfileId =
          profileId === "me" && currentUser ? currentUser.id : profileId;

        if (!actualProfileId) {
          setError("User not found");
          setLoading(false);
          return;
        }

        // Check for locally stored data first
        const localUserData = checkLocalStorage(actualProfileId);

        if (localUserData) {
          console.log("Using locally stored user data", localUserData);
          setProfileUser(localUserData);
        } else {
          // Fetch user data from API
          const userData = await userApi.getUserById(actualProfileId);
          setProfileUser(userData);
        }

        // Fetch user's posts
        const postsData = await postApi.getPostsByUserId(actualProfileId);
        setPosts(postsData);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to load profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && !currentUserLoading) {
      fetchData();
    }
  }, [profileId, authLoading, currentUserLoading, currentUser]);

  const handleSaveProfile = (updatedUser: User) => {
    setProfileUser(updatedUser);

    if (isOwnProfile && updateUserProfile) {
      updateUserProfile(updatedUser);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (loading || authLoading || currentUserLoading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <div className="rounded-lg bg-destructive/10 p-6 text-destructive">
          <p>{error || "User not found"}</p>
          <button
            className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Create tabs for mobile header
  const profileTabs = [
    { id: "posts", label: "Posts", path: `/profile/${profileId}?tab=posts` },
    { id: "media", label: "Media", path: `/profile/${profileId}?tab=media` },
    { id: "likes", label: "Likes", path: `/profile/${profileId}?tab=likes` },
  ];

  return (
    <>
      {/* Mobile Header */}
      <MobileHeader title={profileUser.alias} showBackButton />

      <div className="pb-6">
        {/* Cover Image */}
        <div className="relative h-32 w-full overflow-hidden bg-gradient-to-r from-blue-400 to-purple-500 md:h-48">
          {profileUser.headerImage && (
            <img
              src={profileUser.headerImage}
              alt="Cover"
              className="h-full w-full object-cover"
            />
          )}
        </div>

        {/* Profile Info */}
        <div className="px-4">
          <div className="flex justify-between">
            {/* Avatar */}
            <div className="relative -mt-16">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={profileUser.pfp} alt={profileUser.alias} />
                <AvatarFallback className="text-2xl">
                  {profileUser.alias?.substring(0, 2) || "U"}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Actions */}
            <div className="mt-2 flex gap-2">
              {isOwnProfile ? (
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <span className="hidden md:inline">Edit Profile</span>
                  <EditIcon className="h-4 w-4 md:ml-2 md:hidden" />
                </Button>
              ) : (
                <Button variant="default" className="rounded-full">
                  Follow
                </Button>
              )}
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* User Details */}
          <div className="mt-3">
            <h1 className="text-xl font-bold">{profileUser.alias}</h1>
            <p className="text-muted-foreground">
              @{profileUser.alias?.toLowerCase().replace(/\s+/g, "_") || "user"}
            </p>

            {profileUser.bio && <p className="mt-3">{profileUser.bio}</p>}

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {profileUser.location && (
                <div className="flex items-center">
                  <MapPinIcon className="mr-1 h-4 w-4" />
                  <span>{profileUser.location}</span>
                </div>
              )}
              {profileUser.dob && (
                <div className="flex items-center">
                  <CalendarIcon className="mr-1 h-4 w-4" />
                  <span>Joined {formatJoinDate(profileUser.dob)}</span>
                </div>
              )}
            </div>

            <div className="mt-3 flex gap-4 text-sm">
              <div>
                <span className="font-bold">265</span>
                <span className="ml-1 text-muted-foreground">Following</span>
              </div>
              <div>
                <span className="font-bold">568</span>
                <span className="ml-1 text-muted-foreground">Followers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs - Desktop */}
        <div className="mt-4 hidden md:block">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="w-full">
              <TabsTrigger value="posts" className="flex-1">
                Posts
              </TabsTrigger>
              <TabsTrigger value="media" className="flex-1">
                Media
              </TabsTrigger>
              <TabsTrigger value="likes" className="flex-1">
                Likes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-4">
              {renderPostsContent()}
            </TabsContent>

            <TabsContent value="media" className="mt-4">
              {renderMediaContent()}
            </TabsContent>

            <TabsContent value="likes" className="mt-4">
              {renderLikesContent()}
            </TabsContent>
          </Tabs>
        </div>

        {/* Content Tabs - Mobile */}
        <div className="mt-4 md:hidden">
          <div className="grid grid-cols-3 border-b border-border">
            {["posts", "media", "likes"].map((tab) => (
              <button
                key={tab}
                className={cn(
                  "flex h-[52px] items-center justify-center border-b-2 px-4 font-medium",
                  activeTab === tab
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground",
                )}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="mt-2">
            {activeTab === "posts" && renderPostsContent()}
            {activeTab === "media" && renderMediaContent()}
            {activeTab === "likes" && renderLikesContent()}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isOwnProfile && profileUser && (
        <EditProfileModal
          user={profileUser}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveProfile}
        />
      )}
    </>
  );

  function renderPostsContent() {
    return posts.length > 0 ? (
      <div className="divide-y divide-border">
        {posts.map((post) => (
          <PostComponent
            key={post.id}
            post={post}
            currentUserId={currentUser?.id}
          />
        ))}
      </div>
    ) : (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No posts yet</p>
      </div>
    );
  }

  function renderMediaContent() {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Media posts will appear here</p>
      </div>
    );
  }

  function renderLikesContent() {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Liked posts will appear here</p>
      </div>
    );
  }
}
