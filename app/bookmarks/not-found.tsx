import { Bookmark } from "lucide-react";
import { ComingSoon } from "@/components/placeholder/coming-soon";

export default function BookmarksNotFound() {
  return (
    <ComingSoon
      title="Bookmarks"
      icon={Bookmark}
      description="Coming Soon"
      message="Our bookmarks feature is currently under development."
      additionalMessage="Soon you'll be able to save your favorite posts and content for later."
    />
  );
}
