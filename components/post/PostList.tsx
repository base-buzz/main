import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ImageIcon,
  Gift,
  Sparkles,
  ListFilter,
  Smile,
  Calendar,
  MapPin,
} from "lucide-react";

export function PostList() {
  return (
    <div className="flex flex-col divide-y divide-border">
      {/* What's happening input */}
      <div className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/avatars/01.png" alt="@user" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <textarea
              placeholder="What's happening?"
              className="w-full resize-none bg-transparent text-xl outline-none placeholder:text-muted-foreground"
              rows={1}
            />
            <div className="mt-2 flex justify-between">
              <div className="-ml-2 flex gap-4">
                <Button variant="ghost" size="icon" className="text-primary">
                  <ImageIcon className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-primary">
                  <Gift className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-primary">
                  <Sparkles className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-primary">
                  <ListFilter className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-primary">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-primary">
                  <Calendar className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-primary">
                  <MapPin className="h-5 w-5" />
                </Button>
              </div>
              <Button className="rounded-full bg-primary px-4 text-primary-foreground">
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Show posts section */}
      <button className="w-full px-4 py-3 text-primary hover:bg-accent/5">
        Show 69 posts
      </button>

      {/* Posts list */}
      <div className="divide-y divide-border">
        {/* ... existing posts ... */}
      </div>
    </div>
  );
}
