"use client";

import React, { useState, useEffect } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePathname } from "next/navigation";

// Helper function to truncate string in the middle
const truncateMiddle = (
  str: string | null | undefined,
  startLen = 6,
  endLen = 4
): string => {
  if (!str) return "N/A";
  if (str.length <= startLen + endLen + 3) return str;
  return `${str.substring(0, startLen)}...${str.substring(str.length - endLen)}`;
};

/**
 * DiagnosticInfo Component
 *
 * Displays debugging information relevant to the current user and environment.
 */
export const DiagnosticInfo: React.FC = () => {
  const { user, isLoading } = useCurrentUser();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const clientSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clientSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? "Configured"
    : "MISSING!";

  return (
    <div className="mb-4 rounded-lg bg-black p-4 text-white text-xs font-mono">
      <h3 className="mb-2 text-sm font-semibold border-b border-gray-700 pb-1">
        DIAGNOSTICS
      </h3>
      <ul className="space-y-1">
        <li>
          <strong>Page Path:</strong> {pathname}
        </li>
        <li>
          <strong>User Loading:</strong> {isLoading ? "true" : "false"}
        </li>
        <li>
          <strong>User Auth:</strong>{" "}
          {user ? "Authenticated" : "Not Authenticated"}
        </li>
        {user && (
          <>
            <li>
              <strong>User ID:</strong> {truncateMiddle(user.id, 8, 6)}
            </li>
            <li>
              <strong>User Address:</strong>{" "}
              {truncateMiddle(user.address, 6, 4)}
            </li>
            <li>
              <strong>User Handle:</strong> {user.handle || "N/A"}
            </li>
            <li>
              <strong>User Name:</strong> {user.display_name || "N/A"}
            </li>
          </>
        )}
        <li>
          <strong>Client Supa Anon Key:</strong> {clientSupabaseAnonKey}
        </li>
        <li>
          <strong>Render Time:</strong>{" "}
          {isClient ? new Date().toLocaleTimeString() : "..."}
        </li>
      </ul>

      {/* New Section: Component Auth Checks */}
      <h3 className="mt-3 mb-2 text-sm font-semibold border-b border-gray-700 pb-1">
        COMPONENT AUTH CHECKS
      </h3>
      <ul className="space-y-1">
        {/* General Layout Components */}
        <li>{user ? "✅" : "❌"} LayoutWrapper (Overall Structure)</li>
        <li>{user ? "✅" : "❌"} Header (Top Nav / Connect Button)</li>
        <li>{user ? "✅" : "❌"} LeftSidebar (Main Nav Links)</li>
        <li>{user ? "✅" : "❌"} RightSidebar (Search / Trending / Follows)</li>
        <li>{user ? "✅" : "❌"} BottomNav (Mobile Navigation)</li>

        {/* Page-Specific / Conditional Components - Modified to always show some */}
        {/* Always show HomePage status */}
        <li>{user ? "✅" : "❌"} HomePage (Main Feed Container)</li>

        {/* Always show PostsSection status and internals */}
        <li>
          {user ? "✅" : "❌"} PostsSection (Feed Renderer)
          {/* Indented checks for parts rendered by PostsSection */}
          <ul className="ml-4 mt-1 space-y-1">
            <li>{user ? "✅" : "❌"} Post Header (Avatar/Name/Handle)</li>
            <li>{user ? "✅" : "❌"} Post Content</li>
            <li>{user ? "✅" : "❌"} Post Media/Image</li>
            <li>{user ? "✅" : "❌"} Post Actions (Like/Reply etc.)</li>
          </ul>
        </li>

        {/* Always show ComposeBox status */}
        <li>{user ? "✅" : "❌"} ComposeBox (Main Post Input)</li>

        {/* Keep others conditional */}
        {pathname && pathname.startsWith("/post/") && (
          <li>{user ? "✅" : "❌"} PostPage (Detail View Container)</li>
        )}
        {pathname && pathname.startsWith("/post/") && (
          <li>{user ? "✅" : "❌"} CreatePostForm (Reply Input)</li>
        )}
        {pathname && pathname.startsWith("/profile/") && (
          <li>{user ? "✅" : "❌"} ProfilePage (User Profile View)</li>
        )}
        {/* Add more components as needed */}
      </ul>
    </div>
  );
};
