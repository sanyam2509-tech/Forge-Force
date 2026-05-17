"use client";

import { useState, useCallback } from "react";

export function useCopyToClipboard() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = useCallback(async (text: string, key?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key ?? "__default__");
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // Fallback for environments where clipboard API is not available
      setCopiedKey(null);
    }
  }, []);

  const isCopied = useCallback(
    (key?: string) => copiedKey === (key ?? "__default__"),
    [copiedKey]
  );

  return { isCopied, copy };
}
