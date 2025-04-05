"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { notificationApi, postApi, userApi } from "@/lib/api";
import { Post, Notification, User } from "@/types/interfaces";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/new-york/ui/tabs";
import { Button } from "@/registry/new-york/ui/button";
import { Card, CardContent } from "@/registry/new-york/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/registry/new-york/ui/avatar";
import { Bell, Heart, MessageCircle, Repeat, Quote } from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth({ required: true });
  const { user, loading: userLoading } = useCurrentUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [posts, setPosts] = useState<Record<string, Post>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Fetch user's notifications
        const notificationsData =
          await notificationApi.getNotificationsByUserId(user.id);
        setNotifications(notificationsData);

        // Extract unique user IDs and post IDs to fetch related data
        const userIds = new Set<string>();
        const postIds = new Set<string>();

        notificationsData.forEach((notification) => {
          // We'll need to fetch the user who created the notification
          // In a real app with proper notification structure, we'd extract the actorId
          // For now, we'll use a placeholder approach
          userIds.add("placeholder");
          postIds.add(notification.postId);
        });

        // Fetch users data
        const usersData: Record<string, User> = {};
        for (const userId of Array.from(userIds)) {
          try {
            const userData = await userApi.getUserById(userId);
            usersData[userId] = userData;
          } catch (err) {
            console.error(`Error fetching user ${userId}:`, err);
          }
        }
        setUsers(usersData);

        // Fetch posts data
        const postsData: Record<string, Post> = {};
        for (const postId of Array.from(postIds)) {
          try {
            const postData = await postApi.getPostById(postId);
            postsData[postId] = postData;
          } catch (err) {
            console.error(`Error fetching post ${postId}:`, err);
          }
        }
        setPosts(postsData);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && !authLoading && !userLoading && user) {
      fetchNotifications();
    }
  }, [isAuthenticated, authLoading, userLoading, user]);

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      await notificationApi.markAllAsRead(user.id);
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true })),
      );
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "reply":
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case "retweet":
        return <Repeat className="h-4 w-4 text-green-500" />;
      case "quoteTweet":
        return <Quote className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  const getNotificationText = (notification: Notification) => {
    const post = posts[notification.postId];
    const postPreview = post
      ? post.content.substring(0, 50) + (post.content.length > 50 ? "..." : "")
      : "a post";

    switch (notification.type) {
      case "like":
        return (
          <>
            liked your post:{" "}
            <span className="text-muted-foreground">"{postPreview}"</span>
          </>
        );
      case "reply":
        return (
          <>
            replied to your post:{" "}
            <span className="text-muted-foreground">"{postPreview}"</span>
          </>
        );
      case "retweet":
        return (
          <>
            retweeted your post:{" "}
            <span className="text-muted-foreground">"{postPreview}"</span>
          </>
        );
      case "quoteTweet":
        return (
          <>
            quoted your post:{" "}
            <span className="text-muted-foreground">"{postPreview}"</span>
          </>
        );
      default:
        return <>interacted with your post</>;
    }
  };

  if (loading || authLoading || userLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="rounded-lg bg-destructive/10 p-6 text-destructive">
          <p>{error}</p>
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

  return (
    <div className="container mx-auto max-w-2xl py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notifications</h1>
        {notifications.some((n) => !n.read) && (
          <Button variant="outline" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs defaultValue="all">
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">
            All
          </TabsTrigger>
          <TabsTrigger value="mentions" className="flex-1">
            Mentions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => {
              // For demo purposes, create a placeholder user
              const actor = {
                id: "placeholder",
                alias: "User",
                pfp: `https://source.unsplash.com/random/200x200?sig=${Math.floor(Math.random() * 1000)}`,
              };

              return (
                <Card
                  key={notification.id}
                  className={
                    notification.read ? "bg-background" : "bg-primary/5"
                  }
                >
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={actor.pfp} alt={actor.alias} />
                          <AvatarFallback>
                            {actor.alias.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{actor.alias}</div>
                        <div className="text-sm text-muted-foreground">
                          {getNotificationText(notification)}
                        </div>
                      </div>

                      <div className="mt-2">
                        <Link
                          href={`/post/${notification.postId}`}
                          className="text-sm text-primary hover:underline"
                        >
                          View post
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="rounded-lg border p-8 text-center">
              <p className="text-muted-foreground">You have no notifications</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="mentions" className="mt-6">
          <div className="rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">Mentions will appear here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
