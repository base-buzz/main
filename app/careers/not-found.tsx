import Link from "next/link";
import { Home, Briefcase } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CareersNotFound() {
  return (
    <div className="container flex h-[80vh] flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Briefcase className="mx-auto mb-4 h-12 w-12 text-primary" />
          <CardTitle className="text-2xl font-bold">Careers</CardTitle>
          <CardDescription>We&apos;re still building this page</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Our careers page is coming soon. Check back later for job
            opportunities.
          </p>
          <p className="text-muted-foreground">
            Have questions? Reach out to us on social media.
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
