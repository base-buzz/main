import { IconName } from "../components/ui/icons";

export interface NavItem {
  label: string;
  icon: IconName;
  path: string;
  protected?: boolean;
}

export const leftNavItems: NavItem[] = [
  { label: "Home", icon: "home", path: "/" },
  { label: "Explore", icon: "search", path: "/explore" },
  {
    label: "Notifications",
    icon: "bell",
    path: "/notifications",
    protected: true,
  },
  { label: "Messages", icon: "mail", path: "/messages", protected: true },
  {
    label: "AI Minter",
    icon: "sparkles",
    path: "/rugtron",
    protected: true,
  },
  {
    label: "Bookmarks",
    icon: "bookmark",
    path: "/bookmarks",
    protected: true,
  },
  { label: "🔥 Hires", icon: "briefcase", path: "/careers" },
  {
    label: "Token Hubs",
    icon: "users",
    path: "/communities",
    protected: true,
  },
  {
    label: "Verified Projects",
    icon: "shield-check",
    path: "/verified",
  },
  { label: "Buzzboard", icon: "trending-up", path: "/launchpad" },
  {
    label: "Chatrooms",
    icon: "message-circle",
    path: "/chat",
    protected: true,
  },
  {
    label: "More",
    icon: "more-horizontal",
    path: "/settings",
    protected: true,
  },
];
