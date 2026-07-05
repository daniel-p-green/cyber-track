"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type RuntimeState = {
  provider: "ollama";
  connected: boolean;
  model: string | null;
  model_state: "loaded" | "installed" | "missing" | "unreachable";
};

type Props = {
  compact?: boolean;
  className?: string;
};

const fallbackState: RuntimeState = {
  provider: "ollama",
  connected: false,
  model: null,
  model_state: "unreachable",
};

export default function LocalRuntimeStatus({ compact = false, className }: Props) {
  const [state, setState] = useState<RuntimeState | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/local-ai-status", { cache: "no-store" });
        const json = (await res.json()) as RuntimeState;
        if (!cancelled) setState(json);
      } catch {
        if (!cancelled) setState(fallbackState);
      }
    }

    load();
    const timer = window.setInterval(load, 12000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const loading = state === null;
  const connected = state?.connected ?? false;
  const signalColor = connected ? "var(--signal)" : "var(--amber)";
  const label = loading
    ? "Ollama checking"
    : connected
      ? "Ollama connected"
      : "Ollama not detected";
  const detail = loading
    ? "local runtime"
    : state?.model
      ? `${state.model} ${state.model_state}`
      : connected
        ? "Gemma model missing"
        : "start Ollama locally";

  return (
    <span
      className={`display ${className ?? ""}`}
      title={`${label} · ${detail}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: compact ? 7 : 9,
        padding: compact ? "4px 9px" : "6px 12px",
        border: `1.4px solid color-mix(in srgb, ${signalColor} 56%, transparent)`,
        background: `color-mix(in srgb, ${signalColor} 6%, transparent)`,
        borderRadius: 6,
        color: signalColor,
        whiteSpace: "nowrap",
      }}
    >
      <span
        aria-hidden
        style={{
          display: "inline-grid",
          placeItems: "center",
          width: compact ? 16 : 19,
          height: compact ? 16 : 19,
          borderRadius: 3,
          background: "color-mix(in srgb, var(--panel-2) 78%, transparent)",
          overflow: "hidden",
        }}
      >
        <Image
          className="ollama-icon ollama-icon-black"
          src="/icons/ollama.svg"
          alt=""
          width={compact ? 13 : 15}
          height={compact ? 13 : 15}
          style={{ width: compact ? 13 : 15, height: compact ? 13 : 15 }}
        />
        <Image
          className="ollama-icon ollama-icon-white"
          src="/icons/ollama-dark.svg"
          alt=""
          width={compact ? 13 : 15}
          height={compact ? 13 : 15}
          style={{ width: compact ? 13 : 15, height: compact ? 13 : 15 }}
        />
      </span>
      <span style={{ display: "inline-flex", flexDirection: "column", gap: 2 }}>
        <span
          style={{
            fontSize: compact ? 9.5 : 10.5,
            fontWeight: 800,
            letterSpacing: "0.1em",
            lineHeight: 1,
          }}
        >
          {label}
        </span>
        {!compact && (
          <span
            className="mono"
            style={{
              color: "var(--muted)",
              fontSize: 10,
              letterSpacing: "0.04em",
              lineHeight: 1.1,
              textTransform: "none",
            }}
          >
            {detail}
          </span>
        )}
      </span>
    </span>
  );
}
