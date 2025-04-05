/**
 * @file components/ui/main-nav.tsx
 * @description Main navigation component that provides responsive navigation with mobile menu,
 * desktop navigation, and legal/privacy links. Includes hamburger menu for mobile, logo,
 * and social links.
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Icons } from "@/components/icons";
import { useState } from "react";

/**
 * MainNav Component
 *
 * A responsive navigation component that includes:
 * - Mobile hamburger menu with slide-out sheet
 * - Desktop navigation links
 * - Logo with dark/light mode support
 * - Social media links
 * - Legal & Privacy section
 */
export function MainNav() {
  const pathname = usePathname();
  const [isLegalOpen, setIsLegalOpen] = useState(false);

  const navigationItems = [
    {
      href: "/",
      label: "Home",
      icon: <Icons.home className="h-6 w-6" />,
    },
    {
      href: "/explore",
      label: "Explore",
      icon: <Icons.search className="h-6 w-6" />,
    },
    {
      href: "/notifications",
      label: "Notifications",
      icon: <Icons.bell className="h-6 w-6" />,
      hasNotification: true,
    },
    {
      href: "/messages",
      label: "Messages",
      icon: <Icons.mail className="h-6 w-6" />,
      hasNotification: true,
    },
    {
      href: "/bookmarks",
      label: "Bookmarks",
      icon: <Icons.bookmark className="h-6 w-6" />,
    },
    {
      href: "/communities",
      label: "Communities",
      icon: <Icons.users className="h-6 w-6" />,
    },
    {
      href: "/tabs/careers",
      label: "Careers",
      icon: <Icons.briefcase className="h-6 w-6" />,
      hasNotification: true,
    },
    {
      href: "/apps",
      label: "Apps",
      icon: <Icons.apps className="h-6 w-6" />,
    },
    {
      href: "/profile",
      label: "Profile",
      icon: <Icons.user className="h-6 w-6" />,
    },
  ];

  const baseBuzzFeatures = [
    {
      href: "/badges",
      label: "Badges",
      description: "View your achievements",
      icon: <Icons.badge className="h-5 w-5" />,
    },
    {
      href: "/benefits",
      label: "Benefits",
      description: "Member perks",
      icon: <Icons.gift className="h-5 w-5" />,
    },
    {
      href: "/apps",
      label: "Apps",
      description: "Explore Base Buzz apps",
      icon: <Icons.apps className="h-5 w-5" />,
    },
    {
      href: "/leaderboard",
      label: "Leaderboard",
      description: "Top contributors",
      icon: <Icons.trophy className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex items-center gap-2">
      {/* Mobile Menu Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 9h16.5m-16.5 6.75h16.5"
              />
            </svg>
            <span className="sr-only">Open Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-6">
          {/* Logo at the top */}
          <div className="mb-6 flex items-center gap-2">
            <Image
              src="/logo.svg"
              width={32}
              height={32}
              alt="Base Buzz"
              className="dark:invert"
            />
            <span className="font-bold">{siteConfig.name}</span>
          </div>

          {/* Primary Navigation Links */}
          <nav className="flex flex-col space-y-3">
            {navigationItems.map(({ href, label, icon, hasNotification }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-lg transition-colors hover:bg-accent",
                  pathname === href ? "bg-accent" : "transparent",
                )}
              >
                <div className="relative">
                  {icon}
                  {hasNotification && (
                    <div className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
                  )}
                </div>
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <Separator className="my-4" />

          {/* Base Buzz Features */}
          <div className="space-y-3">
            <h3 className="px-3 text-lg font-semibold">Base Buzz Features</h3>
            <div className="grid grid-cols-2 gap-2">
              {baseBuzzFeatures.map(({ href, label, description, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col gap-1 rounded-lg border p-3 transition hover:bg-accent"
                >
                  <div className="flex items-center gap-2">
                    {icon}
                    <span className="font-medium">{label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {description}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Social Media Links with Hover Animation */}
          <div className="flex items-center justify-between gap-2">
            {Object.entries(siteConfig.links).map(([platform, url]) => (
              <Link
                key={platform}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg p-2 transition-colors hover:bg-accent"
              >
                {platform === "twitter" && (
                  <Icons.twitter className="h-5 w-5" />
                )}
                {platform === "github" && <Icons.gitHub className="h-5 w-5" />}
                {platform === "discord" && (
                  <Icons.discord className="h-5 w-5" />
                )}
                <span className="sr-only">{platform}</span>
              </Link>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Legal & Privacy Section */}
          <div className="space-y-2">
            <button
              onClick={() => setIsLegalOpen(!isLegalOpen)}
              className="flex w-full items-center justify-between text-sm font-medium transition hover:text-primary"
            >
              Legal & Privacy
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className={`h-5 w-5 transition-transform ${
                  isLegalOpen ? "rotate-180" : ""
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isLegalOpen && (
              <div className="ml-4 space-y-2 text-sm text-muted-foreground">
                <Link
                  href="/terms"
                  className="block transition hover:text-primary"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/privacy"
                  className="block transition hover:text-primary"
                >
                  Privacy Policy
                </Link>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Logo Section with Dark/Light Mode Support */}
      <Link href="/" className="hidden items-center space-x-2 lg:flex">
        <Image
          src="/logo.svg"
          width={32}
          height={32}
          alt="Base Buzz"
          className="dark:invert"
        />
        <span className="hidden font-bold lg:inline-block">
          {siteConfig.name}
        </span>
      </Link>

      {/* Desktop Navigation Links */}
      <nav className="ml-2 hidden items-center gap-4 text-sm md:flex xl:gap-6">
        {navigationItems
          .filter(
            (item) =>
              !["home", "bookmarks", "communities", "profile"].includes(
                item.label.toLowerCase(),
              ),
          )
          .map(({ href, label, hasNotification }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative inline-flex items-center transition-colors hover:text-foreground/80",
                pathname === href ? "text-foreground" : "text-foreground/80",
              )}
            >
              <span>{label}</span>
              {hasNotification && (
                <div className="absolute -right-2.5 -top-1.5 h-2.5 w-2.5 rounded-full bg-red-500" />
              )}
            </Link>
          ))}
      </nav>
    </div>
  );
}
