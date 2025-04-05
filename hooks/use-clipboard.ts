import { useState } from "react";

export function useClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 sec
    });
  };

  return { copy, copied };
}
