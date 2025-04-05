import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

export function useUnreadMessages() {
  const [unreadCount, setUnreadCount] = useState(0);
  const { isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      setUnreadCount(2); // Mock value - replace with actual API call
    }
  }, [isConnected]);

  return { unreadCount };
}
