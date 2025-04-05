import { Bell } from "lucide-react";
import { ComingSoon } from "@/components/placeholder/coming-soon";

export default function NotifOnNotFound() {
  return (
    <ComingSoon
      title="Notifications"
      icon={Bell}
      description="Coming Soon"
      message="Our real-time notification system is currently under development."
      additionalMessage="Stay tuned for updates on your favorite content and connections."
    />
  );
}
