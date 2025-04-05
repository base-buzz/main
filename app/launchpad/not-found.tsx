import Link from "next/link";
import { Home, Rocket } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LaunchpadNotFound() {
  return (
    <div className="container flex h-[80vh] flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Rocket className="mx-auto mb-4 h-12 w-12 text-primary" />
          <CardTitle className="text-2xl font-bold">Launchpad</CardTitle>
          <CardDescription>Coming Soon</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Our launchpad for new projects is currently under development.
          </p>
          <p className="text-muted-foreground">
            We&apos;re working to bring you exciting new projects and
            opportunities.
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
