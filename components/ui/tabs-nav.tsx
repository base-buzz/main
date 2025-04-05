"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const tabs = [
  {
    name: "Mail",
    href: "/tabs/mail",
    code: "https://github.com/shadcn/ui/tree/main/apps/www/app/(site)/tabs/mail",
    hidden: false,
  },
  {
    name: "Dashboard",
    href: "/tabs/dashboard",
    code: "https://github.com/shadcn/ui/tree/main/apps/www/app/(site)/tabs/dashboard",
    hidden: false,
  },
  {
    name: "Tasks",
    href: "/tabs/tasks",
    code: "https://github.com/shadcn/ui/tree/main/apps/www/app/(site)/tabs/tasks",
    hidden: false,
  },
  {
    name: "Playground",
    href: "/tabs/playground",
    code: "https://github.com/shadcn/ui/tree/main/apps/www/app/(site)/tabs/playground",
    hidden: false,
  },
  {
    name: "Forms",
    href: "/tabs/forms",
    code: "https://github.com/shadcn/ui/tree/main/apps/www/app/(site)/tabs/forms",
    hidden: false,
  },
  {
    name: "Music",
    href: "/tabs/music",
    code: "https://github.com/shadcn/ui/tree/main/apps/www/app/(site)/tabs/music",
    hidden: false,
  },
  {
    name: "Careers",
    href: "/tabs/careers",
    code: "https://github.com/shadcn/ui/tree/main/apps/www/app/(site)/tabs/careers",
    hidden: false,
  },
];

interface TabsNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TabsNav({ className, ...props }: TabsNavProps) {
  const pathname = usePathname();

  return (
    <div className="relative">
      <ScrollArea className="max-w-[600px] lg:max-w-none">
        <div className={cn("flex items-center", className)} {...props}>
          <ExampleLink
            example={{ name: "Tabs", href: "/", code: "", hidden: false }}
            isActive={pathname === "/"}
          />
          {tabs.map((example) => (
            <ExampleLink
              key={example.href}
              example={example}
              isActive={pathname?.startsWith(example.href) ?? false}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}

function ExampleLink({
  example,
  isActive,
}: {
  example: (typeof tabs)[number];
  isActive: boolean;
}) {
  if (example.hidden) {
    return null;
  }

  return (
    <Link
      href={example.href}
      key={example.href}
      className="flex h-7 items-center justify-center rounded-full px-4 text-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary data-[active=true]:bg-muted data-[active=true]:text-primary"
      data-active={isActive}
    >
      {example.name}
    </Link>
  );
}
