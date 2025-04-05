/**
 * @file hooks/useWalletSheet.ts
 * @description Hook for managing wallet sheet visibility
 */

import { useWalletSheetContext } from "@/components/providers";

export function useWalletSheet() {
  return useWalletSheetContext();
}
