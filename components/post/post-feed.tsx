import { useState, useEffect } from "react";
import { PostCard } from "./post-card";
import { PostForm } from "./post-form";
import { usePosts, Post } from "@/lib/api-client";

interface PostFeedProps {
  userId?: string; // Current user's ID (optional)
  profileId?: string; // Profile to show posts for (optional)
  initialPosts?: Post[]; // Initial posts data (optional)
  showPostForm?: boolean;
}

export function PostFeed({
  userId,
  profileId,
  initialPosts = [],
  showPostForm = true,
}: PostFeedProps) {
  // State for selected post for reply
  const [replyToPost, setReplyToPost] = useState<Post | null>(null);

  // Get posts data (from hook or prop)
  const { posts: hookPosts, loading, error } = usePosts(profileId);
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  // Update posts when hook data changes
  useEffect(() => {
    if (hookPosts && hookPosts.length > 0) {
      setPosts(hookPosts);
    }
  }, [hookPosts]);

  // Handle successful post creation
  const handlePostSuccess = () => {
    // In a real app, we would refetch posts here
    setReplyToPost(null);
  };

  // Handle reply button click
  const handleReply = (post: Post) => {
    setReplyToPost(post);
  };

  // Close reply form
  const handleCloseReply = () => {
    setReplyToPost(null);
  };

  return (
    <div>
      {/* Post creation form */}
      {showPostForm && userId && (
        <PostForm userId={userId} onPostSuccess={handlePostSuccess} />
      )}

      {/* Reply form */}
      {replyToPost && userId && (
        <div className="border-b border-border bg-accent/10 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium">
              Replying to {replyToPost.users?.display_name || "post"}
            </h3>
            <button
              onClick={handleCloseReply}
              className="text-muted-foreground hover:text-foreground"
            >
              &times;
            </button>
          </div>
          <div className="mb-2 border-l-2 border-border pl-6">
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {replyToPost.content}
            </p>
          </div>
          <PostForm
            userId={userId}
            replyToId={replyToPost.id}
            onPostSuccess={handlePostSuccess}
            placeholder="Write your reply..."
          />
        </div>
      )}

      {/* Loading state */}
      {loading && initialPosts.length === 0 && (
        <div className="p-4 text-center text-muted-foreground">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2">Loading posts...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 text-center text-red-500">
          Error loading posts. Please try again.
        </div>
      )}

      {/* Empty state */}
      {!loading && posts.length === 0 && (
        <div className="p-4 text-center text-muted-foreground">
          No posts to display. {showPostForm ? "Be the first to post!" : ""}
        </div>
      )}

      {/* Posts list */}
      <div>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={userId}
            onReply={handleReply}
          />
        ))}
      </div>
    </div>
  );
}
