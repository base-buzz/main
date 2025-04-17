import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Truncate Ethereum address
export function truncateAddress(address: string | undefined): string {
  if (!address) return "";
  if (address.length <= 10) return address; // Prevent errors on short strings
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}
