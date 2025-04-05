import Link from "next/link";
import { Home, LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ComingSoonProps {
  title: string;
  icon: LucideIcon;
  description?: string;
  message?: string;
  additionalMessage?: string;
}

export function ComingSoon({
  title,
  icon: Icon,
  description = "Coming Soon",
  message = `The ${title.toLowerCase()} page is currently under development.`,
  additionalMessage = "We're working to bring you more features and content.",
}: ComingSoonProps) {
  return (
    <div className="container flex h-[80vh] flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Icon className="mx-auto mb-4 h-12 w-12 text-primary" />
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">{message}</p>
          <p className="text-muted-foreground">{additionalMessage}</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/">
            <Button variant="default">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
