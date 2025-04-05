import Link from "next/link";
import { Home } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex h-[80vh] flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold">404</CardTitle>
          <CardDescription className="text-xl">Page Not Found</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
          <p className="text-muted-foreground">
            We&apos;re working on bringing more content to BaseBuzz soon.
          </p>
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
