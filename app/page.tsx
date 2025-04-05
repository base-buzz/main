"use client"; // Assuming NotLoggedInLayout might use client-side hooks

import NotLoggedInLayout from "@/components/layout/auth/NotLoggedInLayout";

export default function RootPage() {
  // This page simply renders the layout meant for unauthenticated users at the root.
  return <NotLoggedInLayout />;
}
