import { Settings } from "lucide-react";
import { ComingSoon } from "@/components/placeholder/coming-soon";

export default function SettingsNotFound() {
  return (
    <ComingSoon
      title="Settings"
      icon={Settings}
      description="Coming Soon"
      message="Our settings page is currently under development."
      additionalMessage="Soon you'll be able to customize your experience and manage your account."
    />
  );
}
