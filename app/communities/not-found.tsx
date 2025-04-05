import { Users } from "lucide-react";
import { ComingSoon } from "@/components/placeholder/coming-soon";

export default function CommunitiesNotFound() {
  return (
    <ComingSoon
      title="Communities"
      icon={Users}
      description="Coming Soon"
      message="Our communities feature is currently under development."
      additionalMessage="Soon you'll be able to join and participate in various communities of interest."
    />
  );
}
