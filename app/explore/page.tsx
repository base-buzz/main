"use client";

import React, { useEffect, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { postApi } from "@/lib/api";
import { Post } from "@/types/interfaces";
import PostComponent from "@/components/post/PostComponent";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Search } from "lucide-react";

export default function ExplorePage() {
  const { user } = useCurrentUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const postsData = await postApi.getPosts();

        // Sort posts by likes and retweets to show trending content
        const sortedPosts = [...postsData].sort((a, b) => {
          const aEngagement = a.likes + a.retweets;
          const bEngagement = b.likes + b.retweets;
          return bEngagement - aEngagement;
        });

        setPosts(sortedPosts);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Filter posts when searching
  const filteredPosts = searchQuery.trim()
    ? posts.filter((post) =>
        post.content.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : posts;

  const trendingHashtags = [
    { tag: "#web3", count: 1243 },
    { tag: "#defi", count: 987 },
    { tag: "#nft", count: 854 },
    { tag: "#ethereum", count: 743 },
    { tag: "#bitcoin", count: 621 },
    { tag: "#crypto", count: 512 },
    { tag: "#blockchain", count: 498 },
  ];

  return (
    <div className="container mx-auto max-w-6xl py-6">
      <div className="mb-6 flex items-center">
        <h1 className="text-3xl font-bold">Explore</h1>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="col-span-2">
          <Tabs defaultValue="trending">
            <TabsList className="w-full">
              <TabsTrigger value="trending" className="flex-1">
                Trending
              </TabsTrigger>
              <TabsTrigger value="latest" className="flex-1">
                Latest
              </TabsTrigger>
              <TabsTrigger value="media" className="flex-1">
                Media
              </TabsTrigger>
            </TabsList>

            {loading ? (
              <div className="mt-6 flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="mt-6 rounded-lg bg-destructive/10 p-6 text-destructive">
                <p>{error}</p>
                <button
                  className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                <TabsContent value="trending" className="mt-6 space-y-6">
                  {filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
                      <PostComponent
                        key={post.id}
                        post={post}
                        currentUserId={user?.id}
                      />
                    ))
                  ) : (
                    <Card className="p-8 text-center">
                      <p className="text-muted-foreground">
                        No posts match your search
                      </p>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="latest" className="mt-6 space-y-6">
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">
                      Latest posts will appear here
                    </p>
                  </Card>
                </TabsContent>

                <TabsContent value="media" className="mt-6 space-y-6">
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">
                      Media posts will appear here
                    </p>
                  </Card>
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trending Tags</CardTitle>
              <CardDescription>What people are talking about</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {trendingHashtags.map((hashtag, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span className="cursor-pointer text-primary hover:underline">
                      {hashtag.tag}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {hashtag.count} posts
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Who to follow</CardTitle>
              <CardDescription>Suggested accounts for you</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Suggested accounts will appear here based on your interests
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
