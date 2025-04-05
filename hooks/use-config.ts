import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// Remove imports for registry types
// import { BaseColor } from "@/registry/registry-base-colors";
// import { Style } from "@/registry/registry-styles";

type Config = {
  // Use string type instead of imported types
  style: string;
  theme: string;
  radius: number;
  packageManager: "npm" | "yarn" | "pnpm" | "bun";
  installationType: "cli" | "manual";
};

const configAtom = atomWithStorage<Config>("config", {
  style: "new-york",
  theme: "zinc",
  radius: 0.5,
  packageManager: "pnpm",
  installationType: "cli",
});

export function useConfig() {
  return useAtom(configAtom);
}
