"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import EnhancedComposeForm from "./EnhancedComposeForm";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { User } from "@/types/interfaces";

export default function ComposePage() {
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();
  const [isFocused, setIsFocused] = useState(false);

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <div>Please log in to compose a post.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-background/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 rounded-full"
            onClick={handleCancel}
          >
            <XIcon className="h-5 w-5" />
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
          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-muted">
            <Image
              src={user.avatar_url || "https://i.pravatar.cc/150?img=3"}
              alt={user.display_name || "User Avatar"}
              fill
              className="object-cover"
              sizes="40px"
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
