"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Link from "next/link";
import { Button } from "@/registry/new-york/ui/button";
import { ChevronLeft, X } from "lucide-react";
import { Icon } from "@/components/ui/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EnhancedComposeForm from "./EnhancedComposeForm";

export default function ComposePage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth({ required: true });
  const { user, loading: userLoading } = useCurrentUser();

  const handleCancel = () => {
    router.push("/home");
  };

  if (authLoading || userLoading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-background/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 rounded-full"
            onClick={handleCancel}
          >
            <X className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">New Post</h1>
        </div>
        <div>
          <Button variant="ghost" size="sm" className="text-sm text-primary">
            Drafts
          </Button>
        </div>
      </div>

      {/* Compose form */}
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
            <EnhancedComposeForm userId={user.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
