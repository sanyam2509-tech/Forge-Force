"use client";

import { useState, useCallback } from "react";

export function useCopyToClipboard() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = useCallback(async (text: string, key?: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
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
