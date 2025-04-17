import React from "react";
import { notFound } from "next/navigation";
import { getUserByHandle, getUserByAddress } from "@/services/users.service";
import { getUserPosts } from "@/services/posts.service";
import { ProfileHeaderClient } from "@/components/profile/ProfileHeaderClient";
import { ComposeBox } from "@/components/home/ComposeBox";
import { ShowPostsCount } from "@/components/home/ShowPostsCount";
import { PostsSection } from "@/components/home/PostsSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Post as PostType, User } from "@/types/interfaces";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/authOptions";

interface HandlePageProps {
  params: {
    handle: string;
  };
}

export default async function HandlePage({ params }: HandlePageProps) {
  const { handle } = params;
  let profileUser: User | null = null;
  let rawProfileUser: any = null; // Temporary variable to hold raw result

  // 1. Try fetching the profile user data based on the handle
  rawProfileUser = await getUserByHandle(handle);

  // 2. If not found by handle, try fetching by address
  if (!rawProfileUser) {
    if (handle.startsWith("0x") && handle.length === 42) {
      console.log(`User not found by handle '${handle}', trying as address...`);
      rawProfileUser = await getUserByAddress(handle);
    } else {
      console.log(
        `Handle '${handle}' does not look like an address, not attempting address lookup.`
      );
    }
  }

  // Assert the type after fetching, allowing for potential nulls from service
  const typedProfileUser = rawProfileUser as User | null;

  // Fetch the current logged-in user's session
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.address ?? undefined;

  // Fetch full profile for the currently logged-in user
  let rawCurrentUserProfile: any = null;
  if (currentUserId) {
    rawCurrentUserProfile = await getUserByAddress(currentUserId);
  }
  const currentUserProfile = rawCurrentUserProfile as User | null;

  // 3. If user still not found, show 404
  if (!typedProfileUser) {
    console.log(`User not found by handle or address: '${handle}'`);
    notFound();
  }

  // Fetch the posts for this profile user
  const userPosts = await getUserPosts(typedProfileUser.id || "", 20, 0);

  // --- Add Server-Side Logging for Post Data ---
  console.log(`[Server /${handle}] Fetched ${userPosts.length} posts.`);
  if (userPosts.length > 0) {
    const postWithImage = userPosts.find(
      (p) => p.id === "b5c66156-cb8f-477d-906e-b580de35db16"
    ); // ID of your image post
    if (postWithImage) {
      console.log(
        `[Server /${handle}] Test post found. image_url:`,
        postWithImage.image_url
      );
      if (!postWithImage.image_url) {
        console.error(
          `[Server /${handle}] !!! CRITICAL: Test post fetched BUT image_url is MISSING on server!`
        );
      }
    } else {
      console.warn(
        `[Server /${handle}] Test post with ID b5c6... not found in fetched posts.`
      );
    }
  }
  // --- End Logging ---

  // Determine if the viewed profile is the current user's profile
  // const isCurrentUserProfile = currentUserId === typedProfileUser.address; // Logic is inside ProfileHeaderClient

  return (
    <main className="flex min-h-screen w-full flex-col border-x border-border">
      {/* Comment out the Profile Header */}
      {/* 
      <ProfileHeaderClient
        profileUser={typedProfileUser}
        currentUserId={currentUserId}
      /> 
      */}

      {/* Tabs for Posts, Replies, etc. */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-4 rounded-none border-b border-border">
          {/* TODO: Make tabs dynamic based on content */}
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="replies" disabled>
            Replies
          </TabsTrigger>
          <TabsTrigger value="media" disabled>
            Media
          </TabsTrigger>
          <TabsTrigger value="likes" disabled>
            Likes
          </TabsTrigger>
        </TabsList>

        {/* Posts Tab Content */}
        <TabsContent value="posts">
          {/* Conditional Compose Box (Show only on own profile) */}
          {currentUserId === typedProfileUser.address && currentUserProfile && (
            <ComposeBox user={currentUserProfile} />
          )}

          {/* Posts Count and Section */}
          {userPosts.length > 0 && <ShowPostsCount count={userPosts.length} />}
          <PostsSection
            posts={userPosts.map((post) => ({
              ...(post as any),
              userId: post.user_id,
              createdAt: post.created_at,
              image_url: post.image_url,
              comments: [],
              retweets: post.reposts_count ?? 0,
              likes: post.likes_count ?? 0,
              userName: typedProfileUser.display_name || handle,
              userAvatar: typedProfileUser.avatar_url || "/default-avatar.png",
              userHandle: handle,
              verified: false,
            }))}
            loading={false}
            currentUserId={currentUserId ?? undefined}
            className="divide-y divide-border"
          />
        </TabsContent>

        {/* TODO: Add TabsContent for Replies, Media, Likes */}
      </Tabs>
    </main>
  );
}

export const dynamic = "force-dynamic"; // Or 'auto' if caching is desired
