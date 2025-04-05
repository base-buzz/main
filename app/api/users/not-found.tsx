import { User } from "lucide-react";
import { ComingSoon } from "@/components/placeholder/coming-soon";

export default function ApiUsersNotFound() {
  return (
    <ComingSoon
      title="API Users"
      icon={User}
      description="API Endpoint Coming Soon"
      message="Our user API endpoints are currently under development."
      additionalMessage="This endpoint will be available for developers in the future."
    />
  );
}
