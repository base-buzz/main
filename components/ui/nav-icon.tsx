"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface NavIconProps {
  icon: React.ElementType;
  isActive?: boolean;
  showNotificationDot?: boolean;
  unreadCount?: number;
  className?: string;
}

export function NavIcon({
  icon: Icon,
  isActive = false,
  showNotificationDot = false,
  unreadCount,
  className,
}: NavIconProps) {
  return (
    <motion.div
      initial={false}
      animate={{
        scale: isActive ? 1.1 : 1,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn("relative", className)}
    >
      <Icon
        className={cn(
          "transition-colors duration-200",
          isActive
            ? "text-foreground dark:text-white"
            : "text-muted-foreground group-hover:text-foreground dark:text-gray-400 dark:group-hover:text-white",
        )}
      />
      {showNotificationDot && (
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[rgb(29,155,240)]" />
      )}
      {typeof unreadCount === "number" && unreadCount > 0 && (
        <div className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[rgb(29,155,240)] px-1 text-xs font-medium text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </div>
      )}
    </motion.div>
  );
}
