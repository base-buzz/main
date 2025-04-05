import { Link2 } from "lucide-react";
import { ComingSoon } from "@/components/placeholder/coming-soon";

export default function ConnectNotFound() {
  return (
    <ComingSoon
      title="Connect"
      icon={Link2}
      description="Coming Soon"
      message="Our connect feature is currently under development."
      additionalMessage="Soon you'll be able to connect with other users and projects."
    />
  );
}
