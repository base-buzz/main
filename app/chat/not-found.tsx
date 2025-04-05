import { MessageSquare } from "lucide-react";
import { ComingSoon } from "@/components/placeholder/coming-soon";

export default function ChatNotFound() {
  return (
    <ComingSoon
      title="Chat"
      icon={MessageSquare}
      description="Coming Soon"
      message="Our chat feature is currently under development."
      additionalMessage="Soon you'll be able to message and connect with other users."
    />
  );
}
