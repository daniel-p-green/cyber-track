"use client";

import { useEffect, useRef, useState } from "react";
import {
  dynamicBriefingUrl,
  staticBriefingUrl,
} from "@/lib/briefing-audio";

interface Props {
  /** Stable id for cached MP3 lookup (mission id, or `hero`). */
  briefingId: string;
  /** Fallback transcript for on-demand synthesis when static audio is missing. */
  text: string;
  label?: string;
  compact?: boolean;
  iconOnly?: boolean;
  className?: string;
}

/** Play pre-generated or server-synthesized briefing audio. */
export default function VoiceBriefing({
  briefingId,
  text,
  label = "Play briefing",
  compact = false,
  iconOnly = false,
  className,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  function playUrl(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setSpeaking(false);
      audio.onerror = () => reject(new Error("Playback failed"));
      audio
        .play()
        .then(() => {
          setSpeaking(true);
          resolve();
        })
        .catch(reject);
    });
  }

  async function fetchDynamicUrl(): Promise<string> {
    const res = await fetch(dynamicBriefingUrl(briefingId, text));
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { hint?: string } | null;
      throw new Error(body?.hint ?? "Briefing audio unavailable");
    }
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }

  async function toggle() {
    if (speaking || loading) {
      audioRef.current?.pause();
      setSpeaking(false);
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      try {
        await playUrl(staticBriefingUrl(briefingId));
      } catch {
        await playUrl(await fetchDynamicUrl());
      }
    } catch (e) {
      setSpeaking(false);
      setError(e instanceof Error ? e.message : "Briefing unavailable");
    } finally {
      setLoading(false);
    }
  }

  const statusLabel = loading ? "Loading audio" : speaking ? "Stop audio" : label;

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        aria-pressed={speaking}
        aria-busy={loading}
        aria-label={speaking ? "Stop the voice briefing" : statusLabel}
        className={`display ${className ?? ""}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: iconOnly ? 0 : 8,
          width: iconOnly ? (compact ? 30 : 36) : "auto",
          height: iconOnly ? (compact ? 30 : 36) : "auto",
          padding: iconOnly ? 0 : compact ? "4px 11px" : "7px 15px",
          border: `1.4px solid ${
            speaking
              ? "var(--signal)"
              : "color-mix(in srgb, var(--muted) 45%, transparent)"
          }`,
          borderRadius: 6,
          background: speaking
            ? "color-mix(in srgb, var(--signal) 7%, transparent)"
            : "transparent",
          color: speaking ? "var(--signal)" : "var(--muted)",
          fontSize: compact ? 10 : 11.5,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          transition: "color 120ms ease-out, border-color 120ms ease-out",
          opacity: loading ? 0.7 : 1,
          cursor: loading ? "wait" : "pointer",
        }}
      >
        {loading ? (
          <svg width={compact ? 11 : 13} height={compact ? 11 : 13} viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="14 8" />
          </svg>
        ) : speaking ? (
          <svg width={compact ? 9 : 11} height={compact ? 9 : 11} viewBox="0 0 12 12" aria-hidden>
            <rect x="1.5" y="1.5" width="9" height="9" fill="currentColor" rx="1" />
          </svg>
        ) : (
          <svg
            width={compact ? 11 : 13}
            height={compact ? 11 : 13}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M4 9.5v5h4l5 4v-13l-5 4z" />
            <path d="M16.5 8.8a4.6 4.6 0 0 1 0 6.4M19 6.4a8 8 0 0 1 0 11.2" />
          </svg>
        )}
        {!iconOnly && (loading ? "Loading" : speaking ? "Stop" : label)}
      </button>
      {error && (
        <span
          className="mono"
          style={{ fontSize: 9, color: "var(--danger, #c44)", letterSpacing: "0.06em" }}
          role="status"
        >
          {error}
        </span>
      )}
    </span>
  );
}
