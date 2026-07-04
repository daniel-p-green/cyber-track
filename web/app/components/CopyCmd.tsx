"use client";

import { useState } from "react";

/** Small copy-to-clipboard affordance for terminal commands. */
export default function CopyCmd({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy command: ${text}`}
      title="Copy command"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        border: "1px solid var(--line)",
        borderRadius: 2,
        background: "transparent",
        color: copied ? "var(--signal)" : "var(--muted)",
        fontFamily: "var(--font-display)",
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        flexShrink: 0,
        transition: "color 120ms ease-out, border-color 120ms ease-out",
      }}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
