"use client"; // Required for potential future state hooks (e.g., active link)

import Link from "next/link";
import { Home, Search, Bell, Mail, Shapes } from "lucide-react"; // Using lucide-react based on icons.tsx
import { Icons } from "@/components/icons"; // Assuming custom Grok icon might be here
import { cn } from "@/lib/utils";

// TODO: Add state management for active link highlighting
// TODO: Add state/props for notification/message badges

export function BottomNavigationBar() {
  // Placeholder paths - replace with actual routes
  const navItems = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/explore", label: "Search", icon: Search },
    { href: "/grok", label: "Grok", icon: Shapes }, // Using Shapes as placeholder
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/messages", label: "Messages", icon: Mail },
  ];

  // Add badges later
  // const notificationCount = 1; // Example
  // const messageCount = 1; // Example

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <nav className="flex h-full items-center justify-around">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          // Placeholder for active state - use pathname later
          const isActive = item.href === "/home"; // Example: Mark home as active
          return (
            <Link
              key={item.label}
              href={item.href}
              className="relative flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
              aria-label={item.label}
            >
              <IconComponent
                className={cn("h-6 w-6", isActive && "text-primary")}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {/* Basic active state styling */}
              {/* <span className={cn(isActive ? "font-bold text-primary" : "")}>{item.label}</span> */}

              {/* Badge Placeholder - Add logic later */}
              {/* {item.label === "Notifications" && notificationCount > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {notificationCount}
                </span>
              )}
              {item.label === "Messages" && messageCount > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {messageCount}
                </span>
              )} */}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
