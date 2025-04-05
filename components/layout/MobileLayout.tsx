"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  PanInfo,
  animate,
} from "framer-motion";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-275, 0, 275],
    ["rgba(0, 0, 0, 0.5)", "rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.5)"]
  );
  const [isOpen, setIsOpen] = useState(false);

  // Add onDragEnd handler
  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const swipeThreshold = 100;
    const velocityThreshold = 500;
    const { offset, velocity } = info;

    if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
      // Snap Left Drawer Open
      // animate(x, 275, { type: "spring", stiffness: 300, damping: 30 });
      // setIsOpen(true); // Temporarily disable state update
    } else if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
      // Snap Right Drawer Open
      // animate(x, -275, { type: "spring", stiffness: 300, damping: 30 });
      // setIsOpen(true); // Temporarily disable state update
    } else {
      // Snap Closed
      // animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
      // setIsOpen(false); // Temporarily disable state update
    }
  };

  return (
    <div className="relative h-full min-h-screen touch-pan-y">
      {/* TEMPORARILY COMMENT OUT LEFT NAVIGATION SHEET */}
      {/* <motion.div
        className="fixed left-0 top-0 z-50 h-full w-[275px] -translate-x-full transform bg-background"
        style={{ x }}
      >
        <div className="flex h-full flex-col p-4">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = isActive ? item.activeIcon : item.icon;

              if (item.requiresAuth && !isConnected) {
                return (
                  <button
                    key={item.href}
                    onClick={() => openWalletModal()}
                    className={cn(
                      "group flex w-full items-center gap-4 rounded-full p-3 transition-colors hover:bg-accent/10",
                      isActive && "font-bold"
                    )}
                  >
                    <NavIcon
                      icon={Icon}
                      isActive={isActive}
                      showNotificationDot={item.href === "/notifications"}
                      className="h-[26px] w-[26px]"
                    />
                    <span className="text-xl">{item.label}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex w-full items-center gap-4 rounded-full p-3 transition-colors hover:bg-accent/10",
                    isActive && "font-bold"
                  )}
                >
                  <NavIcon
                    icon={Icon}
                    isActive={isActive}
                    showNotificationDot={item.href === "/notifications"}
                    className="h-[26px] w-[26px]"
                  />
                  <span className="text-xl">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-auto">
            <Link
              href="/profile"
              className="flex w-full items-center gap-3 rounded-full p-3 transition-colors hover:bg-accent/10"
            >
              <div className="h-10 w-10 rounded-full bg-accent" />
              <div className="flex-1 text-left">
                <div className="font-bold">User</div>
                <div className="text-sm text-muted-foreground">@user</div>
              </div>
            </Link>
          </div>
        </div>
      </motion.div> */}

      {/* Right Wallet Sheet (still simplified) */}
      <motion.div className="fixed right-0 top-0 z-50 h-full w-[275px] translate-x-full transform bg-background">
        <div className="flex h-full flex-col p-4">
          <div className="text-xl font-bold">Wallet</div>
          {isConnected ? (
            <div className="mt-4">
              {/* Connected wallet info */}
              <div className="rounded-lg border border-border p-4">
                <div className="font-medium">Connected</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  0x72...377A
                </div>
              </div>
            </div>
          ) : (
            <button className="mt-4 w-full rounded-full bg-primary px-4 py-2 font-medium text-primary-foreground">
              Connect Wallet
            </button>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.main
        className="relative min-h-screen"
        // style={{
        //   x,
        //   backgroundColor: "white",
        // }}
        // drag="x"
        // dragConstraints={{ left: -275, right: 275 }}
        // onDragEnd={handleDragEnd}
      >
        {children}
      </motion.main>

      {/* Backdrop */}
      <motion.div className="fixed inset-0 z-40 bg-black/50" />
    </div>
  );
}
