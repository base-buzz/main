"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// Remove registry import
// import { registryCategories } from "@/registry/registry-categories";

// Provide empty array
const registryCategories: Array<{
  name: string;
  slug: string;
  hidden: boolean;
}> = [];

export function BlocksNav() {
  const pathname = usePathname();

  return (
    <div className="relative overflow-hidden">
      <ScrollArea className="max-w-none">
        <div className="flex items-center">
          <BlocksNavLink
            category={{ name: "Featured", slug: "", hidden: false }}
            isActive={pathname === "/blocks"}
          />
          {registryCategories.map((category) => (
            <BlocksNavLink
              key={category.slug}
              category={category}
              isActive={pathname === `/blocks/${category.slug}`}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}

function BlocksNavLink({
  category,
  isActive,
}: {
  // Adjust type to match the dummy data structure
  category: { name: string; slug: string; hidden: boolean };
  isActive: boolean;
}) {
  if (category.hidden) {
    return null;
  }

  return (
    <Link
      href={`/blocks/${category.slug}`}
      key={category.slug}
      className="flex h-7 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[active=true]:bg-muted data-[active=true]:text-foreground"
      data-active={isActive}
    >
      {category.name}
    </Link>
  );
}
