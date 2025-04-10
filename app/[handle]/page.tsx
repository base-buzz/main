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

  // Fetch the profile user data based on the handle
  const profileUser = await getUserByHandle(handle);
  // Assert the type here to satisfy the compiler downstream
  const typedProfileUser = profileUser as User | null;

  // Fetch the current logged-in user's session (needed for follow/like status later)
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.address; // Logged in user's address

  // Fetch full profile for the currently logged-in user (for ComposeBox)
  // Also assert the type for the current user profile
  const currentUserProfile = currentUserId
    ? ((await getUserByAddress(currentUserId)) as User | null)
    : null;

  // If user not found by handle, show 404
  if (!typedProfileUser) {
    notFound();
  }

  // Fetch the posts for this profile user using their actual user ID (UUID)
  const userPosts = await getUserPosts(typedProfileUser.id || "", 20, 0); // Use ID (UUID)

  return (
    <main className="flex min-h-screen w-full flex-col border-x border-border">
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
            // Map the fetched posts to the structure expected by PostsSection
            posts={userPosts.map((post) => ({
              // Cast to any initially to satisfy TS during mapping
              ...(post as any),
              ...post,
              // Rename/map fields as needed by PostsSection's Post type
              userId: post.user_id,
              createdAt: post.created_at,
              comments: post.replies_count ?? 0, // Use comments if that is the expected prop name
              retweets: post.reposts_count ?? 0, // Use retweets if that is the expected prop name
              likes: post.likes_count ?? 0,
              // Add other fields expected by the Post type in PostsSection
              userName: typedProfileUser.display_name || handle, // Add author info
              userAvatar: typedProfileUser.avatar_url || "/default-avatar.png",
              userHandle: handle,
            }))}
            loading={false} // Data is fetched server-side
            currentUserId={currentUserId ?? undefined} // Ensure type is string | undefined
            className="divide-y divide-border"
          />
        </TabsContent>

        {/* TODO: Add TabsContent for Replies, Media, Likes */}
      </Tabs>
    </main>
  );
}

export const dynamic = "force-dynamic"; // Or 'auto' if caching is desired
