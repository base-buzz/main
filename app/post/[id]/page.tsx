"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { postApi } from "@/lib/api";
import { Post } from "@/types/interfaces";
import PostComponent from "@/components/post/PostComponent";
import Link from "next/link";
import { Button } from "@/registry/new-york/ui/button";
import { ChevronLeft } from "lucide-react";
import CreatePostForm from "@/components/post/CreatePostForm";
import { Icon } from "@/components/ui/icons";

export default function PostPage() {
  const params = useParams();
  const postId = params?.id as string;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { user, loading: userLoading } = useCurrentUser();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        // In a real app, we would fetch the specific post from the API
        // For now, we'll get all posts and find the one with matching ID
        const allPosts = await postApi.getPosts();
        const foundPost = allPosts.find((p) => p.id === postId);

        if (foundPost) {
          setPost(foundPost);
        } else {
          setError("Post not found");
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleReplyCreated = (newReply: Post) => {
    if (post) {
      // Add the new reply to the post's comments
      setPost({
        ...post,
        comments: [newReply, ...post.comments],
      });
    }
  };

  if (loading || authLoading || userLoading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <div className="rounded-lg bg-destructive/10 p-6 text-destructive">
          <p>{error || "Post not found"}</p>
          <Link href="/">
            <Button className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center bg-background/90 px-4 py-3 backdrop-blur-md">
        <Link href="/home" className="mr-4">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Post</h1>
      </div>

      {/* Main post */}
      <div className="p-4">
        <PostComponent post={post} currentUserId={user?.id} />
      </div>

      {/* Reply form */}
      {user && isAuthenticated && (
        <div className="p-4">
          <div className="flex gap-3">
            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-muted">
              <img
                src="https://i.pravatar.cc/150?img=3"
                alt={user.alias || "User"}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="w-full">
              <CreatePostForm
                userId={user.id}
                onPostCreated={handleReplyCreated}
                replyToId={post.id}
                className="border-0 p-0 shadow-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Replies section */}
      <div className="divide-y divide-border">
        <h2 className="bg-background/50 p-4 font-bold">Replies</h2>
        {post.comments.length > 0 ? (
          post.comments.map((comment) => (
            <div key={comment.id} className="p-4">
              <PostComponent post={comment} currentUserId={user?.id} />
            </div>
          ))
        ) : (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">
              No replies yet. Be the first to reply!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
