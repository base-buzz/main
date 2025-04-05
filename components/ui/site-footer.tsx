"use client";
import { useEffect } from "react";
import { siteConfig } from "@/config/site";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { Button } from "./button";

export function SiteFooter() {
  useEffect(() => {
    const copyBtn = document.getElementById("copy-btn");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText("0x123...ABC");
      });
    }
  }, []);

  return (
    <footer className="border-t bg-background py-10">
      <div className="container-wrapper">
        <div className="container flex flex-col space-y-10 sm:flex-row sm:justify-between sm:space-y-0">
          {/* ✅ Social Links - Animated */}
          <div className="flex justify-center gap-4">
            {[
              {
                href: siteConfig.links.twitter,
                icon: <Icons.twitter className="h-6 w-6" />,
                label: "Twitter",
              },
              {
                href: siteConfig.links.github,
                icon: <Icons.gitHub className="h-6 w-6" />,
                label: "GitHub",
              },
              {
                href: "https://discord.gg/basebuzz",
                icon: <Icons.discord className="h-6 w-6" />,
                label: "Discord",
              },
            ].map(({ href, icon, label }) => (
              <Link key={href} href={href} target="_blank" rel="noreferrer">
                <Button
                  variant="ghost"
                  size="icon"
                  className="group transition-transform duration-300 hover:rotate-[10deg] hover:text-primary"
                >
                  {icon}
                  <span className="sr-only">{label}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* Footer Links */}
          <div className="grid grid-cols-2 gap-6 text-sm text-foreground sm:grid-cols-4">
            <div>
              <h3 className="font-medium text-primary">App</h3>
              <ul className="mt-2 space-y-1">
                <li>
                  <a href="#" className="hover:underline">
                    Trade
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Explore
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Pool
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-primary">Company</h3>
              <ul className="mt-2 space-y-1">
                <li>
                  <a href="#" className="hover:underline">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Brand assets
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-primary">Protocol</h3>
              <ul className="mt-2 space-y-1">
                <li>
                  <a href="#" className="hover:underline">
                    Vote
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Governance
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Developers
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-primary">Need Help?</h3>
              <ul className="mt-2 space-y-1">
                <li>
                  <a href="#" className="hover:underline">
                    Help center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Contact us
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="mt-6 flex flex-col items-center justify-between border-t pt-6 text-sm text-foreground sm:flex-row">
          <p className="text-primary sm:order-1">© 2025 - BaseBuzz</p>

          {/* ✅ Token Address Section */}
          <div className="flex flex-col items-center space-y-1 sm:order-2 sm:flex-row sm:space-x-4 sm:space-y-0">
            <span className="text-xs text-foreground">
              Verify: $BUZZ Contract
            </span>
            <span className="font-mono text-xs text-foreground">
              0x123...ABC
            </span>
            <button
              id="copy-btn"
              className="text-xs text-foreground hover:underline"
            >
              Copy
            </button>
            <a
              href="https://basescan.org/address/0x123ABC"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-foreground hover:underline"
            >
              View on Explorer ↗
            </a>
          </div>

          {/* ✅ Policy Links */}
          <div className="flex space-x-4 sm:order-3">
            <a href="#" className="text-foreground hover:underline">
              Trademark Policy
            </a>
            <a href="#" className="text-foreground hover:underline">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
